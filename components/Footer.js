'use client'
import Link from 'next/link'
import Image from 'next/image'
import { FaPhone, FaEnvelope, FaMapMarkerAlt, FaFacebook, FaInstagram, FaYoutube, FaWhatsapp } from 'react-icons/fa'
import { POPULER_ROTALAR } from '@/lib/populer-rotalar'
import { resimYolu } from '@/lib/resim'

const SOSYAL_MEDYA = [
  { key: 'facebook', label: 'Facebook sayfamız', url: 'https://www.facebook.com/adanaevdenevetasima/', Icon: FaFacebook },
  { key: 'instagram', label: 'Instagram sayfamız', url: 'https://www.instagram.com/adananabarajevdenevenakliyat/', Icon: FaInstagram },
  { key: 'youtube', label: 'YouTube kanalımız', url: 'https://www.youtube.com/channel/UC8ZcBL6T-OELy9B_ykx79zQ', Icon: FaYoutube },
]

export default function Footer({ ayarlar, hizmetler }) {
  const getAyar = (key) => ayarlar?.find(a => a.anahtar === key)?.deger || ''
  const telefon = getAyar('telefon') || '05051774097'
  const adres = getAyar('adres') || 'Belediye Evleri, 84244. Sk. No:9 Adana / Çukurova'
  const whatsapp = getAyar('whatsapp') || '905051774097'
  const footerLogo = getAyar('footer_logo') || getAyar('logo') || '/resimler/adananakliye.png'

  // Google Ads Dönüşüm Takip Fonksiyonu
  const handleConversion = () => {
    if (typeof window !== 'undefined' && window.gtag && typeof window.gtag === 'function') {
      window.gtag('event', 'conversion', {
        'send_to': 'AW-10842738572/28z6CO6-69sbEIyfnLIo'
      });
    }
  }

  return (
    <footer className="bg-[#1e3a5f] text-white" role="contentinfo">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          <div className="flex flex-col gap-6">
            <Image src={resimYolu(footerLogo)} alt="Adana Nakliye Logo" width={180} height={80} className="h-16 w-auto brightness-0 invert" />
            <p className="text-white text-base leading-relaxed">Adana evden eve taşımacılık hizmetlerinde profesyonel çözümler için yanınızdayız.</p>
            {/* Bağlantılar href="#" ile hiçbir yere gitmiyordu ve içlerinde
                yalnızca ikon olduğu için ekran okuyucuya isimsiz görünüyordu.
                Adresler ayarlardan, yoksa layout'taki yapısal veriden geliyor. */}
            <div className="flex gap-4">
              {SOSYAL_MEDYA.map(({ key, label, url, Icon }) => {
                const href = getAyar(key) || url
                if (!href) return null
                return (
                  <a
                    key={key}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    title={label}
                    className="w-12 h-12 rounded-lg bg-[#0f2744] flex items-center justify-center hover:bg-[#d4ed31] hover:text-[#1e3a5f] transition-all"
                  >
                    <Icon size={24} aria-hidden="true" />
                  </a>
                )
              })}
            </div>
          </div>
          <div>
            <h3 className="text-lg font-bold mb-8 border-b-2 border-[#d4ed31] w-fit pb-2">KURUMSAL</h3>
            <ul className="flex flex-col gap-5">
              <li><Link href="/hakkimizda" className="hover:text-[#d4ed31] py-2 block">Hakkımızda</Link></li>
              <li><Link href="/blog" className="hover:text-[#d4ed31] py-2 block">Blog</Link></li>
              <li><Link href="/rota" className="hover:text-[#d4ed31] py-2 block">Nakliye Rotaları</Link></li>
              <li><Link href="/nakliye-hizmetleri" className="hover:text-[#d4ed31] py-2 block">İllere Göre Hizmetler</Link></li>
              <li><Link href="/nakliyat" className="hover:text-[#d4ed31] py-2 block">Adana Semtleri</Link></li>
              <li><Link href="/iletisim" className="hover:text-[#d4ed31] py-2 block">İletişim</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-bold mb-8 border-b-2 border-[#d4ed31] w-fit pb-2">HİZMETLERİMİZ</h3>
            <ul className="flex flex-col gap-5">
              {hizmetler?.slice(0, 4).map((h) => (
                <li key={h.id}><Link href={`/hizmet/${h.slug}`} className="hover:text-[#d4ed31] py-2 block">{h.baslik}</Link></li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-bold mb-8 border-b-2 border-[#d4ed31] w-fit pb-2">İLETİŞİM</h3>
            <div className="flex flex-col gap-6">
              {/* Telefon Tıklama Takibi */}
              <a 
                href={`tel:${telefon}`} 
                onClick={handleConversion}
                className="flex items-center gap-3 text-lg font-bold hover:text-[#d4ed31] py-2"
              >
                <FaPhone className="text-[#d4ed31]"/> {telefon}
              </a>
              
              {/* WhatsApp Tıklama Takibi */}
              <a 
                href={`https://wa.me/${whatsapp}`} 
                onClick={handleConversion}
                className="bg-[#0f2744] p-4 rounded-xl flex items-center gap-3 hover:bg-green-600 transition-all py-3"
              >
                <FaWhatsapp className="text-green-500" size={24}/> <span>WhatsApp Destek</span>
              </a>
            </div>
          </div>
        </div>

        {/* Popüler rotalar: her sayfadan rota ağına giden iç bağlantılar.
            Arama motorları için sitenin en derin sayfalarını üç tık
            uzaklığa indiriyor. */}
        <nav aria-labelledby="footer-rotalar" className="mt-14 border-t border-white/10 pt-10">
          <h3 id="footer-rotalar" className="text-lg font-bold mb-5 border-b-2 border-[#d4ed31] w-fit pb-2">
            POPÜLER ROTALAR
          </h3>
          <ul className="flex flex-wrap gap-x-5 gap-y-1 text-sm text-white/80">
            {POPULER_ROTALAR.map((rota) => (
              <li key={rota.href}>
                <Link href={rota.href} className="block py-2 hover:text-[#d4ed31]">{rota.metin}</Link>
              </li>
            ))}
            <li>
              <Link href="/rota" className="block py-2 font-semibold text-[#d4ed31] hover:underline">
                Tüm rotalar →
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </footer>
  )
}
