'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase-browser'
import { 
  FaRobot, FaUser, FaSync, FaClock, FaMapMarkerAlt, 
  FaCheck, FaTimes, FaSearch, FaChartBar, FaPhone, FaToggleOn, FaToggleOff
} from 'react-icons/fa'
import toast from 'react-hot-toast'

export default function AdminChatbotPage() {
  const [sohbetler, setSohbetler] = useState([])
  const [limitler, setLimitler] = useState([])
  const [stats, setStats] = useState({})
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('today')
  const [search, setSearch] = useState('')
  const [selectedChat, setSelectedChat] = useState(null)
  const [chatbotAktif, setChatbotAktif] = useState(true)
  const [toggling, setToggling] = useState(false)
  const supabase = createClient()

  useEffect(() => { fetchData() }, [filter])

  const fetchData = async () => {
    setLoading(true)
    
    // Chatbot aktif durumunu al
    const { data: ayarlar } = await supabase
      .from('chatbot_ayarlari')
      .select('*')
      .eq('anahtar', 'aktif')
      .single()
    
    setChatbotAktif(ayarlar?.deger === 'true')
    
    let query = supabase
      .from('chatbot_sohbetler')
      .select('*')
      .order('created_at', { ascending: false })
    
    // Filtre uygula
    const now = new Date()
    if (filter === 'today') {
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      query = query.gte('created_at', startOfDay.toISOString())
    } else if (filter === 'week') {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      query = query.gte('created_at', weekAgo.toISOString())
    } else if (filter === 'month') {
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
      query = query.gte('created_at', monthAgo.toISOString())
    }

    const { data } = await query.limit(500)
    setSohbetler(data || [])
    
    // Limitler
    const { data: limitData } = await supabase
      .from('chatbot_limitler')
      .select('*')
      .order('son_soru_tarihi', { ascending: false })
      .limit(100)
    setLimitler(limitData || [])
    
    // İstatistikler
    calculateStats(data || [])
    setLoading(false)
  }

  const calculateStats = (data) => {
    const successful = data.filter(s => s.basarili).length
    const failed = data.filter(s => !s.basarili).length
    const limitHits = data.filter(s => s.hata_mesaji?.includes('limit')).length
    const avgResponseTime = data.length > 0 
      ? Math.round(data.reduce((sum, s) => sum + (s.cevap_suresi_ms || 0), 0) / data.length)
      : 0
    const totalTokens = data.reduce((sum, s) => sum + (s.token_kullanimi || 0), 0)
    
    // Sık sorulan konular (basit kelime analizi)
    const keywords = {}
    data.forEach(s => {
      const words = s.kullanici_mesaji?.toLowerCase().split(/\s+/) || []
      words.forEach(word => {
        if (word.length > 3 && !['nasıl', 'nedir', 'için', 'olan', 'kadar'].includes(word)) {
          keywords[word] = (keywords[word] || 0) + 1
        }
      })
    })
    
    setStats({
      total: data.length,
      successful,
      failed,
      limitHits,
      avgResponseTime,
      totalTokens,
      uniqueUsers: new Set(data.map(s => s.fingerprint || s.ip_adresi)).size,
      topKeywords: Object.entries(keywords).sort((a, b) => b[1] - a[1]).slice(0, 5)
    })
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleString('tr-TR', {
      timeZone: 'Europe/Istanbul',
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    })
  }

  const toggleChatbot = async () => {
    setToggling(true)
    const yeniDurum = !chatbotAktif
    
    const { error } = await supabase
      .from('chatbot_ayarlari')
      .update({ deger: yeniDurum ? 'true' : 'false' })
      .eq('anahtar', 'aktif')
    
    if (error) {
      toast.error('Hata oluştu!')
    } else {
      setChatbotAktif(yeniDurum)
      toast.success(yeniDurum ? 'Chatbot açıldı!' : 'Chatbot kapatıldı!')
    }
    setToggling(false)
  }

  const filteredSohbetler = sohbetler.filter(s => {
    if (!search) return true
    const searchLower = search.toLowerCase()
    return (
      s.kullanici_mesaji?.toLowerCase().includes(searchLower) ||
      s.bot_cevabi?.toLowerCase().includes(searchLower) ||
      s.ip_adresi?.includes(searchLower)
    )
  })

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <FaRobot className="text-blue-600" /> Chatbot Sohbetleri
          </h1>
          <p className="text-gray-500 text-sm mt-1">Yapay zeka asistanı ile yapılan tüm sohbetler</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Chatbot Açma/Kapama Toggle */}
          <button
            onClick={toggleChatbot}
            disabled={toggling}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
              chatbotAktif 
                ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                : 'bg-red-100 text-red-700 hover:bg-red-200'
            }`}
          >
            {chatbotAktif ? (
              <>
                <FaToggleOn className="text-2xl" /> Chatbot Açık
              </>
            ) : (
              <>
                <FaToggleOff className="text-2xl" /> Chatbot Kapalı
              </>
            )}
          </button>
          <select 
            value={filter} 
            onChange={(e) => setFilter(e.target.value)}
            className="admin-input py-2"
          >
            <option value="today">Bugün</option>
            <option value="week">Son 7 Gün</option>
            <option value="month">Son 30 Gün</option>
            <option value="all">Tümü</option>
          </select>
          <button onClick={fetchData} className="admin-btn-secondary p-2">
            <FaSync className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* İstatistik Kartları */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
        <div className="admin-card text-center">
          <p className="text-2xl font-bold text-blue-600">{stats.total || 0}</p>
          <p className="text-xs text-gray-500">Toplam Soru</p>
        </div>
        <div className="admin-card text-center">
          <p className="text-2xl font-bold text-green-600">{stats.successful || 0}</p>
          <p className="text-xs text-gray-500">Başarılı</p>
        </div>
        <div className="admin-card text-center">
          <p className="text-2xl font-bold text-red-600">{stats.failed || 0}</p>
          <p className="text-xs text-gray-500">Başarısız</p>
        </div>
        <div className="admin-card text-center">
          <p className="text-2xl font-bold text-orange-600">{stats.limitHits || 0}</p>
          <p className="text-xs text-gray-500">Limit Aşımı</p>
        </div>
        <div className="admin-card text-center">
          <p className="text-2xl font-bold text-purple-600">{stats.uniqueUsers || 0}</p>
          <p className="text-xs text-gray-500">Tekil Kullanıcı</p>
        </div>
        <div className="admin-card text-center">
          <p className="text-2xl font-bold text-teal-600">{stats.avgResponseTime || 0}ms</p>
          <p className="text-xs text-gray-500">Ort. Cevap</p>
        </div>
      </div>

      {/* Sık Sorulan Konular */}
      {stats.topKeywords?.length > 0 && (
        <div className="admin-card mb-6">
          <h3 className="font-bold mb-3 flex items-center gap-2">
            <FaChartBar className="text-blue-600" /> Sık Sorulan Konular
          </h3>
          <div className="flex flex-wrap gap-2">
            {stats.topKeywords.map(([word, count]) => (
              <span key={word} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                {word} ({count})
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Arama */}
      <div className="admin-card mb-6">
        <div className="relative">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Sohbetlerde ara..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="admin-input pl-10 w-full"
          />
        </div>
      </div>

      {/* Sohbet Listesi */}
      <div className="space-y-4">
        {filteredSohbetler.map((s) => (
          <div 
            key={s.id} 
            className={`admin-card cursor-pointer hover:shadow-md transition-shadow ${!s.basarili ? 'border-l-4 border-l-red-400' : ''}`}
            onClick={() => setSelectedChat(s)}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                {/* Kullanıcı Mesajı */}
                <div className="flex items-start gap-2 mb-2">
                  <FaUser className="text-gray-400 mt-1 shrink-0" />
                  <p className="text-gray-800">{s.kullanici_mesaji}</p>
                </div>
                
                {/* Bot Cevabı */}
                {s.bot_cevabi && (
                  <div className="flex items-start gap-2 ml-6 p-2 bg-blue-50 rounded-lg">
                    <FaRobot className="text-blue-600 mt-1 shrink-0" />
                    <p className="text-gray-700 text-sm line-clamp-2">{s.bot_cevabi}</p>
                  </div>
                )}
                
                {/* Hata */}
                {!s.basarili && s.hata_mesaji && (
                  <div className="flex items-center gap-2 ml-6 mt-2 text-red-600 text-sm">
                    <FaTimes /> {s.hata_mesaji}
                  </div>
                )}
              </div>
              
              {/* Meta Bilgiler */}
              <div className="text-right text-xs text-gray-500 shrink-0">
                <p className="flex items-center gap-1 justify-end">
                  <FaClock /> {formatDate(s.created_at)}
                </p>
                <p className="mt-1">
                  {s.basarili ? (
                    <span className="text-green-600 flex items-center gap-1 justify-end">
                      <FaCheck /> {s.cevap_suresi_ms}ms
                    </span>
                  ) : (
                    <span className="text-red-600 flex items-center gap-1 justify-end">
                      <FaTimes /> Hata
                    </span>
                  )}
                </p>
                {s.ip_adresi && (
                  <p className="mt-1 font-mono">{s.ip_adresi}</p>
                )}
              </div>
            </div>
          </div>
        ))}

        {filteredSohbetler.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            {loading ? 'Yükleniyor...' : 'Henüz sohbet yok'}
          </div>
        )}
      </div>

      {/* Detay Modal */}
      {selectedChat && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedChat(null)}>
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-xl font-bold">Sohbet Detayı</h2>
                <p className="text-sm text-gray-500">{formatDate(selectedChat.created_at)}</p>
              </div>
              <button onClick={() => setSelectedChat(null)} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
            </div>

            <div className="space-y-4">
              {/* Kullanıcı Mesajı */}
              <div className="p-4 bg-gray-100 rounded-lg">
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                  <FaUser /> Kullanıcı
                </div>
                <p className="text-gray-800">{selectedChat.kullanici_mesaji}</p>
              </div>

              {/* Bot Cevabı */}
              {selectedChat.bot_cevabi && (
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-2 text-sm text-blue-600 mb-2">
                    <FaRobot /> Asistan
                  </div>
                  <p className="text-gray-700 whitespace-pre-wrap">{selectedChat.bot_cevabi}</p>
                </div>
              )}

              {/* Hata */}
              {!selectedChat.basarili && (
                <div className="p-4 bg-red-50 rounded-lg">
                  <div className="flex items-center gap-2 text-sm text-red-600 mb-2">
                    <FaTimes /> Hata
                  </div>
                  <p className="text-red-700">{selectedChat.hata_mesaji}</p>
                </div>
              )}

              {/* Meta Bilgiler */}
              <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg text-sm">
                <div>
                  <p className="text-gray-500">IP Adresi</p>
                  <p className="font-mono">{selectedChat.ip_adresi || '-'}</p>
                </div>
                <div>
                  <p className="text-gray-500">Fingerprint</p>
                  <p className="font-mono truncate">{selectedChat.fingerprint || '-'}</p>
                </div>
                <div>
                  <p className="text-gray-500">Cevap Süresi</p>
                  <p>{selectedChat.cevap_suresi_ms || 0} ms</p>
                </div>
                <div>
                  <p className="text-gray-500">Token Kullanımı</p>
                  <p>{selectedChat.token_kullanimi || 0}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
