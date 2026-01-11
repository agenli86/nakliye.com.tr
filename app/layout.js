import './globals.css'

export const metadata = {
  title: 'Adana Nakliye - Evden Eve Nakliyat',
  description: 'Adana nakliyat ve taşımacılık hizmetleri',
}

export default function RootLayout({ children }) {
  return (
    <html lang="tr">
      <head>
        <script dangerouslySetInnerHTML={{__html: `
          (function() {
            // Sayfa yüklenince ziyaretçi kaydet
            if (typeof window !== 'undefined') {
              window.addEventListener('load', function() {
                try {
                  // URL parametrelerini al
                  const params = new URLSearchParams(window.location.search);
                  const utmSource = params.get('utm_source');
                  const utmMedium = params.get('utm_medium');
                  const utmCampaign = params.get('utm_campaign');
                  const gclid = params.get('gclid');
                  const fbclid = params.get('fbclid');
                  const referrer = document.referrer || '';
                  
                  // Kaynak belirle
                  let source = 'direk';
                  if (gclid || (utmSource && utmSource.toLowerCase().includes('google'))) {
                    source = 'ads';
                  } else if (fbclid || (utmSource && utmSource.toLowerCase().includes('facebook'))) {
                    source = 'face';
                  } else if (referrer.includes('google.com') && !gclid) {
                    source = 'google_organik';
                  } else if (referrer && !referrer.includes(window.location.hostname)) {
                    source = 'referans';
                  }
                  
                  console.log('🔵 Ziyaretçi kaydediliyor:', source);
                  
                  // API'ye gönder
                  fetch('/api/track-visitor', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({
                      source: source,
                      medium: utmMedium || 'none',
                      campaign: utmCampaign || null,
                      referrer: referrer,
                      gclid: gclid || null,
                      fbclid: fbclid || null,
                      page: window.location.pathname,
                      fullUrl: window.location.href,
                      userAgent: navigator.userAgent
                    })
                  }).then(r => r.json()).then(data => {
                    console.log('✅ Kaydedildi:', data);
                  }).catch(err => {
                    console.error('❌ Hata:', err);
                  });
                } catch(e) {
                  console.error('Tracking error:', e);
                }
              });
            }
          })();
        `}} />
      </head>
      <body>{children}</body>
    </html>
  )
}
