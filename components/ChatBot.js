'use client'
import { useState, useRef, useEffect } from 'react'
import { FaRobot, FaTimes, FaPaperPlane, FaPhone, FaSpinner } from 'react-icons/fa'

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Merhaba! 👋 Ben Adana Nakliye yapay zeka asistanıyım. Size nakliyat, taşımacılık ve fiyatlar hakkında yardımcı olabilirim. Ne sormak istersiniz?'
    }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [remainingQuestions, setRemainingQuestions] = useState(5)
  const [limitReached, setLimitReached] = useState(false)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

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

  // Chat açıldığında input'a focus
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [isOpen])

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
    // [text](url) formatını link'e çevir
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

  return (
    <>
      {/* Chat Butonu */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-24 right-6 z-40 bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-110 ${isOpen ? 'hidden' : 'flex'} items-center gap-2`}
        aria-label="Yapay Zeka Asistan"
      >
        <FaRobot size={24} />
        <span className="hidden sm:inline font-semibold">AI Asistan</span>
      </button>

      {/* Chat Penceresi */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-[360px] max-w-[calc(100vw-2rem)] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-200">
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
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
            >
              <FaTimes size={18} />
            </button>
          </div>

          {/* Kalan Soru Sayısı */}
          <div className="bg-blue-50 px-4 py-2 text-xs text-blue-600 flex justify-between items-center">
            <span>Günlük kalan soru hakkınız: <strong>{remainingQuestions}</strong></span>
            <a href="tel:05057805551" className="flex items-center gap-1 text-green-600 hover:underline">
              <FaPhone size={10} /> Bizi Arayın
            </a>
          </div>

          {/* Mesajlar */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-[350px] bg-gray-50">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] p-3 rounded-2xl ${
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
                <div className="bg-white p-3 rounded-2xl rounded-bl-md shadow-sm">
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
          <form onSubmit={sendMessage} className="p-3 border-t bg-white">
            {limitReached ? (
              <div className="text-center py-2">
                <p className="text-sm text-gray-600 mb-2">Günlük soru limitiniz doldu</p>
                <a
                  href="tel:05057805551"
                  className="inline-flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-full text-sm font-semibold hover:bg-green-700"
                >
                  <FaPhone /> 0505 780 55 51
                </a>
              </div>
            ) : (
              <div className="flex gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Mesajınızı yazın..."
                  className="flex-1 border rounded-full px-4 py-2 text-sm focus:outline-none focus:border-blue-500"
                  disabled={loading}
                />
                <button
                  type="submit"
                  disabled={loading || !input.trim()}
                  className="bg-blue-600 text-white p-3 rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <FaPaperPlane size={14} />
                </button>
              </div>
            )}
          </form>
        </div>
      )}
    </>
  )
}
