'use client'

import { useState, useEffect } from 'react'

interface Option {
  _id: string
  name: string
  [key: string]: any
}

interface SearchSelectProps {
  label: string
  placeholder: string
  searchEndpoint: string
  onSelect: (option: Option) => void
  displayField?: string
  required?: boolean
}

export default function SearchSelect({ 
  label, 
  placeholder, 
  searchEndpoint, 
  onSelect, 
  displayField = 'name',
  required = false 
}: SearchSelectProps) {
  const [query, setQuery] = useState('')
  const [options, setOptions] = useState<Option[]>([])
  const [loading, setLoading] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const [selectedOption, setSelectedOption] = useState<Option | null>(null)

  useEffect(() => {
    if (query.length > 1) {
      searchOptions()
    } else {
      setOptions([])
    }
  }, [query])

  const searchOptions = async () => {
    setLoading(true)
    try {
      const response = await fetch(`${searchEndpoint}?name=${query}`)
      if (response.ok) {
        const data = await response.json()
        setOptions(data)
        setShowDropdown(true)
      }
    } catch (error) {
      console.error('Search error:', error)
    }
    setLoading(false)
  }

  const handleSelect = (option: Option) => {
    setSelectedOption(option)
    setQuery(option[displayField])
    setShowDropdown(false)
    onSelect(option)
  }

  return (
    <div className="relative">
      <label className="block text-sm font-medium mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        onFocus={() => query.length > 1 && setShowDropdown(true)}
      />
      
      {showDropdown && (
        <div className="absolute z-10 w-full bg-white border rounded-b shadow-lg max-h-40 overflow-y-auto">
          {loading ? (
            <div className="p-2 text-gray-500">Searching...</div>
          ) : options.length > 0 ? (
            options.map((option) => (
              <div
                key={option._id}
                onClick={() => handleSelect(option)}
                className="p-2 hover:bg-gray-100 cursor-pointer"
              >
                {option[displayField]} {option.position && `(${option.position})`}
              </div>
            ))
          ) : (
            <div className="p-2 text-gray-500">No results found</div>
          )}
        </div>
      )}
    </div>
  )
}