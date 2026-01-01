'use client'

import Link from 'next/link'
import Image from 'next/image'
import { FaPhone, FaEnvelope, FaMapMarkerAlt, FaFacebook, FaInstagram, FaYoutube, FaTwitter, FaWhatsapp } from 'react-icons/fa'

export default function Footer({ ayarlar, hizmetler }) {
  const getAyar = (key) => ayarlar?.find(a => a.anahtar === key)?.deger || ''

  const telefon = getAyar('telefon') || '05057805551'
  const email = getAyar('email') || 'info@adananakliye.com.tr'
  const adres = getAyar('adres') || 'Belediye Evleri, 84244. Sk. No:9 Adana / Çukurova'
  const whatsapp = getAyar('whatsapp') || '905057805551'
  const facebook = getAyar('facebook')
  const instagram = getAyar('instagram')
  const youtube = getAyar('youtube')
  const twitter = getAyar('twitter')
  const footerLogo = getAyar('footer_logo') || getAyar('logo') || '/resimler/adananakliye.png'
  const copyright = getAyar('copyright') || 'Adana Nakliye © 2024 Tüm Hakları Saklıdır.'

  return (
    <footer style={{ backgroundColor: '#1e3a5f' }} role="contentinfo">
      {/* Main Footer */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12"> {/* Gap 10'dan 12'ye çıkarıldı: Dokunma hedefi iyileştirmesi */}
          
          {/* Company Info */}
          <div className="flex flex-col gap-6">
            <Image
              src={footerLogo}
              alt="Adana Nakliye Logo"
              width={180}
              height={80}
              className="h-16 w-auto brightness-0 invert"
              loading="lazy"
            />
            {/* Yazı rengi white'dan white/100 yapıldı: Kontrast iyileştirmesi */}
            <p className="text-white text-base leading-relaxed">
              Adana evden eve taşımacılık için indirimli fiyat avantajlarından haberdar olmak için bizi takip ediniz.
            </p>
            <div className="flex gap-4"> {/* Gap 3'ten 4'e çıkarıldı */}
              {facebook && (
                <a
                  href={facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook sayfamızı ziyaret edin"
                  className="w-12 h-12 rounded-lg flex items-center justify-center text-white bg-[#0f2744] hover:bg-[#d4ed31] hover:text-[#1e3a5f] transition-all"
                >
                  <FaFacebook size={20} />
                </a>
              )}
              {instagram && (
                <a
                  href={instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram sayfamızı ziyaret edin"
                  className="w-12 h-12 rounded-lg flex items-center justify-center text-white bg-[#0f2744] hover:bg-[#d4ed31] hover:text-[#1e3a5f] transition-all"
                >
                  <FaInstagram size={20} />
                </a>
              )}
              {youtube && (
                <a
                  href={youtube}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="YouTube kanalımızı ziyaret edin"
                  className="w-12 h-12 rounded-lg flex items-center justify-center text-white bg-[#0f2744] hover:bg-[#d4ed31] hover:text-[#1e3a5f] transition-all"
                >
                  <FaYoutube size={20} />
                </a>
              )}
            </div>
          </div>

          {/* Kurumsal */}
          <div>
            <h4 className="text-lg font-bold mb-8 text-white relative pb-3" style={{ borderBottom: '3px solid #d4ed31', width: 'fit-content' }}>
              KURUMSAL
            </h4>
            <ul className="flex flex-col gap-4"> {/* Space-y yerine gap-4: Dokunma hedefi iyileştirmesi */}
              <li>
                <Link href="/hakkimizda" className="text-white hover:text-[#d4ed31] font-medium transition-colors flex items-center gap-3 py-1">
                  <span className="w-2 h-2 rounded-full bg-[#d4ed31]"></span>
                  Hakkımızda
                </Link>
              </li>
              <li>
                <Link href="/galeri" className="text-white hover:text-[#d4ed31] font-medium transition-colors flex items-center gap-3 py-1">
                  <span className="w-2 h-2 rounded-full bg-[#d4ed31]"></span>
                  Galeri
                </Link>
              </li>
              <li>
                <Link href="/iletisim" className="text-white hover:text-[#d4ed31] font-medium transition-colors flex items-center gap-3 py-1">
                  <span className="w-2 h-2 rounded-full bg-[#d4ed31]"></span>
                  İletişim
                </Link>
              </li>
            </ul>
          </div>

          {/* Hizmetler */}
          <div>
            <h4 className="text-lg font-bold mb-8 text-white relative pb-3" style={{ borderBottom: '3px solid #d4ed31', width: 'fit-content' }}>
              HİZMETLER
            </h4>
            <ul className="flex flex-col gap-4">
              {hizmetler?.slice(0, 5).map((hizmet) => (
                <li key={hizmet.id}>
                  <Link
                    href={`/hizmet/${hizmet.slug}`}
                    className="text-white hover:text-[#d4ed31] font-medium transition-colors flex items-center gap-3 py-1"
                  >
                    <span className="w-2 h-2 rounded-full bg-[#d4ed31]"></span>
                    {hizmet.baslik}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* İletişim */}
          <div>
            <h4 className="text-lg font-bold mb-8 text-white relative pb-3" style={{ borderBottom: '3px solid #d4ed31', width: 'fit-content' }}>
              İLETİŞİM
            </h4>
            <ul className="flex flex-col gap-5">
              <li>
                <a
                  href={`https://www.google.com/maps/search/${encodeURIComponent(adres)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white hover:text-[#d4ed31] transition-colors flex items-start gap-3 py-1"
                >
                  <FaMapMarkerAlt className="mt-1 flex-shrink-0 text-[#d4ed31]" size={20} />
                  <span>{adres}</span>
                </a>
              </li>
              <li>
                <a
                  href={`tel:${telefon}`}
                  aria-label="Telefon ile arayın"
                  className="text-white hover:text-[#d4ed31] transition-colors flex items-center gap-3 py-1"
                >
                  <FaPhone className="text-[#d4ed31]" size={18} />
                  <span className="font-semibold text-lg">{telefon}</span>
                </a>
              </li>
              <li>
                <a
                  href={`https://wa.me/${whatsapp}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="WhatsApp ile mesaj gönderin"
                  className="text-white hover:text-green-400 transition-colors flex items-center gap-3 py-2 px-4 rounded-lg bg-[#0f2744] w-fit"
                >
                  <FaWhatsapp className="text-green-500" size={22} />
                  <span className="font-bold">WhatsApp Hattı</span>
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Footer */}
      <div style={{ borderTop: '2px solid #0f2744' }}>
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-white/80 text-sm font-medium text-center md:text-left">
              {copyright}
            </p>
            <div className="flex items-center gap-6 text-sm">
              <Link href="/gizlilik-politikasi" className="text-white hover:text-[#d4ed31] underline underline-offset-4">
                Gizlilik Politikası
              </Link>
              <Link href="/kvkk" className="text-white hover:text-[#d4ed31] underline underline-offset-4">
                KVKK
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
