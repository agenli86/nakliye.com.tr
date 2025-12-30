import { createClient } from '@/lib/supabase-server'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import StickyButtons from '@/components/StickyButtons'
import TeklifForm from '@/components/TeklifForm'
import Link from 'next/link'
import { FaChevronRight, FaPhone, FaWhatsapp, FaCheckCircle } from 'react-icons/fa'

export async function generateMetadata() {
  const supabase = await createClient()
  const { data: ayarlar } = await supabase.from('ayarlar').select('*')
  const getAyar = (key) => ayarlar?.find(a => a.anahtar === key)?.deger || ''
  const siteUrl = getAyar('site_url') || 'https://adananakliye.com.tr'
  
  return {
    title: 'Ücretsiz Teklif Al | Adana Nakliye',
    description: 'Adana evden eve nakliyat için ücretsiz teklif alın. Hemen formu doldurun, size en uygun fiyatı sunalım.',
    openGraph: {
      title: 'Ücretsiz Teklif Al | Adana Nakliye',
      description: 'Adana evden eve nakliyat için ücretsiz teklif alın.',
      url: `${siteUrl}/teklif-al`,
      images: [{ url: getAyar('og_image') }],
    },
    alternates: { canonical: `${siteUrl}/teklif-al` },
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

export default async function TeklifAlPage() {
  const { ayarlar, menu, hizmetler } = await getData()
  const getAyar = (key) => ayarlar?.find(a => a.anahtar === key)?.deger || ''
  const telefon = getAyar('telefon')
  const whatsapp = getAyar('whatsapp')

  const avantajlar = [
    'Ücretsiz keşif hizmeti',
    'Rekabetçi fiyat garantisi',
    'Sigortalı taşımacılık',
    'Profesyonel ekip',
    '7/24 müşteri desteği',
    'Hızlı geri dönüş'
  ]

  return (
    <>
      <Header ayarlar={ayarlar} menu={menu} />
      <main>
        {/* Hero */}
        <section className="py-20 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #046ffb 0%, #1e3a5f 100%)' }}>
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-10 left-10 w-40 h-40 bg-white rounded-full" />
            <div className="absolute bottom-10 right-10 w-60 h-60 bg-white rounded-full" />
          </div>
          <div className="container mx-auto px-4 relative z-10">
            <nav className="flex items-center gap-2 text-white/80 text-sm mb-4">
              <Link href="/" className="hover:text-white">Anasayfa</Link>
              <FaChevronRight className="text-xs" />
              <span className="text-white">Teklif Al</span>
            </nav>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Ücretsiz Teklif Al</h1>
            <p className="text-xl text-white/90 max-w-2xl">
              Taşınma planınızı bizimle paylaşın, size en uygun fiyatı sunalım.
            </p>
          </div>
        </section>

        {/* Form Section */}
        <section className="section">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-3 gap-12">
              {/* Form */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-2xl shadow-xl p-8">
                  <h2 className="text-2xl font-bold mb-6" style={{ color: '#1e3a5f' }}>
                    Teklif Formu
                  </h2>
                  <TeklifForm hizmetler={hizmetler} />
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Quick Contact */}
                <div className="rounded-2xl p-6 text-white" style={{ backgroundColor: '#1e3a5f' }}>
                  <h3 className="text-xl font-bold mb-4">Hızlı İletişim</h3>
                  <p className="text-white/80 mb-6">
                    Hemen aramak isterseniz bize ulaşabilirsiniz.
                  </p>
                  <a 
                    href={`tel:${telefon}`} 
                    className="flex items-center justify-center gap-2 w-full py-4 rounded-xl font-semibold text-lg mb-3 transition-all hover:scale-105"
                    style={{ backgroundColor: '#d4ed31', color: '#1e3a5f' }}
                  >
                    <FaPhone /> {telefon}
                  </a>
                  <a 
                    href={`https://wa.me/${whatsapp}`}
                    target="_blank"
                    className="flex items-center justify-center gap-2 w-full py-4 rounded-xl font-semibold bg-green-500 hover:bg-green-600 transition-all"
                  >
                    <FaWhatsapp /> WhatsApp ile Yazın
                  </a>
                </div>

                {/* Avantajlar */}
                <div className="bg-gray-50 rounded-2xl p-6">
                  <h3 className="text-xl font-bold mb-4" style={{ color: '#1e3a5f' }}>
                    Neden Biz?
                  </h3>
                  <ul className="space-y-3">
                    {avantajlar.map((item, i) => (
                      <li key={i} className="flex items-center gap-3">
                        <FaCheckCircle style={{ color: '#d4ed31' }} />
                        <span className="text-gray-700">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer ayarlar={ayarlar} hizmetler={hizmetler} />
      <StickyButtons whatsapp={whatsapp} telefon={telefon} />
    </>
  )
}
