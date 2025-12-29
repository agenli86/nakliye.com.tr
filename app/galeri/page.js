import { createClient } from '@/lib/supabase-server'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import StickyButtons from '@/components/StickyButtons'
import Link from 'next/link'
import { FaChevronRight } from 'react-icons/fa'

export async function generateMetadata() {
  const supabase = await createClient()
  const [{ data: seo }, { data: ayarlar }] = await Promise.all([
    supabase.from('seo_ayarlari').select('*').eq('sayfa_turu', 'galeri').single(),
    supabase.from('ayarlar').select('*'),
  ])
  const getAyar = (key) => ayarlar?.find(a => a.anahtar === key)?.deger || ''
  const siteUrl = getAyar('site_url') || 'https://adananakliye.com.tr'
  return {
    title: seo?.meta_title || 'Galeri | Adana Nakliye',
    description: seo?.meta_description,
    openGraph: { title: seo?.meta_title, description: seo?.meta_description, url: `${siteUrl}/galeri`, images: [{ url: seo?.og_image || getAyar('og_image') }] },
    alternates: { canonical: seo?.canonical_url || `${siteUrl}/galeri` },
  }
}

async function getData() {
  const supabase = await createClient()
  const [{ data: ayarlar }, { data: menu }, { data: hizmetler }, { data: galeri }] = await Promise.all([
    supabase.from('ayarlar').select('*'),
    supabase.from('menu').select('*').eq('aktif', true).order('sira'),
    supabase.from('hizmetler').select('id, baslik, slug').eq('aktif', true).order('sira'),
    supabase.from('galeri').select('*').eq('aktif', true).order('sira'),
  ])
  return { ayarlar, menu, hizmetler, galeri }
}

export default async function GaleriPage() {
  const { ayarlar, menu, hizmetler, galeri } = await getData()
  const getAyar = (key) => ayarlar?.find(a => a.anahtar === key)?.deger || ''

  return (
    <>
      <Header ayarlar={ayarlar} menu={menu} />
      <main className="pt-[140px] md:pt-[160px]">
        <section className="py-20" style={{ background: 'linear-gradient(135deg, #046ffb 0%, #0559c9 100%)' }}>
          <div className="container mx-auto px-4">
            <nav className="flex items-center gap-2 text-white/80 text-sm mb-4">
              <Link href="/" className="hover:text-white">Anasayfa</Link>
              <FaChevronRight className="text-xs" />
              <span className="text-white">Galeri</span>
            </nav>
            <h1 className="text-4xl md:text-5xl font-bold text-white">Galeri</h1>
            <p className="text-xl text-white/90 mt-4">Çalışmalarımızdan kareler</p>
          </div>
        </section>

        <section className="section">
          <div className="container mx-auto px-4">
            {galeri && galeri.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {galeri.map((item) => (
                  <div key={item.id} className="group relative aspect-square rounded-xl overflow-hidden shadow-lg">
                    <img src={item.resim} alt={item.baslik || 'Galeri'} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                        {item.baslik && <h3 className="font-semibold">{item.baslik}</h3>}
                        {item.kategori && <span className="text-sm text-white/80">{item.kategori}</span>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center py-16 text-gray-500">Henüz galeri resmi eklenmemiş.</p>
            )}
          </div>
        </section>
      </main>
      <Footer ayarlar={ayarlar} hizmetler={hizmetler} />
      <StickyButtons whatsapp={getAyar('whatsapp')} telefon={getAyar('telefon')} />
    </>
  )
}
