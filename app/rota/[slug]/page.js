// ISR: rota sayfaları build'de üretilir, günde bir arka planda tazelenir.
export const revalidate = 86400

import Link from 'next/link'
import { notFound } from 'next/navigation'
import { FaChevronRight, FaPhone, FaWhatsapp, FaRoute, FaClock, FaMapMarkedAlt, FaTruck } from 'react-icons/fa'

import Header from '@/components/Header'
import Footer from '@/components/Footer'
import StickyButtons from '@/components/StickyButtons'
import RotaFiyatTablosu from '@/components/RotaFiyatTablosu'
import RotaSSS from '@/components/RotaSSS'
import IcLinkAgi from '@/components/IcLinkAgi'

import { ROTALAR, rotaBul, ilgiliRotalar, ilHizmetUrl } from '@/lib/rotalar'
import { rotaBirlestir } from '@/lib/rota-db'
import { SITE_URL, ayarAl, siteVerisi } from '@/lib/site-verisi'
import {
  fiyatAyarlari,
  fiyatTablosu,
  rotaBolumleri,
  rotaGirisMetni,
  rotaMakalesi,
  rotaSSS,
} from '@/lib/rota-icerik'

export async function generateStaticParams() {
  return ROTALAR.map((rota) => ({ slug: rota.rotaSlug }))
}

async function sayfaVerisi(slug) {
  const temel = rotaBul(slug)
  if (!temel) return null
  const { ayarlar, menu, hizmetler, rotaKayitlari } = await siteVerisi()
  const kayit = rotaKayitlari.find((k) => k.slug === slug && k.tur !== 'il-hizmet') || null
  if (kayit && kayit.aktif === false) return null
  return { rota: rotaBirlestir(temel, kayit), ayarlar, menu, hizmetler, kayit }
}

export async function generateMetadata({ params }) {
  const { slug } = await params
  const veri = await sayfaVerisi(slug)
  if (!veri) return { title: 'Sayfa Bulunamadı' }
  const { rota, kayit } = veri
  const url = `${SITE_URL}/rota/${slug}`
  const baslik = kayit?.meta_title || `${rota.tersBaslik} | ${rota.rotaAdi}`
  const aciklama =
    kayit?.meta_description ||
    `${rota.tersBaslik} hizmeti: sigortalı evden eve nakliyat, küçük nakliye ve parça eşya taşıma. Adana ${rota.ad} arası yaklaşık ${rota.mesafe} km, teslim ${rota.teslimGun}. Ücretsiz ekspertiz ve yazılı fiyat.`

  return {
    title: baslik,
    description: aciklama,
    keywords:
      kayit?.meta_keywords ||
      `${rota.rotaAdi.toLowerCase()}, ${rota.tersBaslik.toLowerCase()}, adana ${rota.ad.toLowerCase()} evden eve nakliyat, adana ${rota.ad.toLowerCase()} parça eşya taşıma, adana ${rota.ad.toLowerCase()} nakliye fiyatları`,
    openGraph: {
      title: baslik,
      description: aciklama,
      url,
      type: 'article',
      images: kayit?.og_image ? [{ url: kayit.og_image }] : undefined,
    },
    alternates: { canonical: kayit?.canonical_url || url },
  }
}

export default async function RotaSayfasi({ params }) {
  const { slug } = await params
  const veri = await sayfaVerisi(slug)
  if (!veri) notFound()

  const { rota, ayarlar, menu, hizmetler, kayit } = veri
  const telefon = ayarAl(ayarlar, 'telefon', '05057805551')
  const whatsapp = ayarAl(ayarlar, 'whatsapp', '905057805551')

  const fiyatSecenekleri = fiyatAyarlari(ayarlar)
  const fiyatlar = fiyatSecenekleri.goster ? fiyatTablosu(rota, ayarlar) : []
  const bolumler = rotaBolumleri(rota)
  const makale = rotaMakalesi(rota)
  const sorular = rotaSSS(rota, fiyatlar)
  const komsular = ilgiliRotalar(rota, 10)
  const url = `${SITE_URL}/rota/${slug}`

  const ozetSatirlari = [
    { etiket: 'Güzergah', deger: `Adana → ${rota.ad}`, ikon: FaRoute },
    { etiket: 'Yaklaşık Mesafe', deger: `${rota.mesafe} km`, ikon: FaMapMarkedAlt },
    { etiket: 'Ortalama Teslim', deger: rota.teslimGun, ikon: FaClock },
    { etiket: 'Bölge', deger: rota.bolgeAdi, ikon: FaTruck },
  ]

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Anasayfa', item: SITE_URL },
          { '@type': 'ListItem', position: 2, name: 'Nakliye Rotaları', item: `${SITE_URL}/rota` },
          { '@type': 'ListItem', position: 3, name: rota.rotaAdi, item: url },
        ],
      },
      {
        '@type': 'Service',
        name: rota.tersBaslik,
        serviceType: 'Evden Eve Nakliyat',
        url,
        description: `Adana ${rota.ad} arası sigortalı evden eve nakliyat, küçük nakliye ve parça eşya taşıma hizmeti.`,
        provider: {
          '@type': 'MovingCompany',
          name: 'Adana Nakliye',
          telephone: `+9${telefon.replace(/\D/g, '')}`,
          url: SITE_URL,
        },
        areaServed: [
          { '@type': 'City', name: 'Adana' },
          { '@type': rota.tip === 'il' ? 'City' : 'AdministrativeArea', name: rota.ad },
        ],
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

  const linkGruplari = [
    {
      baslik: `${rota.il} içinde`,
      linkler: [
        { href: ilHizmetUrl(rota.ilSlug), metin: `${rota.il} Nakliye Hizmetleri` },
        ...komsular
          .filter((k) => k.ilSlug === rota.ilSlug)
          .slice(0, 8)
          .map((k) => ({ href: k.url, metin: k.rotaAdi })),
      ],
    },
    {
      baslik: `${rota.bolgeAdi} rotaları`,
      linkler: komsular
        .filter((k) => k.ilSlug !== rota.ilSlug)
        .slice(0, 9)
        .map((k) => ({ href: k.url, metin: k.rotaAdi })),
    },
    {
      baslik: 'Adana nakliye hizmetleri',
      linkler: (hizmetler || []).slice(0, 6).map((h) => ({ href: `/hizmet/${h.slug}`, metin: h.baslik })),
    },
    {
      baslik: 'Tüm rotalar',
      linkler: [
        { href: '/rota', metin: 'Adana Çıkışlı Tüm Nakliye Rotaları' },
        { href: '/nakliye-hizmetleri', metin: 'İllere Göre Nakliye Hizmetleri' },
        { href: '/teklif-al', metin: 'Ücretsiz Teklif Al' },
      ],
    },
  ]

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Header ayarlar={ayarlar} menu={menu} />

      <main id="main-content">
        <section className="py-14 md:py-20" style={{ background: 'linear-gradient(135deg, #0b63e5 0%, #0450bb 100%)' }}>
          <div className="container mx-auto px-4">
            <nav aria-label="Sayfa yolu" className="flex flex-wrap items-center gap-2 text-white text-sm mb-4">
              <Link href="/" className="hover:text-white underline-offset-2 hover:underline">Anasayfa</Link>
              <FaChevronRight className="text-[10px]" aria-hidden="true" />
              <Link href="/rota" className="hover:text-white underline-offset-2 hover:underline">Nakliye Rotaları</Link>
              <FaChevronRight className="text-[10px]" aria-hidden="true" />
              <span className="text-white font-medium">{rota.rotaAdi}</span>
            </nav>

            <h1 className="text-3xl md:text-5xl font-bold text-white tracking-tight">{rota.rotaAdi}</h1>
            <p className="mt-3 text-lg md:text-xl text-white font-medium">{rota.tersBaslik}</p>
            <p className="mt-4 max-w-3xl text-white leading-relaxed">
              {kayit?.ozet || rotaGirisMetni(rota)}
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href={`tel:${telefon}`}
                className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 font-bold text-[#0b5bd3] shadow-md hover:bg-slate-100"
              >
                <FaPhone aria-hidden="true" /> {telefon}
              </a>
              <a
                href={`https://wa.me/${whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl bg-[#1a8d47] px-6 py-3 font-bold text-white shadow-md hover:bg-[#15753a]"
              >
                <FaWhatsapp size={20} aria-hidden="true" /> WhatsApp'tan Yaz
              </a>
              <Link
                href="/teklif-al"
                className="inline-flex items-center gap-2 rounded-xl border-2 border-white px-6 py-3 font-bold text-white hover:bg-white/10"
              >
                Ücretsiz Teklif Al
              </Link>
            </div>
          </div>
        </section>

        <section className="border-b border-slate-200 bg-white py-8">
          <div className="container mx-auto px-4">
            <h2 className="sr-only">{rota.rotaAdi} güzergah bilgileri</h2>
            <dl className="grid grid-cols-2 gap-4 md:grid-cols-4">
              {ozetSatirlari.map((satir) => (
                <div key={satir.etiket} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <dt className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-600">
                    <satir.ikon aria-hidden="true" className="text-[#0b5bd3]" /> {satir.etiket}
                  </dt>
                  <dd className="mt-2 text-lg font-bold text-[#1e3a5f]">{satir.deger}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        <section className="py-12 md:py-16">
          <div className="container mx-auto px-4">
            <div className="grid gap-10 lg:grid-cols-3">
              <div className="lg:col-span-2">
                {bolumler.map((bolum) => (
                  <section key={bolum.id} id={bolum.id} className="mb-10 scroll-mt-28">
                    <h2 className="text-2xl md:text-3xl font-bold text-[#1e3a5f] mb-4">{bolum.baslik}</h2>
                    {bolum.paragraflar.map((p, i) => (
                      <p key={i} className="mb-4 leading-relaxed text-slate-700">{p}</p>
                    ))}
                  </section>
                ))}

                {fiyatlar.length > 0 && (
                  <section id="fiyatlar" className="mb-10 scroll-mt-28">
                    <h2 className="text-2xl md:text-3xl font-bold text-[#1e3a5f] mb-4">
                      Adana {rota.ad} Nakliye Fiyatları {new Date().getFullYear()}
                    </h2>
                    <p className="mb-5 leading-relaxed text-slate-700">
                      Aşağıdaki tablo, yaklaşık {rota.mesafe} km'lik Adana {rota.ad} güzergahı için hazırlanmıştır.
                      Tutarlar ambalaj, söküm, taşıma, montaj ve sigortayı kapsar.
                    </p>
                    <RotaFiyatTablosu
                      satirlar={fiyatlar}
                      baslik={`Adana ${rota.ad} nakliye fiyat tablosu`}
                      not={kayit?.fiyat_notu || (fiyatSecenekleri.guncelleme
                        ? `Fiyatlar ${fiyatSecenekleri.guncelleme} tarihinde güncellenmiştir ve tahminidir. Kesin fiyat ücretsiz ekspertiz sonrası yazılı olarak verilir.`
                        : undefined)}
                    />
                  </section>
                )}

                {rota.ilceler && rota.ilceler.length > 0 && (
                  <section id="ilceler" className="mb-10 scroll-mt-28">
                    <h2 className="text-2xl md:text-3xl font-bold text-[#1e3a5f] mb-4">
                      {rota.il} İçinde Hizmet Verdiğimiz İlçeler ve Bölgeler
                    </h2>
                    <p className="mb-4 leading-relaxed text-slate-700">
                      {rota.il}, {rota.bolgeAdi} sınırlarında
                      {rota.tip === 'ilce' && rota.tur === 'belde'
                        ? `; ${rota.ad}, ${rota.il} ilinin ${rota.bagliIlce} ilçesine bağlı`
                        : ''}
                      . Aşağıdaki ilçelerin tamamına Adana çıkışlı evden eve nakliyat, küçük nakliye ve
                      parça eşya taşıma hizmeti veriyoruz.
                    </p>
                    <ul className="flex flex-wrap gap-2">
                      {rota.ilceler.map((ilce) => (
                        <li
                          key={ilce}
                          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700"
                        >
                          {ilce}
                        </li>
                      ))}
                    </ul>
                  </section>
                )}

                {kayit?.icerik && (
                  <section
                    className="prose prose-slate max-w-none mb-10 prose-headings:text-[#1e3a5f]"
                    dangerouslySetInnerHTML={{ __html: kayit.icerik }}
                  />
                )}

                <article id="makale" className="mb-4 scroll-mt-28">
                  <h2 className="text-2xl md:text-3xl font-bold text-[#1e3a5f] mb-4">
                    {kayit?.makale_baslik || makale.baslik}
                  </h2>
                  {kayit?.makale ? (
                    <div
                      className="prose prose-slate max-w-none prose-headings:text-[#1e3a5f]"
                      dangerouslySetInnerHTML={{ __html: kayit.makale }}
                    />
                  ) : (
                    makale.paragraflar.map((p, i) => (
                      <p key={i} className="mb-4 leading-relaxed text-slate-700">{p}</p>
                    ))
                  )}
                </article>

                <RotaSSS sorular={sorular} baslik={`Adana ${rota.ad} Nakliye Hakkında Sık Sorulan Sorular`} />
                <IcLinkAgi gruplar={linkGruplari} baslik="Bu Sayfayla İlgili Diğer Sayfalar" />
              </div>

              <aside className="space-y-6">
                <div className="sticky top-28 rounded-2xl border border-slate-100 bg-white p-7 shadow-lg">
                  <h2 className="mb-2 text-xl font-bold text-[#1e3a5f]">{rota.ad} İçin Teklif Alın</h2>
                  <p className="mb-5 text-sm text-slate-600">
                    Ekspertiz ücretsiz. Eşya listesi çıkarılır, fiyat yazılı verilir ve taşıma günü değişmez.
                  </p>
                  <div className="flex flex-col gap-3">
                    <a
                      href={`tel:${telefon}`}
                      className="flex items-center justify-center gap-3 rounded-xl bg-[#046ffb] py-4 font-bold text-white shadow-md transition-all hover:bg-[#1e3a5f]"
                    >
                      <FaPhone aria-hidden="true" /> {telefon}
                    </a>
                    <a
                      href={`https://wa.me/${whatsapp}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-3 rounded-xl bg-[#1a8d47] py-4 font-bold text-white shadow-md transition-all hover:opacity-90"
                    >
                      <FaWhatsapp size={22} aria-hidden="true" /> WhatsApp
                    </a>
                    <Link
                      href="/teklif-al"
                      className="flex items-center justify-center gap-3 rounded-xl border-2 border-[#046ffb] py-4 font-bold text-[#0b5bd3] transition-all hover:bg-blue-50"
                    >
                      Formu Doldur
                    </Link>
                  </div>

                  <div className="mt-8">
                    <h3 className="mb-3 border-b pb-2 font-bold text-[#1e3a5f]">Sayfa İçeriği</h3>
                    <ul className="space-y-2 text-sm">
                      {[...bolumler.map((b) => ({ id: b.id, baslik: b.baslik })),
                        ...(fiyatlar.length ? [{ id: 'fiyatlar', baslik: `Adana ${rota.ad} Nakliye Fiyatları` }] : []),
                        { id: 'ilceler', baslik: `${rota.il} İlçeleri` },
                        { id: 'makale', baslik: 'Taşınma Rehberi' },
                      ].map((b) => (
                        <li key={b.id}>
                          <a href={`#${b.id}`} className="block py-1 font-medium text-slate-600 hover:text-[#0b5bd3]">
                            {b.baslik}
                          </a>
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
