'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase-browser'
import ImageUpload from '@/components/ImageUpload'
import { FaEdit, FaSave, FaTimes, FaSearch, FaGlobe } from 'react-icons/fa'
import toast from 'react-hot-toast'

export default function AdminSEOPage() {
  const [seoAyarlari, setSeoAyarlari] = useState([])
  const [loading, setLoading] = useState(true)
  const [editMode, setEditMode] = useState(null)
  const [formData, setFormData] = useState({})

  const supabase = createClient()

  const sayfaLabels = {
    anasayfa: 'Anasayfa',
    hizmetler: 'Hizmetler',
    blog: 'Blog',
    iletisim: 'İletişim',
    sss: 'S.S.S',
    galeri: 'Galeri',
    hakkimizda: 'Hakkımızda',
  }

  useEffect(() => {
    fetchSeoAyarlari()
  }, [])

  const fetchSeoAyarlari = async () => {
    const { data, error } = await supabase.from('seo_ayarlari').select('*').order('sayfa_turu')
    if (!error) setSeoAyarlari(data || [])
    setLoading(false)
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const handleImageChange = (url) => {
    setFormData({ ...formData, og_image: url })
  }

  const handleEdit = (item) => {
    setEditMode(item.id)
    setFormData(item)
  }

  const handleCancel = () => {
    setEditMode(null)
    setFormData({})
  }

  const handleSave = async () => {
    try {
      const { error } = await supabase.from('seo_ayarlari').update(formData).eq('id', editMode)
      if (error) throw error
      toast.success('SEO ayarları kaydedildi')
      fetchSeoAyarlari()
      handleCancel()
    } catch (error) {
      toast.error('Hata: ' + error.message)
    }
  }

  if (loading) {
    return <div className="flex justify-center py-12"><div className="spinner"></div></div>
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <FaSearch className="text-2xl text-primary-500" />
        <h1 className="text-2xl font-bold">SEO Ayarları</h1>
      </div>

      <p className="text-gray-600 mb-6">
        Her sayfanın meta başlık, açıklama, og:image ve canonical URL ayarlarını buradan yönetebilirsiniz.
      </p>

      {/* Form Modal */}
      {editMode && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <FaGlobe className="text-primary-500" />
              {sayfaLabels[formData.sayfa_turu] || formData.sayfa_turu} - SEO
            </h2>

            <div className="space-y-4">
              <div>
                <label className="admin-label">Meta Başlık (Title)</label>
                <input
                  type="text"
                  name="meta_title"
                  value={formData.meta_title || ''}
                  onChange={handleChange}
                  className="admin-input"
                  placeholder="Sayfa başlığı | Site Adı"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {(formData.meta_title || '').length}/60 karakter (Önerilen: 50-60)
                </p>
              </div>

              <div>
                <label className="admin-label">Meta Açıklama (Description)</label>
                <textarea
                  name="meta_description"
                  value={formData.meta_description || ''}
                  onChange={handleChange}
                  rows={3}
                  className="admin-input resize-none"
                  placeholder="Sayfa açıklaması..."
                ></textarea>
                <p className="text-xs text-gray-500 mt-1">
                  {(formData.meta_description || '').length}/160 karakter (Önerilen: 150-160)
                </p>
              </div>

              <div>
                <label className="admin-label">Anahtar Kelimeler (Keywords)</label>
                <input
                  type="text"
                  name="meta_keywords"
                  value={formData.meta_keywords || ''}
                  onChange={handleChange}
                  className="admin-input"
                  placeholder="anahtar1, anahtar2, anahtar3"
                />
              </div>

              <div>
                <label className="admin-label">OG Image (Sosyal Medya Görseli)</label>
                <ImageUpload
                  value={formData.og_image}
                  onChange={handleImageChange}
                  folder="seo"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Önerilen boyut: 1200x630 piksel
                </p>
              </div>

              <div>
                <label className="admin-label">Canonical URL</label>
                <input
                  type="text"
                  name="canonical_url"
                  value={formData.canonical_url || ''}
                  onChange={handleChange}
                  className="admin-input"
                  placeholder="https://adananakliye.com.tr/sayfa"
                />
              </div>

              <div>
                <label className="admin-label">Robots</label>
                <select
                  name="robots"
                  value={formData.robots || 'index, follow'}
                  onChange={handleChange}
                  className="admin-input"
                >
                  <option value="index, follow">index, follow (İndeksle)</option>
                  <option value="noindex, follow">noindex, follow (İndeksleme)</option>
                  <option value="index, nofollow">index, nofollow (Linkleri takip etme)</option>
                  <option value="noindex, nofollow">noindex, nofollow (Hiçbiri)</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button onClick={handleCancel} className="admin-btn-secondary flex items-center gap-2">
                <FaTimes /> İptal
              </button>
              <button onClick={handleSave} className="admin-btn-primary flex items-center gap-2">
                <FaSave /> Kaydet
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SEO List */}
      <div className="grid gap-4">
        {seoAyarlari.map((item) => (
          <div key={item.id} className="admin-card">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="bg-primary-100 text-primary-700 px-2 py-1 rounded text-sm font-medium">
                    {sayfaLabels[item.sayfa_turu] || item.sayfa_turu}
                  </span>
                  {item.canonical_url && (
                    <span className="text-xs text-gray-500">{item.canonical_url}</span>
                  )}
                </div>
                <h3 className="font-semibold text-lg text-gray-800 mb-1">
                  {item.meta_title || <span className="text-red-500">Meta başlık tanımlı değil</span>}
                </h3>
                <p className="text-gray-600 text-sm line-clamp-2">
                  {item.meta_description || <span className="text-red-400">Meta açıklama tanımlı değil</span>}
                </p>
              </div>
              <button onClick={() => handleEdit(item)} className="p-2 hover:bg-blue-100 rounded text-blue-600">
                <FaEdit size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
