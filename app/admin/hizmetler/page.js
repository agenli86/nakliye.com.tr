'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase-browser'
import ImageUpload from '@/components/ImageUpload'
import dynamic from 'next/dynamic'
import { FaPlus, FaEdit, FaTrash, FaSave, FaTimes, FaEye, FaEyeSlash, FaArrowUp, FaArrowDown } from 'react-icons/fa'
import toast from 'react-hot-toast'

// RichTextEditor'ı client-side only yükle
const RichTextEditor = dynamic(() => import('@/components/RichTextEditor'), { ssr: false })

export default function AdminHizmetlerPage() {
  const [hizmetler, setHizmetler] = useState([])
  const [loading, setLoading] = useState(true)
  const [editMode, setEditMode] = useState(null)
  const [formData, setFormData] = useState({
    baslik: '', slug: '', kisa_aciklama: '', icerik: '', resim: '', icon: '', sira: 0,
    anasayfada_goster: true, aktif: true,
    meta_title: '', meta_description: '', meta_keywords: '', og_image: '', canonical_url: ''
  })
  const supabase = createClient()

  useEffect(() => { fetchHizmetler() }, [])

  const fetchHizmetler = async () => {
    const { data } = await supabase.from('hizmetler').select('*').order('sira')
    setHizmetler(data || [])
    setLoading(false)
  }

  const generateSlug = (text) => text.toLowerCase().replace(/ğ/g,'g').replace(/ü/g,'u').replace(/ş/g,'s').replace(/ı/g,'i').replace(/ö/g,'o').replace(/ç/g,'c').replace(/[^a-z0-9]+/g,'-').replace(/-+/g,'-').replace(/^-|-$/g,'')

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    let newData = { ...formData, [name]: type === 'checkbox' ? checked : value }
    if (name === 'baslik' && editMode === 'new') {
      newData.slug = generateSlug(value)
      if (!newData.meta_title) newData.meta_title = value
    }
    setFormData(newData)
  }

  const handleNew = () => {
    setEditMode('new')
    setFormData({ baslik: '', slug: '', kisa_aciklama: '', icerik: '', resim: '', icon: '', sira: hizmetler.length, anasayfada_goster: true, aktif: true, meta_title: '', meta_description: '', meta_keywords: '', og_image: '', canonical_url: '' })
  }

  const handleEdit = (item) => { setEditMode(item.id); setFormData(item) }
  const handleCancel = () => { setEditMode(null); setFormData({}) }

  const handleSave = async () => {
    if (!formData.baslik || !formData.slug) { toast.error('Başlık ve slug zorunlu'); return }
    try {
      if (editMode === 'new') {
        await supabase.from('hizmetler').insert([formData])
        toast.success('Hizmet eklendi')
      } else {
        await supabase.from('hizmetler').update(formData).eq('id', editMode)
        toast.success('Hizmet güncellendi')
      }
      fetchHizmetler(); handleCancel()
    } catch (error) { toast.error('Hata: ' + error.message) }
  }

  const handleDelete = async (id) => {
    if (!confirm('Silmek istediğinize emin misiniz?')) return
    await supabase.from('hizmetler').delete().eq('id', id)
    toast.success('Silindi'); fetchHizmetler()
  }

  const moveItem = async (id, direction) => {
    const idx = hizmetler.findIndex(h => h.id === id)
    if ((direction === -1 && idx === 0) || (direction === 1 && idx === hizmetler.length - 1)) return
    const newOrder = [...hizmetler]
    const [item] = newOrder.splice(idx, 1)
    newOrder.splice(idx + direction, 0, item)
    for (let i = 0; i < newOrder.length; i++) {
      await supabase.from('hizmetler').update({ sira: i }).eq('id', newOrder[i].id)
    }
    fetchHizmetler()
  }

  if (loading) return <div className="flex justify-center py-12"><div className="spinner"></div></div>

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Hizmetler</h1>
        <button onClick={handleNew} className="admin-btn-primary flex items-center gap-2"><FaPlus /> Yeni Hizmet</button>
      </div>

      {editMode && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-6">{editMode === 'new' ? 'Yeni Hizmet' : 'Hizmet Düzenle'}</h2>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="admin-label">Başlık *</label>
                <input type="text" name="baslik" value={formData.baslik} onChange={handleChange} className="admin-input" />
              </div>
              <div>
                <label className="admin-label">Slug *</label>
                <input type="text" name="slug" value={formData.slug} onChange={handleChange} className="admin-input" />
              </div>
            </div>

            <div className="mt-4">
              <label className="admin-label">Resim</label>
              <ImageUpload value={formData.resim} onChange={(url) => setFormData({...formData, resim: url})} folder="hizmetler" />
            </div>

            <div className="mt-4">
              <label className="admin-label">Kısa Açıklama</label>
              <textarea name="kisa_aciklama" value={formData.kisa_aciklama || ''} onChange={handleChange} rows={2} className="admin-input resize-none" />
            </div>

            <div className="mt-4">
              <label className="admin-label">İçerik</label>
              <RichTextEditor 
                value={formData.icerik || ''} 
                onChange={(html) => setFormData({...formData, icerik: html})}
                placeholder="Hizmet içeriğini yazın..."
              />
            </div>

            <div className="flex gap-4 mt-4">
              <label className="flex items-center gap-2"><input type="checkbox" name="anasayfada_goster" checked={formData.anasayfada_goster} onChange={handleChange} className="w-5 h-5" /> Anasayfada Göster</label>
              <label className="flex items-center gap-2"><input type="checkbox" name="aktif" checked={formData.aktif} onChange={handleChange} className="w-5 h-5" /> Aktif</label>
            </div>

            <hr className="my-6" />
            <h3 className="font-bold mb-4">SEO Ayarları</h3>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="admin-label">Meta Title</label>
                <input type="text" name="meta_title" value={formData.meta_title || ''} onChange={handleChange} className="admin-input" />
              </div>
              <div>
                <label className="admin-label">Canonical URL</label>
                <input type="text" name="canonical_url" value={formData.canonical_url || ''} onChange={handleChange} className="admin-input" />
              </div>
            </div>

            <div className="mt-4">
              <label className="admin-label">Meta Description</label>
              <textarea name="meta_description" value={formData.meta_description || ''} onChange={handleChange} rows={2} className="admin-input resize-none" />
            </div>

            <div className="mt-4">
              <label className="admin-label">OG Image</label>
              <ImageUpload value={formData.og_image} onChange={(url) => setFormData({...formData, og_image: url})} folder="seo" />
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button onClick={handleCancel} className="admin-btn-secondary"><FaTimes /> İptal</button>
              <button onClick={handleSave} className="admin-btn-primary"><FaSave /> Kaydet</button>
            </div>
          </div>
        </div>
      )}

      <div className="grid gap-4">
        {hizmetler.map((h) => (
          <div key={h.id} className="admin-card flex items-center gap-4">
            {h.resim && <img src={h.resim} alt="" className="w-20 h-20 object-cover rounded-lg" />}
            <div className="flex-1">
              <h3 className="font-semibold">{h.baslik}</h3>
              <p className="text-sm text-gray-500">/hizmet/{h.slug}</p>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={() => moveItem(h.id, -1)} className="p-2 text-gray-400 hover:text-gray-600"><FaArrowUp /></button>
              <button onClick={() => moveItem(h.id, 1)} className="p-2 text-gray-400 hover:text-gray-600"><FaArrowDown /></button>
              <button onClick={() => handleEdit(h)} className="p-2 text-blue-600 hover:bg-blue-50 rounded"><FaEdit /></button>
              <button onClick={() => handleDelete(h.id)} className="p-2 text-red-600 hover:bg-red-50 rounded"><FaTrash /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
