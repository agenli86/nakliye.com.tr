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
    <footer style={{ backgroundColor: '#1e3a5f' }}>
      {/* Main Footer */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Company Info */}
          <div>
            <Image
              src={footerLogo}
              alt="Adana Nakliye"
              width={180}
              height={80}
              className="h-16 w-auto mb-6 brightness-0 invert"
            />
            <p className="text-white/90 mb-6 leading-relaxed">
              Adana evden eve taşımacılık için indirimli fiyat avantajlarından haberdar olmak için bizi takip ediniz.
            </p>
            <div className="flex gap-3">
              {facebook && (
                <a
                  href={facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook sayfamızı ziyaret edin"
                  className="w-10 h-10 rounded-lg flex items-center justify-center text-white/90 hover:text-white transition-all"
                  style={{ backgroundColor: '#0f2744' }}
                >
                  <FaFacebook />
                </a>
              )}
              {instagram && (
                <a
                  href={instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram sayfamızı ziyaret edin"
                  className="w-10 h-10 rounded-lg flex items-center justify-center text-white/90 hover:text-white transition-all"
                  style={{ backgroundColor: '#0f2744' }}
                >
                  <FaInstagram />
                </a>
              )}
              {youtube && (
                <a
                  href={youtube}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="YouTube kanalımızı ziyaret edin"
                  className="w-10 h-10 rounded-lg flex items-center justify-center text-white/90 hover:text-white transition-all"
                  style={{ backgroundColor: '#0f2744' }}
                >
                  <FaYoutube />
                </a>
              )}
              {twitter && (
                <a
                  href={twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Twitter sayfamızı ziyaret edin"
                  className="w-10 h-10 rounded-lg flex items-center justify-center text-white/90 hover:text-white transition-all"
                  style={{ backgroundColor: '#0f2744' }}
                >
                  <FaTwitter />
                </a>
              )}
            </div>
          </div>

          {/* Kurumsal */}
          <div>
            <h4 className="text-lg font-bold mb-6 text-white relative pb-3" style={{ borderBottom: '2px solid #d4ed31', width: 'fit-content', paddingBottom: '8px' }}>
              KURUMSAL
            </h4>
            <ul className="space-y-3">
              <li>
                <Link href="/hakkimizda" className="text-white/80 hover:text-[#d4ed31] transition-colors flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#d4ed31' }}></span>
                  Hakkımızda
                </Link>
              </li>
              <li>
                <Link href="/galeri" className="text-white/80 hover:text-[#d4ed31] transition-colors flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#d4ed31' }}></span>
                  Galeri
                </Link>
              </li>
              <li>
                <Link href="/sss" className="text-white/80 hover:text-[#d4ed31] transition-colors flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#d4ed31' }}></span>
                  Sıkça Sorulan Sorular
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-white/80 hover:text-[#d4ed31] transition-colors flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#d4ed31' }}></span>
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/iletisim" className="text-white/80 hover:text-[#d4ed31] transition-colors flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#d4ed31' }}></span>
                  İletişim
                </Link>
              </li>
            </ul>
          </div>

          {/* Hizmetler */}
          <div>
            <h4 className="text-lg font-bold mb-6 text-white relative pb-3" style={{ borderBottom: '2px solid #d4ed31', width: 'fit-content', paddingBottom: '8px' }}>
              HİZMETLER
            </h4>
            <ul className="space-y-3">
              {hizmetler?.slice(0, 6).map((hizmet) => (
                <li key={hizmet.id}>
                  <Link
                    href={`/hizmet/${hizmet.slug}`}
                    className="text-white/80 hover:text-[#d4ed31] transition-colors flex items-center gap-2"
                  >
                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#d4ed31' }}></span>
                    {hizmet.baslik}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* İletişim */}
          <div>
            <h4 className="text-lg font-bold mb-6 text-white relative pb-3" style={{ borderBottom: '2px solid #d4ed31', width: 'fit-content', paddingBottom: '8px' }}>
              İLETİŞİM
            </h4>
            <ul className="space-y-4">
              <li>
                <a
                  href={`https://maps.google.com/?q=${encodeURIComponent(adres)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/90 hover:text-[#d4ed31] transition-colors flex items-start gap-3"
                >
                  <FaMapMarkerAlt className="mt-1 flex-shrink-0" style={{ color: '#d4ed31' }} />
                  <span>{adres}</span>
                </a>
              </li>
              <li>
                <a
                  href={`tel:${telefon}`}
                  aria-label="Telefon ile arayın"
                  className="text-white/90 hover:text-[#d4ed31] transition-colors flex items-center gap-3"
                >
                  <FaPhone style={{ color: '#d4ed31' }} />
                  <span>{telefon}</span>
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${email}`}
                  className="text-white/90 hover:text-[#d4ed31] transition-colors flex items-center gap-3"
                >
                  <FaEnvelope style={{ color: '#d4ed31' }} />
                  <span>{email}</span>
                </a>
              </li>
              <li>
                <a
                  href={`https://wa.me/${whatsapp}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="WhatsApp ile mesaj gönderin"
                  className="text-white/90 hover:text-green-400 transition-colors flex items-center gap-3"
                >
                  <FaWhatsapp className="text-green-500" />
                  <span>WhatsApp ile Ulaşın</span>
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Footer */}
      <div style={{ borderTop: '1px solid #0f2744' }}>
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-white/60 text-sm text-center md:text-left">
              {copyright}
            </p>
            <div className="flex items-center gap-4 text-sm text-white/60">
              <Link href="/gizlilik-politikasi" className="hover:text-[#d4ed31] transition-colors">
                Gizlilik Politikası
              </Link>
              <span>|</span>
              <Link href="/kvkk" className="hover:text-[#d4ed31] transition-colors">
                KVKK
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
