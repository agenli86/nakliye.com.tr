'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase-browser'
import { FaPlus, FaEdit, FaTrash, FaSave, FaTimes, FaArrowUp, FaArrowDown, FaLink } from 'react-icons/fa'
import toast from 'react-hot-toast'

export default function AdminMenuPage() {
  const [menuItems, setMenuItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [editMode, setEditMode] = useState(null)
  const [formData, setFormData] = useState({
    baslik: '',
    link: '',
    parent_id: null,
    sira: 0,
    aktif: true,
    yeni_sekmede_ac: false,
  })

  const supabase = createClient()

  useEffect(() => {
    fetchMenu()
  }, [])

  const fetchMenu = async () => {
    const { data, error } = await supabase.from('menu').select('*').order('sira')
    if (!error) setMenuItems(data || [])
    setLoading(false)
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    let val = type === 'checkbox' ? checked : value
    if (name === 'parent_id') val = value === '' ? null : parseInt(value)
    setFormData({ ...formData, [name]: val })
  }

  const handleEdit = (item) => {
    setEditMode(item.id)
    setFormData(item)
  }

  const handleNew = () => {
    setEditMode('new')
    setFormData({
      baslik: '',
      link: '',
      parent_id: null,
      sira: menuItems.filter(m => !m.parent_id).length,
      aktif: true,
      yeni_sekmede_ac: false,
    })
  }

  const handleCancel = () => {
    setEditMode(null)
    setFormData({})
  }

  const handleSave = async () => {
    if (!formData.baslik || !formData.link) {
      toast.error('Başlık ve link zorunludur')
      return
    }

    try {
      if (editMode === 'new') {
        const { error } = await supabase.from('menu').insert([formData])
        if (error) throw error
        toast.success('Menü öğesi eklendi')
      } else {
        const { error } = await supabase.from('menu').update(formData).eq('id', editMode)
        if (error) throw error
        toast.success('Menü öğesi güncellendi')
      }
      fetchMenu()
      handleCancel()
    } catch (error) {
      toast.error('Hata: ' + error.message)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Bu menü öğesi silinecek. Emin misiniz?')) return
    try {
      const { error } = await supabase.from('menu').delete().eq('id', id)
      if (error) throw error
      toast.success('Menü öğesi silindi')
      fetchMenu()
    } catch (error) {
      toast.error('Hata: ' + error.message)
    }
  }

  // Ana menü öğeleri
  const parentItems = menuItems.filter(m => !m.parent_id)
  // Alt menü öğelerini getir
  const getChildren = (parentId) => menuItems.filter(m => m.parent_id === parentId)

  if (loading) {
    return <div className="flex justify-center py-12"><div className="spinner"></div></div>
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Menü Yönetimi</h1>
        <button onClick={handleNew} className="admin-btn-primary flex items-center gap-2">
          <FaPlus /> Yeni Menü Öğesi
        </button>
      </div>

      {/* Form Modal */}
      {editMode && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg">
            <h2 className="text-xl font-bold mb-6">
              {editMode === 'new' ? 'Yeni Menü Öğesi' : 'Menü Öğesi Düzenle'}
            </h2>

            <div className="space-y-4">
              <div>
                <label className="admin-label">Başlık *</label>
                <input
                  type="text"
                  name="baslik"
                  value={formData.baslik}
                  onChange={handleChange}
                  className="admin-input"
                />
              </div>

              <div>
                <label className="admin-label">Link *</label>
                <input
                  type="text"
                  name="link"
                  value={formData.link}
                  onChange={handleChange}
                  className="admin-input"
                  placeholder="/sayfa veya https://..."
                />
              </div>

              <div>
                <label className="admin-label">Üst Menü</label>
                <select
                  name="parent_id"
                  value={formData.parent_id || ''}
                  onChange={handleChange}
                  className="admin-input"
                >
                  <option value="">Ana Menü</option>
                  {parentItems.filter(p => p.id !== editMode).map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.baslik}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-4">
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
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="yeni_sekmede_ac"
                    checked={formData.yeni_sekmede_ac}
                    onChange={handleChange}
                    className="w-5 h-5"
                  />
                  Yeni Sekmede Aç
                </label>
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

      {/* Menu List */}
      <div className="space-y-4">
        {parentItems.map((item) => {
          const children = getChildren(item.id)
          return (
            <div key={item.id} className="admin-card">
              <div className="flex items-center justify-between p-2">
                <div className="flex items-center gap-3">
                  <FaLink className="text-primary-500" />
                  <div>
                    <div className="font-medium">{item.baslik}</div>
                    <div className="text-sm text-gray-500">{item.link}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded-full text-xs ${item.aktif ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {item.aktif ? 'Aktif' : 'Pasif'}
                  </span>
                  <button onClick={() => handleEdit(item)} className="p-2 hover:bg-blue-100 rounded text-blue-600">
                    <FaEdit />
                  </button>
                  <button onClick={() => handleDelete(item.id)} className="p-2 hover:bg-red-100 rounded text-red-600">
                    <FaTrash />
                  </button>
                </div>
              </div>

              {/* Alt Menüler */}
              {children.length > 0 && (
                <div className="border-t mt-2 pt-2 pl-8 space-y-2">
                  {children.map((child) => (
                    <div key={child.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <div className="flex items-center gap-3">
                        <span className="text-gray-400">↳</span>
                        <div>
                          <div className="font-medium text-sm">{child.baslik}</div>
                          <div className="text-xs text-gray-500">{child.link}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => handleEdit(child)} className="p-1 hover:bg-blue-100 rounded text-blue-600">
                          <FaEdit size={14} />
                        </button>
                        <button onClick={() => handleDelete(child.id)} className="p-1 hover:bg-red-100 rounded text-red-600">
                          <FaTrash size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })}
        {parentItems.length === 0 && (
          <p className="text-center py-8 text-gray-500">Henüz menü öğesi eklenmemiş</p>
        )}
      </div>
    </div>
  )
}
