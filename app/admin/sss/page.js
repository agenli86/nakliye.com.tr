'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase-browser'
import { FaPlus, FaEdit, FaTrash, FaSave, FaTimes, FaArrowUp, FaArrowDown } from 'react-icons/fa'
import toast from 'react-hot-toast'

export default function AdminSSSPage() {
  const [sorular, setSorular] = useState([])
  const [loading, setLoading] = useState(true)
  const [editMode, setEditMode] = useState(null)
  const [formData, setFormData] = useState({ soru: '', cevap: '', sira: 0, aktif: true })

  const supabase = createClient()

  useEffect(() => {
    fetchSorular()
  }, [])

  const fetchSorular = async () => {
    const { data, error } = await supabase.from('sss').select('*').order('sira')
    if (!error) setSorular(data || [])
    setLoading(false)
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value })
  }

  const handleEdit = (soru) => {
    setEditMode(soru.id)
    setFormData(soru)
  }

  const handleNew = () => {
    setEditMode('new')
    setFormData({ soru: '', cevap: '', sira: sorular.length, aktif: true })
  }

  const handleCancel = () => {
    setEditMode(null)
    setFormData({})
  }

  const handleSave = async () => {
    if (!formData.soru || !formData.cevap) {
      toast.error('Soru ve cevap zorunludur')
      return
    }

    try {
      if (editMode === 'new') {
        const { error } = await supabase.from('sss').insert([formData])
        if (error) throw error
        toast.success('Soru eklendi')
      } else {
        const { error } = await supabase.from('sss').update(formData).eq('id', editMode)
        if (error) throw error
        toast.success('Soru güncellendi')
      }
      fetchSorular()
      handleCancel()
    } catch (error) {
      toast.error('Hata: ' + error.message)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Bu soru silinecek. Emin misiniz?')) return
    try {
      const { error } = await supabase.from('sss').delete().eq('id', id)
      if (error) throw error
      toast.success('Soru silindi')
      fetchSorular()
    } catch (error) {
      toast.error('Hata: ' + error.message)
    }
  }

  const handleReorder = async (id, direction) => {
    const index = sorular.findIndex(s => s.id === id)
    if ((direction === -1 && index === 0) || (direction === 1 && index === sorular.length - 1)) return

    const newSorular = [...sorular]
    const temp = newSorular[index]
    newSorular[index] = newSorular[index + direction]
    newSorular[index + direction] = temp

    for (let i = 0; i < newSorular.length; i++) {
      await supabase.from('sss').update({ sira: i }).eq('id', newSorular[i].id)
    }
    fetchSorular()
  }

  if (loading) {
    return <div className="flex justify-center py-12"><div className="spinner"></div></div>
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Sıkça Sorulan Sorular</h1>
        <button onClick={handleNew} className="admin-btn-primary flex items-center gap-2">
          <FaPlus /> Yeni Soru
        </button>
      </div>

      {/* Form Modal */}
      {editMode && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl">
            <h2 className="text-xl font-bold mb-6">
              {editMode === 'new' ? 'Yeni Soru' : 'Soru Düzenle'}
            </h2>

            <div className="space-y-4">
              <div>
                <label className="admin-label">Soru *</label>
                <input
                  type="text"
                  name="soru"
                  value={formData.soru}
                  onChange={handleChange}
                  className="admin-input"
                />
              </div>

              <div>
                <label className="admin-label">Cevap *</label>
                <textarea
                  name="cevap"
                  value={formData.cevap}
                  onChange={handleChange}
                  rows={5}
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

      {/* SSS List */}
      <div className="space-y-4">
        {sorular.map((soru, index) => (
          <div key={soru.id} className="admin-card">
            <div className="flex items-start gap-4">
              <div className="flex flex-col gap-1">
                <button
                  onClick={() => handleReorder(soru.id, -1)}
                  disabled={index === 0}
                  className="p-1 hover:bg-gray-200 rounded disabled:opacity-30"
                >
                  <FaArrowUp />
                </button>
                <button
                  onClick={() => handleReorder(soru.id, 1)}
                  disabled={index === sorular.length - 1}
                  className="p-1 hover:bg-gray-200 rounded disabled:opacity-30"
                >
                  <FaArrowDown />
                </button>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg mb-2">{soru.soru}</h3>
                <p className="text-gray-600">{soru.cevap}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-2 py-1 rounded-full text-xs ${soru.aktif ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {soru.aktif ? 'Aktif' : 'Pasif'}
                </span>
                <button onClick={() => handleEdit(soru)} className="p-2 hover:bg-blue-100 rounded text-blue-600">
                  <FaEdit />
                </button>
                <button onClick={() => handleDelete(soru.id)} className="p-2 hover:bg-red-100 rounded text-red-600">
                  <FaTrash />
                </button>
              </div>
            </div>
          </div>
        ))}
        {sorular.length === 0 && (
          <p className="text-center py-8 text-gray-500">Henüz soru eklenmemiş</p>
        )}
      </div>
    </div>
  )
}
