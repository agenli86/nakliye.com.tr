export const revalidate = 3600
import { createClient } from '@/lib/supabase-public'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import StickyButtons from '@/components/StickyButtons'
import Link from 'next/link'
import { FaChevronRight, FaCheckCircle } from 'react-icons/fa'
import { resimYolu } from '@/lib/resim'

export async function generateMetadata() {
  const supabase = await createClient()
  const [{ data: seo }, { data: sayfa }, { data: ayarlar }] = await Promise.all([
    supabase.from('seo_ayarlari').select('*').eq('sayfa_turu', 'hakkimizda').single(),
    supabase.from('sayfalar').select('*').eq('slug', 'hakkimizda').single(),
    supabase.from('ayarlar').select('*'),
  ])
  const getAyar = (key) => ayarlar?.find(a => a.anahtar === key)?.deger || ''
  const siteUrl = getAyar('site_url') || 'https://adananakliye.com.tr'

  return {
    title: seo?.meta_title || sayfa?.meta_title || 'Hakkımızda | Adana Nakliye',
    description: seo?.meta_description || sayfa?.meta_description,
    keywords: seo?.meta_keywords || sayfa?.meta_keywords,
    openGraph: {
      title: seo?.meta_title || sayfa?.meta_title,
      description: seo?.meta_description || sayfa?.meta_description,
      url: `${siteUrl}/hakkimizda`,
      images: [{ url: seo?.og_image || sayfa?.og_image || getAyar('og_image'), width: 1200, height: 630 }],
    },
    alternates: { canonical: seo?.canonical_url || `${siteUrl}/hakkimizda` },
  }
}

async function getData() {
  const supabase = await createClient()
  const [{ data: ayarlar }, { data: menu }, { data: hizmetler }, { data: sayfa }] = await Promise.all([
    supabase.from('ayarlar').select('*'),
    supabase.from('menu').select('*').eq('aktif', true).order('sira'),
    supabase.from('hizmetler').select('id, baslik, slug').eq('aktif', true).order('sira'),
    supabase.from('sayfalar').select('*').eq('slug', 'hakkimizda').single(),
  ])
  return { ayarlar, menu, hizmetler, sayfa }
}

export default async function HakkimizdaPage() {
  const { ayarlar, menu, hizmetler, sayfa } = await getData()
  const getAyar = (key) => ayarlar?.find(a => a.anahtar === key)?.deger || ''

  return (
    <>
      <Header ayarlar={ayarlar} menu={menu} />
      <main>
        <section className="py-20" style={{ background: 'linear-gradient(135deg, #0b63e5 0%, #0450bb 100%)' }}>
          <div className="container mx-auto px-4">
            <nav className="flex items-center gap-2 text-white text-sm mb-4">
              <Link href="/" className="inline-flex min-h-[24px] items-center hover:text-white">Anasayfa</Link>
              <FaChevronRight className="text-xs" />
              <span className="text-white">Hakkımızda</span>
            </nav>
            <h1 className="text-4xl md:text-5xl font-bold text-white">Hakkımızda</h1>
          </div>
        </section>

        <section className="section">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                {sayfa?.icerik ? (
                  <div className="prose prose-lg max-w-none" dangerouslySetInnerHTML={{ __html: sayfa.icerik }} />
                ) : (
                  <>
                    <h2 className="text-3xl font-bold mb-6" style={{ color: '#1e3a5f' }}>Adana Nakliye - Güvenilir Evden Eve Nakliyat</h2>
                    <p className="text-gray-600 mb-4">17 yılı aşkın tecrübemizle Adana ve çevresinde evden eve nakliyat hizmeti sunuyoruz.</p>
                  </>
                )}
                <div className="grid grid-cols-2 gap-4 mt-8">
                  {[{n: getAyar('tecrube_yili') || '17', l: 'Yıllık Tecrübe'}, {n: getAyar('mutlu_musteri') || '7800', l: 'Mutlu Müşteri'}].map((s, i) => (
                    <div key={i} className="text-center p-6 rounded-xl" style={{ backgroundColor: '#f0f9ff' }}>
                      <div className="text-4xl font-bold" style={{ color: '#0561e0' }}>{s.n}+</div>
                      <div className="text-gray-600 mt-2">{s.l}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <img src={resimYolu(sayfa?.resim || '/resimler/201-hakkimizda.webp')} alt="Hakkımızda" loading="lazy" decoding="async" className="w-full h-auto rounded-2xl shadow-2xl" />
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer ayarlar={ayarlar} hizmetler={hizmetler} />
      <StickyButtons whatsapp={getAyar('whatsapp')} telefon={getAyar('telefon')} />
    </>
  )
}
