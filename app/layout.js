import './globals.css'
import { Toaster } from 'react-hot-toast'
import { Inter } from 'next/font/google'
import Script from 'next/script'
import dynamic from 'next/dynamic'

// Kritik olmayan component'ler - lazy load
const VisitorTracker = dynamic(() => import('@/components/VisitorTracker'), { ssr: false })
const FraudDetector = dynamic(() => import('@/components/FraudDetector'), { ssr: false })
const CookieBanner = dynamic(() => import('@/components/CookieBanner'), { ssr: false })

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap', // Yazı tipi yüklenene kadar sistem fontunu gösterir (LCP hızlanır)
  variable: '--font-inter',
  adjustFontFallback: true, 
})

export const metadata = {
  metadataBase: new URL('https://www.adananakliye.com.tr'),
  title: 'Adana Nakliye | Evden Eve Nakliyat | 05057805551',
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
  themeColor: '#046ffb',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({ children }) {
  return (
    <html lang="tr" className={`${inter.variable} scroll-smooth`}>
      <head>
        <link rel="icon" href="/resimler/adana-evden-eve-nakliyat.png" />
        
        {/* Preconnect - Bağlantıları daha sıkı hale getirdik */}
        <link rel="preconnect" href="https://www.googletagmanager.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://connect.facebook.net" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
        
        {/* Yapılandırılmış Veri (Schema) */}
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
              "telephone": "+905057805551",
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
              }
            })
          }}
        />
      </head>
      <body className={inter.className}>
        <FraudDetector />
        <VisitorTracker />
        <CookieBanner />
        
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: { borderRadius: '10px', padding: '16px' },
          }}
        />
        
        <main id="main-content">{children}</main>
        
        {/* --- GOOGLE ANALYTICS --- */}
        <Script 
          src="https://www.googletagmanager.com/gtag/js?id=G-FQBQFLNBJ8"
          strategy="lazyOnload" 
        />
        <Script id="google-analytics" strategy="lazyOnload">
          {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','G-FQBQFLNBJ8');`}
        </Script>

        {/* --- GOOGLE ADS TAG (YENİ EKLENEN) --- */}
        <Script 
          src="https://www.googletagmanager.com/gtag/js?id=AW-10842738572"
          strategy="lazyOnload" 
        />
        <Script id="google-ads" strategy="lazyOnload">
          {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config', 'AW-10842738572');`}
        </Script>
        
        {/* --- FACEBOOK PIXEL --- */}
        <Script id="facebook-pixel" strategy="lazyOnload">
          {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','779004901018883');fbq('track','PageView');`}
        </Script>
      </body>
    </html>
  )
}
