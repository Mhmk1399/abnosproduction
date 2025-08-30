'use client'

import { useState, useEffect } from 'react'
import SearchSelect from '@/components/SearchSelect'
import Dropdown from '@/components/Dropdown'

export default function TestPage() {
  const [inventory, setInventory] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [searchStatus, setSearchStatus] = useState<'idle' | 'searching' | 'found' | 'not-found'>('idle')
  const [formData, setFormData] = useState({
    productionCode: '',
    wastedWidth: '',
    wastedHeight: '',
    reason: '',
    step: '',
    user: ''
  })

  // Debounced search effect
  useEffect(() => {
    if (formData.productionCode.length > 2) {
      const timer = setTimeout(() => {
        handleProductLayerLookup(formData.productionCode)
      }, 3000)
      
      return () => clearTimeout(timer)
    } else {
      setInventory(null)
      setSearchStatus('idle')
    }
  }, [formData.productionCode])

  const handleProductLayerLookup = async (productionCode: string) => {
    setSearchStatus('searching')
    setLoading(true)
    try {
      const response = await fetch(`/api/productLayer?productionCode=${productionCode}`)
      if (response.ok) {
        const data = await response.json()
        if (data.length > 0) {
          setInventory(data[0])
          setSearchStatus('found')
        } else {
          setInventory(null)
          setSearchStatus('not-found')
        }
      } else {
        setInventory(null)
        setSearchStatus('not-found')
      }
    } catch (error) {
      console.error('Error:', error)
      setInventory(null)
      setSearchStatus('not-found')
    }
    setLoading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!inventory || searchStatus !== 'found') {
      alert('لطفاً ابتدا کد تولید معتبر وارد کرده و منتظر یافت شدن آن باشید')
      return
    }

    const wastedProductData = {
      layerWidth: inventory.width || 0,
      wastedWidth: parseFloat(formData.wastedWidth),
      layerHeight: inventory.height || 0,
      wastedHeight: parseFloat(formData.wastedHeight),
      reason: formData.reason,
      step: formData.step,
      user: formData.user
    }

    try {
      const response = await fetch('/api/wasted-products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(wastedProductData)
      })

      if (response.ok) {
        alert('محصول ضایعاتی با موفقیت ایجاد شد!')
        setFormData({ productionCode: '', wastedWidth: '', wastedHeight: '', reason: '', step: '', user: '' })
        setInventory(null)
      } else {
        alert('خطا در ایجاد محصول ضایعاتی')
      }
    } catch (error) {
      console.error('Error:', error)
      alert('خطا در ایجاد محصول ضایعاتی')
    }
  }



  return (
    <div className="container mx-auto p-4 space-y-6" dir="rtl">
      {inventory && searchStatus === 'found' && (
        <div className="bg-green-100 border border-green-300 p-4 rounded-lg">
          <h3 className="font-bold text-green-800 mb-2">✓ لایه محصول یافت شد</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium">کد تولید:</span>
              <p className="text-green-700">{inventory.productionCode}</p>
            </div>
            <div>
              <span className="font-medium">تاریخ تولید:</span>
              <p className="text-green-700">{new Date(inventory.productionDate).toLocaleDateString('fa-IR')}</p>
            </div>
            <div>
              <span className="font-medium">عرض:</span>
              <p className="text-green-700 font-bold">{inventory.width} میلیمتر</p>
            </div>
            <div>
              <span className="font-medium">ارتفاع:</span>
              <p className="text-green-700 font-bold">{inventory.height} میلیمتر</p>
            </div>
          </div>
        </div>
      )}
      
      
      
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow space-y-4">
        <h2 className="text-xl font-bold">فرم محصول ضایعاتی</h2>
        
        <div>
          <label className="block text-sm font-medium mb-1">کد تولید *</label>
          <div className="relative">
            <input
              type="text"
              value={formData.productionCode}
              onChange={(e) => {
                setFormData({...formData, productionCode: e.target.value})
                if (e.target.value.length <= 2) {
                  setSearchStatus('idle')
                }
              }}
              placeholder="کد تولید را وارد کنید (پس از ۳ ثانیه جستجو میشود)"
              className={`w-full p-2 border rounded focus:outline-none focus:ring-2 ${
                searchStatus === 'found' ? 'border-green-500 focus:ring-green-500' :
                searchStatus === 'not-found' ? 'border-red-500 focus:ring-red-500' :
                searchStatus === 'searching' ? 'border-yellow-500 focus:ring-yellow-500' :
                'border-gray-300 focus:ring-blue-500'
              }`}
              required
            />
            {searchStatus === 'searching' && (
              <div className="absolute left-2 top-2">
                <div className="animate-spin h-5 w-5 border-2 border-yellow-500 border-t-transparent rounded-full"></div>
              </div>
            )}
          </div>
          {searchStatus === 'searching' && (
            <p className="text-sm text-yellow-600 mt-1">در حال جستجوی کد تولید...</p>
          )}
          {searchStatus === 'not-found' && (
            <p className="text-sm text-red-600 mt-1">کد تولید یافت نشد. لطفاً بررسی کرده و دوباره تلاش کنید.</p>
          )}
          {searchStatus === 'found' && (
            <p className="text-sm text-green-600 mt-1">✓ کد تولید یافت شد!</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">عرض ضایعات *</label>
            <input
              type="number"
              value={formData.wastedWidth}
              onChange={(e) => setFormData({...formData, wastedWidth: e.target.value})}
              placeholder="عرض ضایعات را وارد کنید"
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">ارتفاع ضایعات *</label>
            <input
              type="number"
              value={formData.wastedHeight}
              onChange={(e) => setFormData({...formData, wastedHeight: e.target.value})}
              placeholder="ارتفاع ضایعات را وارد کنید"
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
        </div>

        <Dropdown
          label="دلیل"
          placeholder="دلیل را انتخاب کنید"
          endpoint="/api/reasons"
          onSelect={(option) => setFormData({...formData, reason: option._id})}
          displayField="reason"
          required
        />

        <Dropdown
          label="مرحله"
          placeholder="مرحله را انتخاب کنید"
          endpoint="/api/steps"
          onSelect={(option) => setFormData({...formData, step: option._id})}
          required
        />

        <SearchSelect
          label="کاربر"
          placeholder="جستجوی کاربر بر اساس نام"
          searchEndpoint="/api/staff/search"
          onSelect={(option) => setFormData({...formData, user: option._id})}
          required
        />

        <button
          type="submit"
          className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          ایجاد محصول ضایعاتی
        </button>
      </form>
    </div>
  )
}