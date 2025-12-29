'use client'

import { useState, useRef } from 'react'
import { createClient } from '@/lib/supabase-browser'
import { FaUpload, FaImage, FaTimes, FaSpinner } from 'react-icons/fa'
import toast from 'react-hot-toast'

export default function ImageUpload({ value, onChange, folder = 'genel' }) {
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState(value || '')
  const inputRef = useRef(null)
  const supabase = createClient()

  const handleUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Dosya tipi kontrolü
    if (!file.type.startsWith('image/')) {
      toast.error('Sadece resim dosyaları yükleyebilirsiniz')
      return
    }

    // Boyut kontrolü (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Dosya boyutu 5MB\'dan küçük olmalı')
      return
    }

    setUploading(true)

    try {
      // Dosya adını oluştur
      const fileExt = file.name.split('.').pop()
      const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`

      // Supabase Storage'a yükle
      const { data, error } = await supabase.storage
        .from('images')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (error) throw error

      // Public URL'i al
      const { data: { publicUrl } } = supabase.storage
        .from('images')
        .getPublicUrl(fileName)

      setPreview(publicUrl)
      onChange(publicUrl)
      toast.success('Resim yüklendi')
    } catch (error) {
      console.error('Upload error:', error)
      toast.error('Yükleme hatası: ' + error.message)
    } finally {
      setUploading(false)
    }
  }

  const handleRemove = () => {
    setPreview('')
    onChange('')
    if (inputRef.current) inputRef.current.value = ''
  }

  const handleUrlChange = (e) => {
    const url = e.target.value
    setPreview(url)
    onChange(url)
  }

  return (
    <div className="space-y-3">
      {/* Preview */}
      {preview && (
        <div className="relative inline-block">
          <img
            src={preview}
            alt="Önizleme"
            className="h-32 w-auto rounded-lg border object-cover"
            onError={() => setPreview('')}
          />
          <button
            type="button"
            onClick={handleRemove}
            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
          >
            <FaTimes size={12} />
          </button>
        </div>
      )}

      {/* Upload Area */}
      <div className="flex items-center gap-3">
        <label className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg cursor-pointer hover:bg-primary-600 transition-colors">
          {uploading ? (
            <>
              <FaSpinner className="animate-spin" />
              Yükleniyor...
            </>
          ) : (
            <>
              <FaUpload />
              Resim Yükle
            </>
          )}
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            onChange={handleUpload}
            disabled={uploading}
            className="hidden"
          />
        </label>
        <span className="text-gray-500 text-sm">veya</span>
      </div>

      {/* URL Input */}
      <div className="flex items-center gap-2">
        <FaImage className="text-gray-400" />
        <input
          type="text"
          value={preview}
          onChange={handleUrlChange}
          placeholder="Resim URL'si girin..."
          className="flex-1 px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />
      </div>

      <p className="text-xs text-gray-500">
        Desteklenen formatlar: JPG, PNG, GIF, WebP (Max: 5MB)
      </p>
    </div>
  )
}
