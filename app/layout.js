import './globals.css'
import { Toaster } from 'react-hot-toast'
import { Inter } from 'next/font/google'
import dynamic from 'next/dynamic'
import DeferredAnalytics from '@/components/DeferredAnalytics'
import { resimYolu } from '@/lib/resim'

// Kritik olmayan component'ler - lazy load
const VisitorTracker = dynamic(() => import('@/components/VisitorTracker'), { ssr: false })
const FraudDetector = dynamic(() => import('@/components/FraudDetector'), { ssr: false })

// latin-ext alt kümesi Türkçe karakterler (ş ğ İ ı ç ö ü) için gerekli.
// Yalnızca 'latin' yüklendiğinde bu harfler sistem yazı tipine düşüyor,
// bu da metnin iki farklı fontla çizilmesine ve düzen kaymasına yol açıyor.
// adjustFontFallback, font inene kadar kullanılan yedek fontun ölçülerini
// Inter'a yaklaştırarak kaymayı (CLS) sıfıra indirir.
const inter = Inter({
  subsets: ['latin', 'latin-ext'],
  display: 'swap',
  variable: '--font-inter',
  adjustFontFallback: true,
  // preload kapalı. İki alt küme birlikte 134 kB ediyor ve preload onları
  // hero görseliyle aynı öncelik sınıfına koyuyordu; yavaş 4G'de bu 134 kB
  // hattı doldurup LCP öğesi olan hero görselini geciktiriyordu. Yazı tipi
  // artık CSS ayrıştırılınca normal öncelikle iniyor. Metin bu sürede
  // yedek fontla çiziliyor, adjustFontFallback ölçüleri Inter'a eşitlediği
  // için geçiş sırasında düzen kaymıyor.
  preload: false,
})

export const metadata = {
  metadataBase: new URL('https://www.adananakliye.com.tr'),
  title: 'Adana Nakliye | Evden Eve Nakliyat | 05051774097',
  description: 'Adana evden eve nakliyat fiyatlarında %25 indirim dönemi. Profesyonel Adana nakliye şehir içi şehirler arası nakliyat ev taşımacılık için bize ulaşın.',
  keywords: 'adana nakliye, adana evden eve nakliyat, adana nakliyat, evden eve taşımacılık',
  openGraph: {
    title: 'Adana Nakliye | Evden Eve Nakliyat',
    description: 'Adana evden eve nakliyat fiyatlarında %25 indirim dönemi.',
    url: 'https://www.adananakliye.com.tr',
    siteName: 'Adana Nakliye',
    locale: 'tr_TR',
    type: 'website',
  },
  twitter: { card: 'summary_large_image' },
  robots: { index: true, follow: true },
  alternates: { canonical: 'https://www.adananakliye.com.tr' },
}

export const viewport = {
  themeColor: '#0561e0',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({ children }) {
  return (
    <html lang="tr" className={inter.variable}>
      <head>
        {/* Sekme simgesini tarayıcı her şeyden uzun süre saklıyor; dosyanın
            içeriği değiştiğinde adres de değişmezse eski logo aylarca
            ekranda kalıyor. resimYolu sürüm damgasını ekliyor. */}
        <link rel="icon" href={resimYolu('/resimler/adana-evden-eve-nakliyat.png')} />
        {/* Preconnect yalnızca ilk boyamayı gerçekten etkileyen kaynak için.
            Her preconnect bir TCP+TLS el sıkışması demek; analitik ve takip
            alan adları artık sayfa yüklendikten sonra çağrıldığı için
            onlara daha ucuz olan dns-prefetch yetiyor. api.ipify.org ve
            nominatim tamamen kaldırıldı, artık hiç çağrılmıyorlar. */}
        <link rel="preconnect" href="https://hvkwboukgzblmqvjcyjt.supabase.co" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
        <link rel="dns-prefetch" href="https://connect.facebook.net" />
        <link rel="dns-prefetch" href="https://ipapi.co" />
        
        {/* JSON-LD LocalBusiness */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "MovingCompany",
              "name": "Adana Nakliye",
              "url": "https://www.adananakliye.com.tr/",
              "logo": "https://www.adananakliye.com.tr/resimler/adananakliye.png",
              "image": "https://www.adananakliye.com.tr/resimler/adanaevdenevenakliyat.jpg",
              "description": "Adana evden eve nakliyat fiyatlarında %25 indirim. Profesyonel nakliye hizmeti.",
              "telephone": "+905051774097",
              "email": "info@adananakliye.com.tr",
              "priceRange": "₺₺",
              "address": {
                "@type": "PostalAddress",
                "streetAddress": "Belediye Evleri, 84244 Sokak No:9",
                "addressLocality": "Çukurova",
                "addressRegion": "Adana",
                "postalCode": "01170",
                "addressCountry": "TR"
              },
              "geo": {
                "@type": "GeoCoordinates",
                "latitude": "36.9914",
                "longitude": "35.3308"
              },
              "openingHoursSpecification": {
                "@type": "OpeningHoursSpecification",
                "dayOfWeek": ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"],
                "opens": "07:00",
                "closes": "21:30"
              },
              "aggregateRating": {
                "@type": "AggregateRating",
                "ratingValue": "4.9",
                "reviewCount": "7800"
              },
              "sameAs": [
                "https://www.facebook.com/adanaevdenevetasima/",
                "https://www.instagram.com/adananabarajevdenevenakliyat/",
                "https://www.youtube.com/channel/UC8ZcBL6T-OELy9B_ykx79zQ"
              ]
            })
          }}
        />
      </head>
      <body className={inter.className}>
        <FraudDetector />
        <VisitorTracker />
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: { borderRadius: '10px', padding: '16px' },
          }}
        />
        {children}
        
        {/* Analitik ve pixel kodları: ilk etkileşime ya da 5. saniyeye
            kadar hiç indirilmiyor (bkz. components/DeferredAnalytics.js). */}
        <DeferredAnalytics />
      </body>
    </html>
  )
}
