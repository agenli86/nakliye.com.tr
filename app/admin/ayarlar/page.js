'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase-browser'
import ImageUpload from '@/components/ImageUpload'
import { FaSave, FaCog, FaPhone, FaGlobe, FaPalette, FaChartBar } from 'react-icons/fa'
import toast from 'react-hot-toast'

export default function AdminAyarlarPage() {
  const [ayarlar, setAyarlar] = useState({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState('genel')
  const supabase = createClient()

  const tabs = [
    { id: 'genel', label: 'Genel', icon: FaCog },
    { id: 'iletisim', label: 'İletişim', icon: FaPhone },
    { id: 'sosyal', label: 'Sosyal Medya', icon: FaGlobe },
    { id: 'seo', label: 'SEO', icon: FaChartBar },
    { id: 'tema', label: 'Tema', icon: FaPalette },
  ]

  useEffect(() => { fetchAyarlar() }, [])

  const fetchAyarlar = async () => {
    const { data } = await supabase.from('ayarlar').select('*')
    const obj = {}
    data?.forEach(a => { obj[a.anahtar] = a.deger })
    setAyarlar(obj)
    setLoading(false)
  }

  const handleChange = (key, value) => {
    setAyarlar(prev => ({ ...prev, [key]: value }))
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      for (const [key, value] of Object.entries(ayarlar)) {
        await supabase.from('ayarlar').update({ deger: value }).eq('anahtar', key)
      }
      toast.success('Ayarlar kaydedildi')
    } catch (error) {
      toast.error('Hata: ' + error.message)
    }
    setSaving(false)
  }

  const renderField = (key, label, type = 'text', placeholder = '') => {
    if (type === 'image') {
      return (
        <div key={key} className="mb-6">
          <label className="admin-label">{label}</label>
          <ImageUpload value={ayarlar[key] || ''} onChange={(url) => handleChange(key, url)} folder="ayarlar" />
        </div>
      )
    }
    if (type === 'textarea') {
      return (
        <div key={key} className="mb-6">
          <label className="admin-label">{label}</label>
          <textarea value={ayarlar[key] || ''} onChange={(e) => handleChange(key, e.target.value)} className="admin-input resize-none" rows={3} placeholder={placeholder} />
        </div>
      )
    }
    if (type === 'color') {
      return (
        <div key={key} className="mb-6">
          <label className="admin-label">{label}</label>
          <div className="flex items-center gap-3">
            <input type="color" value={ayarlar[key] || '#000000'} onChange={(e) => handleChange(key, e.target.value)} className="w-12 h-12 rounded cursor-pointer" />
            <input type="text" value={ayarlar[key] || ''} onChange={(e) => handleChange(key, e.target.value)} className="admin-input flex-1" />
          </div>
        </div>
      )
    }
    return (
      <div key={key} className="mb-6">
        <label className="admin-label">{label}</label>
        <input type={type} value={ayarlar[key] || ''} onChange={(e) => handleChange(key, e.target.value)} className="admin-input" placeholder={placeholder} />
      </div>
    )
  }

  if (loading) return <div className="flex justify-center py-12"><div className="spinner"></div></div>

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Site Ayarları</h1>
        <button onClick={handleSave} disabled={saving} className="admin-btn-primary flex items-center gap-2">
          <FaSave /> {saving ? 'Kaydediliyor...' : 'Kaydet'}
        </button>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === tab.id ? 'text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            style={activeTab === tab.id ? { backgroundColor: '#1e3a5f' } : {}}>
            <tab.icon /> {tab.label}
          </button>
        ))}
      </div>

      <div className="admin-card">
        {activeTab === 'genel' && (
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              {renderField('site_adi', 'Site Adı')}
              {renderField('site_slogan', 'Site Sloganı')}
              {renderField('copyright', 'Copyright Metni')}
            </div>
            <div>
              {renderField('logo', 'Logo', 'image')}
              {renderField('favicon', 'Favicon', 'image')}
              {renderField('footer_logo', 'Footer Logo', 'image')}
            </div>
          </div>
        )}

        {activeTab === 'iletisim' && (
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              {renderField('telefon', 'Telefon', 'tel', '05XX XXX XX XX')}
              {renderField('telefon2', 'İkinci Telefon', 'tel')}
              {renderField('whatsapp', 'WhatsApp', 'tel', '90XXXXXXXXXX')}
              {renderField('email', 'E-posta', 'email')}
            </div>
            <div>
              {renderField('adres', 'Adres', 'textarea')}
              {renderField('calisma_saatleri', 'Çalışma Saatleri')}
              {renderField('harita_embed', 'Google Maps Embed URL', 'textarea')}
            </div>
          </div>
        )}

        {activeTab === 'sosyal' && (
          <div className="grid md:grid-cols-2 gap-6">
            {renderField('facebook', 'Facebook URL')}
            {renderField('instagram', 'Instagram URL')}
            {renderField('youtube', 'YouTube URL')}
            {renderField('twitter', 'Twitter URL')}
          </div>
        )}

        {activeTab === 'seo' && (
          <div>
            {renderField('meta_title', 'Ana Sayfa Meta Başlık')}
            {renderField('meta_description', 'Ana Sayfa Meta Açıklama', 'textarea')}
            {renderField('meta_keywords', 'Anahtar Kelimeler', 'textarea')}
            {renderField('og_image', 'OG Image (Paylaşım Görseli)', 'image')}
            {renderField('site_url', 'Site URL (Canonical için)')}
            {renderField('google_analytics', 'Google Analytics ID')}
            {renderField('facebook_pixel', 'Facebook Pixel ID')}
          </div>
        )}

        {activeTab === 'tema' && (
          <div className="grid md:grid-cols-3 gap-6">
            {renderField('renk_primary', 'Ana Renk (Mavi)', 'color')}
            {renderField('renk_secondary', 'İkincil Renk (Lacivert)', 'color')}
          </div>
        )}
      </div>
    </div>
  )
}
