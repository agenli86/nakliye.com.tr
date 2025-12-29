'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase-browser'
import ImageUpload from '@/components/ImageUpload'
import { FaPlus, FaEdit, FaTrash, FaSave, FaTimes, FaImage } from 'react-icons/fa'
import toast from 'react-hot-toast'

export default function AdminGaleriPage() {
  const [galeri, setGaleri] = useState([])
  const [loading, setLoading] = useState(true)
  const [editMode, setEditMode] = useState(null)
  const [formData, setFormData] = useState({
    baslik: '',
    aciklama: '',
    resim: '',
    kategori: '',
    sira: 0,
    aktif: true,
  })

  const supabase = createClient()

  useEffect(() => {
    fetchGaleri()
  }, [])

  const fetchGaleri = async () => {
    const { data, error } = await supabase.from('galeri').select('*').order('sira')
    if (!error) setGaleri(data || [])
    setLoading(false)
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value })
  }

  const handleImageChange = (url) => {
    setFormData({ ...formData, resim: url })
  }

  const handleNew = () => {
    setEditMode('new')
    setFormData({ baslik: '', aciklama: '', resim: '', kategori: '', sira: galeri.length, aktif: true })
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
    if (!formData.resim) {
      toast.error('Resim zorunludur')
      return
    }

    try {
      if (editMode === 'new') {
        const { error } = await supabase.from('galeri').insert([formData])
        if (error) throw error
        toast.success('Resim eklendi')
      } else {
        const { error } = await supabase.from('galeri').update(formData).eq('id', editMode)
        if (error) throw error
        toast.success('Resim güncellendi')
      }
      fetchGaleri()
      handleCancel()
    } catch (error) {
      toast.error('Hata: ' + error.message)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Bu resim silinecek. Emin misiniz?')) return
    try {
      const { error } = await supabase.from('galeri').delete().eq('id', id)
      if (error) throw error
      toast.success('Resim silindi')
      fetchGaleri()
    } catch (error) {
      toast.error('Hata: ' + error.message)
    }
  }

  if (loading) {
    return <div className="flex justify-center py-12"><div className="spinner"></div></div>
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Galeri</h1>
        <button onClick={handleNew} className="admin-btn-primary flex items-center gap-2">
          <FaPlus /> Yeni Resim
        </button>
      </div>

      {/* Form Modal */}
      {editMode && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-6">
              {editMode === 'new' ? 'Yeni Resim' : 'Resim Düzenle'}
            </h2>

            <div className="space-y-4">
              <div>
                <label className="admin-label">Resim *</label>
                <ImageUpload
                  value={formData.resim}
                  onChange={handleImageChange}
                  folder="galeri"
                />
              </div>

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
                <label className="admin-label">Açıklama</label>
                <textarea
                  name="aciklama"
                  value={formData.aciklama || ''}
                  onChange={handleChange}
                  rows={2}
                  className="admin-input resize-none"
                ></textarea>
              </div>

              <div>
                <label className="admin-label">Kategori</label>
                <input
                  type="text"
                  name="kategori"
                  value={formData.kategori || ''}
                  onChange={handleChange}
                  className="admin-input"
                  placeholder="Nakliyat, Asansör, Ofis..."
                />
              </div>

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

      {/* Gallery Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {galeri.map((item) => (
          <div key={item.id} className="admin-card p-2 group relative">
            <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
              {item.resim ? (
                <img src={item.resim} alt={item.baslik} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <FaImage className="text-gray-400 text-4xl" />
                </div>
              )}
            </div>
            {item.baslik && (
              <p className="mt-2 text-sm font-medium truncate">{item.baslik}</p>
            )}
            {item.kategori && (
              <p className="text-xs text-gray-500">{item.kategori}</p>
            )}
            
            {/* Actions */}
            <div className="absolute top-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={() => handleEdit(item)} className="p-2 bg-white rounded shadow hover:bg-blue-50">
                <FaEdit className="text-blue-600" size={14} />
              </button>
              <button onClick={() => handleDelete(item.id)} className="p-2 bg-white rounded shadow hover:bg-red-50">
                <FaTrash className="text-red-600" size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {galeri.length === 0 && (
        <p className="text-center py-12 text-gray-500">Henüz resim eklenmemiş</p>
      )}
    </div>
  )
}
