import { createClient } from '@/lib/supabase-server'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import ContactForm from '@/components/ContactForm'
import StickyButtons from '@/components/StickyButtons'
import Link from 'next/link'
import { FaChevronRight, FaPhone, FaEnvelope, FaMapMarkerAlt, FaWhatsapp, FaClock } from 'react-icons/fa'

export async function generateMetadata() {
  const supabase = await createClient()
  const [{ data: seo }, { data: ayarlar }] = await Promise.all([
    supabase.from('seo_ayarlari').select('*').eq('sayfa_turu', 'iletisim').single(),
    supabase.from('ayarlar').select('*'),
  ])
  const getAyar = (key) => ayarlar?.find(a => a.anahtar === key)?.deger || ''
  const siteUrl = getAyar('site_url') || 'https://adananakliye.com.tr'
  return {
    title: seo?.meta_title || 'İletişim | Adana Nakliye',
    description: seo?.meta_description || 'Adana Nakliye iletişim bilgileri.',
    openGraph: { title: seo?.meta_title, description: seo?.meta_description, url: `${siteUrl}/iletisim`, images: [{ url: seo?.og_image || getAyar('og_image') }] },
    alternates: { canonical: seo?.canonical_url || `${siteUrl}/iletisim` },
  }
}

async function getData() {
  const supabase = await createClient()
  const [{ data: ayarlar }, { data: menu }, { data: hizmetler }] = await Promise.all([
    supabase.from('ayarlar').select('*'),
    supabase.from('menu').select('*').eq('aktif', true).order('sira'),
    supabase.from('hizmetler').select('id, baslik, slug').eq('aktif', true).order('sira'),
  ])
  return { ayarlar, menu, hizmetler }
}

export default async function IletisimPage() {
  const { ayarlar, menu, hizmetler } = await getData()
  const getAyar = (key) => ayarlar?.find(a => a.anahtar === key)?.deger || ''

  const contactInfo = [
    { icon: FaPhone, label: 'Telefon', value: getAyar('telefon'), href: `tel:${getAyar('telefon')}` },
    { icon: FaWhatsapp, label: 'WhatsApp', value: 'WhatsApp ile yazın', href: `https://wa.me/${getAyar('whatsapp')}` },
    { icon: FaEnvelope, label: 'E-posta', value: getAyar('email'), href: `mailto:${getAyar('email')}` },
    { icon: FaMapMarkerAlt, label: 'Adres', value: getAyar('adres') },
    { icon: FaClock, label: 'Çalışma Saatleri', value: getAyar('calisma_saatleri') },
  ]

  return (
    <>
      <Header ayarlar={ayarlar} menu={menu} />
      <main className="pt-[140px] md:pt-[160px]">
        <section className="py-20" style={{ background: 'linear-gradient(135deg, #046ffb 0%, #0559c9 100%)' }}>
          <div className="container mx-auto px-4">
            <nav className="flex items-center gap-2 text-white/80 text-sm mb-4">
              <Link href="/" className="hover:text-white">Anasayfa</Link>
              <FaChevronRight className="text-xs" />
              <span className="text-white">İletişim</span>
            </nav>
            <h1 className="text-4xl md:text-5xl font-bold text-white">İletişim</h1>
          </div>
        </section>

        <section className="section">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-12">
              <div>
                <h2 className="text-2xl font-bold mb-6" style={{ color: '#1e3a5f' }}>Bize Ulaşın</h2>
                <div className="space-y-4">
                  {contactInfo.map((item, i) => (
                    <div key={i} className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
                      <div className="w-12 h-12 rounded-full flex items-center justify-center text-white" style={{ backgroundColor: '#046ffb' }}>
                        <item.icon />
                      </div>
                      <div>
                        <div className="font-semibold" style={{ color: '#1e3a5f' }}>{item.label}</div>
                        {item.href ? <a href={item.href} className="text-gray-600 hover:text-blue-600">{item.value}</a> : <div className="text-gray-600">{item.value}</div>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="admin-card">
                <h2 className="text-2xl font-bold mb-6" style={{ color: '#1e3a5f' }}>Mesaj Gönderin</h2>
                <ContactForm />
              </div>
            </div>
            {getAyar('harita_embed') && (
              <div className="mt-12 rounded-xl overflow-hidden shadow-lg">
                <iframe src={getAyar('harita_embed')} width="100%" height="400" style={{ border: 0 }} allowFullScreen loading="lazy" />
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer ayarlar={ayarlar} hizmetler={hizmetler} />
      <StickyButtons whatsapp={getAyar('whatsapp')} telefon={getAyar('telefon')} />
    </>
  )
}
