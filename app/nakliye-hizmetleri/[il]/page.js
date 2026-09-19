export const revalidate = 86400

import Link from 'next/link'
import { notFound } from 'next/navigation'
import { FaChevronRight, FaPhone, FaWhatsapp, FaCheckCircle } from 'react-icons/fa'

import Header from '@/components/Header'
import Footer from '@/components/Footer'
import StickyButtons from '@/components/StickyButtons'
import RotaFiyatTablosu from '@/components/RotaFiyatTablosu'
import RotaSSS from '@/components/RotaSSS'
import IcLinkAgi from '@/components/IcLinkAgi'

import { ILLER, ilBul } from '@/lib/iller'
import { ILCE_ROTA_LISTESI, ilgiliRotalar, rotaBul, rotaSlug, rotaUrl, ilHizmetUrl } from '@/lib/rotalar'
import { SITE_URL, ayarAl, siteVerisi } from '@/lib/site-verisi'
import { fiyatAyarlari, fiyatTablosu } from '@/lib/rota-icerik'
import { IL_HIZMETLERI, ilGirisMetni, ilHizmetAciklamasi, ilSSS } from '@/lib/il-icerik'

export async function generateStaticParams() {
  return ILLER.map((il) => ({ il: il.slug }))
}

async function sayfaVerisi(ilSlug) {
  const il = ilBul(ilSlug)
  if (!il) return null
  const { ayarlar, menu, hizmetler, rotaKayitlari } = await siteVerisi()
  const kayit = rotaKayitlari.find((k) => k.tur === 'il-hizmet' && k.slug === ilSlug) || null
  if (kayit && kayit.aktif === false) return null
  return { il, ayarlar, menu, hizmetler, kayit }
}

export async function generateMetadata({ params }) {
  const { il: ilSlug } = await params
  const veri = await sayfaVerisi(ilSlug)
  if (!veri) return { title: 'Sayfa Bulunamadı' }
  const { il, kayit } = veri
  const url = `${SITE_URL}${ilHizmetUrl(il.slug)}`
  const baslik = kayit?.meta_title || `${il.ad} Nakliye Hizmetleri | Evden Eve Nakliyat`
  return {
    title: baslik,
    description:
      kayit?.meta_description ||
      `${il.ad} nakliye hizmetleri: evden eve nakliyat, ofis taşıma, asansörlü nakliyat, parça eşya taşıma ve eşya depolama. ${il.ad} merkez ve tüm ilçelerine sigortalı taşımacılık.`,
    keywords:
      kayit?.meta_keywords ||
      `${il.ad.toLowerCase()} nakliye hizmetleri, ${il.ad.toLowerCase()} evden eve nakliyat, ${il.ad.toLowerCase()} nakliyat firması, adana ${il.ad.toLowerCase()} nakliye`,
    openGraph: { title: baslik, description: `${il.ad} nakliye hizmetleri ve evden eve nakliyat.`, url },
    alternates: { canonical: kayit?.canonical_url || url },
  }
}

export default async function IlHizmetSayfasi({ params }) {
  const { il: ilSlug } = await params
  const veri = await sayfaVerisi(ilSlug)
  if (!veri) notFound()

  const { il, ayarlar, menu, hizmetler, kayit } = veri
  const telefon = ayarAl(ayarlar, 'telefon', '05057805551')
  const whatsapp = ayarAl(ayarlar, 'whatsapp', '905057805551')
  const url = `${SITE_URL}${ilHizmetUrl(il.slug)}`

  const rota = il.slug === 'adana' ? null : rotaBul(rotaSlug(il.slug))
  const fiyatSecenekleri = fiyatAyarlari(ayarlar)
  const fiyatlar = rota && fiyatSecenekleri.goster ? fiyatTablosu(rota, ayarlar) : []
  const sorular = ilSSS(il, rota)
  const giris = ilGirisMetni(il)
  const ilceRotalari = ILCE_ROTA_LISTESI.filter((r) => r.ilSlug === il.slug)
  const komsular = rota ? ilgiliRotalar(rota, 10).filter((k) => k.ilSlug !== il.slug) : []

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Anasayfa', item: SITE_URL },
          { '@type': 'ListItem', position: 2, name: 'Nakliye Hizmetleri', item: `${SITE_URL}/nakliye-hizmetleri` },
          { '@type': 'ListItem', position: 3, name: `${il.ad} Nakliye Hizmetleri`, item: url },
        ],
      },
      {
        '@type': 'Service',
        name: `${il.ad} Nakliye Hizmetleri`,
        serviceType: 'Nakliyat',
        url,
        areaServed: { '@type': 'State', name: il.ad },
        provider: {
          '@type': 'MovingCompany',
          name: 'Adana Nakliye',
          telephone: `+9${telefon.replace(/\D/g, '')}`,
          url: SITE_URL,
        },
        hasOfferCatalog: {
          '@type': 'OfferCatalog',
          name: `${il.ad} nakliye hizmet listesi`,
          itemListElement: IL_HIZMETLERI.map((h) => ({
            '@type': 'Offer',
            itemOffered: { '@type': 'Service', name: `${il.ad} ${h.ad}` },
          })),
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
        <section className="py-14 md:py-20" style={{ background: 'linear-gradient(135deg, #1e3a5f 0%, #0b5bd3 100%)' }}>
          <div className="container mx-auto px-4">
            <nav aria-label="Sayfa yolu" className="mb-4 flex flex-wrap items-center gap-2 text-sm text-white">
              <Link href="/" className="hover:text-white hover:underline">Anasayfa</Link>
              <FaChevronRight className="text-[10px]" aria-hidden="true" />
              <Link href="/nakliye-hizmetleri" className="hover:text-white hover:underline">Nakliye Hizmetleri</Link>
              <FaChevronRight className="text-[10px]" aria-hidden="true" />
              <span className="font-medium text-white">{il.ad}</span>
            </nav>
            <h1 className="text-3xl font-bold tracking-tight text-white md:text-5xl">
              {kayit?.h1 || `${il.ad} Nakliye Hizmetleri`}
            </h1>
            <p className="mt-4 max-w-3xl leading-relaxed text-white">{kayit?.ozet || giris[0]}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href={`tel:${telefon}`} className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 font-bold text-[#0b5bd3] shadow-md hover:bg-slate-100">
                <FaPhone aria-hidden="true" /> {telefon}
              </a>
              <a href={`https://wa.me/${whatsapp}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-xl bg-[#1a8d47] px-6 py-3 font-bold text-white shadow-md hover:bg-[#15753a]">
                <FaWhatsapp size={20} aria-hidden="true" /> WhatsApp
              </a>
              {rota && (
                <Link href={rota.url} className="inline-flex items-center gap-2 rounded-xl border-2 border-white px-6 py-3 font-bold text-white hover:bg-white/10">
                  {rota.rotaAdi} Sayfası
                </Link>
              )}
            </div>
          </div>
        </section>

        <section className="py-12 md:py-16">
          <div className="container mx-auto px-4">
            <div className="grid gap-10 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <section className="mb-10">
                  <h2 className="mb-4 text-2xl font-bold text-[#1e3a5f] md:text-3xl">
                    {il.ad} Nakliyat Hakkında
                  </h2>
                  {giris.slice(1).map((p, i) => (
                    <p key={i} className="mb-4 leading-relaxed text-slate-700">{p}</p>
                  ))}
                  {kayit?.icerik && (
                    <div className="prose prose-slate max-w-none prose-headings:text-[#1e3a5f]" dangerouslySetInnerHTML={{ __html: kayit.icerik }} />
                  )}
                </section>

                <section id="hizmetler" className="mb-10 scroll-mt-28">
                  <h2 className="mb-5 text-2xl font-bold text-[#1e3a5f] md:text-3xl">
                    {il.ad} İçin Verdiğimiz Hizmetler
                  </h2>
                  <div className="grid gap-4 sm:grid-cols-2">
                    {IL_HIZMETLERI.map((hizmet) => (
                      <article key={hizmet.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                        <h3 className="mb-2 flex items-start gap-2 text-lg font-bold text-[#1e3a5f]">
                          <FaCheckCircle aria-hidden="true" className="mt-1 shrink-0 text-[#1a8d47]" />
                          {il.ad} {hizmet.ad}
                        </h3>
                        <p className="text-sm leading-relaxed text-slate-700">{ilHizmetAciklamasi(hizmet, il)}</p>
                      </article>
                    ))}
                  </div>
                </section>

                <section id="ilceler" className="mb-10 scroll-mt-28">
                  <h2 className="mb-4 text-2xl font-bold text-[#1e3a5f] md:text-3xl">
                    {il.ad} Hizmet Verdiğimiz İlçeler
                  </h2>
                  <p className="mb-4 leading-relaxed text-slate-700">
                    {il.ad} {il.bolgeAdi} sınırlarında. Aşağıdaki ilçelerin tamamına aynı hizmet kapsamıyla
                    çalışıyoruz; listede olmayan bir yerleşim için de bizi arayabilirsiniz.
                  </p>
                  <ul className="flex flex-wrap gap-2">
                    {il.ilceler.map((ilce) => (
                      <li key={ilce} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700">
                        {il.ad} {ilce}
                      </li>
                    ))}
                  </ul>
                </section>

                {fiyatlar.length > 0 && (
                  <section id="fiyatlar" className="mb-10 scroll-mt-28">
                    <h2 className="mb-4 text-2xl font-bold text-[#1e3a5f] md:text-3xl">
                      Adana {il.ad} Nakliye Fiyatları {new Date().getFullYear()}
                    </h2>
                    <RotaFiyatTablosu satirlar={fiyatlar} baslik={`Adana ${il.ad} nakliye fiyat tablosu`} not={kayit?.fiyat_notu} />
                    <p className="mt-4 text-slate-700">
                      Güzergaha özel ayrıntılar, teslim süresi ve taşınma rehberi için{' '}
                      <Link href={rota.url} className="font-semibold text-[#0b5bd3] hover:underline">{rota.rotaAdi}</Link>{' '}
                      sayfasına bakabilirsiniz.
                    </p>
                  </section>
                )}

                <RotaSSS sorular={sorular} baslik={`${il.ad} Nakliye Hakkında Sık Sorulan Sorular`} />

                <IcLinkAgi
                  baslik="Bu Sayfayla İlgili Diğer Sayfalar"
                  gruplar={[
                    {
                      baslik: `${il.ad} rotaları`,
                      linkler: [
                        ...(rota ? [{ href: rota.url, metin: rota.rotaAdi }] : []),
                        ...ilceRotalari.map((r) => ({ href: r.url, metin: r.rotaAdi })),
                      ],
                    },
                    {
                      baslik: `${il.bolgeAdi} illeri`,
                      linkler: ILLER.filter((x) => x.bolge === il.bolge && x.slug !== il.slug)
                        .slice(0, 10)
                        .map((x) => ({ href: ilHizmetUrl(x.slug), metin: `${x.ad} Nakliye Hizmetleri` })),
                    },
                    {
                      baslik: 'Yakın mesafeli rotalar',
                      linkler: komsular.slice(0, 8).map((k) => ({ href: k.url, metin: k.rotaAdi })),
                    },
                    {
                      baslik: 'Adana nakliye hizmetleri',
                      linkler: [
                        ...(hizmetler || []).slice(0, 6).map((h) => ({ href: `/hizmet/${h.slug}`, metin: h.baslik })),
                        { href: '/rota', metin: 'Tüm Nakliye Rotaları' },
                        { href: '/nakliye-hizmetleri', metin: 'Tüm İller' },
                      ],
                    },
                  ]}
                />
              </div>

              <aside className="space-y-6">
                <div className="sticky top-28 rounded-2xl border border-slate-100 bg-white p-7 shadow-lg">
                  <h2 className="mb-2 text-xl font-bold text-[#1e3a5f]">{il.ad} İçin Teklif Alın</h2>
                  <p className="mb-5 text-sm text-slate-600">Ekspertiz ücretsiz, fiyat yazılı ve taşıma günü değişmiyor.</p>
                  <div className="flex flex-col gap-3">
                    <a href={`tel:${telefon}`} className="flex items-center justify-center gap-3 rounded-xl bg-[#046ffb] py-4 font-bold text-white shadow-md hover:bg-[#1e3a5f]">
                      <FaPhone aria-hidden="true" /> {telefon}
                    </a>
                    <a href={`https://wa.me/${whatsapp}`} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-3 rounded-xl bg-[#1a8d47] py-4 font-bold text-white shadow-md hover:opacity-90">
                      <FaWhatsapp size={22} aria-hidden="true" /> WhatsApp
                    </a>
                    <Link href="/teklif-al" className="flex items-center justify-center gap-3 rounded-xl border-2 border-[#046ffb] py-4 font-bold text-[#0b5bd3] hover:bg-blue-50">
                      Formu Doldur
                    </Link>
                  </div>
                  <div className="mt-8">
                    <h3 className="mb-3 border-b pb-2 font-bold text-[#1e3a5f]">Özet</h3>
                    <dl className="space-y-2 text-sm">
                      <div className="flex justify-between gap-3"><dt className="text-slate-600">Plaka kodu</dt><dd className="font-semibold text-[#1e3a5f]">{String(il.plaka).padStart(2, '0')}</dd></div>
                      <div className="flex justify-between gap-3"><dt className="text-slate-600">Bölge</dt><dd className="font-semibold text-[#1e3a5f]">{il.bolgeAdi}</dd></div>
                      <div className="flex justify-between gap-3"><dt className="text-slate-600">İlçe sayısı</dt><dd className="font-semibold text-[#1e3a5f]">{il.ilceler.length}+</dd></div>
                      {il.slug !== 'adana' && (
                        <div className="flex justify-between gap-3"><dt className="text-slate-600">Adana&apos;ya uzaklık</dt><dd className="font-semibold text-[#1e3a5f]">~{il.mesafe} km</dd></div>
                      )}
                    </dl>
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
