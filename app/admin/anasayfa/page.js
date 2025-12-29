'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase-browser'
import ImageUpload from '@/components/ImageUpload'
import { FaEdit, FaSave, FaTimes, FaHome } from 'react-icons/fa'
import toast from 'react-hot-toast'

export default function AdminAnasayfaPage() {
  const [bolumler, setBolumler] = useState([])
  const [tablar, setTablar] = useState([])
  const [loading, setLoading] = useState(true)
  const [editMode, setEditMode] = useState(null)
  const [editType, setEditType] = useState(null) // 'bolum' veya 'tab'
  const [formData, setFormData] = useState({})

  const supabase = createClient()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    const [{ data: bolumlerData }, { data: tablarData }] = await Promise.all([
      supabase.from('anasayfa_bolumleri').select('*').order('sira'),
      supabase.from('anasayfa_tablari').select('*').order('sira'),
    ])
    setBolumler(bolumlerData || [])
    setTablar(tablarData || [])
    setLoading(false)
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value })
  }

  const handleImageChange = (url) => {
    setFormData({ ...formData, resim: url })
  }

  const handleEditBolum = (bolum) => {
    setEditMode(bolum.id)
    setEditType('bolum')
    setFormData(bolum)
  }

  const handleEditTab = (tab) => {
    setEditMode(tab.id)
    setEditType('tab')
    setFormData(tab)
  }

  const handleCancel = () => {
    setEditMode(null)
    setEditType(null)
    setFormData({})
  }

  const handleSave = async () => {
    try {
      const table = editType === 'bolum' ? 'anasayfa_bolumleri' : 'anasayfa_tablari'
      const { error } = await supabase.from(table).update(formData).eq('id', editMode)
      if (error) throw error
      toast.success('Kaydedildi')
      fetchData()
      handleCancel()
    } catch (error) {
      toast.error('Hata: ' + error.message)
    }
  }

  const bolumLabels = {
    slider_alti: 'Slider Altı Bölümü',
    hizmetler_baslik: 'Hizmetler Bölümü Başlık',
    fiyatlar_baslik: 'Fiyatlar Bölümü Başlık',
    sayac_baslik: 'Sayaç Bölümü Başlık',
    cta: 'CTA (Çağrı) Bölümü',
    blog_baslik: 'Blog Bölümü Başlık',
  }

  if (loading) {
    return <div className="flex justify-center py-12"><div className="spinner"></div></div>
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <FaHome className="text-2xl text-primary-500" />
        <h1 className="text-2xl font-bold">Anasayfa Yönetimi</h1>
      </div>

      {/* Form Modal */}
      {editMode && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-6">
              {editType === 'bolum' ? bolumLabels[formData.bolum_adi] || 'Bölüm Düzenle' : 'Tab Düzenle'}
            </h2>

            <div className="space-y-4">
              <div>
                <label className="admin-label">Başlık</label>
                <input
                  type="text"
                  name="baslik"
                  value={formData.baslik || ''}
                  onChange={handleChange}
                  className="admin-input"
                />
              </div>

              <div>
                <label className="admin-label">Alt Başlık</label>
                <input
                  type="text"
                  name="alt_baslik"
                  value={formData.alt_baslik || ''}
                  onChange={handleChange}
                  className="admin-input"
                />
              </div>

              <div>
                <label className="admin-label">İçerik (HTML)</label>
                <textarea
                  name="icerik"
                  value={formData.icerik || ''}
                  onChange={handleChange}
                  rows={8}
                  className="admin-input resize-none font-mono text-sm"
                ></textarea>
              </div>

              {editType === 'bolum' && (
                <>
                  <div>
                    <label className="admin-label">Resim</label>
                    <ImageUpload
                      value={formData.resim}
                      onChange={handleImageChange}
                      folder="anasayfa"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="admin-label">Buton Metni</label>
                      <input
                        type="text"
                        name="buton_metin"
                        value={formData.buton_metin || ''}
                        onChange={handleChange}
                        className="admin-input"
                      />
                    </div>
                    <div>
                      <label className="admin-label">Buton Linki</label>
                      <input
                        type="text"
                        name="buton_link"
                        value={formData.buton_link || ''}
                        onChange={handleChange}
                        className="admin-input"
                      />
                    </div>
                  </div>
                </>
              )}

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="aktif"
                  checked={formData.aktif}
                  onChange={handleChange}
                  className="w-5 h-5"
                />
                Aktif
              </label>
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

      {/* Bölümler */}
      <div className="mb-8">
        <h2 className="text-lg font-bold mb-4 text-gray-700">Anasayfa Bölümleri</h2>
        <div className="grid gap-4">
          {bolumler.map((bolum) => (
            <div key={bolum.id} className="admin-card flex items-center justify-between">
              <div>
                <h3 className="font-semibold">{bolumLabels[bolum.bolum_adi] || bolum.bolum_adi}</h3>
                <p className="text-sm text-gray-500">{bolum.baslik}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-2 py-1 rounded-full text-xs ${bolum.aktif ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {bolum.aktif ? 'Aktif' : 'Pasif'}
                </span>
                <button onClick={() => handleEditBolum(bolum)} className="p-2 hover:bg-blue-100 rounded text-blue-600">
                  <FaEdit />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tablar */}
      <div>
        <h2 className="text-lg font-bold mb-4 text-gray-700">Anasayfa Tabları</h2>
        <div className="grid gap-4">
          {tablar.map((tab, index) => (
            <div key={tab.id} className="admin-card flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center font-bold">
                  {index + 1}
                </span>
                <div>
                  <h3 className="font-semibold">{tab.baslik}</h3>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-2 py-1 rounded-full text-xs ${tab.aktif ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {tab.aktif ? 'Aktif' : 'Pasif'}
                </span>
                <button onClick={() => handleEditTab(tab)} className="p-2 hover:bg-blue-100 rounded text-blue-600">
                  <FaEdit />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
