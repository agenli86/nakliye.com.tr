'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase-browser'
import Link from 'next/link'
import Image from 'next/image'
import toast from 'react-hot-toast'
import {
  FaHome, FaCog, FaImages, FaConciergeBell, FaNewspaper, FaMoneyBillWave,
  FaQuestionCircle, FaBars, FaEnvelope, FaSignOutAlt, FaTimes, FaTachometerAlt,
  FaListUl, FaSearch, FaPhotoVideo, FaBullhorn, FaCode, FaAward, FaUsers, FaRobot, FaShieldAlt
} from 'react-icons/fa'

const menuItems = [
  { href: '/admin', label: 'Dashboard', icon: FaTachometerAlt },
  { href: '/admin/ziyaretciler', label: 'Ziyaretçi Analizi', icon: FaUsers },
  { href: '/admin/sahte-tiklamalar', label: 'Sahte Tıklamalar', icon: FaShieldAlt },
  { href: '/admin/chatbot', label: 'Chatbot Sohbetleri', icon: FaRobot },
  { href: '/admin/ayarlar', label: 'Site Ayarları', icon: FaCog },
  { href: '/admin/anasayfa', label: 'Anasayfa', icon: FaHome },
  { href: '/admin/kutucuklar', label: 'Özellik Kutucukları', icon: FaAward },
  { href: '/admin/duyurular', label: 'Duyurular', icon: FaBullhorn },
  { href: '/admin/sliders', label: 'Slider', icon: FaImages },
  { href: '/admin/hizmetler', label: 'Hizmetler', icon: FaConciergeBell },
  { href: '/admin/makaleler', label: 'Makaleler', icon: FaNewspaper },
  { href: '/admin/galeri', label: 'Galeri', icon: FaPhotoVideo },
  { href: '/admin/fiyatlar', label: 'Fiyatlar', icon: FaMoneyBillWave },
  { href: '/admin/sss', label: 'SSS', icon: FaQuestionCircle },
  { href: '/admin/menu', label: 'Menü', icon: FaListUl },
  { href: '/admin/seo', label: 'SEO', icon: FaSearch },
  { href: '/admin/yapisal-veri', label: 'Yapısal Veri', icon: FaCode },
  { href: '/admin/mesajlar', label: 'Mesajlar', icon: FaEnvelope },
]

export default function AdminLayout({ children }) {
  const router = useRouter()
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [user, setUser] = useState(null)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user))
  }, [])

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    toast.success('Çıkış yapıldı')
    router.push('/admin/giris')
    router.refresh()
  }

  if (pathname === '/admin/giris') return children

  return (
    <div className="min-h-screen bg-gray-100">
      {sidebarOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* Sidebar */}
      <aside 
        className={`fixed top-0 left-0 z-50 h-screen w-64 text-white transform transition-transform duration-300 lg:translate-x-0 flex flex-col ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`} 
        style={{ backgroundColor: '#1e3a5f' }}
      >
        {/* Logo - Fixed */}
        <div className="flex-shrink-0 flex items-center justify-between p-4 border-b border-white/10">
          <Link href="/admin">
            <Image src="/resimler/adananakliye.png" alt="Admin" width={120} height={40} className="brightness-0 invert" />
          </Link>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-white/60 hover:text-white">
            <FaTimes size={18} />
          </button>
        </div>

        {/* Menu - Scrollable */}
        <nav className="flex-1 overflow-y-auto p-3">
          <ul className="space-y-1">
            {menuItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                      isActive 
                        ? 'text-gray-900 shadow-md' 
                        : 'text-white/80 hover:text-white hover:bg-white/10'
                    }`}
                    style={isActive ? { backgroundColor: '#d4ed31' } : {}}
                  >
                    <item.icon className="flex-shrink-0 text-base" />
                    <span className="truncate">{item.label}</span>
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* Footer - Fixed */}
        <div className="flex-shrink-0 p-3 border-t border-white/10">
          <Link 
            href="/" 
            target="_blank" 
            className="flex items-center gap-3 px-3 py-2.5 text-white/70 hover:bg-white/10 rounded-lg text-sm font-medium transition-all"
          >
            <FaHome className="flex-shrink-0" /> 
            <span>Siteyi Gör</span>
          </Link>
          <button 
            onClick={handleLogout} 
            className="flex items-center gap-3 px-3 py-2.5 text-red-300 hover:bg-red-500/20 rounded-lg w-full text-sm font-medium transition-all mt-1"
          >
            <FaSignOutAlt className="flex-shrink-0" /> 
            <span>Çıkış Yap</span>
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="lg:ml-64 min-h-screen">
        <header className="bg-white shadow-sm sticky top-0 z-30">
          <div className="flex items-center justify-between px-4 py-3">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
              <FaBars size={20} />
            </button>
            <h1 className="text-lg font-semibold hidden lg:block" style={{ color: '#1e3a5f' }}>Admin Paneli</h1>
            <span className="text-sm text-gray-500 truncate max-w-[200px]">{user?.email}</span>
          </div>
        </header>
        <main className="p-4 lg:p-6">{children}</main>
      </div>
    </div>
  )
}
