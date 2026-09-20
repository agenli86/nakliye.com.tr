export const revalidate = 86400

import Link from 'next/link'
import { notFound } from 'next/navigation'
import { FaChevronRight, FaPhone, FaWhatsapp } from 'react-icons/fa'

import Header from '@/components/Header'
import Footer from '@/components/Footer'
import StickyButtons from '@/components/StickyButtons'
import RotaSSS from '@/components/RotaSSS'
import IcLinkAgi from '@/components/IcLinkAgi'

import { SITE_URL, ayarAl, siteVerisi } from '@/lib/site-verisi'
import { paraBicimle } from '@/lib/rota-icerik'
import {
  HIZMET_SAYFALARI,
  evTasimaTablosu,
  fiyatGosterilsin,
  hamalUcretleri,
  hizmetSayfaUrl,
  hizmetSayfasiBul,
  kucukIsTablosu,
} from '@/lib/hizmet-sayfalari'

export async function generateStaticParams() {
  return HIZMET_SAYFALARI.map((s) => ({ slug: s.slug }))
}

export async function generateMetadata({ params }) {
  const { slug } = await params
  const sayfa = hizmetSayfasiBul(slug)
  if (!sayfa) return { title: 'Sayfa Bulunamadı' }
  const url = `${SITE_URL}${hizmetSayfaUrl(sayfa.slug)}`
  return {
    title: sayfa.metaTitle,
    description: sayfa.metaDescription,
    keywords: sayfa.keywords,
    openGraph: { title: sayfa.metaTitle, description: sayfa.metaDescription, url },
    alternates: { canonical: url },
  }
}

/**
 * Sayfanın fiyat tablosu. Üç tip var ve hangisinin çizileceğini içerik
 * dosyasındaki `tablo` alanı söylüyor. Rakamların tamamı panel ayarından
 * türetiliyor, burada sabit sayı yok.
 */
function FiyatTablosu({ sayfa, ayarlar }) {
  if (!sayfa.tablo || !fiyatGosterilsin(ayarlar)) return null

  if (sayfa.tablo === 'hamal') {
    const satirlar = hamalUcretleri(ayarlar)
    return (
      <section id="fiyatlar" className="mb-10 scroll-mt-28">
        <h2 className="mb-4 text-2xl font-bold text-[#1e3a5f] md:text-3xl">Adana Hamal Ücretleri</h2>
        <div className="w-full max-w-full overflow-x-auto rounded-2xl border border-slate-200 shadow-sm">
          <table className="w-full min-w-[320px] text-left text-sm">
            <caption className="sr-only">Adana günlük hamal ücretleri tablosu</caption>
            <thead className="bg-[#1e3a5f] text-white">
              <tr>
                <th scope="col" className="px-3 py-3 font-semibold sm:px-4">Hizmet</th>
                <th scope="col" className="whitespace-nowrap px-3 py-3 text-right font-semibold sm:px-4">Tahmini Ücret</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {satirlar.map((satir) => (
                <tr key={satir.ad} className="hover:bg-slate-50">
                  <th scope="row" className="px-3 py-3 font-medium text-slate-700 sm:px-4">{satir.ad}</th>
                  <td className="whitespace-nowrap px-3 py-3 text-right font-bold text-[#0b5bd3] sm:px-4">
                    {paraBicimle(satir.tutar)} TL
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="bg-slate-50 px-4 py-3 text-xs text-slate-600">
            Tutarlar TL cinsinden ve tahminidir. Kat sayısı, eşyanın cinsi ve sürenin uzaması rakamı değiştiriyor.
            Kesin ücret işe başlamadan yazılı olarak bildiriliyor.
          </p>
        </div>
      </section>
    )
  }

  if (sayfa.tablo === 'kucuk') {
    const satirlar = kucukIsTablosu(ayarlar)
    return (
      <section id="fiyatlar" className="mb-10 scroll-mt-28">
        <h2 className="mb-4 text-2xl font-bold text-[#1e3a5f] md:text-3xl">Adana İçi Tahmini Ücretler</h2>
        <div className="w-full max-w-full overflow-x-auto rounded-2xl border border-slate-200 shadow-sm">
          <table className="w-full min-w-[320px] text-left text-sm">
            <caption className="sr-only">Adana içi küçük taşıma işleri fiyat tablosu</caption>
            <thead className="bg-[#1e3a5f] text-white">
              <tr>
                <th scope="col" className="px-3 py-3 font-semibold sm:px-4">İş</th>
                <th scope="col" className="whitespace-nowrap px-3 py-3 font-semibold sm:px-4">Hacim</th>
                <th scope="col" className="whitespace-nowrap px-3 py-3 text-right font-semibold sm:px-4">Tahmini Ücret</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {satirlar.map((satir) => (
                <tr key={satir.id} className="hover:bg-slate-50">
                  <th scope="row" className="px-3 py-3 font-medium text-slate-700 sm:px-4">{satir.ad}</th>
                  <td className="whitespace-nowrap px-3 py-3 text-slate-600 sm:px-4">{satir.hacim}</td>
                  <td className="whitespace-nowrap px-3 py-3 text-right font-bold text-[#0b5bd3] sm:px-4">
                    {paraBicimle(satir.alt)} - {paraBicimle(satir.ust)} TL
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="bg-slate-50 px-4 py-3 text-xs text-slate-600">
            Tutarlar Adana içi tek sefer işler için tahminidir. Kat, asansör durumu ve mesafe rakamı değiştiriyor.
          </p>
        </div>
      </section>
    )
  }

  const satirlar = evTasimaTablosu(ayarlar)
  return (
    <section id="fiyatlar" className="mb-10 scroll-mt-28">
      <h2 className="mb-4 text-2xl font-bold text-[#1e3a5f] md:text-3xl">Adana İçi Ev Taşıma Ücretleri</h2>
      <div className="w-full max-w-full overflow-x-auto rounded-2xl border border-slate-200 shadow-sm">
        <table className="w-full min-w-[320px] text-left text-sm">
          <caption className="sr-only">Adana içi daire tipine göre ev taşıma fiyat tablosu</caption>
          <thead className="bg-[#1e3a5f] text-white">
            <tr>
              <th scope="col" className="px-3 py-3 font-semibold sm:px-4">Daire Tipi</th>
              <th scope="col" className="whitespace-nowrap px-3 py-3 font-semibold sm:px-4">Hacim</th>
              <th scope="col" className="whitespace-nowrap px-3 py-3 text-right font-semibold sm:px-4">Tahmini Ücret</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 bg-white">
            {satirlar.map((satir) => {
              const vurgulu = satir.id === sayfa.vurgulananTip
              return (
                <tr key={satir.id} className={vurgulu ? 'bg-blue-50' : 'hover:bg-slate-50'}>
                  <th scope="row" className="px-3 py-3 font-medium text-slate-700 sm:px-4">
                    {satir.ad}{vurgulu && <span className="ml-2 rounded bg-[#0561e0] px-2 py-0.5 text-xs font-semibold text-white">Bu sayfa</span>}
                  </th>
                  <td className="whitespace-nowrap px-3 py-3 text-slate-600 sm:px-4">{satir.hacim}</td>
                  <td className="whitespace-nowrap px-3 py-3 text-right font-bold text-[#0b5bd3] sm:px-4">
                    {paraBicimle(satir.alt)} - {paraBicimle(satir.ust)} TL
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        <p className="bg-slate-50 px-4 py-3 text-xs text-slate-600">
          Tutarlar Adana içi taşımalar için tahminidir. Kat, asansör durumu, ambalajlamanın kime ait olduğu ve
          taşınma tarihi rakamı değiştiriyor. Kesin fiyat keşif sonrası yazılı veriliyor.
        </p>
      </div>
    </section>
  )
}

export default async function HizmetSayfasi({ params }) {
  const { slug } = await params
  const sayfa = hizmetSayfasiBul(slug)
  if (!sayfa) notFound()

  const { ayarlar, menu, hizmetler } = await siteVerisi()
  const telefon = ayarAl(ayarlar, 'telefon', '05051774097')
  const whatsapp = ayarAl(ayarlar, 'whatsapp', '905051774097')
  const url = `${SITE_URL}${hizmetSayfaUrl(sayfa.slug)}`

  const bolumler = sayfa.bolumler(ayarlar)
  const sorular = sayfa.sss(ayarlar)
  const ilgiliSayfalar = (sayfa.ilgili || [])
    .map((s) => hizmetSayfasiBul(s))
    .filter(Boolean)

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Anasayfa', item: SITE_URL },
          { '@type': 'ListItem', position: 2, name: 'Hizmetler', item: `${SITE_URL}/hizmetler` },
          { '@type': 'ListItem', position: 3, name: sayfa.baslik, item: url },
        ],
      },
      {
        '@type': 'Service',
        name: sayfa.baslik,
        serviceType: 'Nakliyat',
        url,
        areaServed: { '@type': 'City', name: 'Adana' },
        provider: {
          '@type': 'MovingCompany',
          name: 'Adana Nakliye',
          telephone: `+9${telefon.replace(/\D/g, '')}`,
          url: SITE_URL,
        },
      },
      {
        '@type': 'FAQPage',
        mainEntity: sorular.map((s) => ({
          '@type': 'Question',
          name: s.soru,
          acceptedAnswer: { '@type': 'Answer', text: s.cevap },
        })),
      },
    ],
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Header ayarlar={ayarlar} menu={menu} />

      <main id="main-content">
        <section className="py-14 md:py-20" style={{ background: 'linear-gradient(135deg, #0b3b73 0%, #0561e0 100%)' }}>
          <div className="container mx-auto px-4">
            <nav aria-label="Sayfa yolu" className="mb-4 flex flex-wrap items-center gap-2 text-sm text-white">
              <Link href="/" className="inline-flex min-h-[24px] items-center hover:underline">Anasayfa</Link>
              <FaChevronRight className="text-[10px]" aria-hidden="true" />
              <Link href="/hizmetler" className="inline-flex min-h-[24px] items-center hover:underline">Hizmetler</Link>
              <FaChevronRight className="text-[10px]" aria-hidden="true" />
              <span className="font-medium">{sayfa.baslik}</span>
            </nav>

            <h1 className="text-3xl font-bold tracking-tight text-white md:text-5xl">{sayfa.baslik}</h1>
            <p className="mt-4 max-w-3xl leading-relaxed text-white">{sayfa.ozet}</p>

            <div className="mt-8 flex flex-wrap gap-3">
              <a href={`tel:${telefon}`} className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 font-bold text-[#0b5bd3] shadow-md hover:bg-slate-100">
                <FaPhone aria-hidden="true" /> {telefon}
              </a>
              <a href={`https://wa.me/${whatsapp}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-xl bg-[#1a8d47] px-6 py-3 font-bold text-white shadow-md hover:bg-[#15753a]">
                <FaWhatsapp size={20} aria-hidden="true" /> WhatsApp
              </a>
              <Link href="/teklif-al" className="inline-flex items-center gap-2 rounded-xl border-2 border-white px-6 py-3 font-bold text-white hover:bg-white/10">
                Ücretsiz Teklif Al
              </Link>
            </div>
          </div>
        </section>

        <section className="py-12 md:py-16">
          <div className="container mx-auto px-4">
            <div className="grid gap-10 lg:grid-cols-3">
              <div className="min-w-0 lg:col-span-2">
                {bolumler.map((bolum) => (
                  <section key={bolum.baslik} className="mb-10">
                    <h2 className="mb-4 text-2xl font-bold text-[#1e3a5f] md:text-3xl">{bolum.baslik}</h2>
                    {bolum.paragraflar.map((p, i) => (
                      <p key={i} className="mb-4 leading-relaxed text-slate-700">{p}</p>
                    ))}
                  </section>
                ))}

                <FiyatTablosu sayfa={sayfa} ayarlar={ayarlar} />

                <RotaSSS sorular={sorular} baslik={`${sayfa.baslik} Hakkında Sık Sorulan Sorular`} />

                <IcLinkAgi
                  baslik="Bu Sayfayla İlgili Diğer Sayfalar"
                  gruplar={[
                    {
                      baslik: 'İlgili hizmetler',
                      linkler: ilgiliSayfalar.map((s) => ({ href: hizmetSayfaUrl(s.slug), metin: s.baslik })),
                    },
                    {
                      baslik: 'Adana nakliye hizmetleri',
                      linkler: [
                        ...(hizmetler || []).slice(0, 6).map((h) => ({ href: `/hizmet/${h.slug}`, metin: h.baslik })),
                        { href: '/hizmetler', metin: 'Tüm Hizmetler' },
                      ],
                    },
                    {
                      baslik: 'Şehir dışına taşıma',
                      linkler: [
                        { href: '/rota', metin: 'Tüm Nakliye Rotaları' },
                        { href: '/sehirler-arasi-nakliye', metin: 'Şehirler Arası Nakliye' },
                        { href: '/nakliyeciler-sitesi', metin: 'Nakliyeciler Sitesi' },
                      ],
                    },
                  ]}
                />
              </div>

              <aside className="min-w-0 space-y-6">
                <div className="sticky top-28 rounded-2xl border border-slate-100 bg-white p-7 shadow-lg">
                  <h2 className="mb-2 text-xl font-bold text-[#1e3a5f]">Ücretsiz Teklif Al</h2>
                  <p className="mb-5 text-sm text-slate-600">
                    Eşyanın fotoğrafını gönderin, aynı gün yazılı fiyat verelim. Keşif ücretsiz.
                  </p>
                  <div className="flex flex-col gap-3">
                    <a href={`tel:${telefon}`} className="flex items-center justify-center gap-3 rounded-xl bg-[#0561e0] py-4 font-bold text-white shadow-md hover:bg-[#1e3a5f]">
                      <FaPhone aria-hidden="true" /> {telefon}
                    </a>
                    <a href={`https://wa.me/${whatsapp}`} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-3 rounded-xl bg-[#1a8d47] py-4 font-bold text-white shadow-md hover:opacity-90">
                      <FaWhatsapp size={22} aria-hidden="true" /> WhatsApp
                    </a>
                    <Link href="/teklif-al" className="flex items-center justify-center gap-3 rounded-xl border-2 border-[#0561e0] py-4 font-bold text-[#0b5bd3] hover:bg-blue-50">
                      Formu Doldur
                    </Link>
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
