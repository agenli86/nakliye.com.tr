'use client'

import { useState } from 'react'
import { FaPaperPlane, FaSpinner } from 'react-icons/fa'
import toast from 'react-hot-toast'

export default function TeklifForm({ hizmetler }) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    ad_soyad: '',
    telefon: '',
    email: '',
    hizmet_turu: '',
    nereden_il: '',
    nereden_ilce: '',
    nereden_kat: '',
    nereye_il: '',
    nereye_ilce: '',
    nereye_kat: '',
    tasinma_tarihi: '',
    ev_tipi: '',
    asansor_var_mi: '',
    notlar: ''
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.ad_soyad || !formData.telefon) {
      toast.error('Ad soyad ve telefon zorunludur')
      return
    }

    setLoading(true)

    try {
      const mesaj = `
Hizmet: ${formData.hizmet_turu || 'Belirtilmedi'}
Ev Tipi: ${formData.ev_tipi || 'Belirtilmedi'}

NEREDEN:
İl: ${formData.nereden_il || '-'}
İlçe: ${formData.nereden_ilce || '-'}
Kat: ${formData.nereden_kat || '-'}

NEREYE:
İl: ${formData.nereye_il || '-'}
İlçe: ${formData.nereye_ilce || '-'}
Kat: ${formData.nereye_kat || '-'}

Taşınma Tarihi: ${formData.tasinma_tarihi || 'Belirtilmedi'}
Asansör: ${formData.asansor_var_mi || 'Belirtilmedi'}

Notlar: ${formData.notlar || '-'}
      `.trim()

      // Supabase istemcisi yalnızca form gönderilirken indiriliyor.
      const { createClient } = await import('@/lib/supabase-browser')
      const supabase = createClient()
      const { error } = await supabase.from('iletisim_mesajlari').insert([{
        ad_soyad: formData.ad_soyad,
        telefon: formData.telefon,
        email: formData.email,
        konu: 'Teklif Talebi - ' + (formData.hizmet_turu || 'Genel'),
        mesaj: mesaj
      }])

      if (error) throw error

      toast.success('Teklif talebiniz alındı! En kısa sürede dönüş yapacağız.')
      setFormData({
        ad_soyad: '', telefon: '', email: '', hizmet_turu: '',
        nereden_il: '', nereden_ilce: '', nereden_kat: '',
        nereye_il: '', nereye_ilce: '', nereye_kat: '',
        tasinma_tarihi: '', ev_tipi: '', asansor_var_mi: '', notlar: ''
      })
    } catch (error) {
      toast.error('Bir hata oluştu. Lütfen tekrar deneyin.')
    } finally {
      setLoading(false)
    }
  }

  const inputClass = "w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
  const labelClass = "block text-sm font-medium text-gray-700 mb-2"

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Kişisel Bilgiler */}
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Ad Soyad *</label>
          <input 
            type="text" 
            name="ad_soyad" 
            value={formData.ad_soyad} 
            onChange={handleChange} 
            className={inputClass}
            placeholder="Adınız Soyadınız"
            required
          />
        </div>
        <div>
          <label className={labelClass}>Telefon *</label>
          <input 
            type="tel" 
            name="telefon" 
            value={formData.telefon} 
            onChange={handleChange} 
            className={inputClass}
            placeholder="05XX XXX XX XX"
            required
          />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>E-posta</label>
          <input 
            type="email" 
            name="email" 
            value={formData.email} 
            onChange={handleChange} 
            className={inputClass}
            placeholder="ornek@email.com"
          />
        </div>
        <div>
          <label className={labelClass}>Hizmet Türü</label>
          <select name="hizmet_turu" value={formData.hizmet_turu} onChange={handleChange} className={inputClass}>
            <option value="">Seçiniz</option>
            {hizmetler?.map(h => (
              <option key={h.id} value={h.baslik}>{h.baslik}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Nereden */}
      <div className="p-4 bg-blue-50 rounded-xl">
        <h3 className="font-semibold mb-4" style={{ color: '#1e3a5f' }}>📍 Nereden Taşınacak?</h3>
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <label className={labelClass}>İl</label>
            <input type="text" name="nereden_il" value={formData.nereden_il} onChange={handleChange} className={inputClass} placeholder="Adana" />
          </div>
          <div>
            <label className={labelClass}>İlçe</label>
            <input type="text" name="nereden_ilce" value={formData.nereden_ilce} onChange={handleChange} className={inputClass} placeholder="Çukurova" />
          </div>
          <div>
            <label className={labelClass}>Kat</label>
            <input type="text" name="nereden_kat" value={formData.nereden_kat} onChange={handleChange} className={inputClass} placeholder="3" />
          </div>
        </div>
      </div>

      {/* Nereye */}
      <div className="p-4 bg-green-50 rounded-xl">
        <h3 className="font-semibold mb-4" style={{ color: '#1e3a5f' }}>📍 Nereye Taşınacak?</h3>
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <label className={labelClass}>İl</label>
            <input type="text" name="nereye_il" value={formData.nereye_il} onChange={handleChange} className={inputClass} placeholder="Adana" />
          </div>
          <div>
            <label className={labelClass}>İlçe</label>
            <input type="text" name="nereye_ilce" value={formData.nereye_ilce} onChange={handleChange} className={inputClass} placeholder="Sarıçam" />
          </div>
          <div>
            <label className={labelClass}>Kat</label>
            <input type="text" name="nereye_kat" value={formData.nereye_kat} onChange={handleChange} className={inputClass} placeholder="5" />
          </div>
        </div>
      </div>

      {/* Diğer Bilgiler */}
      <div className="grid md:grid-cols-3 gap-4">
        <div>
          <label className={labelClass}>Taşınma Tarihi</label>
          <input type="date" name="tasinma_tarihi" value={formData.tasinma_tarihi} onChange={handleChange} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Ev Tipi</label>
          <select name="ev_tipi" value={formData.ev_tipi} onChange={handleChange} className={inputClass}>
            <option value="">Seçiniz</option>
            <option value="1+1">1+1</option>
            <option value="2+1">2+1</option>
            <option value="3+1">3+1</option>
            <option value="4+1">4+1</option>
            <option value="5+1">5+1</option>
            <option value="Villa">Villa</option>
            <option value="Ofis">Ofis</option>
          </select>
        </div>
        <div>
          <label className={labelClass}>Asansör Var mı?</label>
          <select name="asansor_var_mi" value={formData.asansor_var_mi} onChange={handleChange} className={inputClass}>
            <option value="">Seçiniz</option>
            <option value="Evet">Evet</option>
            <option value="Hayır">Hayır</option>
            <option value="Sadece yükleme adresinde">Sadece yükleme adresinde</option>
            <option value="Sadece indirme adresinde">Sadece indirme adresinde</option>
          </select>
        </div>
      </div>

      <div>
        <label className={labelClass}>Eklemek İstedikleriniz</label>
        <textarea 
          name="notlar" 
          value={formData.notlar} 
          onChange={handleChange} 
          rows={4} 
          className={inputClass + " resize-none"}
          placeholder="Özel eşyalar, istekler veya sorularınız..."
        />
      </div>

      <button 
        type="submit" 
        disabled={loading}
        className="w-full py-4 rounded-xl font-semibold text-lg flex items-center justify-center gap-2 transition-all hover:scale-[1.02] disabled:opacity-70"
        style={{ backgroundColor: '#d4ed31', color: '#1e3a5f' }}
      >
        {loading ? (
          <>
            <FaSpinner className="animate-spin" />
            Gönderiliyor...
          </>
        ) : (
          <>
            <FaPaperPlane />
            Teklif Al
          </>
        )}
      </button>
    </form>
  )
}
