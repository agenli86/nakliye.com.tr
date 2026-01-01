'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase-browser'
import dynamic from 'next/dynamic'
import { FaClock, FaMapMarkerAlt, FaEye, FaSync, FaPhone, FaWhatsapp, FaBullhorn } from 'react-icons/fa'
import toast from 'react-hot-toast'

const VisitorMap = dynamic(() => import('@/components/VisitorMap'), { ssr: false })

export default function AdminZiyaretcilerPage() {
  const [visitors, setVisitors] = useState([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => { fetchData() }, [])

  const fetchData = async () => {
    setLoading(true)
    const { data } = await supabase.from('ziyaretciler').select('*').order('created_at', { ascending: false }).limit(100)
    setVisitors(data || [])
    setLoading(false)
  }

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Ziyaretçi Takibi</h1>
        <button onClick={fetchData} className="p-2 bg-blue-600 text-white rounded"><FaSync /></button>
      </div>

      <div className="bg-white rounded-xl shadow overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-3 text-left">Zaman / Konum</th>
              <th className="p-3 text-left">Kaynak</th>
              <th className="p-3 text-left">IP / Cihaz</th>
              <th className="p-3 text-center">İşlem</th>
            </tr>
          </thead>
          <tbody>
            {visitors.map(v => (
              <tr key={v.id} className="border-b hover:bg-gray-50">
                <td className="p-3">
                  <div className="font-medium text-xs text-gray-400">{new Date(v.created_at).toLocaleString('tr-TR')}</div>
                  <div className="flex items-center gap-1 font-bold">
                    <FaMapMarkerAlt className={v.konum_izni ? 'text-green-500' : 'text-gray-300'} />
                    {v.il || 'Bilinmiyor'} / {v.ilce || '-'}
                  </div>
                </td>
                <td className="p-3">
                  {v.reklam_trafigi ? (
                    <span className="bg-red-600 text-white px-2 py-1 rounded-md font-bold text-xs flex items-center gap-1 animate-pulse">
                      <FaBullhorn /> ADS
                    </span>
                  ) : (
                    <span className="text-gray-500">{v.utm_source || 'Organik'}</span>
                  )}
                  <div className="flex gap-2 mt-1">
                    {v.telefon_tiklama && <FaPhone className="text-green-500" title="Aradı" />}
                    {v.whatsapp_tiklama && <FaWhatsapp className="text-green-500" title="WhatsApp" />}
                  </div>
                </td>
                <td className="p-3">
                  <code className="text-xs text-blue-600">{v.ip_adresi}</code>
                  <div className="text-gray-400 text-xs">{v.isletim_sistemi} / {v.tarayici}</div>
                </td>
                <td className="p-3 text-center">
                  <button onClick={() => setSelectedVisitor(v)} className="p-2 bg-gray-100 rounded"><FaEye /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODAL KODLARI BURAYA (Sadelik için detaya girmedim) */}
    </div>
  )
}
