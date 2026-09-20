// ISR: sayfa bir kez üretilir, en fazla 1 saatte bir arka planda tazelenir.
export const revalidate = 3600

import { createClient } from '@/lib/supabase-public'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import ServiceCard from '@/components/ServiceCard'
import StickyButtons from '@/components/StickyButtons'
import Link from 'next/link'
import { FaChevronRight } from 'react-icons/fa'
import { HIZMET_SAYFALARI, hizmetSayfaUrl } from '@/lib/hizmet-sayfalari'

export async function generateMetadata() {
  const supabase = await createClient()
  const [{ data: seo }, { data: ayarlar }] = await Promise.all([
    supabase.from('seo_ayarlari').select('*').eq('sayfa_turu', 'hizmetler').single(),
    supabase.from('ayarlar').select('*'),
  ])
  const getAyar = (key) => ayarlar?.find(a => a.anahtar === key)?.deger || ''
  const siteUrl = getAyar('site_url') || 'https://adananakliye.com.tr'
  return {
    title: seo?.meta_title || 'Hizmetlerimiz | Adana Nakliye',
    description: seo?.meta_description,
    openGraph: { title: seo?.meta_title, description: seo?.meta_description, url: `${siteUrl}/hizmetler`, images: [{ url: seo?.og_image || getAyar('og_image') }] },
    alternates: { canonical: seo?.canonical_url || `${siteUrl}/hizmetler` },
  }
}

async function getData() {
  const supabase = await createClient()
  const [{ data: ayarlar }, { data: menu }, { data: hizmetler }] = await Promise.all([
    supabase.from('ayarlar').select('*'),
    supabase.from('menu').select('*').eq('aktif', true).order('sira'),
    supabase.from('hizmetler').select('*').eq('aktif', true).order('sira'),
  ])
  return { ayarlar, menu, hizmetler }
}

export default async function HizmetlerPage() {
  const { ayarlar, menu, hizmetler } = await getData()
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
              <span className="text-white">Hizmetlerimiz</span>
            </nav>
            <h1 className="text-4xl md:text-5xl font-bold text-white">Hizmetlerimiz</h1>
            <p className="text-xl text-white mt-4">Profesyonel nakliyat çözümleri</p>
          </div>
        </section>

        <section className="section">
          <div className="container mx-auto px-4">
            {/* Kartların başlığı H3. Araya H2 konmazsa H1'den H3'e
                atlanıyor ve başlık sırası bozuluyor. */}
            <h2 className="section-title">Adana Nakliye Hizmetlerimiz</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {hizmetler?.map((hizmet) => <ServiceCard key={hizmet.id} hizmet={hizmet} />)}
            </div>
          </div>
        </section>

        {/* Kod tarafında duran dar konu sayfaları. Panelden girilen
            hizmetlerden ayrı tutuluyor; tek girişleri burası olduğu için
            listelenmezlerse yetim sayfa olarak kalıyorlar. */}
        <section className="section bg-slate-50">
          <div className="container mx-auto px-4">
            <h2 className="section-title">Adana İçi Özel Hizmetler</h2>
            <p className="mb-8 max-w-3xl text-slate-600">
              Evden eve nakliye dışında sık istenen işler: pikap taşıma, hamaliye, mobilya montajı,
              tek beyaz eşya taşıma ve daire tipine göre ev taşıma ücretleri.
            </p>
            <ul className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {HIZMET_SAYFALARI.map((sayfa) => (
                <li key={sayfa.slug}>
                  <Link
                    href={hizmetSayfaUrl(sayfa.slug)}
                    className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-lg"
                  >
                    <h3 className="mb-2 text-lg font-bold text-[#1e3a5f]">{sayfa.baslik}</h3>
                    <p className="text-sm leading-relaxed text-slate-600">{sayfa.ozet}</p>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </main>
      <Footer ayarlar={ayarlar} hizmetler={hizmetler} />
      <StickyButtons whatsapp={getAyar('whatsapp')} telefon={getAyar('telefon')} />
    </>
  )
}
