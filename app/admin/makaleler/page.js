'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase-browser'
import ImageUpload from '@/components/ImageUpload'
import dynamic from 'next/dynamic'
import { FaPlus, FaEdit, FaTrash, FaSave, FaTimes, FaEye, FaEyeSlash } from 'react-icons/fa'
import toast from 'react-hot-toast'

// RichTextEditor'ı client-side only yükle
const RichTextEditor = dynamic(() => import('@/components/RichTextEditor'), { ssr: false })

export default function AdminMakalelerPage() {
  const [makaleler, setMakaleler] = useState([])
  const [loading, setLoading] = useState(true)
  const [editMode, setEditMode] = useState(null)
  const [formData, setFormData] = useState({
    baslik: '', slug: '', ozet: '', icerik: '', resim: '', kategori: '', etiketler: '',
    meta_title: '', meta_description: '', meta_keywords: '', og_image: '', canonical_url: '', aktif: true
  })
  const supabase = createClient()

  useEffect(() => { fetchMakaleler() }, [])

  const fetchMakaleler = async () => {
    const { data } = await supabase.from('makaleler').select('*').order('created_at', { ascending: false })
    setMakaleler(data || [])
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
    setFormData({ baslik: '', slug: '', ozet: '', icerik: '', resim: '', kategori: '', etiketler: '', meta_title: '', meta_description: '', meta_keywords: '', og_image: '', canonical_url: '', aktif: true })
  }

  const handleEdit = (item) => { setEditMode(item.id); setFormData(item) }
  const handleCancel = () => { setEditMode(null); setFormData({}) }

  const handleSave = async () => {
    if (!formData.baslik || !formData.slug) { toast.error('Başlık ve slug zorunlu'); return }
    try {
      if (editMode === 'new') {
        const { error } = await supabase.from('makaleler').insert([formData])
        if (error) throw error
        toast.success('Makale eklendi')
      } else {
        const { error } = await supabase.from('makaleler').update(formData).eq('id', editMode)
        if (error) throw error
        toast.success('Makale güncellendi')
      }
      fetchMakaleler(); handleCancel()
    } catch (error) { toast.error('Hata: ' + error.message) }
  }

  const handleDelete = async (id) => {
    if (!confirm('Silmek istediğinize emin misiniz?')) return
    const { error } = await supabase.from('makaleler').delete().eq('id', id)
    if (error) toast.error('Hata'); else { toast.success('Silindi'); fetchMakaleler() }
  }

  const toggleAktif = async (id, aktif) => {
    await supabase.from('makaleler').update({ aktif: !aktif }).eq('id', id)
    fetchMakaleler()
  }

  if (loading) return <div className="flex justify-center py-12"><div className="spinner"></div></div>

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Makaleler</h1>
        <button onClick={handleNew} className="admin-btn-primary flex items-center gap-2"><FaPlus /> Yeni Makale</button>
      </div>

      {editMode && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-6">{editMode === 'new' ? 'Yeni Makale' : 'Makale Düzenle'}</h2>
            
            <div className="grid md:grid-cols-2 gap-6">
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
              <ImageUpload value={formData.resim} onChange={(url) => setFormData({...formData, resim: url})} folder="makaleler" />
            </div>

            <div className="mt-4">
              <label className="admin-label">Özet</label>
              <textarea name="ozet" value={formData.ozet || ''} onChange={handleChange} rows={2} className="admin-input resize-none" />
            </div>

            <div className="mt-4">
              <label className="admin-label">İçerik</label>
              <RichTextEditor 
                value={formData.icerik || ''} 
                onChange={(html) => setFormData({...formData, icerik: html})}
                placeholder="Makale içeriğini yazın..."
              />
            </div>

            <div className="grid md:grid-cols-2 gap-6 mt-4">
              <div>
                <label className="admin-label">Kategori</label>
                <input type="text" name="kategori" value={formData.kategori || ''} onChange={handleChange} className="admin-input" />
              </div>
              <div>
                <label className="admin-label">Etiketler</label>
                <input type="text" name="etiketler" value={formData.etiketler || ''} onChange={handleChange} className="admin-input" placeholder="etiket1, etiket2" />
              </div>
            </div>

            <hr className="my-6" />
            <h3 className="font-bold mb-4">SEO Ayarları</h3>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="admin-label">Meta Title</label>
                <input type="text" name="meta_title" value={formData.meta_title || ''} onChange={handleChange} className="admin-input" />
              </div>
              <div>
                <label className="admin-label">Canonical URL</label>
                <input type="text" name="canonical_url" value={formData.canonical_url || ''} onChange={handleChange} className="admin-input" placeholder="https://..." />
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

            <label className="flex items-center gap-2 mt-4">
              <input type="checkbox" name="aktif" checked={formData.aktif} onChange={handleChange} className="w-5 h-5" /> Aktif
            </label>

            <div className="flex justify-end gap-3 mt-6">
              <button onClick={handleCancel} className="admin-btn-secondary flex items-center gap-2"><FaTimes /> İptal</button>
              <button onClick={handleSave} className="admin-btn-primary flex items-center gap-2"><FaSave /> Kaydet</button>
            </div>
          </div>
        </div>
      )}

      <div className="grid gap-4">
        {makaleler.map((m) => (
          <div key={m.id} className="admin-card flex items-center gap-4">
            {m.resim && <img src={m.resim} alt="" className="w-20 h-20 object-cover rounded-lg" />}
            <div className="flex-1">
              <h3 className="font-semibold">{m.baslik}</h3>
              <p className="text-sm text-gray-500">/makale/{m.slug}</p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => toggleAktif(m.id, m.aktif)} className={`p-2 rounded ${m.aktif ? 'text-green-600' : 'text-gray-400'}`}>
                {m.aktif ? <FaEye /> : <FaEyeSlash />}
              </button>
              <button onClick={() => handleEdit(m)} className="p-2 text-blue-600 hover:bg-blue-50 rounded"><FaEdit /></button>
              <button onClick={() => handleDelete(m.id)} className="p-2 text-red-600 hover:bg-red-50 rounded"><FaTrash /></button>
            </div>
          </div>
        ))}
      </div>
      {makaleler.length === 0 && <p className="text-center py-12 text-gray-500">Henüz makale yok</p>}
    </div>
  )
}
