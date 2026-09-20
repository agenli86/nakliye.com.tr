export const revalidate = 86400

import Link from 'next/link'
import { FaChevronRight } from 'react-icons/fa'

import Header from '@/components/Header'
import Footer from '@/components/Footer'
import StickyButtons from '@/components/StickyButtons'

import { BOLGELER, BOLGE_SIRASI, ILLER } from '@/lib/iller'
import { SITE_URL, ayarAl, siteVerisi } from '@/lib/site-verisi'
import { sehirlerarasiUrl } from '@/lib/sehirlerarasi-icerik'

export async function generateMetadata() {
  return {
    title: 'Şehirler Arası Nakliye | 81 İl',
    description:
      '81 ilin tamamına şehirler arası nakliye: evden eve nakliyat, şehirler arası ev taşıma, şehirler arası küçük nakliye ve asansörlü taşıma. İlinizi seçin, fiyat tablosunu görün.',
    alternates: { canonical: `${SITE_URL}/sehirler-arasi-nakliye` },
  }
}

export default async function SehirlerArasiDizini() {
  const { ayarlar, menu, hizmetler } = await siteVerisi()
  const telefon = ayarAl(ayarlar, 'telefon', '05051774097')
  const whatsapp = ayarAl(ayarlar, 'whatsapp', '905051774097')

  const gruplar = new Map()
  for (const il of ILLER) {
    if (!gruplar.has(il.bolge)) gruplar.set(il.bolge, [])
    gruplar.get(il.bolge).push(il)
  }
  for (const [, liste] of gruplar) liste.sort((a, b) => a.ad.localeCompare(b.ad, 'tr'))

  return (
    <>
      <Header ayarlar={ayarlar} menu={menu} />
      <main id="main-content">
        <section className="py-16 md:py-20" style={{ background: 'linear-gradient(135deg, #1e3a5f 0%, #0b5bd3 100%)' }}>
          <div className="container mx-auto px-4">
            <nav aria-label="Sayfa yolu" className="mb-4 flex items-center gap-2 text-sm text-white">
              <Link href="/" className="inline-flex min-h-[24px] items-center hover:text-white hover:underline">Anasayfa</Link>
              <FaChevronRight className="text-[10px]" aria-hidden="true" />
              <span className="font-medium text-white">Şehirler Arası Nakliye</span>
            </nav>
            <h1 className="text-3xl font-bold tracking-tight text-white md:text-5xl">İllere Göre Şehirler Arası Nakliye</h1>
            <p className="mt-4 max-w-3xl leading-relaxed text-white">
              Adana çıkışlı filomuzla 81 ilin tamamına şehirler arası nakliye yapıyoruz. Her il sayfasında evden eve nakliyat, şehirler arası ev taşıma, şehirler arası küçük nakliye ve asansörlü taşıma için ayrı ayrı tahmini fiyat, teslim süresi ve taşınma rehberi var.
            </p>
          </div>
        </section>

        <section className="section">
          <div className="container mx-auto px-4">
            {BOLGE_SIRASI.filter((b) => gruplar.has(b)).map((bolge) => (
              <div key={bolge} className="mb-10">
                <h2 className="mb-4 text-xl font-bold text-[#1e3a5f] md:text-2xl">{BOLGELER[bolge]}</h2>
                <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {gruplar.get(bolge).map((il) => (
                    <li key={il.slug}>
                      <Link
                        href={sehirlerarasiUrl(il.slug)}
                        className="flex items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 transition-all hover:border-[#0561e0] hover:shadow-md"
                      >
                        <span className="font-semibold text-[#1e3a5f]">{il.ad} Şehirler Arası Nakliye</span>
                        <span className="text-xs font-medium text-slate-500">{String(il.plaka).padStart(2, '0')}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      </main>
      <Footer ayarlar={ayarlar} hizmetler={hizmetler} />
      <StickyButtons whatsapp={whatsapp} telefon={telefon} />
    </>
  )
}
