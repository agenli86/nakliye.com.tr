'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { FaPhone, FaMapMarkerAlt, FaBars, FaTimes, FaChevronDown } from 'react-icons/fa'

export default function Header({ ayarlar, menu }) {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [openDropdown, setOpenDropdown] = useState(null)

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const telefon = ayarlar?.find(a => a.anahtar === 'telefon')?.deger || '05057805551'
  const logo = ayarlar?.find(a => a.anahtar === 'logo')?.deger || '/resimler/adananakliye.png'
  
  const menuItems = menu?.filter(item => !item.parent_id) || []
  const getSubMenu = (parentId) => menu?.filter(item => item.parent_id === parentId) || []

  return (
    <>
      {/* Top Bar - Desktop Only */}
      <div className="bg-blue-600 text-white py-2 hidden md:block">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center text-sm">
            <div className="flex items-center space-x-6">
              <a href={`tel:${telefon}`} className="flex items-center hover:text-blue-200 transition-colors">
                <FaPhone className="mr-2" />
                {telefon}
              </a>
              <div className="flex items-center">
                <FaMapMarkerAlt className="mr-2" />
                Çukurova, Adana
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-yellow-300 font-semibold">7/24 Hizmet</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <header className={`sticky top-0 z-50 bg-white transition-shadow duration-300 ${isScrolled ? 'shadow-lg' : 'shadow-md'}`}>
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-20 md:h-24">
            {/* Logo */}
            <Link href="/" className="flex items-center">
              <Image
                src={logo}
                alt="Adana Nakliye"
                width={220}
                height={80}
                className="h-14 md:h-16 w-auto"
                priority
              />
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-1">
              {menuItems.map((item) => {
                const subMenu = getSubMenu(item.id)
                const hasSubMenu = subMenu.length > 0

                return (
                  <div
                    key={item.id}
                    className="relative"
                    onMouseEnter={() => hasSubMenu && setOpenDropdown(item.id)}
                    onMouseLeave={() => setOpenDropdown(null)}
                  >
                    <Link
                      href={item.link}
                      className="flex items-center px-4 py-2 text-gray-700 hover:text-blue-600 font-medium transition-colors"
                    >
                      {item.baslik}
                      {hasSubMenu && <FaChevronDown className="ml-1 text-xs" />}
                    </Link>

                    {hasSubMenu && openDropdown === item.id && (
                      <div className="absolute top-full left-0 mt-0 w-64 bg-white rounded-lg shadow-xl py-2 z-50">
                        {subMenu.map((subItem) => (
                          <Link
                            key={subItem.id}
                            href={subItem.link}
                            className="block px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                          >
                            {subItem.baslik}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
              
              <Link
                href="/teklif-al"
                className="ml-4 px-5 py-2.5 rounded-lg font-semibold transition-all hover:scale-105"
                style={{ backgroundColor: '#d4ed31', color: '#1e3a5f' }}
              >
                Teklif Al
              </Link>
            </nav>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden text-gray-700 text-2xl p-2"
            >
              {isMobileMenuOpen ? <FaTimes /> : <FaBars />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden bg-white border-t">
            <div className="container mx-auto px-4 py-4">
              <nav className="flex flex-col space-y-1">
                {menuItems.map((item) => {
                  const subMenu = getSubMenu(item.id)
                  const hasSubMenu = subMenu.length > 0
                  const isOpen = openDropdown === item.id

                  return (
                    <div key={item.id}>
                      <div className="flex items-center justify-between">
                        <Link
                          href={item.link}
                          className="flex-1 py-3 text-gray-700 hover:text-blue-600 font-medium transition-colors"
                          onClick={() => !hasSubMenu && setIsMobileMenuOpen(false)}
                        >
                          {item.baslik}
                        </Link>
                        {hasSubMenu && (
                          <button
                            onClick={() => setOpenDropdown(isOpen ? null : item.id)}
                            className="p-3 text-gray-500"
                          >
                            <FaChevronDown className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                          </button>
                        )}
                      </div>

                      {hasSubMenu && isOpen && (
                        <div className="pl-4 pb-2">
                          {subMenu.map((subItem) => (
                            <Link
                              key={subItem.id}
                              href={subItem.link}
                              className="block py-2 text-gray-600 hover:text-blue-600 transition-colors"
                              onClick={() => setIsMobileMenuOpen(false)}
                            >
                              → {subItem.baslik}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                })}

                <div className="pt-4 mt-4 border-t space-y-3">
                  <Link
                    href="/teklif-al"
                    className="block text-center py-3 rounded-lg font-semibold"
                    style={{ backgroundColor: '#d4ed31', color: '#1e3a5f' }}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Teklif Al
                  </Link>
                  <a
                    href={`tel:${telefon}`}
                    className="flex items-center justify-center py-3 text-blue-600 font-semibold"
                  >
                    <FaPhone className="mr-2" />
                    {telefon}
                  </a>
                </div>
              </nav>
            </div>
          </div>
        )}
      </header>
    </>
  )
}
