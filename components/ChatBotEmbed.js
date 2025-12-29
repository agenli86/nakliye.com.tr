'use client'
import { useState, useRef, useEffect } from 'react'
import { FaRobot, FaPaperPlane, FaPhone, FaSpinner, FaComments } from 'react-icons/fa'
import { createClient } from '@/lib/supabase-browser'

export default function ChatBotEmbed() {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [remainingQuestions, setRemainingQuestions] = useState(5)
  const [limitReached, setLimitReached] = useState(false)
  const [started, setStarted] = useState(false)
  const [isActive, setIsActive] = useState(true)
  const [checkingStatus, setCheckingStatus] = useState(true)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)
  const supabase = createClient()

  // Chatbot aktif mi kontrol et
  useEffect(() => {
    const checkStatus = async () => {
      try {
        const { data } = await supabase
          .from('chatbot_ayarlari')
          .select('deger')
          .eq('anahtar', 'aktif')
          .single()
        
        setIsActive(data?.deger === 'true')
      } catch (e) {
        setIsActive(false)
      }
      setCheckingStatus(false)
    }
    checkStatus()
  }, [])

  // Fingerprint oluştur
  const [fingerprint, setFingerprint] = useState('')
  useEffect(() => {
    const fp = `${navigator.userAgent}-${screen.width}x${screen.height}-${new Date().getTimezoneOffset()}`
    setFingerprint(btoa(fp).substring(0, 20))
  }, [])

  // Mesaj listesi güncellendiğinde aşağı kaydır
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Chatbot kapalıysa hiçbir şey gösterme
  if (checkingStatus) return null
  if (!isActive) return null

  const startChat = () => {
    setStarted(true)
    setMessages([{
      role: 'assistant',
      content: 'Merhaba! 👋 Ben Adana Nakliye yapay zeka asistanıyım. Size nakliyat, taşımacılık, fiyatlar ve hizmetlerimiz hakkında yardımcı olabilirim.\n\nNe sormak istersiniz?'
    }])
    setTimeout(() => inputRef.current?.focus(), 100)
  }

  const sendMessage = async (e) => {
    e.preventDefault()
    if (!input.trim() || loading || limitReached) return

    const userMessage = input.trim()
    setInput('')
    setMessages(prev => [...prev, { role: 'user', content: userMessage }])
    setLoading(true)

    try {
      const response = await fetch('/api/chatbot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage, fingerprint })
      })

      const data = await response.json()

      if (data.limitReached) {
        setLimitReached(true)
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: data.error,
          isError: true
        }])
      } else if (data.error) {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: data.error,
          isError: true
        }])
      } else {
        setMessages(prev => [...prev, { role: 'assistant', content: data.reply }])
        setRemainingQuestions(data.remainingQuestions)
      }
    } catch (error) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Bağlantı hatası oluştu. Lütfen tekrar deneyin.',
        isError: true
      }])
    }

    setLoading(false)
  }

  // Markdown benzeri linkler için basit parser
  const parseLinks = (text) => {
    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g
    const parts = []
    let lastIndex = 0
    let match

    while ((match = linkRegex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push(text.substring(lastIndex, match.index))
      }
      parts.push(
        <a
          key={match.index}
          href={match[2]}
          className="text-blue-600 underline font-semibold hover:text-blue-800"
          target={match[2].startsWith('tel:') ? '_self' : '_blank'}
          rel="noopener noreferrer"
        >
          {match[1]}
        </a>
      )
      lastIndex = match.index + match[0].length
    }

    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex))
    }

    return parts.length > 0 ? parts : text
  }

  // Öneri soruları
  const suggestions = [
    'Nakliyat fiyatları ne kadar?',
    'Asansörlü taşıma yapıyor musunuz?',
    'Şehirler arası taşıma var mı?',
    'Eşyaları siz mi paketliyorsunuz?'
  ]

  return (
    <section className="py-12 bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          
          {/* Başlık */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-4">
              <FaRobot /> Yapay Zeka Asistan
            </div>
            <h2 className="text-3xl font-bold text-gray-800 mb-2">
              Sorularınızı Yanıtlayalım
            </h2>
            <p className="text-gray-600">
              Nakliyat hakkında merak ettiklerinizi yapay zeka asistanımıza sorabilirsiniz
            </p>
          </div>

          {/* Chat Alanı */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
            
            {/* Başlamamış - Başlangıç Ekranı */}
            {!started ? (
              <div className="p-8 text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <FaComments className="text-white text-3xl" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">
                  Merhaba! Size nasıl yardımcı olabilirim?
                </h3>
                <p className="text-gray-500 mb-6">
                  Nakliyat, fiyatlar ve hizmetlerimiz hakkında sorularınızı yanıtlayayım
                </p>
                
                {/* Öneri Butonları */}
                <div className="flex flex-wrap justify-center gap-2 mb-6">
                  {suggestions.map((s, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        startChat()
                        setTimeout(() => {
                          setInput(s)
                        }, 500)
                      }}
                      className="px-4 py-2 bg-gray-100 hover:bg-blue-50 hover:text-blue-600 rounded-full text-sm transition-colors"
                    >
                      {s}
                    </button>
                  ))}
                </div>
                
                <button
                  onClick={startChat}
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-3 rounded-full font-semibold hover:shadow-lg transition-all hover:scale-105"
                >
                  <FaRobot /> Sohbete Başla
                </button>
                
                <p className="text-xs text-gray-400 mt-4">
                  Günlük 5 soru hakkınız var • Daha fazlası için bizi arayın
                </p>
              </div>
            ) : (
              <>
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                      <FaRobot size={20} />
                    </div>
                    <div>
                      <h3 className="font-bold">Nakliye Asistanı</h3>
                      <p className="text-xs text-blue-100">Yapay Zeka ile Sohbet</p>
                    </div>
                  </div>
                  <div className="text-right text-sm">
                    <p className="text-blue-100">Kalan soru hakkı</p>
                    <p className="font-bold text-lg">{remainingQuestions}/5</p>
                  </div>
                </div>

                {/* Mesajlar */}
                <div className="h-[350px] overflow-y-auto p-4 space-y-4 bg-gray-50">
                  {messages.map((msg, idx) => (
                    <div
                      key={idx}
                      className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      {msg.role === 'assistant' && (
                        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center mr-2 flex-shrink-0">
                          <FaRobot className="text-white text-sm" />
                        </div>
                      )}
                      <div
                        className={`max-w-[80%] p-4 rounded-2xl ${
                          msg.role === 'user'
                            ? 'bg-blue-600 text-white rounded-br-md'
                            : msg.isError
                              ? 'bg-red-100 text-red-700 rounded-bl-md'
                              : 'bg-white text-gray-800 shadow-sm rounded-bl-md'
                        }`}
                      >
                        <div className="text-sm whitespace-pre-wrap leading-relaxed">
                          {parseLinks(msg.content)}
                        </div>
                      </div>
                    </div>
                  ))}

                  {loading && (
                    <div className="flex justify-start">
                      <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center mr-2 flex-shrink-0">
                        <FaRobot className="text-white text-sm" />
                      </div>
                      <div className="bg-white p-4 rounded-2xl rounded-bl-md shadow-sm">
                        <div className="flex items-center gap-2 text-gray-500">
                          <FaSpinner className="animate-spin" />
                          <span className="text-sm">Yazıyor...</span>
                        </div>
                      </div>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="p-4 border-t bg-white">
                  {limitReached ? (
                    <div className="text-center py-2">
                      <p className="text-sm text-gray-600 mb-3">Günlük soru limitiniz doldu</p>
                      <a
                        href="tel:05057805551"
                        className="inline-flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-full font-semibold hover:bg-green-700 transition-colors"
                      >
                        <FaPhone /> 0505 780 55 51 - Bizi Arayın
                      </a>
                    </div>
                  ) : (
                    <form onSubmit={sendMessage} className="flex gap-3">
                      <input
                        ref={inputRef}
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Mesajınızı yazın..."
                        className="flex-1 border-2 border-gray-200 rounded-full px-5 py-3 focus:outline-none focus:border-blue-500 transition-colors"
                        disabled={loading}
                      />
                      <button
                        type="submit"
                        disabled={loading || !input.trim()}
                        className="bg-blue-600 text-white px-6 py-3 rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                      >
                        <FaPaperPlane />
                        <span className="hidden sm:inline">Gönder</span>
                      </button>
                    </form>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Alt Bilgi */}
          <div className="text-center mt-6 text-sm text-gray-500">
            <p>
              Detaylı bilgi ve randevu için: 
              <a href="tel:05057805551" className="text-blue-600 font-semibold ml-1 hover:underline">
                0505 780 55 51
              </a>
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
