export const revalidate = 86400

import Link from 'next/link'
import { FaChevronRight, FaPhone, FaWhatsapp } from 'react-icons/fa'

import Header from '@/components/Header'
import Footer from '@/components/Footer'
import StickyButtons from '@/components/StickyButtons'
import IcLinkAgi from '@/components/IcLinkAgi'

import { SITE_URL, ayarAl, siteVerisi } from '@/lib/site-verisi'
import { HIZMET_SAYFALARI, hizmetSayfaUrl } from '@/lib/hizmet-sayfalari'
import { ILCELER, SEMTLER, ilceSemtleri, semtUrl } from '@/lib/semtler'

export async function generateMetadata() {
  const url = `${SITE_URL}/nakliyat`
  return {
    title: 'Adana Semtlerinde Nakliyat - Semt Semt Nakliyeci ve Hamal',
    description: `Adana'nın ${SEMTLER.length} merkezi semtinde nakliyat, hamal, pikap taşıma ve evden eve nakliye. Semtinizin sayfasından fiyat ve hizmet bilgisi.`,
    keywords:
      'adana semt nakliyeci, adana mahalle nakliyat, adana hamal, adana evden eve nakliye, seyhan nakliyeci, çukurova nakliyeci, yüreğir nakliyeci, sarıçam nakliyeci',
    openGraph: { title: 'Adana Semtlerinde Nakliyat', description: 'Semt semt nakliyeci, hamal ve ev taşıma.', url },
    alternates: { canonical: url },
  }
}

export default async function SemtlerSayfasi() {
  const { ayarlar, menu, hizmetler } = await siteVerisi()
  const telefon = ayarAl(ayarlar, 'telefon', '05051774097')
  const whatsapp = ayarAl(ayarlar, 'whatsapp', '905051774097')

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Anasayfa', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Adana Semtleri', item: `${SITE_URL}/nakliyat` },
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
              <span className="font-medium">Adana Semtleri</span>
            </nav>
            <h1 className="text-3xl font-bold tracking-tight text-white md:text-5xl">
              Adana Semtlerinde Nakliyat
            </h1>
            <p className="mt-4 max-w-3xl leading-relaxed text-white">
              Seyhan, Çukurova, Yüreğir ve Sarıçam&apos;a bağlı {SEMTLER.length} merkezi semtte evden eve nakliyat,
              hamal, pikap taşıma ve mobilya montajı yapıyoruz. Semtinizin sayfasında o semte özel bilgiler,
              fiyat aralığı ve sık sorulan sorular var.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href={`tel:${telefon}`} className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 font-bold text-[#0b5bd3] shadow-md hover:bg-slate-100">
                <FaPhone aria-hidden="true" /> {telefon}
              </a>
              <a href={`https://wa.me/${whatsapp}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-xl bg-[#1a8d47] px-6 py-3 font-bold text-white shadow-md hover:bg-[#15753a]">
                <FaWhatsapp size={20} aria-hidden="true" /> WhatsApp
              </a>
            </div>
          </div>
        </section>

        <section className="py-12 md:py-16">
          <div className="container mx-auto px-4">
            {ILCELER.map((ilce) => {
              const semtler = ilceSemtleri(ilce.slug)
              return (
                <section key={ilce.slug} className="mb-12">
                  <div className="mb-5 flex flex-wrap items-baseline justify-between gap-2">
                    <h2 className="text-2xl font-bold text-[#1e3a5f] md:text-3xl">
                      <Link href={semtUrl(ilce.slug)} className="hover:underline">
                        {ilce.ad} Nakliyeci
                      </Link>
                    </h2>
                    <span className="text-sm text-slate-500">{semtler.length} semt</span>
                  </div>
                  <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {semtler.map((s) => (
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
              )
            })}

            <IcLinkAgi
              baslik="Hizmet Sayfaları"
              gruplar={[
                {
                  baslik: 'Adana içi hizmetler',
                  linkler: HIZMET_SAYFALARI.map((s) => ({ href: hizmetSayfaUrl(s.slug), metin: s.baslik })),
                },
                {
                  baslik: 'Şehir dışına taşıma',
                  linkler: [
                    { href: '/rota', metin: 'Tüm Nakliye Rotaları' },
                    { href: '/sehirler-arasi-nakliye', metin: 'Şehirler Arası Nakliye' },
                    { href: '/nakliyeciler-sitesi', metin: 'Nakliyeciler Sitesi' },
                    { href: '/hizmetler', metin: 'Tüm Hizmetler' },
                  ],
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
