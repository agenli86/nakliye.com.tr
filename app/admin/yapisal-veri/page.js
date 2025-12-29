'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase-browser'
import { FaSave, FaCode, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa'
import toast from 'react-hot-toast'

export default function AdminYapisalVeriPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [jsonValid, setJsonValid] = useState(true)
  const [formData, setFormData] = useState({
    organization: '',
    local_business: '',
    website: '',
    breadcrumb: true
  })
  const supabase = createClient()

  useEffect(() => { fetchData() }, [])

  const fetchData = async () => {
    const { data } = await supabase.from('ayarlar').select('*')
    
    const getVal = (key) => data?.find(a => a.anahtar === key)?.deger || ''
    
    // Varsayılan değerler
    const defaultOrg = {
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": getVal('site_adi') || "Adana Nakliye",
      "url": getVal('site_url') || "https://adananakliye.com.tr",
      "logo": getVal('logo'),
      "contactPoint": {
        "@type": "ContactPoint",
        "telephone": getVal('telefon'),
        "contactType": "customer service",
        "areaServed": "TR",
        "availableLanguage": "Turkish"
      },
      "sameAs": [
        getVal('facebook'),
        getVal('instagram'),
        getVal('youtube')
      ].filter(Boolean)
    }

    const defaultBusiness = {
      "@context": "https://schema.org",
      "@type": "MovingCompany",
      "name": getVal('site_adi') || "Adana Nakliye",
      "image": getVal('og_image'),
      "url": getVal('site_url') || "https://adananakliye.com.tr",
      "telephone": getVal('telefon'),
      "email": getVal('email'),
      "address": {
        "@type": "PostalAddress",
        "streetAddress": getVal('adres'),
        "addressLocality": "Adana",
        "addressRegion": "Adana",
        "postalCode": "01000",
        "addressCountry": "TR"
      },
      "geo": {
        "@type": "GeoCoordinates",
        "latitude": 36.9914,
        "longitude": 35.3308
      },
      "openingHoursSpecification": {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
        "opens": "07:00",
        "closes": "21:30"
      },
      "priceRange": "₺₺",
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "4.9",
        "reviewCount": getVal('mutlu_musteri') || "7800"
      }
    }

    const defaultWebsite = {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "name": getVal('site_adi') || "Adana Nakliye",
      "url": getVal('site_url') || "https://adananakliye.com.tr",
      "potentialAction": {
        "@type": "SearchAction",
        "target": (getVal('site_url') || "https://adananakliye.com.tr") + "/arama?q={search_term_string}",
        "query-input": "required name=search_term_string"
      }
    }

    setFormData({
      organization: getVal('json_ld_organization') || JSON.stringify(defaultOrg, null, 2),
      local_business: getVal('json_ld_local_business') || JSON.stringify(defaultBusiness, null, 2),
      website: getVal('json_ld_website') || JSON.stringify(defaultWebsite, null, 2),
      breadcrumb: getVal('json_ld_breadcrumb') !== 'false'
    })
    setLoading(false)
  }

  const validateJSON = (str) => {
    try {
      JSON.parse(str)
      return true
    } catch {
      return false
    }
  }

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (field !== 'breadcrumb') {
      setJsonValid(validateJSON(value))
    }
  }

  const handleSave = async () => {
    // JSON validasyonu
    if (!validateJSON(formData.organization) || !validateJSON(formData.local_business) || !validateJSON(formData.website)) {
      toast.error('JSON formatı hatalı!')
      return
    }

    setSaving(true)
    try {
      const updates = [
        { anahtar: 'json_ld_organization', deger: formData.organization },
        { anahtar: 'json_ld_local_business', deger: formData.local_business },
        { anahtar: 'json_ld_website', deger: formData.website },
        { anahtar: 'json_ld_breadcrumb', deger: formData.breadcrumb ? 'true' : 'false' },
      ]

      for (const update of updates) {
        const { data: existing } = await supabase.from('ayarlar').select('id').eq('anahtar', update.anahtar).single()
        
        if (existing) {
          await supabase.from('ayarlar').update({ deger: update.deger }).eq('anahtar', update.anahtar)
        } else {
          await supabase.from('ayarlar').insert([{ anahtar: update.anahtar, deger: update.deger, grup: 'yapisal_veri' }])
        }
      }

      toast.success('Yapısal veri ayarları kaydedildi')
    } catch (error) {
      toast.error('Hata: ' + error.message)
    }
    setSaving(false)
  }

  const formatJSON = (field) => {
    try {
      const parsed = JSON.parse(formData[field])
      setFormData(prev => ({ ...prev, [field]: JSON.stringify(parsed, null, 2) }))
      setJsonValid(true)
    } catch {
      toast.error('JSON formatı hatalı, düzeltilemedi')
    }
  }

  if (loading) return <div className="flex justify-center py-12"><div className="spinner"></div></div>

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Yapısal Veri (JSON-LD)</h1>
          <p className="text-gray-500 text-sm mt-1">Google için Schema.org yapısal verileri</p>
        </div>
        <button onClick={handleSave} disabled={saving} className="admin-btn-primary flex items-center gap-2">
          <FaSave /> {saving ? 'Kaydediliyor...' : 'Kaydet'}
        </button>
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
        <div className="flex items-start gap-3">
          <FaCode className="text-blue-600 mt-1" />
          <div>
            <h3 className="font-semibold text-blue-900">Yapısal Veri Nedir?</h3>
            <p className="text-blue-700 text-sm mt-1">
              JSON-LD formatındaki yapısal veriler, Google'ın sitenizi daha iyi anlamasını sağlar. 
              Arama sonuçlarında zengin snippet'ler (yıldızlar, telefon, adres vb.) görünmesine yardımcı olur.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {/* Organization */}
        <div className="admin-card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <FaCode className="text-blue-600" />
              Organization (Kurum)
            </h2>
            <button onClick={() => formatJSON('organization')} className="text-sm text-blue-600 hover:underline">
              Formatla
            </button>
          </div>
          <textarea
            value={formData.organization}
            onChange={(e) => handleChange('organization', e.target.value)}
            rows={12}
            className="admin-input font-mono text-sm resize-none"
            placeholder='{"@context": "https://schema.org", ...}'
          />
        </div>

        {/* Local Business */}
        <div className="admin-card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <FaCode className="text-green-600" />
              LocalBusiness (Yerel İşletme)
            </h2>
            <button onClick={() => formatJSON('local_business')} className="text-sm text-blue-600 hover:underline">
              Formatla
            </button>
          </div>
          <textarea
            value={formData.local_business}
            onChange={(e) => handleChange('local_business', e.target.value)}
            rows={16}
            className="admin-input font-mono text-sm resize-none"
          />
        </div>

        {/* Website */}
        <div className="admin-card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <FaCode className="text-purple-600" />
              WebSite
            </h2>
            <button onClick={() => formatJSON('website')} className="text-sm text-blue-600 hover:underline">
              Formatla
            </button>
          </div>
          <textarea
            value={formData.website}
            onChange={(e) => handleChange('website', e.target.value)}
            rows={10}
            className="admin-input font-mono text-sm resize-none"
          />
        </div>

        {/* Breadcrumb Toggle */}
        <div className="admin-card">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.breadcrumb}
              onChange={(e) => handleChange('breadcrumb', e.target.checked)}
              className="w-5 h-5 rounded"
            />
            <div>
              <span className="font-semibold">Breadcrumb Yapısal Verisi</span>
              <p className="text-sm text-gray-500">Sayfalarda otomatik breadcrumb JSON-LD ekle</p>
            </div>
          </label>
        </div>
      </div>

      {/* Validation Status */}
      <div className={`mt-6 p-4 rounded-xl flex items-center gap-3 ${jsonValid ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
        {jsonValid ? (
          <>
            <FaCheckCircle />
            <span>Tüm JSON formatları geçerli</span>
          </>
        ) : (
          <>
            <FaExclamationTriangle />
            <span>JSON formatında hata var, lütfen kontrol edin</span>
          </>
        )}
      </div>
    </div>
  )
}
