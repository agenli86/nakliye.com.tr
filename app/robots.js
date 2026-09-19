const SITE_URL = 'https://www.adananakliye.com.tr'

/**
 * robots.txt
 *
 * Crawl-delay kaldırıldı: Google bu direktifi yok sayar, Bing ve Yandex
 * ise dikkate alıp taramayı yavaşlatır — yani yalnızca zarar veriyordu.
 */
export default function robots() {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/', '/api/'],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  }
}
