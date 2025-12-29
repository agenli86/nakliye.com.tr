'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase-browser'
import { FaPlus, FaEdit, FaTrash, FaSave, FaTimes, FaEye, FaEyeSlash, FaArrowUp, FaArrowDown, FaBullhorn } from 'react-icons/fa'
import toast from 'react-hot-toast'

export default function AdminDuyurularPage() {
  const [duyurular, setDuyurular] = useState([])
  const [loading, setLoading] = useState(true)
  const [editMode, setEditMode] = useState(null)
  const [formData, setFormData] = useState({ metin: '', link: '', icon: '📢', sira: 0, aktif: true })
  const supabase = createClient()

  const iconOptions = ['📢', '🚚', '📦', '⭐', '🎉', '💰', '📞', '✅', '🏠', '🔥', '💪', '🎁']

  useEffect(() => { fetchDuyurular() }, [])

  const fetchDuyurular = async () => {
    const { data } = await supabase.from('duyurular').select('*').order('sira')
    setDuyurular(data || [])
    setLoading(false)
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value })
  }

  const handleNew = () => {
    setEditMode('new')
    setFormData({ metin: '', link: '', icon: '📢', sira: duyurular.length, aktif: true })
  }

  const handleEdit = (item) => { setEditMode(item.id); setFormData(item) }
  const handleCancel = () => { setEditMode(null); setFormData({}) }

  const handleSave = async () => {
    if (!formData.metin) { toast.error('Duyuru metni zorunlu'); return }
    try {
      if (editMode === 'new') {
        await supabase.from('duyurular').insert([formData])
        toast.success('Duyuru eklendi')
      } else {
        await supabase.from('duyurular').update(formData).eq('id', editMode)
        toast.success('Duyuru güncellendi')
      }
      fetchDuyurular(); handleCancel()
    } catch (error) { toast.error('Hata: ' + error.message) }
  }

  const handleDelete = async (id) => {
    if (!confirm('Silmek istediğinize emin misiniz?')) return
    await supabase.from('duyurular').delete().eq('id', id)
    toast.success('Silindi'); fetchDuyurular()
  }

  const toggleAktif = async (id, aktif) => {
    await supabase.from('duyurular').update({ aktif: !aktif }).eq('id', id)
    fetchDuyurular()
  }

  const moveItem = async (id, direction) => {
    const idx = duyurular.findIndex(d => d.id === id)
    if ((direction === -1 && idx === 0) || (direction === 1 && idx === duyurular.length - 1)) return
    const newOrder = [...duyurular]
    const [item] = newOrder.splice(idx, 1)
    newOrder.splice(idx + direction, 0, item)
    for (let i = 0; i < newOrder.length; i++) {
      await supabase.from('duyurular').update({ sira: i }).eq('id', newOrder[i].id)
    }
    fetchDuyurular()
  }

  if (loading) return <div className="flex justify-center py-12"><div className="spinner"></div></div>

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Kayan Duyurular</h1>
          <p className="text-gray-500 text-sm mt-1">Slider altında kayan duyuru bandı</p>
        </div>
        <button onClick={handleNew} className="admin-btn-primary flex items-center gap-2"><FaPlus /> Yeni Duyuru</button>
      </div>

      {/* Preview */}
      {duyurular.filter(d => d.aktif).length > 0 && (
        <div className="mb-6 rounded-xl overflow-hidden">
          <div className="py-3 px-4" style={{ backgroundColor: '#d4ed31' }}>
            <div className="flex items-center gap-4 overflow-hidden">
              {duyurular.filter(d => d.aktif).map((d, i) => (
                <span key={d.id} className="whitespace-nowrap font-semibold" style={{ color: '#1e3a5f' }}>
                  {d.icon} {d.metin}
                  {i < duyurular.filter(d => d.aktif).length - 1 && <span className="ml-4">•</span>}
                </span>
              ))}
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2 text-center">Önizleme (sitede otomatik kayar)</p>
        </div>
      )}

      {editMode && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg">
            <h2 className="text-xl font-bold mb-6">{editMode === 'new' ? 'Yeni Duyuru' : 'Duyuru Düzenle'}</h2>
            
            <div className="space-y-4">
              <div>
                <label className="admin-label">Duyuru Metni *</label>
                <input type="text" name="metin" value={formData.metin} onChange={handleChange} className="admin-input" placeholder="Ücretsiz keşif için hemen arayın!" />
              </div>

              <div>
                <label className="admin-label">İkon</label>
                <div className="flex flex-wrap gap-2">
                  {iconOptions.map((icon) => (
                    <button
                      key={icon}
                      type="button"
                      onClick={() => setFormData({ ...formData, icon })}
                      className={`w-10 h-10 rounded-lg text-xl flex items-center justify-center transition-all ${
                        formData.icon === icon ? 'ring-2 ring-blue-500 bg-blue-50' : 'bg-gray-100 hover:bg-gray-200'
                      }`}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="admin-label">Link (Opsiyonel)</label>
                <input type="text" name="link" value={formData.link || ''} onChange={handleChange} className="admin-input" placeholder="/teklif-al" />
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

      <div className="space-y-3">
        {duyurular.map((d) => (
          <div key={d.id} className="admin-card flex items-center gap-4">
            <span className="text-2xl">{d.icon}</span>
            <div className="flex-1">
              <p className="font-medium">{d.metin}</p>
              {d.link && <p className="text-sm text-gray-500">{d.link}</p>}
            </div>
            <div className="flex items-center gap-1">
              <button onClick={() => moveItem(d.id, -1)} className="p-2 text-gray-400 hover:text-gray-600"><FaArrowUp /></button>
              <button onClick={() => moveItem(d.id, 1)} className="p-2 text-gray-400 hover:text-gray-600"><FaArrowDown /></button>
              <button onClick={() => toggleAktif(d.id, d.aktif)} className={`p-2 ${d.aktif ? 'text-green-600' : 'text-gray-400'}`}>
                {d.aktif ? <FaEye /> : <FaEyeSlash />}
              </button>
              <button onClick={() => handleEdit(d)} className="p-2 text-blue-600 hover:bg-blue-50 rounded"><FaEdit /></button>
              <button onClick={() => handleDelete(d.id)} className="p-2 text-red-600 hover:bg-red-50 rounded"><FaTrash /></button>
            </div>
          </div>
        ))}
      </div>
      {duyurular.length === 0 && (
        <div className="text-center py-12">
          <FaBullhorn className="text-5xl text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">Henüz duyuru yok</p>
        </div>
      )}
    </div>
  )
}
