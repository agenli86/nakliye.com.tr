'use client'
import Link from 'next/link'
import Image from 'next/image'
import { FaPhone, FaEnvelope, FaMapMarkerAlt, FaFacebook, FaInstagram, FaYoutube, FaWhatsapp } from 'react-icons/fa'

export default function Footer({ ayarlar, hizmetler }) {
  const getAyar = (key) => ayarlar?.find(a => a.anahtar === key)?.deger || ''
  const telefon = getAyar('telefon') || '05057805551'
  const adres = getAyar('adres') || 'Belediye Evleri, 84244. Sk. No:9 Adana / Çukurova'
  const whatsapp = getAyar('whatsapp') || '905057805551'
  const footerLogo = getAyar('footer_logo') || getAyar('logo') || '/resimler/adananakliye.png'

  return (
    <footer className="bg-[#1e3a5f] text-white" role="contentinfo">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          <div className="flex flex-col gap-6">
            <Image src={footerLogo} alt="Adana Nakliye Logo" width={180} height={80} className="h-16 w-auto brightness-0 invert" />
            <p className="text-white text-base leading-relaxed">Adana evden eve taşımacılık hizmetlerinde profesyonel çözümler için yanınızdayız.</p>
            <div className="flex gap-4">
              <a href="#" className="w-12 h-12 rounded-lg bg-[#0f2744] flex items-center justify-center hover:bg-[#d4ed31] transition-all"><FaFacebook size={24}/></a>
              <a href="#" className="w-12 h-12 rounded-lg bg-[#0f2744] flex items-center justify-center hover:bg-[#d4ed31] transition-all"><FaInstagram size={24}/></a>
            </div>
          </div>
          <div>
            <h4 className="text-lg font-bold mb-8 border-b-2 border-[#d4ed31] w-fit pb-2">KURUMSAL</h4>
            <ul className="flex flex-col gap-5">
              <li><Link href="/hakkimizda" className="hover:text-[#d4ed31] py-2 block">Hakkımızda</Link></li>
              <li><Link href="/iletisim" className="hover:text-[#d4ed31] py-2 block">İletişim</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-bold mb-8 border-b-2 border-[#d4ed31] w-fit pb-2">HİZMETLERİMİZ</h4>
            <ul className="flex flex-col gap-5">
              {hizmetler?.slice(0, 4).map((h) => (
                <li key={h.id}><Link href={`/hizmet/${h.slug}`} className="hover:text-[#d4ed31] py-2 block">{h.baslik}</Link></li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-bold mb-8 border-b-2 border-[#d4ed31] w-fit pb-2">İLETİŞİM</h4>
            <div className="flex flex-col gap-6">
              <a href={`tel:${telefon}`} className="flex items-center gap-3 text-lg font-bold hover:text-[#d4ed31] py-2"><FaPhone className="text-[#d4ed31]"/> {telefon}</a>
              <a href={`https://wa.me/${whatsapp}`} className="bg-[#0f2744] p-4 rounded-xl flex items-center gap-3 hover:bg-green-600 transition-all py-3"><FaWhatsapp className="text-green-500" size={24}/> <span>WhatsApp Destek</span></a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
