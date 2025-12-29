'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase-browser'
import ImageUpload from '@/components/ImageUpload'
import { FaPlus, FaEdit, FaTrash, FaSave, FaTimes, FaArrowUp, FaArrowDown, FaEye, FaEyeSlash } from 'react-icons/fa'
import toast from 'react-hot-toast'

export default function AdminSlidersPage() {
  const [sliders, setSliders] = useState([])
  const [loading, setLoading] = useState(true)
  const [editMode, setEditMode] = useState(null)
  const [formData, setFormData] = useState({ baslik: '', alt_baslik: '', resim: '', buton_metin: '', buton_link: '', sira: 0, aktif: true })
  const supabase = createClient()

  useEffect(() => { fetchSliders() }, [])

  const fetchSliders = async () => {
    const { data } = await supabase.from('sliders').select('*').order('sira')
    setSliders(data || [])
    setLoading(false)
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value })
  }

  const handleNew = () => {
    setEditMode('new')
    setFormData({ baslik: '', alt_baslik: '', resim: '', buton_metin: '', buton_link: '', sira: sliders.length, aktif: true })
  }

  const handleEdit = (item) => { setEditMode(item.id); setFormData(item) }
  const handleCancel = () => { setEditMode(null); setFormData({}) }

  const handleSave = async () => {
    if (!formData.baslik || !formData.resim) { toast.error('Başlık ve resim zorunlu'); return }
    try {
      if (editMode === 'new') {
        await supabase.from('sliders').insert([formData])
        toast.success('Slider eklendi')
      } else {
        await supabase.from('sliders').update(formData).eq('id', editMode)
        toast.success('Slider güncellendi')
      }
      fetchSliders(); handleCancel()
    } catch (error) { toast.error('Hata: ' + error.message) }
  }

  const handleDelete = async (id) => {
    if (!confirm('Silmek istediğinize emin misiniz?')) return
    await supabase.from('sliders').delete().eq('id', id)
    toast.success('Silindi'); fetchSliders()
  }

  const moveItem = async (id, direction) => {
    const idx = sliders.findIndex(s => s.id === id)
    if ((direction === -1 && idx === 0) || (direction === 1 && idx === sliders.length - 1)) return
    const newOrder = [...sliders]
    const [item] = newOrder.splice(idx, 1)
    newOrder.splice(idx + direction, 0, item)
    for (let i = 0; i < newOrder.length; i++) {
      await supabase.from('sliders').update({ sira: i }).eq('id', newOrder[i].id)
    }
    fetchSliders()
  }

  const toggleAktif = async (id, aktif) => {
    await supabase.from('sliders').update({ aktif: !aktif }).eq('id', id)
    fetchSliders()
  }

  if (loading) return <div className="flex justify-center py-12"><div className="spinner"></div></div>

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Slider Yönetimi</h1>
        <button onClick={handleNew} className="admin-btn-primary flex items-center gap-2"><FaPlus /> Yeni Slider</button>
      </div>

      {editMode && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-6">{editMode === 'new' ? 'Yeni Slider' : 'Slider Düzenle'}</h2>
            
            <div className="space-y-4">
              <div>
                <label className="admin-label">Resim *</label>
                <ImageUpload value={formData.resim} onChange={(url) => setFormData({...formData, resim: url})} folder="sliders" />
              </div>

              <div>
                <label className="admin-label">Başlık *</label>
                <input type="text" name="baslik" value={formData.baslik} onChange={handleChange} className="admin-input" />
              </div>

              <div>
                <label className="admin-label">Alt Başlık</label>
                <input type="text" name="alt_baslik" value={formData.alt_baslik || ''} onChange={handleChange} className="admin-input" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="admin-label">Buton Metni</label>
                  <input type="text" name="buton_metin" value={formData.buton_metin || ''} onChange={handleChange} className="admin-input" />
                </div>
                <div>
                  <label className="admin-label">Buton Linki</label>
                  <input type="text" name="buton_link" value={formData.buton_link || ''} onChange={handleChange} className="admin-input" />
                </div>
              </div>

              <label className="flex items-center gap-2">
                <input type="checkbox" name="aktif" checked={formData.aktif} onChange={handleChange} className="w-5 h-5" /> Aktif
              </label>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button onClick={handleCancel} className="admin-btn-secondary"><FaTimes /> İptal</button>
              <button onClick={handleSave} className="admin-btn-primary"><FaSave /> Kaydet</button>
            </div>
          </div>
        </div>
      )}

      <div className="grid gap-4">
        {sliders.map((s) => (
          <div key={s.id} className="admin-card flex items-center gap-4">
            <img src={s.resim} alt="" className="w-32 h-20 object-cover rounded-lg" />
            <div className="flex-1">
              <h3 className="font-semibold">{s.baslik}</h3>
              {s.alt_baslik && <p className="text-sm text-gray-500">{s.alt_baslik}</p>}
            </div>
            <div className="flex items-center gap-1">
              <button onClick={() => moveItem(s.id, -1)} className="p-2 text-gray-400 hover:text-gray-600"><FaArrowUp /></button>
              <button onClick={() => moveItem(s.id, 1)} className="p-2 text-gray-400 hover:text-gray-600"><FaArrowDown /></button>
              <button onClick={() => toggleAktif(s.id, s.aktif)} className={`p-2 ${s.aktif ? 'text-green-600' : 'text-gray-400'}`}>
                {s.aktif ? <FaEye /> : <FaEyeSlash />}
              </button>
              <button onClick={() => handleEdit(s)} className="p-2 text-blue-600 hover:bg-blue-50 rounded"><FaEdit /></button>
              <button onClick={() => handleDelete(s.id)} className="p-2 text-red-600 hover:bg-red-50 rounded"><FaTrash /></button>
            </div>
          </div>
        ))}
      </div>
      {sliders.length === 0 && <p className="text-center py-12 text-gray-500">Henüz slider yok</p>}
    </div>
  )
}
