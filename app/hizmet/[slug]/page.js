import { createClient } from '@/lib/supabase-server'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import StickyButtons from '@/components/StickyButtons'
import Link from 'next/link'
import Image from 'next/image' // Image bileşenini ekledik
import { FaChevronRight, FaPhone, FaWhatsapp } from 'react-icons/fa'
import { notFound } from 'next/navigation'

export async function generateMetadata({ params }) {
  const { slug } = await params
  const supabase = await createClient()
  const [{ data: hizmet }, { data: ayarlar }] = await Promise.all([
    supabase.from('hizmetler').select('*').eq('slug', slug).single(),
    supabase.from('ayarlar').select('*'),
  ])
  if (!hizmet) return { title: 'Sayfa Bulunamadı' }
  const getAyar = (key) => ayarlar?.find(a => a.anahtar === key)?.deger || ''
  const siteUrl = getAyar('site_url') || 'https://adananakliye.com.tr'
  return {
    title: hizmet.meta_title || `${hizmet.baslik} | Adana Nakliye`,
    description: hizmet.meta_description || hizmet.kisa_aciklama,
    keywords: hizmet.meta_keywords,
    openGraph: {
      title: hizmet.meta_title || hizmet.baslik,
      description: hizmet.meta_description || hizmet.kisa_aciklama,
      url: `${siteUrl}/hizmet/${slug}`,
      images: [{ url: hizmet.og_image || hizmet.resim || getAyar('og_image'), width: 1200, height: 630 }],
    },
    alternates: { canonical: hizmet.canonical_url || `${siteUrl}/hizmet/${slug}` },
  }
}

async function getData(slug) {
  const supabase = await createClient()
  const [{ data: ayarlar }, { data: menu }, { data: hizmetler }, { data: hizmet }] = await Promise.all([
    supabase.from('ayarlar').select('*'),
    supabase.from('menu').select('*').eq('aktif', true).order('sira'),
    supabase.from('hizmetler').select('id, baslik, slug').eq('aktif', true).order('sira'),
    supabase.from('hizmetler').select('*').eq('slug', slug).single(),
  ])
  return { ayarlar, menu, hizmetler, hizmet }
}

export default async function HizmetDetayPage({ params }) {
  const { slug } = await params
  const { ayarlar, menu, hizmetler, hizmet } = await getData(slug)
  if (!hizmet) notFound()
  const getAyar = (key) => ayarlar?.find(a => a.anahtar === key)?.deger || ''
  const telefon = getAyar('telefon')
  const whatsapp = getAyar('whatsapp')

  return (
    <>
      <Header ayarlar={ayarlar} menu={menu} />
      <main id="main-content"> {/* Erişilebilirlik için main id ekledik */}
        {/* Üst Banner Alanı - LCP Optimizasyonu yapıldı */}
        <section className="py-20 relative overflow-hidden bg-slate-900">
          {hizmet.resim && (
            <Image 
              src={hizmet.resim} 
              alt={`${hizmet.baslik} Arka Plan`}
              fill
              priority // Sayfa açılır açılmaz bu resmi yükle dedik (LCP için)
              className="object-cover opacity-30" 
            />
          )}
          <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(4,111,251,0.85), rgba(30,58,95,0.9))' }} />
          <div className="container mx-auto px-4 relative z-10">
            <nav className="flex items-center gap-2 text-white/90 text-sm mb-4">
              <Link href="/" className="hover:text-white transition-colors">Anasayfa</Link>
              <FaChevronRight className="text-[10px]" />
              <Link href="/hizmetler" className="hover:text-white transition-colors">Hizmetler</Link>
              <FaChevronRight className="text-[10px]" />
              <span className="text-white font-medium">{hizmet.baslik}</span>
            </nav>
            <h1 className="text-3xl md:text-5xl font-bold text-white tracking-tight">{hizmet.baslik}</h1>
          </div>
        </section>

        <section className="py-12 md:py-16">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-3 gap-10">
              <div className="lg:col-span-2">
                {/* Ana Resim - Width/Height sorununu Next.js Image ile çözdük */}
                {hizmet.resim && (
                  <div className="relative h-[300px] md:h-[450px] w-full mb-8">
                    <Image 
                      src={hizmet.resim} 
                      alt={hizmet.baslik} 
                      fill
                      sizes="(max-width: 768px) 100vw, 800px"
                      className="object-cover rounded-2xl shadow-xl"
                    />
                  </div>
                )}
                {/* İçerik Alanı - Kontrast ve Okunabilirlik */}
                <div 
                  className="prose prose-slate prose-lg max-w-none text-slate-700 prose-headings:text-[#1e3a5f]" 
                  dangerouslySetInnerHTML={{ __html: hizmet.icerik }} 
                />
              </div>

              {/* Sağ Taraf - Yan Menü */}
              <aside className="space-y-6">
                <div className="bg-white p-8 rounded-2xl shadow-lg border border-slate-100 sticky top-28">
                  <h3 className="text-xl font-bold mb-6" style={{ color: '#1e3a5f' }}>Ücretsiz Teklif Al</h3>
                  <div className="flex flex-col gap-4">
                    <a href={`tel:${telefon}`} className="flex items-center justify-center gap-3 bg-[#046ffb] text-white py-4 rounded-xl font-bold hover:bg-[#1e3a5f] transition-all shadow-md">
                      <FaPhone /> {telefon}
                    </a>
                    <a href={`https://wa.me/${whatsapp}`} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-3 bg-[#25d366] text-white py-4 rounded-xl font-bold hover:opacity-90 transition-all shadow-md">
                      <FaWhatsapp size={22} /> WhatsApp
                    </a>
                  </div>
                  
                  <div className="mt-10">
                    <h4 className="font-bold text-[#1e3a5f] mb-4 border-b pb-2">Hizmet Bölgelerimiz</h4>
                    <ul className="grid grid-cols-1 gap-3">
                      {hizmetler?.filter(h => h.slug !== slug).slice(0, 6).map(h => (
                        <li key={h.id}>
                          <Link href={`/hizmet/${h.slug}`} className="group flex items-center gap-2 text-slate-600 hover:text-[#046ffb] transition-colors text-sm font-medium">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-300 group-hover:bg-[#046ffb]" />
                            {h.baslik}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </aside>
            </div>
          </div>
        </section>
      </main>
      <Footer ayarlar={ayarlar} hizmetler={hizmetler} />
      <StickyButtons whatsapp={whatsapp} telefon={telefon} />
    </>
  )
}
