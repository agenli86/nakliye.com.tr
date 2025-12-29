'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase-browser'
import { FaEnvelope, FaEnvelopeOpen, FaTrash, FaTimes, FaPhone, FaUser } from 'react-icons/fa'
import toast from 'react-hot-toast'

export default function AdminMesajlarPage() {
  const [mesajlar, setMesajlar] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedMesaj, setSelectedMesaj] = useState(null)

  const supabase = createClient()

  useEffect(() => {
    fetchMesajlar()
  }, [])

  const fetchMesajlar = async () => {
    const { data, error } = await supabase
      .from('iletisim_mesajlari')
      .select('*')
      .order('created_at', { ascending: false })
    if (!error) setMesajlar(data || [])
    setLoading(false)
  }

  const handleView = async (mesaj) => {
    setSelectedMesaj(mesaj)
    if (!mesaj.okundu) {
      await supabase.from('iletisim_mesajlari').update({ okundu: true }).eq('id', mesaj.id)
      fetchMesajlar()
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Bu mesaj silinecek. Emin misiniz?')) return
    try {
      const { error } = await supabase.from('iletisim_mesajlari').delete().eq('id', id)
      if (error) throw error
      toast.success('Mesaj silindi')
      setSelectedMesaj(null)
      fetchMesajlar()
    } catch (error) {
      toast.error('Hata: ' + error.message)
    }
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleString('tr-TR', {
      timeZone: 'Europe/Istanbul',
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    })
  }

  const okunmamisSayisi = mesajlar.filter(m => !m.okundu).length

  if (loading) {
    return <div className="flex justify-center py-12"><div className="spinner"></div></div>
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold">İletişim Mesajları</h1>
          {okunmamisSayisi > 0 && (
            <span className="bg-red-500 text-white text-sm px-3 py-1 rounded-full">
              {okunmamisSayisi} yeni
            </span>
          )}
        </div>
      </div>

      {/* Message Detail Modal */}
      {selectedMesaj && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl">
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-xl font-bold">Mesaj Detayı</h2>
              <button onClick={() => setSelectedMesaj(null)} className="p-2 hover:bg-gray-100 rounded">
                <FaTimes />
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <FaUser className="text-primary-500" />
                <div>
                  <div className="font-medium">{selectedMesaj.ad_soyad}</div>
                  <div className="text-sm text-gray-500">{formatDate(selectedMesaj.created_at)}</div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                {selectedMesaj.telefon && (
                  <a href={`tel:${selectedMesaj.telefon}`} className="flex items-center gap-3 p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
                    <FaPhone className="text-green-600" />
                    <span>{selectedMesaj.telefon}</span>
                  </a>
                )}
                {selectedMesaj.email && (
                  <a href={`mailto:${selectedMesaj.email}`} className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
                    <FaEnvelope className="text-blue-600" />
                    <span>{selectedMesaj.email}</span>
                  </a>
                )}
              </div>

              {selectedMesaj.konu && (
                <div>
                  <label className="text-sm text-gray-500">Konu</label>
                  <div className="font-medium">{selectedMesaj.konu}</div>
                </div>
              )}

              <div>
                <label className="text-sm text-gray-500">Mesaj</label>
                <div className="p-4 bg-gray-50 rounded-lg mt-1 whitespace-pre-wrap">
                  {selectedMesaj.mesaj}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setSelectedMesaj(null)} className="admin-btn-secondary">
                Kapat
              </button>
              <button onClick={() => handleDelete(selectedMesaj.id)} className="admin-btn-danger flex items-center gap-2">
                <FaTrash /> Sil
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Messages List */}
      <div className="admin-card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4 w-8"></th>
                <th className="text-left py-3 px-4">Gönderen</th>
                <th className="text-left py-3 px-4">Konu</th>
                <th className="text-left py-3 px-4">Tarih</th>
                <th className="text-right py-3 px-4">İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {mesajlar.map((mesaj) => (
                <tr
                  key={mesaj.id}
                  className={`border-b hover:bg-gray-50 cursor-pointer ${!mesaj.okundu ? 'bg-blue-50' : ''}`}
                  onClick={() => handleView(mesaj)}
                >
                  <td className="py-3 px-4">
                    {mesaj.okundu ? (
                      <FaEnvelopeOpen className="text-gray-400" />
                    ) : (
                      <FaEnvelope className="text-primary-500" />
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <div className={`font-medium ${!mesaj.okundu ? 'text-primary-600' : ''}`}>
                      {mesaj.ad_soyad}
                    </div>
                    <div className="text-sm text-gray-500">{mesaj.telefon || mesaj.email}</div>
                  </td>
                  <td className="py-3 px-4 text-gray-600">{mesaj.konu || '-'}</td>
                  <td className="py-3 px-4 text-sm text-gray-500">{formatDate(mesaj.created_at)}</td>
                  <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                    <button onClick={() => handleDelete(mesaj.id)} className="p-2 hover:bg-red-100 rounded text-red-600">
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {mesajlar.length === 0 && (
            <p className="text-center py-8 text-gray-500">Henüz mesaj yok</p>
          )}
        </div>
      </div>
    </div>
  )
}
