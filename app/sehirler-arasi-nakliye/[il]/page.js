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
import { ilHizmetUrl, rotaBul, rotaSlug } from '@/lib/rotalar'
import { SITE_URL, ayarAl, siteVerisi } from '@/lib/site-verisi'
import { fiyatAyarlari } from '@/lib/rota-icerik'
import { nakliyecilerUrl } from '@/lib/nakliyeciler-icerik'
import {
  SA_TASIMALARI,
  bolgeKomsulari,
  saFiyatTablosu,
  saGirisMetni,
  saMakale,
  saSSS,
  saTasimaAciklamasi,
  sehirlerarasiUrl,
  teslimSuresi,
} from '@/lib/sehirlerarasi-icerik'

export async function generateStaticParams() {
  return ILLER.map((il) => ({ il: il.slug }))
}

async function sayfaVerisi(ilSlug) {
  const il = ilBul(ilSlug)
  if (!il) return null
  const { ayarlar, menu, hizmetler, rotaKayitlari } = await siteVerisi()
  // Panelden düzenleme: rota_sayfalari tablosunda tur = 'sehirler-arasi'.
  // Tablo henüz yoksa kayıt null kalıyor ve sayfa üretilen metinle çiziliyor.
  const kayit = rotaKayitlari.find((k) => k.tur === 'sehirler-arasi' && k.slug === ilSlug) || null
  if (kayit && kayit.aktif === false) return null
  return { il, ayarlar, menu, hizmetler, kayit }
}

export async function generateMetadata({ params }) {
  const { il: ilSlug } = await params
  const veri = await sayfaVerisi(ilSlug)
  if (!veri) return { title: 'Sayfa Bulunamadı' }
  const { il, kayit } = veri
  const url = `${SITE_URL}${sehirlerarasiUrl(il.slug)}`
  const baslik = kayit?.meta_title || `${il.ad} Şehirler Arası Nakliye - Evden Eve Taşıma`
  const kucuk = il.ad.toLocaleLowerCase('tr-TR')

  return {
    title: baslik,
    description:
      kayit?.meta_description ||
      `${il.ad} şehirler arası nakliye: evden eve nakliyat, şehirler arası ev taşıma, şehirler arası küçük nakliye ve ${il.ad} asansörlü taşıma. Sigortalı, tek araçla, yazılı fiyatla.`,
    keywords:
      kayit?.meta_keywords ||
      `${kucuk} şehirler arası nakliye, ${kucuk} evden eve nakliyat, ${kucuk} şehirler arası ev taşıma, ${kucuk} küçük nakliye, ${kucuk} asansörlü taşıma`,
    openGraph: {
      title: baslik,
      description: `${il.ad} şehirler arası nakliye ve evden eve taşıma hizmetleri.`,
      url,
    },
    alternates: { canonical: kayit?.canonical_url || url },
  }
}

export default async function SehirlerArasiSayfasi({ params }) {
  const { il: ilSlug } = await params
  const veri = await sayfaVerisi(ilSlug)
  if (!veri) notFound()

  const { il, ayarlar, menu, hizmetler, kayit } = veri
  const telefon = ayarAl(ayarlar, 'telefon', '05057805551')
  const whatsapp = ayarAl(ayarlar, 'whatsapp', '905057805551')
  const url = `${SITE_URL}${sehirlerarasiUrl(il.slug)}`
  const yil = new Date().getFullYear()

  const giris = saGirisMetni(il)
  const bolumler = saMakale(il)
  const fiyatSecenekleri = fiyatAyarlari(ayarlar)
  const fiyatlar = fiyatSecenekleri.goster ? saFiyatTablosu(il, ayarlar) : []
  const sorular = saSSS(il, fiyatlar)
  const komsular = bolgeKomsulari(il, 10)
  const rota = il.slug === 'adana' ? null : rotaBul(rotaSlug(il.slug))

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Anasayfa', item: SITE_URL },
          { '@type': 'ListItem', position: 2, name: 'Şehirler Arası Nakliye', item: `${SITE_URL}/sehirler-arasi-nakliye` },
          { '@type': 'ListItem', position: 3, name: `${il.ad} Şehirler Arası Nakliye`, item: url },
        ],
      },
      {
        '@type': 'Service',
        name: `${il.ad} Şehirler Arası Nakliye`,
        serviceType: 'Şehirler Arası Nakliyat',
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
          name: `${il.ad} şehirler arası taşıma türleri`,
          itemListElement: SA_TASIMALARI.map((t) => ({
            '@type': 'Offer',
            itemOffered: { '@type': 'Service', name: `${il.ad} ${t.ad}` },
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
              <Link href="/" className="inline-flex min-h-[24px] items-center hover:text-white hover:underline">Anasayfa</Link>
              <FaChevronRight className="text-[10px]" aria-hidden="true" />
              <Link href="/sehirler-arasi-nakliye" className="inline-flex min-h-[24px] items-center hover:text-white hover:underline">Şehirler Arası Nakliye</Link>
              <FaChevronRight className="text-[10px]" aria-hidden="true" />
              <span className="font-medium text-white">{il.ad}</span>
            </nav>

            <h1 className="text-3xl font-bold tracking-tight text-white md:text-5xl">
              {kayit?.h1 || `${il.ad} Şehirler Arası Nakliye`}
            </h1>
            <p className="mt-3 text-lg font-medium text-white md:text-xl">
              {il.ad} Evden Eve Taşıma
            </p>
            <p className="mt-4 max-w-3xl leading-relaxed text-white">{kayit?.ozet || giris[0]}</p>

            <div className="mt-8 flex flex-wrap gap-3">
              <a href={`tel:${telefon}`} className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 font-bold text-[#0b5bd3] shadow-md hover:bg-slate-100">
                <FaPhone aria-hidden="true" /> {telefon}
              </a>
              <a href={`https://wa.me/${whatsapp}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-xl bg-[#1a8d47] px-6 py-3 font-bold text-white shadow-md hover:bg-[#15753a]">
                <FaWhatsapp size={20} aria-hidden="true" /> WhatsApp
              </a>
              <Link href={nakliyecilerUrl(il.slug)} className="inline-flex items-center gap-2 rounded-xl border-2 border-white px-6 py-3 font-bold text-white hover:bg-white/10">
                {il.ad} Nakliyeciler Sitesi
              </Link>
            </div>
          </div>
        </section>

        <section className="py-12 md:py-16">
          <div className="container mx-auto px-4">
            <div className="grid gap-10 lg:grid-cols-3">
              <div className="min-w-0 lg:col-span-2">
                <section className="mb-10">
                  <h2 className="mb-4 text-2xl font-bold text-[#1e3a5f] md:text-3xl">
                    {il.ad} Şehirler Arası Nakliye Hakkında
                  </h2>
                  {giris.slice(1).map((p, i) => (
                    <p key={i} className="mb-4 leading-relaxed text-slate-700">{p}</p>
                  ))}
                  {kayit?.icerik && (
                    <div className="prose prose-slate max-w-none prose-headings:text-[#1e3a5f]" dangerouslySetInnerHTML={{ __html: kayit.icerik }} />
                  )}
                </section>

                <section id="tasima-turleri" className="mb-10 scroll-mt-28">
                  <h2 className="mb-5 text-2xl font-bold text-[#1e3a5f] md:text-3xl">
                    {il.ad} İçin Dört Taşıma Türü
                  </h2>
                  <div className="grid gap-4 sm:grid-cols-2">
                    {SA_TASIMALARI.map((tasima) => (
                      <article key={tasima.id} id={tasima.id} className="scroll-mt-28 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                        <h3 className="mb-2 flex items-start gap-2 text-lg font-bold text-[#1e3a5f]">
                          <FaCheckCircle aria-hidden="true" className="mt-1 shrink-0 text-[#1a8d47]" />
                          {il.ad} {tasima.ad}
                        </h3>
                        <p className="text-sm leading-relaxed text-slate-700">{saTasimaAciklamasi(tasima, il)}</p>
                      </article>
                    ))}
                  </div>
                </section>

                <section id="makale" className="mb-10 scroll-mt-28">
                  {bolumler.map((bolum) => (
                    <div key={bolum.baslik} className="mb-8">
                      <h2 className="mb-4 text-2xl font-bold text-[#1e3a5f] md:text-3xl">{bolum.baslik}</h2>
                      {bolum.paragraflar.map((p, i) => (
                        <p key={i} className="mb-4 leading-relaxed text-slate-700">{p}</p>
                      ))}
                    </div>
                  ))}
                </section>

                {fiyatlar.length > 0 && (
                  <section id="fiyatlar" className="mb-10 scroll-mt-28">
                    <h2 className="mb-4 text-2xl font-bold text-[#1e3a5f] md:text-3xl">
                      {il.ad} Şehirler Arası Nakliye Fiyatları {yil}
                    </h2>
                    <RotaFiyatTablosu
                      satirlar={fiyatlar}
                      baslik={`${il.ad} şehirler arası nakliye fiyat tablosu`}
                      not={kayit?.fiyat_notu}
                    />
                    <p className="mt-4 text-slate-700">
                      {il.mesafe
                        ? `Tablodaki tutarlar ${il.mesafe} km'lik mesafe üzerinden hesaplandı; ortalama teslim süresi ${teslimSuresi(il.mesafe)}.`
                        : 'Tablodaki tutarlar şehir içi ve kısa mesafe taşımalar için ortalama değerlerdir.'}
                      {rota && (
                        <>
                          {' '}Güzergaha özel ayrıntılar için{' '}
                          <Link href={rota.url} className="font-semibold text-[#0b5bd3] hover:underline">{rota.rotaAdi}</Link>{' '}
                          sayfasına bakabilirsiniz.
                        </>
                      )}
                    </p>
                  </section>
                )}

                <RotaSSS sorular={sorular} baslik={`${il.ad} Şehirler Arası Nakliye Hakkında Sık Sorulan Sorular`} />

                <IcLinkAgi
                  baslik="Bu Sayfayla İlgili Diğer Sayfalar"
                  gruplar={[
                    {
                      baslik: `${il.ad} sayfaları`,
                      linkler: [
                        { href: ilHizmetUrl(il.slug), metin: `${il.ad} Nakliye Hizmetleri` },
                        { href: nakliyecilerUrl(il.slug), metin: `${il.ad} Nakliyeciler Sitesi` },
                        ...(rota ? [{ href: rota.url, metin: rota.rotaAdi }] : []),
                      ],
                    },
                    {
                      baslik: `${il.bolgeAdi} illeri`,
                      linkler: komsular.map((x) => ({
                        href: sehirlerarasiUrl(x.slug),
                        metin: `${x.ad} Şehirler Arası Nakliye`,
                      })),
                    },
                    {
                      baslik: 'Adana nakliye hizmetleri',
                      linkler: [
                        ...(hizmetler || []).slice(0, 6).map((h) => ({ href: `/hizmet/${h.slug}`, metin: h.baslik })),
                        { href: '/sehirler-arasi-nakliye', metin: 'Tüm İller' },
                        { href: '/rota', metin: 'Tüm Nakliye Rotaları' },
                      ],
                    },
                  ]}
                />
              </div>

              <aside className="min-w-0 space-y-6">
                <div className="sticky top-28 rounded-2xl border border-slate-100 bg-white p-7 shadow-lg">
                  <h2 className="mb-2 text-xl font-bold text-[#1e3a5f]">{il.ad} İçin Teklif Alın</h2>
                  <p className="mb-5 text-sm text-slate-600">Ekspertiz ücretsiz, fiyat yazılı ve taşıma günü değişmiyor.</p>
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

                  <div className="mt-8">
                    <h3 className="mb-3 border-b pb-2 font-bold text-[#1e3a5f]">Özet</h3>
                    <dl className="space-y-2 text-sm">
                      <div className="flex justify-between gap-3"><dt className="text-slate-600">Plaka kodu</dt><dd className="font-semibold text-[#1e3a5f]">{String(il.plaka).padStart(2, '0')}</dd></div>
                      <div className="flex justify-between gap-3"><dt className="text-slate-600">Bölge</dt><dd className="font-semibold text-[#1e3a5f]">{il.bolgeAdi}</dd></div>
                      <div className="flex justify-between gap-3"><dt className="text-slate-600">İlçe sayısı</dt><dd className="font-semibold text-[#1e3a5f]">{il.ilceler.length}+</dd></div>
                      {il.mesafe > 0 && (
                        <>
                          <div className="flex justify-between gap-3"><dt className="text-slate-600">Adana&apos;ya uzaklık</dt><dd className="font-semibold text-[#1e3a5f]">~{il.mesafe} km</dd></div>
                          <div className="flex justify-between gap-3"><dt className="text-slate-600">Teslim süresi</dt><dd className="font-semibold text-[#1e3a5f]">{teslimSuresi(il.mesafe)}</dd></div>
                        </>
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
