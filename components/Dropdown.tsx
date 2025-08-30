'use client'

import { useState, useEffect } from 'react'

interface Option {
  _id: string
  name: string
  [key: string]: any
}

interface DropdownProps {
  label: string
  placeholder: string
  endpoint: string
  onSelect: (option: Option) => void
  displayField?: string
  required?: boolean
}

export default function Dropdown({ 
  label, 
  placeholder, 
  endpoint, 
  onSelect, 
  displayField = 'name',
  required = false 
}: DropdownProps) {
  const [options, setOptions] = useState<Option[]>([])
  const [selectedOption, setSelectedOption] = useState<Option | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchOptions()
  }, [])

  const fetchOptions = async () => {
    try {
      const response = await fetch(endpoint)
      if (response.ok) {
        const data = await response.json()
        setOptions(data)
      }
    } catch (error) {
      console.error('Fetch error:', error)
    }
    setLoading(false)
  }

  const handleSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = e.target.value
    const option = options.find(opt => opt._id === selectedId)
    if (option) {
      setSelectedOption(option)
      onSelect(option)
    }
  }

  return (
    <div>
      <label className="block text-sm font-medium mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <select
        onChange={handleSelect}
        className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        disabled={loading}
      >
        <option value="">{loading ? 'Loading...' : placeholder}</option>
        {options.map((option) => (
          <option key={option._id} value={option._id}>
            {option[displayField]}
          </option>
        ))}
      </select>
    </div>
  )
}