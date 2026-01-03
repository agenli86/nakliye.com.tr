import './globals.css'
import { Toaster } from 'react-hot-toast'
import { Inter } from 'next/font/google'
import Script from 'next/script'
import dynamic from 'next/dynamic'

// Kritik olmayan component'ler - SSR kapalı, prefetch kapalı
const VisitorTracker = dynamic(() => import('@/components/VisitorTracker'), { 
  ssr: false,
  loading: () => null 
})
const FraudDetector = dynamic(() => import('@/components/FraudDetector'), { 
  ssr: false,
  loading: () => null 
})
const CookieBanner = dynamic(() => import('@/components/CookieBanner'), { 
  ssr: false,
  loading: () => null 
})

// Font optimizasyonu - preload ile
const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
  preload: true, // Font'u önceden yükle
  adjustFontFallback: true,
  fallback: ['system-ui', 'arial'], // Fallback font'lar
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
    images: [
      {
        url: 'https://www.adananakliye.com.tr/resimler/adanaevdenevenakliyat.jpg',
        width: 1200,
        height: 630,
        alt: 'Adana Evden Eve Nakliyat'
      }
    ]
  },
  twitter: { 
    card: 'summary_large_image',
    title: 'Adana Nakliye | Evden Eve Nakliyat',
    description: 'Adana evden eve nakliyat fiyatlarında %25 indirim dönemi.'
  },
  robots: { 
    index: true, 
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    }
  },
  alternates: { canonical: 'https://www.adananakliye.com.tr' },
  verification: {
    google: 'your-google-verification-code', // Google Search Console verification ekle
  }
}

export const viewport = {
  themeColor: '#046ffb',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5, // Zoom izni
}

export default function RootLayout({ children }) {
  return (
    <html lang="tr" className={`${inter.variable} scroll-smooth`}>
      <head>
        {/* Favicon */}
        <link rel="icon" href="/resimler/adana-evden-eve-nakliyat.png" />
        <link rel="apple-touch-icon" href="/resimler/adana-evden-eve-nakliyat.png" />
        
        {/* 🚀 LCP Hızlandırma: Ana görseli yüksek öncelikle önceden yükle */}
        <link 
          rel="preload" 
          href="/resimler/adanaevdenevenakliyat.jpg" 
          as="image" 
          fetchPriority="high"
          type="image/jpeg"
        />
        
        {/* 🚀 DNS Prefetch & Preconnect - Dış kaynaklara bağlantıyı hızlandırır */}
        <link rel="preconnect" href="https://www.googletagmanager.com" />
        <link rel="preconnect" href="https://www.google-analytics.com" />
        <link rel="preconnect" href="https://connect.facebook.net" />
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
        <link rel="dns-prefetch" href="https://connect.facebook.net" />
        
        {/* 🚀 Yapılandırılmış Veri (Schema) - SEO için */}
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
              },
              "sameAs": [
                "https://www.facebook.com/adananakliye",
                "https://www.instagram.com/adananakliye"
              ]
            })
          }}
        />
        
        {/* 🚀 BreadcrumbList Schema - Sayfalara göre dinamik olacak */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "BreadcrumbList",
              "itemListElement": [{
                "@type": "ListItem",
                "position": 1,
                "name": "Ana Sayfa",
                "item": "https://www.adananakliye.com.tr/"
              }]
            })
          }}
        />
      </head>
      
      <body className={inter.className}>
        {/* Kritik olmayan tracker'lar - Lazy load */}
        <FraudDetector />
        <VisitorTracker />
        <CookieBanner />
        
        {/* Toast Bildirimleri */}
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: { 
              borderRadius: '10px', 
              padding: '16px',
              fontSize: '14px'
            },
            success: {
              iconTheme: {
                primary: '#10b981',
                secondary: '#fff',
              },
            },
          }}
        />
        
        {/* Ana İçerik */}
        <main id="main-content">{children}</main>
        
        {/* 📊 GOOGLE TAG MANAGER - TEK BİR SCRIPT İLE TÜM TRACKING */}
        {/* Bu yöntem daha hızlı ve yönetimi kolay */}
        <Script 
          id="gtm"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
              new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
              j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
              'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
              })(window,document,'script','dataLayer','GTM-XXXXXX');
            `
          }}
        />
        
        {/* 📊 GOOGLE ANALYTICS - Optimize edilmiş */}
        <Script 
          src="https://www.googletagmanager.com/gtag/js?id=G-FQBQFLNBJ8"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-FQBQFLNBJ8', {
              page_path: window.location.pathname,
              send_page_view: true
            });
          `}
        </Script>

        {/* 📊 GOOGLE ADS & TELEFON CONVERSION - Optimize edilmiş */}
        <Script 
          src="https://www.googletagmanager.com/gtag/js?id=AW-10842738572"
          strategy="afterInteractive"
        />
        <Script id="google-ads-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'AW-10842738572');
            
            // Telefon Dönüşüm Takibi
            gtag('config', 'AW-10842738572/28z6CO6-69sbEIyfnLIo', {
              'phone_conversion_number': '05057805551'
            });
          `}
        </Script>
        
        {/* 📱 FACEBOOK PIXEL - Optimize edilmiş */}
        <Script id="facebook-pixel" strategy="afterInteractive">
          {`
            !function(f,b,e,v,n,t,s){
              if(f.fbq)return;
              n=f.fbq=function(){
                n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)
              };
              if(!f._fbq)f._fbq=n;
              n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];
              t=b.createElement(e);t.async=!0;
              t.src=v;
              s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)
            }(window, document,'script','https://connect.facebook.net/en_US/fbevents.js');
            
            fbq('init', '779004901018883');
            fbq('track', 'PageView');
          `}
        </Script>
        
        {/* Facebook Pixel noscript fallback */}
        <noscript>
          <img 
            height="1" 
            width="1" 
            style={{display:'none'}}
            src="https://www.facebook.com/tr?id=779004901018883&ev=PageView&noscript=1"
            alt=""
          />
        </noscript>
      </body>
    </html>
  )
}
