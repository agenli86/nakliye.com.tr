'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase-browser'
import toast from 'react-hot-toast'
import { FaPaperPlane } from 'react-icons/fa'

export default function ContactForm() {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    ad_soyad: '',
    email: '',
    telefon: '',
    konu: '',
    mesaj: '',
  })

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const supabase = createClient()
      
      const { error } = await supabase
        .from('iletisim_mesajlari')
        .insert([formData])

      if (error) throw error

      toast.success('Mesajınız başarıyla gönderildi!')
      setFormData({
        ad_soyad: '',
        email: '',
        telefon: '',
        konu: '',
        mesaj: '',
      })
    } catch (error) {
      console.error('Error:', error)
      toast.error('Mesaj gönderilemedi. Lütfen tekrar deneyin.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg p-8">
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="ad_soyad" className="admin-label">
            Ad Soyad *
          </label>
          <input
            type="text"
            id="ad_soyad"
            name="ad_soyad"
            value={formData.ad_soyad}
            onChange={handleChange}
            required
            className="admin-input"
            placeholder="Adınız Soyadınız"
          />
        </div>
        <div>
          <label htmlFor="telefon" className="admin-label">
            Telefon *
          </label>
          <input
            type="tel"
            id="telefon"
            name="telefon"
            value={formData.telefon}
            onChange={handleChange}
            required
            className="admin-input"
            placeholder="05XX XXX XX XX"
          />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mt-6">
        <div>
          <label htmlFor="email" className="admin-label">
            E-posta
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="admin-input"
            placeholder="ornek@email.com"
          />
        </div>
        <div>
          <label htmlFor="konu" className="admin-label">
            Konu
          </label>
          <select
            id="konu"
            name="konu"
            value={formData.konu}
            onChange={handleChange}
            className="admin-input"
          >
            <option value="">Konu Seçin</option>
            <option value="Fiyat Teklifi">Fiyat Teklifi</option>
            <option value="Evden Eve Nakliyat">Evden Eve Nakliyat</option>
            <option value="Şehirler Arası Nakliyat">Şehirler Arası Nakliyat</option>
            <option value="Ofis Taşıma">Ofis Taşıma</option>
            <option value="Asansörlü Nakliyat">Asansörlü Nakliyat</option>
            <option value="Diğer">Diğer</option>
          </select>
        </div>
      </div>

      <div className="mt-6">
        <label htmlFor="mesaj" className="admin-label">
          Mesajınız *
        </label>
        <textarea
          id="mesaj"
          name="mesaj"
          value={formData.mesaj}
          onChange={handleChange}
          required
          rows={5}
          className="admin-input resize-none"
          placeholder="Mesajınızı yazın..."
        ></textarea>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="btn-primary w-full mt-6 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? (
          <>
            <div className="spinner w-5 h-5"></div>
            Gönderiliyor...
          </>
        ) : (
          <>
            <FaPaperPlane />
            Mesaj Gönder
          </>
        )}
      </button>
    </form>
  )
}
