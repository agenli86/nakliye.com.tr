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
import { bulunma } from '@/lib/turkce-ek'
import { evTasimaTablosu, fiyatGosterilsin, hizmetSayfaUrl } from '@/lib/hizmet-sayfalari'
import {
  ILCELER,
  SEMT_SAYFALARI,
  ilceBul,
  ilceSemtleri,
  komsuSemtler,
  semtBul,
  semtUrl,
} from '@/lib/semtler'
import {
  ilceBolumleri,
  ilceOzet,
  ilceSSS,
  semtBolumleri,
  semtOzet,
  semtSSS,
} from '@/lib/semt-icerik'

// Semt sayfalarından linklenen hizmet sayfaları. Ziyaretçi semt
// sayfasından hizmete, hizmetten başka semte geçebilsin diye sabit.
const HIZMET_LINKLERI = [
  { slug: 'adana-hamal-hizmeti', metin: 'Adana Hamal Hizmeti' },
  { slug: 'adana-pikap-nakliye', metin: 'Adana Pikap Nakliye' },
  { slug: 'adana-mini-nakliyat', metin: 'Adana Mini Nakliyat' },
  { slug: 'adana-mobilya-montaj', metin: 'Adana Mobilya Montaj' },
  { slug: 'adana-buzdolabi-nakliyesi', metin: 'Adana Buzdolabı Nakliyesi' },
  { slug: 'adana-2-1-ev-tasima-ucretleri', metin: '2+1 Ev Taşıma Ücretleri' },
]

export async function generateStaticParams() {
  return SEMT_SAYFALARI.map((s) => ({ semt: s.slug }))
}

/** Slug hem ilçe hem semt olabiliyor; hangisi olduğunu burada çözüyoruz. */
function kaydiCoz(slug) {
  const ilce = ilceBul(slug)
  if (ilce) return { tip: 'ilce', ilce, semtler: ilceSemtleri(ilce.slug) }
  const semt = semtBul(slug)
  if (semt) return { tip: 'semt', semt, ilce: ilceBul(semt.ilceSlug) }
  return null
}

export async function generateMetadata({ params }) {
  const { semt: slug } = await params
  const kayit = kaydiCoz(slug)
  if (!kayit) return { title: 'Sayfa Bulunamadı' }
  const url = `${SITE_URL}${semtUrl(slug)}`

  if (kayit.tip === 'ilce') {
    const { ilce } = kayit
    const kucuk = ilce.ad.toLocaleLowerCase('tr-TR')
    return {
      title: `${ilce.ad} Nakliyeci - ${ilce.ad} Nakliyat ve Evden Eve Nakliye`,
      description: `${ilce.ad} nakliyeci: evden eve nakliyat, hamal, pikap taşıma ve mobilya montajı. ${ilce.ad} semtlerine aynı gün ekip.`,
      keywords: `${kucuk} nakliyeci, ${kucuk} nakliyat, ${kucuk} evden eve nakliye, ${kucuk} hamal, ${kucuk} ev taşıma, adana ${kucuk} nakliyat`,
      openGraph: { title: `${ilce.ad} Nakliyeci`, description: `${ilce.ad} nakliyat, hamal ve pikap taşıma.`, url },
      alternates: { canonical: url },
    }
  }

  const { semt } = kayit
  const kucuk = semt.ad.toLocaleLowerCase('tr-TR')
  return {
    title: `${semt.ad} Nakliyeci - ${semt.ad} Nakliyat, Hamal ve Ev Taşıma`,
    description: `${semt.ad} nakliyeci: ${semt.ilce} ${bulunma(semt.ad)} evden eve nakliye, hamal, pikap taşıma, kamyonetçi ve mobilya montajı. Aynı gün ekip, yazılı fiyat.`,
    keywords: `${kucuk} nakliyeci, ${kucuk} nakliyat, ${kucuk} hamal, ${kucuk} evden eve nakliye, ${kucuk} ev taşıma, ${kucuk} pikap taşıma, ${kucuk} kamyonetçi, en yakın ${kucuk} hamal`,
    openGraph: { title: `${semt.ad} Nakliyeci`, description: `${semt.ad} nakliyat, hamal ve pikap taşıma.`, url },
    alternates: { canonical: url },
  }
}

function EvFiyatTablosu({ ayarlar, baslik }) {
  if (!fiyatGosterilsin(ayarlar)) return null
  const satirlar = evTasimaTablosu(ayarlar)
  return (
    <section id="fiyatlar" className="mb-10 scroll-mt-28">
      <h2 className="mb-4 text-2xl font-bold text-[#1e3a5f] md:text-3xl">{baslik}</h2>
      <div className="w-full max-w-full overflow-x-auto rounded-2xl border border-slate-200 shadow-sm">
        <table className="w-full min-w-[320px] text-left text-sm">
          <caption className="sr-only">{baslik}</caption>
          <thead className="bg-[#1e3a5f] text-white">
            <tr>
              <th scope="col" className="px-3 py-3 font-semibold sm:px-4">Daire Tipi</th>
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
          Tutarlar Adana içi taşımalar için tahminidir. Kat, asansör durumu, ambalajlama ve taşınma tarihi
          rakamı değiştiriyor. Kesin fiyat keşif sonrası yazılı veriliyor.
        </p>
      </div>
    </section>
  )
}

export default async function SemtSayfasi({ params }) {
  const { semt: slug } = await params
  const kayit = kaydiCoz(slug)
  if (!kayit) notFound()

  const { ayarlar, menu, hizmetler } = await siteVerisi()
  const telefon = ayarAl(ayarlar, 'telefon', '05051774097')
  const whatsapp = ayarAl(ayarlar, 'whatsapp', '905051774097')
  const url = `${SITE_URL}${semtUrl(slug)}`

  const ilceSayfasi = kayit.tip === 'ilce'
  const ad = ilceSayfasi ? kayit.ilce.ad : kayit.semt.ad
  const baslik = `${ad} Nakliyeci`
  const ozet = ilceSayfasi
    ? ilceOzet(kayit.ilce, kayit.semtler.length)
    : semtOzet(kayit.semt)
  const bolumler = ilceSayfasi
    ? ilceBolumleri(kayit.ilce, kayit.semtler, ayarlar)
    : semtBolumleri(kayit.semt, ayarlar)
  const sorular = ilceSayfasi ? ilceSSS(kayit.ilce, ayarlar) : semtSSS(kayit.semt, ayarlar)

  const komsular = ilceSayfasi ? kayit.semtler : komsuSemtler(kayit.semt, 8)
  const digerIlceler = ILCELER.filter((i) => i.slug !== (ilceSayfasi ? kayit.ilce.slug : kayit.semt.ilceSlug))

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Anasayfa', item: SITE_URL },
          { '@type': 'ListItem', position: 2, name: 'Adana Semtleri', item: `${SITE_URL}/nakliyat` },
          ...(ilceSayfasi
            ? []
            : [{ '@type': 'ListItem', position: 3, name: kayit.semt.ilce, item: `${SITE_URL}${semtUrl(kayit.semt.ilceSlug)}` }]),
          { '@type': 'ListItem', position: ilceSayfasi ? 3 : 4, name: baslik, item: url },
        ],
      },
      {
        '@type': 'MovingCompany',
        name: `Adana Nakliye - ${ad}`,
        url,
        telephone: `+9${telefon.replace(/\D/g, '')}`,
        areaServed: {
          '@type': ilceSayfasi ? 'AdministrativeArea' : 'Place',
          name: ilceSayfasi ? `${ad}, Adana` : `${ad}, ${kayit.semt.ilce}, Adana`,
        },
        address: { '@type': 'PostalAddress', addressLocality: 'Adana', addressCountry: 'TR' },
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
              <Link href="/nakliyat" className="inline-flex min-h-[24px] items-center hover:underline">Adana Semtleri</Link>
              {!ilceSayfasi && (
                <>
                  <FaChevronRight className="text-[10px]" aria-hidden="true" />
                  <Link href={semtUrl(kayit.semt.ilceSlug)} className="inline-flex min-h-[24px] items-center hover:underline">
                    {kayit.semt.ilce}
                  </Link>
                </>
              )}
              <FaChevronRight className="text-[10px]" aria-hidden="true" />
              <span className="font-medium">{ad}</span>
            </nav>

            <h1 className="text-3xl font-bold tracking-tight text-white md:text-5xl">{baslik}</h1>
            <p className="mt-3 text-lg font-medium text-white md:text-xl">
              {ilceSayfasi
                ? `${ad} Nakliyat, Hamal ve Evden Eve Nakliye`
                : `${kayit.semt.ilce} ${ad} - Nakliyat, Hamal ve Ev Taşıma`}
            </p>
            <p className="mt-4 max-w-3xl leading-relaxed text-white">{ozet}</p>

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

                {ilceSayfasi && kayit.semtler.length > 0 && (
                  <section id="semtler" className="mb-10 scroll-mt-28">
                    <h2 className="mb-4 text-2xl font-bold text-[#1e3a5f] md:text-3xl">
                      {kayit.ilce.ad} Semtleri
                    </h2>
                    <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                      {kayit.semtler.map((s) => (
                        <li key={s.slug}>
                          <Link
                            href={semtUrl(s.slug)}
                            className="block rounded-xl border border-slate-200 bg-white px-4 py-3 font-medium text-[#0b5bd3] shadow-sm hover:border-[#0561e0] hover:shadow"
                          >
                            {s.ad} Nakliyeci
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </section>
                )}

                <EvFiyatTablosu
                  ayarlar={ayarlar}
                  baslik={`${ad} Ev Taşıma Fiyatları`}
                />

                <RotaSSS sorular={sorular} baslik={`${baslik} Hakkında Sık Sorulan Sorular`} />

                <IcLinkAgi
                  baslik="Bu Sayfayla İlgili Diğer Sayfalar"
                  gruplar={[
                    {
                      baslik: ilceSayfasi ? `${kayit.ilce.ad} semtleri` : `${kayit.semt.ilce} semtleri`,
                      linkler: komsular.slice(0, 10).map((s) => ({
                        href: semtUrl(s.slug),
                        metin: `${s.ad} Nakliyeci`,
                      })),
                    },
                    {
                      baslik: 'Adana ilçeleri',
                      linkler: [
                        ...(ilceSayfasi ? [] : [{ href: semtUrl(kayit.semt.ilceSlug), metin: `${kayit.semt.ilce} Nakliyeci` }]),
                        ...digerIlceler.map((i) => ({ href: semtUrl(i.slug), metin: `${i.ad} Nakliyeci` })),
                        { href: '/nakliyat', metin: 'Tüm Semtler' },
                      ],
                    },
                    {
                      baslik: 'İlgili hizmetler',
                      linkler: HIZMET_LINKLERI.map((h) => ({ href: hizmetSayfaUrl(h.slug), metin: h.metin })),
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
                  <h2 className="mb-2 text-xl font-bold text-[#1e3a5f]">{ad} İçin Teklif Al</h2>
                  <p className="mb-5 text-sm text-slate-600">
                    Adresi ve eşyayı söyleyin, aynı gün yazılı fiyat verelim. {ad} içinde keşif ücretsiz.
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
