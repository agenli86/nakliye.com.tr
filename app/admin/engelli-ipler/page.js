'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase-browser'
import { FaBan, FaSync, FaPlus, FaTrash, FaCheckCircle } from 'react-icons/fa'
import toast from 'react-hot-toast'

export default function AdminEngelliIPlerPage() {
  const [blockedIPs, setBlockedIPs] = useState([])
  const [loading, setLoading] = useState(true)
  const [newIP, setNewIP] = useState('')
  const [newSebep, setNewSebep] = useState('')
  const [confirmModal, setConfirmModal] = useState({ show: false, action: null, message: '' })
  const supabase = createClient()

  useEffect(() => { fetchData() }, [])

  const fetchData = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('engelli_ipler')
      .select('*')
      .order('engelleme_tarihi', { ascending: false })

    setBlockedIPs(data || [])
    setLoading(false)
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleString('tr-TR', {
      timeZone: 'Europe/Istanbul',
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    })
  }

  // IP Ekle
  const addIP = async (e) => {
    e.preventDefault()
    if (!newIP.trim()) {
      toast.error('Lütfen IP adresi girin')
      return
    }

    try {
      const { error } = await supabase.from('engelli_ipler').insert([{
        ip_adresi: newIP.trim(),
        sebep: newSebep.trim() || 'Manuel olarak eklendi'
      }])

      if (error) {
        if (error.code === '23505') {
          toast.error('Bu IP zaten engellenmiş')
        } else {
          throw error
        }
      } else {
        toast.success('IP engellendi')
        setNewIP('')
        setNewSebep('')
        fetchData()
      }
    } catch (error) {
      console.error('IP ekleme hatası:', error)
      toast.error('IP eklenemedi')
    }
  }

  // Engeli Kaldır
  const unblockIP = (id, ip) => {
    setConfirmModal({
      show: true,
      message: `${ip} adresinin engelini kaldırmak istediğinizden emin misiniz?`,
      action: async () => {
        try {
          const { error } = await supabase.from('engelli_ipler').delete().eq('id', id)
          if (error) throw error
          toast.success('Engel kaldırıldı')
          fetchData()
        } catch (error) {
          console.error('Engel kaldırma hatası:', error)
          toast.error('Engel kaldırılamadı')
        }
        setConfirmModal({ show: false, action: null, message: '' })
      }
    })
  }

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <FaBan className="text-red-600" /> Engelli IP'ler
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Toplam {blockedIPs.length} IP engellendi
          </p>
        </div>
        <button onClick={fetchData} className="admin-btn-secondary flex items-center gap-2">
          <FaSync className={loading ? 'animate-spin' : ''} /> Yenile
        </button>
      </div>

      {/* Manuel IP Ekleme Formu */}
      <div className="admin-card mb-6">
        <h3 className="font-bold mb-4 flex items-center gap-2">
          <FaPlus className="text-blue-600" /> Yeni IP Ekle
        </h3>
        <form onSubmit={addIP} className="flex flex-col md:flex-row gap-3">
          <input
            type="text"
            placeholder="IP Adresi (örn: 192.168.1.1)"
            value={newIP}
            onChange={(e) => setNewIP(e.target.value)}
            className="admin-input flex-1"
          />
          <input
            type="text"
            placeholder="Sebep (opsiyonel)"
            value={newSebep}
            onChange={(e) => setNewSebep(e.target.value)}
            className="admin-input flex-1"
          />
          <button type="submit" className="admin-btn flex items-center gap-2 whitespace-nowrap">
            <FaPlus /> IP Engelle
          </button>
        </form>
      </div>

      {/* Engelli IP Listesi */}
      <div className="admin-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              <th className="text-left py-3 px-2">IP Adresi</th>
              <th className="text-left py-3 px-2">Sebep</th>
              <th className="text-left py-3 px-2">Engelleyen</th>
              <th className="text-left py-3 px-2">Engelleme Tarihi</th>
              <th className="text-center py-3 px-2">İşlem</th>
            </tr>
          </thead>
          <tbody>
            {blockedIPs.map((item) => (
              <tr key={item.id} className="border-b hover:bg-gray-50">
                <td className="py-3 px-2">
                  <code className="text-sm bg-red-50 text-red-700 px-2 py-1 rounded font-mono">
                    {item.ip_adresi}
                  </code>
                </td>
                <td className="py-3 px-2 max-w-xs">
                  <span className="text-gray-700">{item.sebep || '-'}</span>
                </td>
                <td className="py-3 px-2">
                  <span className="text-gray-600">{item.engelleyen || 'admin'}</span>
                </td>
                <td className="py-3 px-2 whitespace-nowrap">
                  <span className="text-gray-600">{formatDate(item.engelleme_tarihi)}</span>
                </td>
                <td className="py-3 px-2 text-center">
                  <button
                    onClick={() => unblockIP(item.id, item.ip_adresi)}
                    className="p-2 bg-green-600 text-white hover:bg-green-700 rounded transition flex items-center gap-1 mx-auto text-sm"
                    title="Engeli Kaldır"
                  >
                    <FaCheckCircle /> Engeli Kaldır
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {blockedIPs.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            {loading ? 'Yükleniyor...' : 'Henüz engelli IP yok'}
          </div>
        )}
      </div>

      {/* Onay Modal */}
      {confirmModal.show && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setConfirmModal({ show: false, action: null, message: '' })}>
          <div className="bg-white rounded-xl p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
            <h3 className="text-xl font-bold mb-4">Onay</h3>
            <p className="text-gray-700 mb-6">{confirmModal.message}</p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setConfirmModal({ show: false, action: null, message: '' })}
                className="admin-btn-secondary"
              >
                İptal
              </button>
              <button
                onClick={confirmModal.action}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition font-medium"
              >
                Evet, Kaldır
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
