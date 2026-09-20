export const revalidate = 86400

import Link from 'next/link'
import { notFound } from 'next/navigation'
import { FaChevronRight, FaPhone, FaWhatsapp, FaTruck } from 'react-icons/fa'

import Header from '@/components/Header'
import Footer from '@/components/Footer'
import StickyButtons from '@/components/StickyButtons'
import RotaFiyatTablosu from '@/components/RotaFiyatTablosu'
import RotaSSS from '@/components/RotaSSS'
import IcLinkAgi from '@/components/IcLinkAgi'
import KmFiyatHesaplama from '@/components/KmFiyatHesaplama'

import { ILLER, ilBul } from '@/lib/iller'
import { ilHizmetUrl, rotaBul, rotaSlug } from '@/lib/rotalar'
import { SITE_URL, ayarAl, siteVerisi } from '@/lib/site-verisi'
import { paraBicimle } from '@/lib/rota-icerik'
import { sehirlerarasiUrl } from '@/lib/sehirlerarasi-icerik'
import {
  ARAC_TIPLERI,
  NK_BOLUMLERI,
  bolgeKomsulari,
  ilKamyonFiyatlari,
  kamyonFiyatAyarlari,
  kmBasiUcret,
  kmFiyatTablosu,
  nakliyecilerUrl,
  nkBolumMetni,
  nkMakale,
  nkGirisMetni,
  nkSSS,
} from '@/lib/nakliyeciler-icerik'

export async function generateStaticParams() {
  return ILLER.map((il) => ({ il: il.slug }))
}

async function sayfaVerisi(ilSlug) {
  const il = ilBul(ilSlug)
  if (!il) return null
  const { ayarlar, menu, hizmetler, rotaKayitlari } = await siteVerisi()
  // Panelden düzenleme: rota_sayfalari tablosunda tur = 'nakliyeciler'.
  const kayit = rotaKayitlari.find((k) => k.tur === 'nakliyeciler' && k.slug === ilSlug) || null
  if (kayit && kayit.aktif === false) return null
  return { il, ayarlar, menu, hizmetler, kayit }
}

export async function generateMetadata({ params }) {
  const { il: ilSlug } = await params
  const veri = await sayfaVerisi(ilSlug)
  if (!veri) return { title: 'Sayfa Bulunamadı' }
  const { il, kayit } = veri
  const url = `${SITE_URL}${nakliyecilerUrl(il.slug)}`
  const baslik = kayit?.meta_title || `${il.ad} Nakliyeciler Sitesi - Kamyon ve Tır Nakliye`
  const kucuk = il.ad.toLocaleLowerCase('tr-TR')

  return {
    title: baslik,
    description:
      kayit?.meta_description ||
      `${il.ad} nakliyeciler sitesi: kamyon nakliye, tır nakliye, kamyon garajı ve km bazlı fiyatlar. Adana ${il.ad} kamyon ve tır nakliye için tahmini ücret hesaplama.`,
    keywords:
      kayit?.meta_keywords ||
      `${kucuk} nakliyeciler sitesi, ${kucuk} kamyon nakliye, ${kucuk} tır nakliye, ${kucuk} kamyon garajı, adana ${kucuk} kamyon nakliye, kamyon nakliye km fiyatları`,
    openGraph: {
      title: baslik,
      description: `${il.ad} kamyon ve tır nakliye, kamyon garajı ve km fiyatları.`,
      url,
    },
    alternates: { canonical: kayit?.canonical_url || url },
  }
}

export default async function NakliyecilerSayfasi({ params }) {
  const { il: ilSlug } = await params
  const veri = await sayfaVerisi(ilSlug)
  if (!veri) notFound()

  const { il, ayarlar, menu, hizmetler, kayit } = veri
  const telefon = ayarAl(ayarlar, 'telefon', '05051774097')
  const whatsapp = ayarAl(ayarlar, 'whatsapp', '905051774097')
  const url = `${SITE_URL}${nakliyecilerUrl(il.slug)}`
  const yil = new Date().getFullYear()

  const { goster: fiyatGoster, yuzKm } = kamyonFiyatAyarlari(ayarlar)
  const kmUcret = kmBasiUcret(ayarlar)
  const giris = nkGirisMetni(il, ayarlar)
  const tablo = fiyatGoster ? kmFiyatTablosu(ayarlar) : []
  const ilFiyatlari = fiyatGoster ? ilKamyonFiyatlari(il, ayarlar) : []
  const makaleBolumleri = nkMakale(il, ayarlar)
  const sorular = nkSSS(il, ayarlar)
  const komsular = bolgeKomsulari(il, 10)
  const rota = il.slug === 'adana' ? null : rotaBul(rotaSlug(il.slug))

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Anasayfa', item: SITE_URL },
          { '@type': 'ListItem', position: 2, name: 'Nakliyeciler Sitesi', item: `${SITE_URL}/nakliyeciler-sitesi` },
          { '@type': 'ListItem', position: 3, name: `${il.ad} Nakliyeciler Sitesi`, item: url },
        ],
      },
      {
        '@type': 'Service',
        name: `${il.ad} Kamyon ve Tır Nakliye`,
        serviceType: 'Yük Taşımacılığı',
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
          name: `${il.ad} yük taşıma araç sınıfları`,
          itemListElement: ARAC_TIPLERI.map((a) => ({
            '@type': 'Offer',
            itemOffered: { '@type': 'Service', name: `${il.ad} ${a.ad} Nakliye` },
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
        <section className="py-14 md:py-20" style={{ background: 'linear-gradient(135deg, #0b3b73 0%, #0561e0 100%)' }}>
          <div className="container mx-auto px-4">
            <nav aria-label="Sayfa yolu" className="mb-4 flex flex-wrap items-center gap-2 text-sm text-white">
              <Link href="/" className="inline-flex min-h-[24px] items-center hover:text-white hover:underline">Anasayfa</Link>
              <FaChevronRight className="text-[10px]" aria-hidden="true" />
              <Link href="/nakliyeciler-sitesi" className="inline-flex min-h-[24px] items-center hover:text-white hover:underline">Nakliyeciler Sitesi</Link>
              <FaChevronRight className="text-[10px]" aria-hidden="true" />
              <span className="font-medium text-white">{il.ad}</span>
            </nav>

            <h1 className="text-3xl font-bold tracking-tight text-white md:text-5xl">
              {kayit?.h1 || `${il.ad} Nakliyeciler Sitesi`}
            </h1>
            <p className="mt-3 text-lg font-medium text-white md:text-xl">
              {il.ad} Kamyon Nakliye ve Tır Nakliye
            </p>
            <p className="mt-4 max-w-3xl leading-relaxed text-white">{kayit?.ozet || giris[0]}</p>

            <div className="mt-8 flex flex-wrap gap-3">
              <a href={`tel:${telefon}`} className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 font-bold text-[#0b5bd3] shadow-md hover:bg-slate-100">
                <FaPhone aria-hidden="true" /> {telefon}
              </a>
              <a href={`https://wa.me/${whatsapp}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-xl bg-[#1a8d47] px-6 py-3 font-bold text-white shadow-md hover:bg-[#15753a]">
                <FaWhatsapp size={20} aria-hidden="true" /> WhatsApp
              </a>
              <Link href={sehirlerarasiUrl(il.slug)} className="inline-flex items-center gap-2 rounded-xl border-2 border-white px-6 py-3 font-bold text-white hover:bg-white/10">
                {il.ad} Şehirler Arası Nakliye
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
                    {il.ad} Yük Taşımacılığı Hakkında
                  </h2>
                  {giris.slice(1).map((p, i) => (
                    <p key={i} className="mb-4 leading-relaxed text-slate-700">{p}</p>
                  ))}
                  {kayit?.icerik && (
                    <div className="prose prose-slate max-w-none prose-headings:text-[#1e3a5f]" dangerouslySetInnerHTML={{ __html: kayit.icerik }} />
                  )}
                </section>

                <section id="araclar" className="mb-10 scroll-mt-28">
                  <h2 className="mb-5 text-2xl font-bold text-[#1e3a5f] md:text-3xl">
                    {il.ad} İçin Araç Sınıflarımız
                  </h2>
                  <div className="grid gap-4 sm:grid-cols-3">
                    {ARAC_TIPLERI.map((arac) => (
                      <article key={arac.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                        <h3 className="mb-2 flex items-start gap-2 text-lg font-bold text-[#1e3a5f]">
                          <FaTruck aria-hidden="true" className="mt-1 shrink-0 text-[#0561e0]" />
                          {arac.ad}
                        </h3>
                        <dl className="space-y-1 text-sm text-slate-700">
                          <div><dt className="inline font-semibold">Kapasite: </dt><dd className="inline">{arac.kapasite}</dd></div>
                          <div><dt className="inline font-semibold">Kasa: </dt><dd className="inline">{arac.kasa}</dd></div>
                        </dl>
                      </article>
                    ))}
                  </div>
                </section>

                {NK_BOLUMLERI.map((bolum) => {
                  const paragraflar = nkBolumMetni(bolum.id, il, ayarlar)
                  if (paragraflar.length === 0) return null
                  return (
                    <section key={bolum.id} id={bolum.id} className="mb-10 scroll-mt-28">
                      <h2 className="mb-4 text-2xl font-bold text-[#1e3a5f] md:text-3xl">
                        {il.ad} {bolum.ad}
                      </h2>
                      {paragraflar.map((p, i) => (
                        <p key={i} className="mb-4 leading-relaxed text-slate-700">{p}</p>
                      ))}

                      {bolum.id === 'km-fiyatlari' && tablo.length > 0 && (
                        <div className="w-full max-w-full overflow-x-auto rounded-2xl border border-slate-200 shadow-sm">
                          <table className="w-full min-w-[320px] text-left text-sm">
                            <caption className="sr-only">
                              {il.ad} kamyon ve tır nakliye km fiyat tablosu
                            </caption>
                            <thead className="bg-[#1e3a5f] text-white">
                              <tr>
                                <th scope="col" className="px-3 py-3 font-semibold sm:px-4">Mesafe</th>
                                {ARAC_TIPLERI.map((arac) => (
                                  <th key={arac.id} scope="col" className="whitespace-nowrap px-3 py-3 text-right font-semibold sm:px-4 sm:text-left">
                                    {arac.ad}
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 bg-white">
                              {tablo.map((satir) => (
                                <tr key={satir.km} className="hover:bg-slate-50">
                                  <th scope="row" className="whitespace-nowrap px-3 py-3 font-semibold text-[#1e3a5f] sm:px-4">
                                    {satir.km} km
                                  </th>
                                  {satir.hucreler.map((hucre) => (
                                    <td key={hucre.aracId} className="whitespace-nowrap px-3 py-3 text-right font-bold text-[#0b5bd3] sm:px-4 sm:text-left">
                                      {paraBicimle(hucre.tutar)}
                                    </td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                          <p className="bg-slate-50 px-4 py-3 text-xs text-slate-600">
                            Tutarlar TL cinsinden ve tahminidir. Esas: 100 km {paraBicimle(yuzKm)} TL,
                            km başına {paraBicimle(kmUcret)} TL. Kesin fiyat yük görüldükten sonra yazılı olarak verilir.
                          </p>
                        </div>
                      )}
                    </section>
                  )
                })}

                <section id="makale" className="mb-10 scroll-mt-28">
                  {makaleBolumleri.map((bolum) => (
                    <div key={bolum.baslik} className="mb-8">
                      <h2 className="mb-4 text-2xl font-bold text-[#1e3a5f] md:text-3xl">{bolum.baslik}</h2>
                      {bolum.paragraflar.map((p, i) => (
                        <p key={i} className="mb-4 leading-relaxed text-slate-700">{p}</p>
                      ))}
                    </div>
                  ))}
                </section>

                {ilFiyatlari.length > 0 && (
                  <section id="adana-rotasi" className="mb-10 scroll-mt-28">
                    <h2 className="mb-4 text-2xl font-bold text-[#1e3a5f] md:text-3xl">
                      Adana {il.ad} Kamyon ve Tır Nakliye Fiyatları {yil}
                    </h2>
                    <RotaFiyatTablosu
                      satirlar={ilFiyatlari}
                      baslik={`Adana ${il.ad} kamyon ve tır nakliye fiyat tablosu`}
                      not={kayit?.fiyat_notu || `Tutarlar ${il.mesafe} km üzerinden, km başına ${paraBicimle(kmUcret)} TL esasıyla hesaplandı. Dönüş yükü bulunduğunda fiyat aşağı çekilebiliyor.`}
                    />
                  </section>
                )}

                <RotaSSS sorular={sorular} baslik={`${il.ad} Kamyon ve Tır Nakliye Hakkında Sık Sorulan Sorular`} />

                <IcLinkAgi
                  baslik="Bu Sayfayla İlgili Diğer Sayfalar"
                  gruplar={[
                    {
                      baslik: `${il.ad} sayfaları`,
                      linkler: [
                        { href: sehirlerarasiUrl(il.slug), metin: `${il.ad} Şehirler Arası Nakliye` },
                        { href: ilHizmetUrl(il.slug), metin: `${il.ad} Nakliye Hizmetleri` },
                        ...(rota ? [{ href: rota.url, metin: rota.rotaAdi }] : []),
                      ],
                    },
                    {
                      baslik: `${il.bolgeAdi} illeri`,
                      linkler: komsular.map((x) => ({
                        href: nakliyecilerUrl(x.slug),
                        metin: `${x.ad} Nakliyeciler Sitesi`,
                      })),
                    },
                    {
                      baslik: 'Adana nakliye hizmetleri',
                      linkler: [
                        ...(hizmetler || []).slice(0, 6).map((h) => ({ href: `/hizmet/${h.slug}`, metin: h.baslik })),
                        { href: '/nakliyeciler-sitesi', metin: 'Tüm İller' },
                        { href: '/rota', metin: 'Tüm Nakliye Rotaları' },
                      ],
                    },
                  ]}
                />
              </div>

              <aside className="min-w-0 space-y-6">
                {fiyatGoster && (
                  <KmFiyatHesaplama
                    kmUcret={kmUcret}
                    araclar={ARAC_TIPLERI}
                    baslangicKm={il.mesafe || 100}
                    telefon={telefon}
                  />
                )}

                <div className="rounded-2xl border border-slate-100 bg-white p-7 shadow-lg">
                  <h2 className="mb-2 text-xl font-bold text-[#1e3a5f]">{il.ad} İçin Araç Talebi</h2>
                  <p className="mb-5 text-sm text-slate-600">Yükün fotoğrafını gönderin, uygun aracı ve fiyatı aynı gün bildirelim.</p>
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
