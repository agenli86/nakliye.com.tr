'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase-browser'
import { FaPlus, FaEdit, FaTrash, FaSave, FaTimes, FaEye, FaEyeSlash, FaArrowUp, FaArrowDown, FaAward, FaShieldAlt, FaMoneyBillWave, FaTruck, FaClock, FaHeadset } from 'react-icons/fa'
import toast from 'react-hot-toast'

const iconOptions = [
  { value: 'award', label: 'Rozet', icon: FaAward },
  { value: 'shield', label: 'Kalkan', icon: FaShieldAlt },
  { value: 'money', label: 'Para', icon: FaMoneyBillWave },
  { value: 'truck', label: 'Kamyon', icon: FaTruck },
  { value: 'clock', label: 'Saat', icon: FaClock },
  { value: 'headset', label: 'Destek', icon: FaHeadset },
]

export default function AdminKutucuklarPage() {
  const [kutucuklar, setKutucuklar] = useState([])
  const [loading, setLoading] = useState(true)
  const [editMode, setEditMode] = useState(null)
  const [formData, setFormData] = useState({ baslik: '', aciklama: '', icon: 'award', link: '', sira: 0, aktif: true })
  const supabase = createClient()

  useEffect(() => { fetchData() }, [])

  const fetchData = async () => {
    const { data } = await supabase.from('ozellik_kutucuklari').select('*').order('sira')
    setKutucuklar(data || [])
    setLoading(false)
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value })
  }

  const handleNew = () => {
    setEditMode('new')
    setFormData({ baslik: '', aciklama: '', icon: 'award', link: '', sira: kutucuklar.length, aktif: true })
  }

  const handleEdit = (item) => { setEditMode(item.id); setFormData(item) }
  const handleCancel = () => { setEditMode(null); setFormData({}) }

  const handleSave = async () => {
    if (!formData.baslik) { toast.error('Başlık zorunlu'); return }
    try {
      if (editMode === 'new') {
        await supabase.from('ozellik_kutucuklari').insert([formData])
        toast.success('Kutucuk eklendi')
      } else {
        await supabase.from('ozellik_kutucuklari').update(formData).eq('id', editMode)
        toast.success('Kutucuk güncellendi')
      }
      fetchData(); handleCancel()
    } catch (error) { toast.error('Hata: ' + error.message) }
  }

  const handleDelete = async (id) => {
    if (!confirm('Silmek istediğinize emin misiniz?')) return
    await supabase.from('ozellik_kutucuklari').delete().eq('id', id)
    toast.success('Silindi'); fetchData()
  }

  const toggleAktif = async (id, aktif) => {
    await supabase.from('ozellik_kutucuklari').update({ aktif: !aktif }).eq('id', id)
    fetchData()
  }

  const moveItem = async (id, direction) => {
    const idx = kutucuklar.findIndex(k => k.id === id)
    if ((direction === -1 && idx === 0) || (direction === 1 && idx === kutucuklar.length - 1)) return
    const newOrder = [...kutucuklar]
    const [item] = newOrder.splice(idx, 1)
    newOrder.splice(idx + direction, 0, item)
    for (let i = 0; i < newOrder.length; i++) {
      await supabase.from('ozellik_kutucuklari').update({ sira: i }).eq('id', newOrder[i].id)
    }
    fetchData()
  }

  const getIconComponent = (iconName) => {
    const found = iconOptions.find(i => i.value === iconName)
    return found ? found.icon : FaAward
  }

  if (loading) return <div className="flex justify-center py-12"><div className="spinner"></div></div>

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Özellik Kutucukları</h1>
          <p className="text-gray-500 text-sm mt-1">Anasayfa AdWords uyumlu kutucuklar</p>
        </div>
        <button onClick={handleNew} className="admin-btn-primary flex items-center gap-2"><FaPlus /> Yeni Kutucuk</button>
      </div>

      {/* Preview */}
      <div className="mb-6 p-6 bg-gray-50 rounded-xl">
        <p className="text-sm text-gray-500 mb-4 text-center">Önizleme</p>
        <div className="grid md:grid-cols-3 gap-4">
          {kutucuklar.filter(k => k.aktif).slice(0, 3).map((k) => {
            const IconComp = getIconComponent(k.icon)
            return (
              <div key={k.id} className="text-center p-4 bg-white rounded-xl shadow-sm">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl mb-3" style={{ backgroundColor: '#046ffb' }}>
                  <IconComp className="text-xl text-white" />
                </div>
                <h4 className="font-bold text-sm mb-1" style={{ color: '#1e3a5f' }}>{k.baslik}</h4>
                <p className="text-xs text-gray-500 line-clamp-2">{k.aciklama}</p>
              </div>
            )
          })}
        </div>
      </div>

      {/* Modal */}
      {editMode && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-6">{editMode === 'new' ? 'Yeni Kutucuk' : 'Kutucuk Düzenle'}</h2>
            
            <div className="space-y-4">
              <div>
                <label className="admin-label">Başlık *</label>
                <input type="text" name="baslik" value={formData.baslik} onChange={handleChange} className="admin-input" placeholder="%100 Garanti Veriyoruz" />
              </div>

              <div>
                <label className="admin-label">Açıklama</label>
                <textarea name="aciklama" value={formData.aciklama || ''} onChange={handleChange} rows={3} className="admin-input" placeholder="Kısa açıklama..." />
              </div>

              <div>
                <label className="admin-label">İkon</label>
                <div className="grid grid-cols-3 gap-2">
                  {iconOptions.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, icon: opt.value })}
                      className={`p-3 rounded-lg flex flex-col items-center gap-1 transition-all ${
                        formData.icon === opt.value ? 'ring-2 ring-blue-500 bg-blue-50' : 'bg-gray-100 hover:bg-gray-200'
                      }`}
                    >
                      <opt.icon className="text-xl" style={{ color: formData.icon === opt.value ? '#046ffb' : '#666' }} />
                      <span className="text-xs">{opt.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="admin-label">Link</label>
                <input type="text" name="link" value={formData.link || ''} onChange={handleChange} className="admin-input" placeholder="/hizmetler" />
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

      {/* List */}
      <div className="space-y-3">
        {kutucuklar.map((k) => {
          const IconComp = getIconComponent(k.icon)
          return (
            <div key={k.id} className="admin-card flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#046ffb' }}>
                <IconComp className="text-xl text-white" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold">{k.baslik}</h4>
                <p className="text-sm text-gray-500 line-clamp-1">{k.aciklama}</p>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => moveItem(k.id, -1)} className="p-2 text-gray-400 hover:text-gray-600"><FaArrowUp /></button>
                <button onClick={() => moveItem(k.id, 1)} className="p-2 text-gray-400 hover:text-gray-600"><FaArrowDown /></button>
                <button onClick={() => toggleAktif(k.id, k.aktif)} className={`p-2 ${k.aktif ? 'text-green-600' : 'text-gray-400'}`}>
                  {k.aktif ? <FaEye /> : <FaEyeSlash />}
                </button>
                <button onClick={() => handleEdit(k)} className="p-2 text-blue-600 hover:bg-blue-50 rounded"><FaEdit /></button>
                <button onClick={() => handleDelete(k.id)} className="p-2 text-red-600 hover:bg-red-50 rounded"><FaTrash /></button>
              </div>
            </div>
          )
        })}
      </div>

      {kutucuklar.length === 0 && (
        <div className="text-center py-12">
          <FaAward className="text-5xl text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">Henüz kutucuk yok</p>
          <button onClick={handleNew} className="mt-4 text-blue-600 hover:underline">İlk kutucuğu ekle</button>
        </div>
      )}
    </div>
  )
}
