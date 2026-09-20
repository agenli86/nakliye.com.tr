export const revalidate = 86400

import Link from 'next/link'
import { FaChevronRight, FaMapMarkedAlt } from 'react-icons/fa'

import Header from '@/components/Header'
import Footer from '@/components/Footer'
import StickyButtons from '@/components/StickyButtons'
import IcLinkAgi from '@/components/IcLinkAgi'

import { BOLGELER, BOLGE_SIRASI } from '@/lib/iller'
import { IL_ROTA_LISTESI, ILCE_ROTA_LISTESI, ROTALAR, rotalariBolgeyeGoreGrupla } from '@/lib/rotalar'
import { SITE_URL, ayarAl, siteVerisi } from '@/lib/site-verisi'

export async function generateMetadata() {
  return {
    title: 'Adana Çıkışlı Nakliye Rotaları | 81 İl ve Turistik İlçeler',
    description: `Adana'dan Türkiye'nin 81 iline ve ${ILCE_ROTA_LISTESI.length} turistik ilçeye evden eve nakliyat, küçük nakliye ve parça eşya taşıma. Mesafe, teslim süresi ve tahmini fiyatlarla ${ROTALAR.length} rota sayfası.`,
    alternates: { canonical: `${SITE_URL}/rota` },
    openGraph: {
      title: 'Adana Çıkışlı Nakliye Rotaları',
      description: `Adana'dan 81 ile ve turistik ilçelere nakliyat rotaları, mesafe ve tahmini fiyatlar.`,
      url: `${SITE_URL}/rota`,
    },
  }
}

export default async function RotaDizini() {
  const { ayarlar, menu, hizmetler } = await siteVerisi()
  const telefon = ayarAl(ayarlar, 'telefon', '05051774097')
  const whatsapp = ayarAl(ayarlar, 'whatsapp', '905051774097')
  const gruplar = rotalariBolgeyeGoreGrupla(IL_ROTA_LISTESI)

  const ilceGruplari = new Map()
  for (const rota of ILCE_ROTA_LISTESI) {
    if (!ilceGruplari.has(rota.il)) ilceGruplari.set(rota.il, [])
    ilceGruplari.get(rota.il).push(rota)
  }
  const sirali = [...ilceGruplari.entries()].sort((a, b) => a[0].localeCompare(b[0], 'tr'))

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Anasayfa', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Nakliye Rotaları', item: `${SITE_URL}/rota` },
    ],
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Header ayarlar={ayarlar} menu={menu} />
      <main id="main-content">
        <section className="py-16 md:py-20" style={{ background: 'linear-gradient(135deg, #0b63e5 0%, #0450bb 100%)' }}>
          <div className="container mx-auto px-4">
            <nav aria-label="Sayfa yolu" className="mb-4 flex items-center gap-2 text-sm text-white">
              <Link href="/" className="inline-flex min-h-[24px] items-center hover:text-white hover:underline">Anasayfa</Link>
              <FaChevronRight className="text-[10px]" aria-hidden="true" />
              <span className="font-medium text-white">Nakliye Rotaları</span>
            </nav>
            <h1 className="text-3xl font-bold tracking-tight text-white md:text-5xl">Adana Çıkışlı Nakliye Rotaları</h1>
            <p className="mt-4 max-w-3xl leading-relaxed text-white">
              Adana&apos;dan Türkiye&apos;nin 81 iline ve {ILCE_ROTA_LISTESI.length} turistik ilçeye düzenli sefer
              yapıyoruz. Her rota sayfasında yaklaşık mesafe, teslim süresi, evden eve nakliyat, küçük nakliye ve
              parça eşya taşıma bilgileri ile tahmini fiyat tablosu bulunuyor.
            </p>
          </div>
        </section>

        <section className="section">
          <div className="container mx-auto px-4">
            <h2 className="mb-2 text-2xl font-bold text-[#1e3a5f] md:text-3xl">İllere Göre Rotalar</h2>
            <p className="mb-8 text-slate-600">Bölgesine göre sıralanmış {IL_ROTA_LISTESI.length} il rotası.</p>

            {BOLGE_SIRASI.filter((b) => gruplar.has(b)).map((bolge) => (
              <div key={bolge} className="mb-10">
                <h3 className="mb-4 flex items-center gap-2 text-xl font-bold text-[#1e3a5f]">
                  <FaMapMarkedAlt aria-hidden="true" className="text-[#0b5bd3]" /> {BOLGELER[bolge]}
                </h3>
                <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {gruplar.get(bolge).map((rota) => (
                    <li key={rota.rotaSlug}>
                      <Link
                        href={rota.url}
                        className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 transition-all hover:border-[#0561e0] hover:shadow-md"
                      >
                        <span className="font-semibold text-[#1e3a5f]">{rota.rotaAdi}</span>
                        <span className="whitespace-nowrap text-xs font-medium text-slate-500">~{rota.mesafe} km</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        <section className="section bg-slate-50">
          <div className="container mx-auto px-4">
            <h2 className="mb-2 text-2xl font-bold text-[#1e3a5f] md:text-3xl">İlçe ve Turistik Bölge Rotaları</h2>
            <p className="mb-8 text-slate-600">
              Fethiye, Kemer, Çeşme, Ayvalık, Bodrum ve Alanya gibi yaz aylarında talebin arttığı noktalara ayrı
              rota sayfaları hazırladık.
            </p>
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {sirali.map(([il, rotalar]) => (
                <div key={il}>
                  <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">{il}</h3>
                  <ul className="space-y-2">
                    {rotalar.map((rota) => (
                      <li key={rota.rotaSlug}>
                        <Link href={rota.url} className="block py-1 font-medium text-[#0b5bd3] hover:underline">
                          {rota.rotaAdi}
                          {rota.tur === 'belde' && (
                            <span className="ml-1 text-xs font-normal text-slate-500">({rota.bagliIlce})</span>
                          )}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="section">
          <div className="container mx-auto px-4">
            <IcLinkAgi
              baslik="Diğer Sayfalar"
              gruplar={[
                {
                  baslik: 'İl hizmet sayfaları',
                  linkler: [{ href: '/nakliye-hizmetleri', metin: 'İllere Göre Nakliye Hizmetleri' }],
                },
                {
                  baslik: 'Adana nakliye hizmetleri',
                  linkler: (hizmetler || []).map((h) => ({ href: `/hizmet/${h.slug}`, metin: h.baslik })),
                },
              ]}
            />
          </div>
        </section>
      </main>
      <Footer ayarlar={ayarlar} hizmetler={hizmetler} />
      <StickyButtons whatsapp={whatsapp} telefon={telefon} />
    </>
  )
}
