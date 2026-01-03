import { createClient } from '@/lib/supabase-server'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import HeroSlider from '@/components/HeroSlider'
import AnnouncementBar from '@/components/AnnouncementBar'
import ServiceCard from '@/components/ServiceCard'
import CounterSection from '@/components/CounterSection'
import PriceTable from '@/components/PriceTable'
import ArticleCard from '@/components/ArticleCard'
import StickyButtons from '@/components/StickyButtons'
import HomeTabs from '@/components/HomeTabs'
import HomeGallery from '@/components/HomeGallery'
import FeatureBoxes from '@/components/FeatureBoxes'
import JsonLd from '@/components/JsonLd'
import Link from 'next/link'
import Image from 'next/image'
import { FaPhone, FaCheckCircle } from 'react-icons/fa'
import dynamic from 'next/dynamic'

// Dynamic import for ChatBotEmbed - reduce initial bundle size
const ChatBotEmbed = dynamic(() => import('@/components/ChatBotEmbed'), {
  ssr: false,
  loading: () => null
})

export async function generateMetadata() {
  const supabase = await createClient()
  const [{ data: seo }, { data: ayarlar }] = await Promise.all([
    supabase.from('seo_ayarlari').select('*').eq('sayfa_turu', 'anasayfa').single(),
    supabase.from('ayarlar').select('*'),
  ])

  const getAyar = (key) => ayarlar?.find(a => a.anahtar === key)?.deger || ''
  const siteUrl = getAyar('site_url') || 'https://adananakliye.com.tr'

  return {
    title: seo?.meta_title || getAyar('meta_title') || 'Adana Nakliye',
    description: seo?.meta_description || getAyar('meta_description'),
    keywords: seo?.meta_keywords || getAyar('meta_keywords'),
    openGraph: {
      title: seo?.meta_title || getAyar('meta_title'),
      description: seo?.meta_description || getAyar('meta_description'),
      url: siteUrl,
      images: [{ 
        url: seo?.og_image || getAyar('og_image') || '/resimler/adanaevdenevenakliyat.jpg', 
        width: 1200, 
        height: 630,
        alt: 'Adana Evden Eve Nakliyat'
      }],
      type: 'website',
      siteName: 'Adana Nakliye',
      locale: 'tr_TR',
    },
    twitter: {
      card: 'summary_large_image',
      title: seo?.meta_title || getAyar('meta_title'),
      description: seo?.meta_description || getAyar('meta_description'),
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      }
    },
    alternates: { canonical: seo?.canonical_url || siteUrl },
  }
}

async function getData() {
  const supabase = await createClient()
  const [
    { data: ayarlar }, { data: menu }, { data: sliders }, { data: hizmetler },
    { data: makaleler }, { data: fiyatlar }, { data: bolumler }, { data: tablar },
    { data: duyurular }, { data: galeri }, { data: kutucuklar },
  ] = await Promise.all([
    supabase.from('ayarlar').select('*'),
    supabase.from('menu').select('*').eq('aktif', true).order('sira'),
    supabase.from('sliders').select('*').eq('aktif', true).order('sira'),
    supabase.from('hizmetler').select('*').eq('aktif', true).eq('anasayfada_goster', true).order('sira'),
    supabase.from('makaleler').select('*').eq('aktif', true).order('created_at', { ascending: false }).limit(3),
    supabase.from('fiyatlar').select('*').eq('aktif', true).order('sira'),
    supabase.from('anasayfa_bolumleri').select('*').eq('aktif', true).order('sira'),
    supabase.from('anasayfa_tablari').select('*').eq('aktif', true).order('sira'),
    supabase.from('duyurular').select('*').eq('aktif', true).order('sira'),
    supabase.from('galeri').select('*').eq('aktif', true).order('sira').limit(9),
    supabase.from('ozellik_kutucuklari').select('*').eq('aktif', true).order('sira').limit(3),
  ])
  return { ayarlar, menu, sliders, hizmetler, makaleler, fiyatlar, bolumler, tablar, duyurular, galeri, kutucuklar }
}

export default async function Home() {
  const { ayarlar, menu, sliders, hizmetler, makaleler, fiyatlar, bolumler, tablar, duyurular, galeri, kutucuklar } = await getData()
  const getAyar = (key) => ayarlar?.find(a => a.anahtar === key)?.deger || ''
  const getBolum = (ad) => bolumler?.find(b => b.bolum_adi === ad) || {}
  
  const whatsapp = getAyar('whatsapp') || '905057805551'
  const telefon = getAyar('telefon') || '05057805551'
  const sliderAlti = getBolum('slider_alti')
  const hizmetlerBaslik = getBolum('hizmetler_baslik')
  const ctaBolum = getBolum('cta')
  const blogBaslik = getBolum('blog_baslik')

  const jsonLdOrganization = getAyar('json_ld_organization')
  const jsonLdLocalBusiness = getAyar('json_ld_local_business')
  const jsonLdWebsite = getAyar('json_ld_website')

  let orgData = null, businessData = null, websiteData = null
  try { if (jsonLdOrganization) orgData = JSON.parse(jsonLdOrganization) } catch {}
  try { if (jsonLdLocalBusiness) businessData = JSON.parse(jsonLdLocalBusiness) } catch {}
  try { if (jsonLdWebsite) websiteData = JSON.parse(jsonLdWebsite) } catch {}

  return (
    <>
      {orgData && <JsonLd data={orgData} />}
      {businessData && <JsonLd data={businessData} />}
      {websiteData && <JsonLd data={websiteData} />}

      <Header ayarlar={ayarlar} menu={menu} />
      
      <main className="home-page">
        {/* 🚀 LCP Element - SADECE slider'a priority */}
        <HeroSlider sliders={sliders} priority={true} />
        
        <AnnouncementBar duyurular={duyurular} />
        <ChatBotEmbed />
        <FeatureBoxes kutucuklar={kutucuklar} />

        {/* Slider Altı Bölüm */}
        <section className="section bg-white">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <span className="text-blue-600 font-semibold text-lg mb-2 block">
                  {sliderAlti.alt_baslik || 'Sitemize Hoşgeldiniz'}
                </span>
                <h2 className="text-3xl md:text-4xl font-bold mb-6" style={{ color: '#1e3a5f' }}>
                  {sliderAlti.baslik || 'Adana Evden Eve Nakliyat'}
                </h2>
                {sliderAlti.icerik ? (
                  <div 
                    className="text-gray-600 mb-6 leading-relaxed prose" 
                    dangerouslySetInnerHTML={{ __html: sliderAlti.icerik }} 
                  />
                ) : (
                  <p className="text-gray-600 mb-6">
                    Adana Nakliye, müşteri memnuniyetini ön planda tutan evden eve nakliyat hizmetlerinde lider firmalardan biridir.
                  </p>
                )}
                <ul className="space-y-3 mb-8">
                  {['Profesyonel ekip', 'Sigortalı taşımacılık', 'Uygun fiyat', '7/24 destek'].map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-gray-700">
                      <FaCheckCircle style={{ color: '#d4ed31' }} />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <Link 
                  href={sliderAlti.buton_link || '/hakkimizda'} 
                  className="btn-primary"
                >
                  {sliderAlti.buton_metin || 'Hakkımızda'}
                </Link>
              </div>
              
              <div className="relative">
                {/* ✅ Priority KALDIRILDI - Slider LCP'dir, bu değil */}
                <Image 
                  src={sliderAlti.resim || '/resimler/294-adana-nakliyat.webp'} 
                  alt="Adana Nakliyat Hizmetleri" 
                  width={600}
                  height={450}
                  className="w-full rounded-2xl shadow-2xl"
                  loading="lazy" // ✅ Lazy loading eklendi
                  quality={85}
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 600px"
                />
                <div 
                  className="absolute -bottom-6 -left-6 w-32 h-32 rounded-2xl -z-10" 
                  style={{ backgroundColor: '#d4ed31' }} 
                  aria-hidden="true"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Tablar */}
        {tablar && tablar.length > 0 && <HomeTabs tablar={tablar} />}

        {/* Hizmetler */}
        <section className="section bg-gray-50">
          <div className="container mx-auto px-4">
            <h2 className="section-title">
              {hizmetlerBaslik.baslik || 'Öne Çıkan Hizmetlerimiz'}
            </h2>
            <p className="section-subtitle">
              {hizmetlerBaslik.alt_baslik || 'Profesyonel nakliyat hizmetleri'}
            </p>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {hizmetler?.map((h) => (
                <ServiceCard key={h.id} hizmet={h} />
              ))}
            </div>
            <div className="text-center mt-12">
              <Link href="/hizmetler" className="btn-outline">
                Tüm Hizmetlerimiz
              </Link>
            </div>
          </div>
        </section>

        {/* Fiyat Tablosu */}
        <PriceTable fiyatlar={fiyatlar} bolum={getBolum('fiyatlar_baslik')} />
        
        {/* Sayaçlar */}
        <CounterSection ayarlar={ayarlar} />

        {/* CTA Bölümü */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div 
              className="rounded-3xl p-8 md:p-12 text-center" 
              style={{ backgroundColor: '#1e3a5f' }}
            >
              <h2 
                className="text-3xl md:text-4xl font-bold mb-4" 
                style={{ color: '#d4ed31' }}
              >
                {ctaBolum.baslik || 'Yardıma mı İhtiyacınız Var?'}
              </h2>
              <p className="text-xl text-white mb-8 max-w-2xl mx-auto">
                {ctaBolum.alt_baslik || 'Uzman ekibimiz yanınızda.'}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a 
                  href={`tel:${telefon}`} 
                  className="btn-primary flex items-center justify-center gap-2"
                  aria-label="Telefon ile hemen arayın"
                >
                  <FaPhone />
                  Hemen Arayın
                </a>
                <Link 
                  href="/teklif-al" 
                  className="bg-white font-semibold py-3 px-6 rounded-lg hover:bg-gray-100 transition-all" 
                  style={{ color: '#1e3a5f' }}
                >
                  Ücretsiz Teklif Al
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Blog Makaleleri */}
        {makaleler?.length > 0 && (
          <section className="section bg-gray-50">
            <div className="container mx-auto px-4">
              <h2 className="section-title">
                {blogBaslik.baslik || 'Son Makaleler'}
              </h2>
              <p className="section-subtitle">
                {blogBaslik.alt_baslik || 'Faydalı bilgiler'}
              </p>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {makaleler.map((m) => (
                  <ArticleCard key={m.id} makale={m} />
                ))}
              </div>
              <div className="text-center mt-12">
                <Link href="/blog" className="btn-outline">
                  Tüm Makaleler
                </Link>
              </div>
            </div>
          </section>
        )}

        {/* Galeri */}
        <HomeGallery galeri={galeri} />
      </main>
      
      <Footer ayarlar={ayarlar} hizmetler={hizmetler} />
      <StickyButtons whatsapp={whatsapp} telefon={telefon} />
    </>
  )
}
