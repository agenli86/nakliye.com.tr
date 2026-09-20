// ISR: sayfa bir kez üretilir, en fazla 1 saatte bir arka planda tazelenir.
export const revalidate = 3600

import { createClient } from '@/lib/supabase-public'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import ArticleCard from '@/components/ArticleCard'
import StickyButtons from '@/components/StickyButtons'
import Link from 'next/link'
import { FaChevronRight, FaRoute } from 'react-icons/fa'
import { rotaOlmayanMakaleler } from '@/lib/rotalar'

export async function generateMetadata() {
  const supabase = await createClient()
  const [{ data: seo }, { data: ayarlar }] = await Promise.all([
    supabase.from('seo_ayarlari').select('*').eq('sayfa_turu', 'blog').single(),
    supabase.from('ayarlar').select('*'),
  ])
  const getAyar = (key) => ayarlar?.find(a => a.anahtar === key)?.deger || ''
  const siteUrl = getAyar('site_url') || 'https://adananakliye.com.tr'
  return {
    title: seo?.meta_title || 'Blog | Adana Nakliye',
    description: seo?.meta_description,
    openGraph: { title: seo?.meta_title, description: seo?.meta_description, url: `${siteUrl}/blog`, images: [{ url: seo?.og_image || getAyar('og_image') }] },
    alternates: { canonical: seo?.canonical_url || `${siteUrl}/blog` },
  }
}

async function getData() {
  const supabase = await createClient()
  const [{ data: ayarlar }, { data: menu }, { data: hizmetler }, { data: makaleler }] = await Promise.all([
    supabase.from('ayarlar').select('*'),
    supabase.from('menu').select('*').eq('aktif', true).order('sira'),
    supabase.from('hizmetler').select('id, baslik, slug').eq('aktif', true).order('sira'),
    supabase.from('makaleler').select('*').eq('aktif', true).order('created_at', { ascending: false }),
  ])
  return { ayarlar, menu, hizmetler, makaleler }
}

export default async function BlogPage() {
  const { ayarlar, menu, hizmetler, makaleler } = await getData()
  // Guzergah yazilari bloga degil /rota altindaki rota sayfalarina ait.
  const yazilar = rotaOlmayanMakaleler(makaleler)
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
              <span className="text-white">Blog</span>
            </nav>
            <h1 className="text-4xl md:text-5xl font-bold text-white">Blog</h1>
            <p className="text-xl text-white mt-4">Nakliyat hakkında faydalı bilgiler</p>
          </div>
        </section>

        <section className="section">
          <div className="container mx-auto px-4">
            <Link
              href="/rota"
              className="mb-10 flex flex-col gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-6 transition-all hover:border-[#0561e0] hover:shadow-md sm:flex-row sm:items-center sm:justify-between"
            >
              <span>
                <span className="flex items-center gap-2 text-lg font-bold text-[#1e3a5f]">
                  <FaRoute aria-hidden="true" className="text-[#0b5bd3]" /> Şehirler arası rota sayfaları
                </span>
                <span className="mt-1 block text-sm text-slate-600">
                  Adana&apos;dan 81 ile ve turistik ilçelere taşınma bilgileri, mesafe ve tahmini fiyatlar artık ayrı sayfalarda.
                </span>
              </span>
              <span className="shrink-0 font-semibold text-[#0b5bd3]">Tüm rotaları gör →</span>
            </Link>

            {yazilar.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {yazilar.map((makale) => <ArticleCard key={makale.id} makale={makale} />)}
              </div>
            ) : (
              <p className="text-center py-16 text-gray-500">Henüz makale eklenmemiş.</p>
            )}
          </div>
        </section>
      </main>
      <Footer ayarlar={ayarlar} hizmetler={hizmetler} />
      <StickyButtons whatsapp={getAyar('whatsapp')} telefon={getAyar('telefon')} />
    </>
  )
}
