import { createClient } from '@/lib/supabase-server'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import ArticleCard from '@/components/ArticleCard'
import StickyButtons from '@/components/StickyButtons'
import Link from 'next/link'
import { FaChevronRight } from 'react-icons/fa'

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
  const getAyar = (key) => ayarlar?.find(a => a.anahtar === key)?.deger || ''

  return (
    <>
      <Header ayarlar={ayarlar} menu={menu} />
      <main>
        <section className="py-20" style={{ background: 'linear-gradient(135deg, #046ffb 0%, #0559c9 100%)' }}>
          <div className="container mx-auto px-4">
            <nav className="flex items-center gap-2 text-white/80 text-sm mb-4">
              <Link href="/" className="hover:text-white">Anasayfa</Link>
              <FaChevronRight className="text-xs" />
              <span className="text-white">Blog</span>
            </nav>
            <h1 className="text-4xl md:text-5xl font-bold text-white">Blog</h1>
            <p className="text-xl text-white/90 mt-4">Nakliyat hakkında faydalı bilgiler</p>
          </div>
        </section>

        <section className="section">
          <div className="container mx-auto px-4">
            {makaleler && makaleler.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {makaleler.map((makale) => <ArticleCard key={makale.id} makale={makale} />)}
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
