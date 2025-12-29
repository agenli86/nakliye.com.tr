'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase-browser'
import { FaPlus, FaEdit, FaTrash, FaSave, FaTimes } from 'react-icons/fa'
import toast from 'react-hot-toast'

export default function AdminFiyatlarPage() {
  const [fiyatlar, setFiyatlar] = useState([])
  const [loading, setLoading] = useState(true)
  const [editMode, setEditMode] = useState(null)
  const [formData, setFormData] = useState({
    daire_tipi: '',
    min_fiyat: '',
    max_fiyat: '',
    aciklama: '',
    sira: 0,
    aktif: true,
  })

  const supabase = createClient()

  useEffect(() => {
    fetchFiyatlar()
  }, [])

  const fetchFiyatlar = async () => {
    const { data, error } = await supabase.from('fiyatlar').select('*').order('sira')
    if (!error) setFiyatlar(data || [])
    setLoading(false)
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value })
  }

  const handleEdit = (fiyat) => {
    setEditMode(fiyat.id)
    setFormData(fiyat)
  }

  const handleNew = () => {
    setEditMode('new')
    setFormData({ daire_tipi: '', min_fiyat: '', max_fiyat: '', aciklama: '', sira: fiyatlar.length, aktif: true })
  }

  const handleCancel = () => {
    setEditMode(null)
    setFormData({})
  }

  const handleSave = async () => {
    if (!formData.daire_tipi || !formData.min_fiyat || !formData.max_fiyat) {
      toast.error('Tüm alanları doldurun')
      return
    }

    try {
      const dataToSave = {
        ...formData,
        min_fiyat: parseFloat(formData.min_fiyat),
        max_fiyat: parseFloat(formData.max_fiyat),
      }

      if (editMode === 'new') {
        const { error } = await supabase.from('fiyatlar').insert([dataToSave])
        if (error) throw error
        toast.success('Fiyat eklendi')
      } else {
        const { error } = await supabase.from('fiyatlar').update(dataToSave).eq('id', editMode)
        if (error) throw error
        toast.success('Fiyat güncellendi')
      }
      fetchFiyatlar()
      handleCancel()
    } catch (error) {
      toast.error('Hata: ' + error.message)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Bu fiyat silinecek. Emin misiniz?')) return
    try {
      const { error } = await supabase.from('fiyatlar').delete().eq('id', id)
      if (error) throw error
      toast.success('Fiyat silindi')
      fetchFiyatlar()
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
        <h1 className="text-2xl font-bold">Fiyatlar</h1>
        <button onClick={handleNew} className="admin-btn-primary flex items-center gap-2">
          <FaPlus /> Yeni Fiyat
        </button>
      </div>

      {/* Form Modal */}
      {editMode && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg">
            <h2 className="text-xl font-bold mb-6">
              {editMode === 'new' ? 'Yeni Fiyat' : 'Fiyat Düzenle'}
            </h2>

            <div className="space-y-4">
              <div>
                <label className="admin-label">Daire Tipi *</label>
                <input
                  type="text"
                  name="daire_tipi"
                  value={formData.daire_tipi}
                  onChange={handleChange}
                  className="admin-input"
                  placeholder="1+1 Adana Evden Eve Nakliyat fiyatı"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="admin-label">En Az Fiyat (TL) *</label>
                  <input
                    type="number"
                    name="min_fiyat"
                    value={formData.min_fiyat}
                    onChange={handleChange}
                    className="admin-input"
                  />
                </div>
                <div>
                  <label className="admin-label">En Çok Fiyat (TL) *</label>
                  <input
                    type="number"
                    name="max_fiyat"
                    value={formData.max_fiyat}
                    onChange={handleChange}
                    className="admin-input"
                  />
                </div>
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

      {/* Fiyatlar Table */}
      <div className="admin-card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4">Daire Tipi</th>
                <th className="text-left py-3 px-4">En Az</th>
                <th className="text-left py-3 px-4">En Çok</th>
                <th className="text-left py-3 px-4">Durum</th>
                <th className="text-right py-3 px-4">İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {fiyatlar.map((fiyat) => (
                <tr key={fiyat.id} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium">{fiyat.daire_tipi}</td>
                  <td className="py-3 px-4 text-primary-600">{parseFloat(fiyat.min_fiyat).toLocaleString('tr-TR')} ₺</td>
                  <td className="py-3 px-4 text-primary-600">{parseFloat(fiyat.max_fiyat).toLocaleString('tr-TR')} ₺</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs ${fiyat.aktif ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {fiyat.aktif ? 'Aktif' : 'Pasif'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button onClick={() => handleEdit(fiyat)} className="p-2 hover:bg-blue-100 rounded text-blue-600">
                      <FaEdit />
                    </button>
                    <button onClick={() => handleDelete(fiyat.id)} className="p-2 hover:bg-red-100 rounded text-red-600">
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {fiyatlar.length === 0 && (
            <p className="text-center py-8 text-gray-500">Henüz fiyat eklenmemiş</p>
          )}
        </div>
      </div>
    </div>
  )
}
