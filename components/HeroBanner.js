import Link from 'next/link'
import { FaPhone } from 'react-icons/fa'

/**
 * Anasayfa hero alanı.
 *
 * Banner'ın kendisi iki ayrı görsel: masaüstünde 2048x768 geniş afiş,
 * mobilde 1254x1254 kare afiş. İkisinin de metni görselin içine basılı
 * olduğu için üstlerine yazı ya da koyu degrade konmuyor; sayfanın H1'i
 * ve tanıtım metni banner'ın altında, gerçek metin olarak duruyor.
 *
 * Neden `<picture>` ve neden next/image değil:
 *  - Sanat yönü gerekiyor. next/image tek bir kaynaktan türetiyor, oysa
 *    burada mobil ve masaüstü için farklı kadraj isteniyor. `<picture>`
 *    media sorgusuyla yalnızca bir görseli indiriyor; iki <Image>'i CSS
 *    ile gizlemek ikisini birden indirtirdi.
 *  - Boyutlar önceden üretildiği için /_next/image hiç devreye girmiyor.
 *    Görsel optimizasyonu önbellekte karşılığı olmayan ilk istekte
 *    yüzlerce milisaniye sürebiliyor; statik dosyada o bedel yok.
 *
 * width/height hem <source> hem <img> üzerinde: tarayıcı en boy oranını
 * daha görsel inmeden biliyor, iki kırılımda da düzen kaymıyor.
 */

const GENIS = [768, 1024, 1280, 1536, 2048]
const KARE = [414, 520, 640, 750, 780, 828, 1024, 1254]

const srcSet = (base, genislikler) =>
  genislikler.map((w) => `/resimler/${base}-${w}.webp ${w}w`).join(', ')

export default function HeroBanner({ telefon }) {
  return (
    <section aria-label="Adana Nakliye tanıtım afişi" className="bg-white">
      <picture>
        <source
          media="(min-width: 768px)"
          type="image/webp"
          srcSet={srcSet('adana-nakliye-banner-genis', GENIS)}
          sizes="100vw"
          width={2048}
          height={768}
        />
        <img
          src="/resimler/adana-nakliye-banner-kare-828.webp"
          srcSet={srcSet('adana-nakliye-banner-kare', KARE)}
          sizes="100vw"
          width={1254}
          height={1254}
          alt="Adana Nakliye - evden eve nakliyat, şehir içi ve şehirler arası taşımacılık, asansörlü taşıma ve profesyonel ambalajlama"
          fetchPriority="high"
          decoding="async"
          className="block w-full h-auto"
        />
      </picture>

      {/* Butonlar telefonda tam genişlikte ve alt alta, sm'den itibaren yan
          yana. Bilerek sarmalı (flex-wrap) değil: yazı tipi yedek fontan
          Inter'a geçerken telefon numarasının genişliği birkaç piksel
          değişiyor, sarmalı dizilimde bu satır atlatıp altındaki her şeyi
          kaydırıyordu. Sabit dizilimde genişlik değişse de yükseklik aynı
          kalıyor, düzen kaymıyor. */}
      <div className="border-b border-slate-200 bg-slate-50">
        <div className="container mx-auto flex flex-col items-stretch justify-center gap-3 px-4 py-4 sm:flex-row sm:items-center">
          <Link
            href="/teklif-al"
            className="inline-flex min-h-[48px] items-center justify-center rounded-lg px-6 py-3 font-semibold shadow-sm transition-transform hover:scale-105"
            style={{ backgroundColor: '#d4ed31', color: '#1e3a5f' }}
          >
            ÜCRETSİZ TEKLİF AL
          </Link>
          <a
            href={`tel:${telefon}`}
            className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-lg border-2 border-[#0561e0] px-6 py-3 font-semibold text-[#0561e0] transition-colors hover:bg-[#0561e0] hover:text-white"
          >
            {/* İkon boyutu rem ile sabit. react-icons varsayılanı 1em, yani
                yedek fonttan Inter'a geçildiğinde ikon da büyüyüp butonun
                yüksekliğini oynatıyor ve altındaki bölümü kaydırıyordu. */}
            <FaPhone aria-hidden="true" className="h-4 w-4 shrink-0" /> {telefon}
          </a>
        </div>
      </div>
    </section>
  )
}
