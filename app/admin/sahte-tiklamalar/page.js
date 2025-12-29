'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase-browser'
import { 
  FaShieldAlt, FaSync, FaBan, FaCheck, FaGlobe, FaServer, 
  FaMobile, FaDesktop, FaClock, FaExclamationTriangle, FaSearch
} from 'react-icons/fa'

export default function AdminSahteTiklamalarPage() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const supabase = createClient()

  useEffect(() => { fetchData() }, [])

  const fetchData = async () => {
    setLoading(true)
    const { data: sahte } = await supabase
      .from('sahte_tiklamalar')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(200)
    
    setData(sahte || [])
    setLoading(false)
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleString('tr-TR', {
      timeZone: 'Europe/Istanbul',
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    })
  }

  const filteredData = data.filter(item => {
    // Filtre
    if (filter === 'blocked' && !item.engellendi) return false
    if (filter === 'foreign' && !item.notlar?.includes('Yurt dışı')) return false
    if (filter === 'vpn' && !item.notlar?.includes('VPN')) return false
    if (filter === 'datacenter' && !item.notlar?.includes('Datacenter')) return false
    
    // Arama
    if (search) {
      const s = search.toLowerCase()
      return (
        item.fingerprint?.toLowerCase().includes(s) ||
        item.il?.toLowerCase().includes(s) ||
        item.notlar?.toLowerCase().includes(s) ||
        item.ip_listesi?.some(ip => ip.includes(s))
      )
    }
    return true
  })

  const stats = {
    total: data.length,
    blocked: data.filter(d => d.engellendi).length,
    foreign: data.filter(d => d.notlar?.includes('Yurt dışı')).length,
    vpn: data.filter(d => d.notlar?.includes('VPN') || d.notlar?.includes('Datacenter')).length
  }

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <FaShieldAlt className="text-red-600" /> Sahte Tıklama Tespiti
          </h1>
          <p className="text-gray-500 text-sm mt-1">Bot, VPN ve şüpheli aktivite kayıtları</p>
        </div>
        <button onClick={fetchData} className="admin-btn-secondary flex items-center gap-2">
          <FaSync className={loading ? 'animate-spin' : ''} /> Yenile
        </button>
      </div>

      {/* İstatistikler */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="admin-card text-center cursor-pointer hover:shadow-md" onClick={() => setFilter('all')}>
          <p className="text-3xl font-bold text-gray-700">{stats.total}</p>
          <p className="text-sm text-gray-500">Toplam Tespit</p>
        </div>
        <div className="admin-card text-center cursor-pointer hover:shadow-md" onClick={() => setFilter('blocked')}>
          <p className="text-3xl font-bold text-red-600">{stats.blocked}</p>
          <p className="text-sm text-gray-500">Engellenen</p>
        </div>
        <div className="admin-card text-center cursor-pointer hover:shadow-md" onClick={() => setFilter('foreign')}>
          <p className="text-3xl font-bold text-orange-600">{stats.foreign}</p>
          <p className="text-sm text-gray-500">Yurt Dışı</p>
        </div>
        <div className="admin-card text-center cursor-pointer hover:shadow-md" onClick={() => setFilter('vpn')}>
          <p className="text-3xl font-bold text-purple-600">{stats.vpn}</p>
          <p className="text-sm text-gray-500">VPN/Datacenter</p>
        </div>
      </div>

      {/* Filtre ve Arama */}
      <div className="admin-card mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Fingerprint, IP veya konum ara..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="admin-input pl-10 w-full"
            />
          </div>
          <select 
            value={filter} 
            onChange={(e) => setFilter(e.target.value)}
            className="admin-input"
          >
            <option value="all">Tümü</option>
            <option value="blocked">Engellenenler</option>
            <option value="foreign">Yurt Dışı</option>
            <option value="vpn">VPN/Datacenter</option>
          </select>
        </div>
      </div>

      {/* Liste */}
      <div className="space-y-4">
        {filteredData.map((item) => (
          <div key={item.id} className={`admin-card ${item.engellendi ? 'border-l-4 border-l-red-500' : ''}`}>
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              {/* Sol: Bilgiler */}
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  {item.engellendi ? (
                    <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium flex items-center gap-1">
                      <FaBan /> Engellendi
                    </span>
                  ) : (
                    <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium flex items-center gap-1">
                      <FaExclamationTriangle /> Şüpheli
                    </span>
                  )}
                  
                  {item.notlar?.includes('Yurt dışı') && (
                    <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-medium flex items-center gap-1">
                      <FaGlobe /> Yurt Dışı
                    </span>
                  )}
                  
                  {(item.notlar?.includes('VPN') || item.notlar?.includes('Datacenter')) && (
                    <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium flex items-center gap-1">
                      <FaServer /> VPN/DC
                    </span>
                  )}
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                  <div>
                    <span className="text-gray-500">Fingerprint:</span>
                    <p className="font-mono text-gray-800 truncate">{item.fingerprint}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Konum:</span>
                    <p className="text-gray-800">{item.il || '-'} / {item.ilce || '-'}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Farklı IP:</span>
                    <p className="text-gray-800 font-bold">{item.farkli_ip_sayisi || 0}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Ort. Süre:</span>
                    <p className="text-gray-800">{item.ortalama_sure_sn || 0} sn</p>
                  </div>
                </div>
                
                {/* Sebepler */}
                {item.notlar && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <p className="text-xs text-gray-500 mb-1">Tespit Sebepleri:</p>
                    <div className="flex flex-wrap gap-1">
                      {item.notlar.split(', ').map((n, i) => (
                        <span key={i} className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">
                          {n}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* IP Listesi */}
                {item.ip_listesi?.length > 0 && (
                  <div className="mt-2">
                    <p className="text-xs text-gray-500 mb-1">IP Adresleri:</p>
                    <div className="flex flex-wrap gap-1">
                      {item.ip_listesi.map((ip, i) => (
                        <span key={i} className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded font-mono text-xs">
                          {ip}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              {/* Sağ: Tarih */}
              <div className="text-right text-sm text-gray-500 shrink-0">
                <p className="flex items-center gap-1 justify-end">
                  <FaClock /> {formatDate(item.created_at)}
                </p>
                <p className="text-xs mt-1">#{item.id}</p>
              </div>
            </div>
          </div>
        ))}

        {filteredData.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            {loading ? 'Yükleniyor...' : 'Henüz tespit yok 🎉'}
          </div>
        )}
      </div>
    </div>
  )
}
