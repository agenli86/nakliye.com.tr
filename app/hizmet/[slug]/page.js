import { createClient } from '@/lib/supabase-server'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import StickyButtons from '@/components/StickyButtons'
import Link from 'next/link'
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
      <main>
        <section className="py-20 bg-cover bg-center relative" style={{ backgroundImage: `url(${hizmet.resim})` }}>
          <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(4,111,251,0.9), rgba(30,58,95,0.9))' }} />
          <div className="container mx-auto px-4 relative z-10">
            <nav className="flex items-center gap-2 text-white/80 text-sm mb-4">
              <Link href="/" className="hover:text-white">Anasayfa</Link>
              <FaChevronRight className="text-xs" />
              <Link href="/hizmetler" className="hover:text-white">Hizmetler</Link>
              <FaChevronRight className="text-xs" />
              <span className="text-white">{hizmet.baslik}</span>
            </nav>
            <h1 className="text-4xl md:text-5xl font-bold text-white">{hizmet.baslik}</h1>
          </div>
        </section>

        <section className="section">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                {hizmet.resim && <img src={hizmet.resim} alt={hizmet.baslik} className="w-full rounded-2xl shadow-lg mb-8" />}
                <div className="prose prose-lg max-w-none" dangerouslySetInnerHTML={{ __html: hizmet.icerik }} />
              </div>
              <div className="space-y-6">
                <div className="admin-card sticky top-32">
                  <h3 className="text-xl font-bold mb-4" style={{ color: '#1e3a5f' }}>Hemen Arayın</h3>
                  <a href={`tel:${telefon}`} className="btn-primary w-full mb-3"><FaPhone /> {telefon}</a>
                  <a href={`https://wa.me/${whatsapp}`} target="_blank" className="btn-whatsapp w-full"><FaWhatsapp /> WhatsApp</a>
                  <hr className="my-6" />
                  <h4 className="font-semibold mb-3">Diğer Hizmetler</h4>
                  <ul className="space-y-2">
                    {hizmetler?.filter(h => h.slug !== slug).slice(0, 5).map(h => (
                      <li key={h.id}><Link href={`/hizmet/${h.slug}`} className="text-blue-600 hover:underline text-sm">{h.baslik}</Link></li>
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
