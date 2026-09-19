// ISR: sayfa bir kez üretilir, en fazla 1 saatte bir arka planda tazelenir.
export const revalidate = 3600

import { createClient, createPublicClient } from '@/lib/supabase-public'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import StickyButtons from '@/components/StickyButtons'
import Link from 'next/link'
import { FaChevronRight, FaCalendar, FaUser, FaEye } from 'react-icons/fa'
import { notFound, permanentRedirect } from 'next/navigation'
import { makaleRotaHedefi, rotaUrl } from '@/lib/rotalar'

// Hizmet/makale sayfalarını build sırasında önceden üret; listede olmayan
// yeni bir slug istendiğinde ilk istekte üretilip önbelleğe alınır.
export async function generateStaticParams() {
  try {
    const supabase = createPublicClient()
    const { data } = await supabase
      .from('makaleler')
      .select('slug')
      .eq('aktif', true)
    // Rota makaleleri artik /rota/... altinda yayinlaniyor; bunlari statik
    // uretmiyoruz, istek geldiginde 301 ile yeni adrese yonlendiriliyorlar.
    return (data || [])
      .filter(r => r.slug && !makaleRotaHedefi(r))
      .map(r => ({ slug: r.slug }))
  } catch {
    return []
  }
}

export async function generateMetadata({ params }) {
  const { slug } = await params
  const supabase = await createClient()
  const [{ data: makale }, { data: ayarlar }] = await Promise.all([
    supabase.from('makaleler').select('*').eq('slug', slug).single(),
    supabase.from('ayarlar').select('*'),
  ])
  if (!makale) return { title: 'Sayfa Bulunamadı' }
  if (makaleRotaHedefi(makale)) return { title: makale.baslik, robots: { index: false, follow: true } }
  const getAyar = (key) => ayarlar?.find(a => a.anahtar === key)?.deger || ''
  const siteUrl = getAyar('site_url') || 'https://adananakliye.com.tr'
  return {
    title: makale.meta_title || `${makale.baslik} | Adana Nakliye`,
    description: makale.meta_description || makale.ozet,
    keywords: makale.meta_keywords,
    openGraph: {
      title: makale.meta_title || makale.baslik,
      description: makale.meta_description || makale.ozet,
      url: `${siteUrl}/makale/${slug}`,
      images: [{ url: makale.og_image || makale.resim || getAyar('og_image'), width: 1200, height: 630 }],
      type: 'article',
    },
    alternates: { canonical: makale.canonical_url || `${siteUrl}/makale/${slug}` },
  }
}

async function getData(slug) {
  const supabase = await createClient()
  const [{ data: ayarlar }, { data: menu }, { data: hizmetler }, { data: makale }, { data: sonMakaleler }] = await Promise.all([
    supabase.from('ayarlar').select('*'),
    supabase.from('menu').select('*').eq('aktif', true).order('sira'),
    supabase.from('hizmetler').select('id, baslik, slug').eq('aktif', true).order('sira'),
    supabase.from('makaleler').select('*').eq('slug', slug).single(),
    supabase.from('makaleler').select('id, baslik, slug, resim').eq('aktif', true).order('created_at', { ascending: false }).limit(5),
  ])
  return { ayarlar, menu, hizmetler, makale, sonMakaleler }
}

export default async function MakaleDetayPage({ params }) {
  const { slug } = await params
  const hedef = makaleRotaHedefi({ slug })
  if (hedef) permanentRedirect(rotaUrl(hedef))

  const { ayarlar, menu, hizmetler, makale, sonMakaleler } = await getData(slug)
  if (!makale) notFound()
  // Kategorisi rota olan eski yazilar da yeni rota sayfasina tasindi.
  const kayitHedefi = makaleRotaHedefi(makale)
  if (kayitHedefi) permanentRedirect(rotaUrl(kayitHedefi))
  const getAyar = (key) => ayarlar?.find(a => a.anahtar === key)?.deger || ''

  const tarih = new Date(makale.created_at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })

  return (
    <>
      <Header ayarlar={ayarlar} menu={menu} />
      <main>
        <section className="py-20" style={{ background: 'linear-gradient(135deg, #0b63e5 0%, #0450bb 100%)' }}>
          <div className="container mx-auto px-4">
            <nav className="flex items-center gap-2 text-white text-sm mb-4">
              <Link href="/" className="hover:text-white">Anasayfa</Link>
              <FaChevronRight className="text-xs" />
              <Link href="/blog" className="hover:text-white">Blog</Link>
              <FaChevronRight className="text-xs" />
              <span className="text-white">{makale.baslik}</span>
            </nav>
            <h1 className="text-3xl md:text-4xl font-bold text-white">{makale.baslik}</h1>
            <div className="flex items-center gap-6 mt-4 text-white">
              <span className="flex items-center gap-2"><FaCalendar /> {tarih}</span>
              <span className="flex items-center gap-2"><FaUser /> {makale.yazar || 'Admin'}</span>
              {makale.goruntulenme > 0 && <span className="flex items-center gap-2"><FaEye /> {makale.goruntulenme}</span>}
            </div>
          </div>
        </section>

        <section className="section">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                {makale.resim && <img src={makale.resim} alt={makale.baslik} className="w-full rounded-2xl shadow-lg mb-8" />}
                <div className="prose prose-lg max-w-none" dangerouslySetInnerHTML={{ __html: makale.icerik }} />
              </div>
              <div className="space-y-6">
                <div className="admin-card">
                  <h3 className="text-lg font-bold mb-4" style={{ color: '#1e3a5f' }}>Son Makaleler</h3>
                  <ul className="space-y-3">
                    {sonMakaleler?.filter(m => m.slug !== slug).slice(0, 4).map(m => (
                      <li key={m.id} className="flex gap-3">
                        {m.resim && <img src={m.resim} alt="" className="w-16 h-16 object-cover rounded" />}
                        <Link href={`/makale/${m.slug}`} className="text-sm hover:text-blue-600">{m.baslik}</Link>
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
      <StickyButtons whatsapp={getAyar('whatsapp')} telefon={getAyar('telefon')} />
    </>
  )
}
