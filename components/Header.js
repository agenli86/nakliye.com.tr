'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { FaPhone, FaEnvelope, FaBars, FaTimes, FaChevronDown, FaFileAlt } from 'react-icons/fa'

export default function Header({ ayarlar, menu }) {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [openSubmenu, setOpenSubmenu] = useState(null)

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const menuItems = menu?.filter(item => !item.parent_id) || []
  const getSubMenu = (parentId) => menu?.filter(item => item.parent_id === parentId) || []

  const telefon = ayarlar?.find(a => a.anahtar === 'telefon')?.deger || '05057805551'
  const email = ayarlar?.find(a => a.anahtar === 'email')?.deger || 'info@adananakliye.com.tr'
  const logo = ayarlar?.find(a => a.anahtar === 'logo')?.deger || '/resimler/adananakliye.png'

  return (
    <header className={`fixed w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-white shadow-lg' : 'bg-white/95 backdrop-blur-sm'}`}>
      {/* Top Bar - Desktop Only */}
      <div className={`hidden md:block text-white transition-all duration-300 ${isScrolled ? 'h-0 overflow-hidden' : 'h-auto'}`} style={{ backgroundColor: '#046ffb' }}>
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center py-1.5 text-sm">
            <div className="flex items-center gap-6">
              <a href={`tel:${telefon}`} className="flex items-center gap-2 hover:text-blue-200 transition-colors">
                <FaPhone className="text-xs" />
                <span>{telefon}</span>
              </a>
              <a href={`mailto:${email}`} className="flex items-center gap-2 hover:text-blue-200 transition-colors">
                <FaEnvelope className="text-xs" />
                <span>{email}</span>
              </a>
            </div>
            <div className="text-blue-100">
              Pazartesi - Pazar: 07:00 - 21:30
            </div>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="container mx-auto px-4">
        <div className={`flex items-center justify-between transition-all duration-300 ${isScrolled ? 'py-1' : 'py-2'}`}>
          {/* Logo */}
          <Link href="/" className="flex-shrink-0">
            <Image
              src={logo}
              alt="Adana Nakliye"
              width={200}
              height={70}
              className={`transition-all duration-300 ${isScrolled ? 'h-10 md:h-12' : 'h-12 md:h-14'} w-auto`}
              priority
            />
          </Link>

          {/* Desktop Menu */}
          <nav className="hidden lg:flex items-center gap-1">
            {menuItems.map((item) => {
              const subMenu = getSubMenu(item.id)
              const hasSubMenu = subMenu.length > 0

              return (
                <div key={item.id} className="relative group">
                  <Link
                    href={item.link}
                    className="flex items-center gap-1 px-4 py-2 font-medium transition-colors hover:text-blue-600"
                    style={{ color: '#1e3a5f' }}
                  >
                    {item.baslik}
                    {hasSubMenu && <FaChevronDown className="text-xs" />}
                  </Link>

                  {hasSubMenu && (
                    <div className="absolute top-full left-0 w-64 bg-white shadow-xl rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                      <div className="py-2">
                        {subMenu.map((subItem) => (
                          <Link
                            key={subItem.id}
                            href={subItem.link}
                            className="block px-4 py-3 text-gray-600 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                          >
                            {subItem.baslik}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </nav>

          {/* Desktop CTA Button */}
          <div className="hidden lg:flex items-center gap-3">
            <Link
              href="/teklif-al"
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold transition-all hover:scale-105 shadow-lg"
              style={{ backgroundColor: '#d4ed31', color: '#1e3a5f' }}
            >
              <FaFileAlt />
              <span>TEKLİF AL</span>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg transition-colors"
            style={{ backgroundColor: isMobileMenuOpen ? '#f3f4f6' : 'transparent', color: '#1e3a5f' }}
          >
            {isMobileMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={`lg:hidden bg-white border-t shadow-xl transition-all duration-300 ${isMobileMenuOpen ? 'max-h-[80vh] opacity-100 overflow-y-auto' : 'max-h-0 opacity-0 overflow-hidden'}`}>
        <div className="container mx-auto px-4 py-4">
          <nav className="flex flex-col gap-1">
            {menuItems.map((item) => {
              const subMenu = getSubMenu(item.id)
              const hasSubMenu = subMenu.length > 0
              const isOpen = openSubmenu === item.id

              return (
                <div key={item.id}>
                  <div className="flex items-center justify-between">
                    <Link
                      href={item.link}
                      onClick={() => !hasSubMenu && setIsMobileMenuOpen(false)}
                      className="flex-1 py-3 font-medium transition-colors"
                      style={{ color: '#1e3a5f' }}
                    >
                      {item.baslik}
                    </Link>
                    {hasSubMenu && (
                      <button onClick={() => setOpenSubmenu(isOpen ? null : item.id)} className="p-3 text-gray-500">
                        <FaChevronDown className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                      </button>
                    )}
                  </div>

                  {hasSubMenu && (
                    <div className={`pl-4 overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-96' : 'max-h-0'}`}>
                      {subMenu.map((subItem) => (
                        <Link
                          key={subItem.id}
                          href={subItem.link}
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="block py-2 text-gray-600 hover:text-blue-600 transition-colors"
                        >
                          {subItem.baslik}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </nav>

          {/* Mobile CTA Buttons */}
          <div className="flex flex-col gap-3 mt-6 pt-4 border-t">
            <Link
              href="/teklif-al"
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-center py-3 rounded-xl font-semibold text-lg flex items-center justify-center gap-2 shadow-lg"
              style={{ backgroundColor: '#d4ed31', color: '#1e3a5f' }}
            >
              <FaFileAlt />
              TEKLİF AL
            </Link>
            
              href={`tel:${telefon}`}
              className="text-center py-3 rounded-xl font-semibold text-lg text-white flex items-center justify-center gap-2"
              style={{ backgroundColor: '#046ffb' }}
            >
              <FaPhone />
              {telefon}
            </a>
          </div>
        </div>
      </div>
    </header>
  )
}
