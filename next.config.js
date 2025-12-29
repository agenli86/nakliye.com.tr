/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
    // Optimize images
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
    minimumCacheTTL: 31536000, // 1 yıl cache
  },
  
  // Compression
  compress: true,
  
  // PoweredBy Header kaldır
  poweredByHeader: false,
  
  // Strict Mode
  reactStrictMode: true,
  
  // SWC Minify (daha hızlı build)
  swcMinify: true,
  
  // Modular Imports - React Icons için bundle size küçültme
  modularizeImports: {
    'react-icons/fa': {
      transform: 'react-icons/fa/{{member}}',
    },
    'react-icons/hi': {
      transform: 'react-icons/hi/{{member}}',
    },
    'react-icons/md': {
      transform: 'react-icons/md/{{member}}',
    },
  },
  
  // Experimental optimizasyonlar
  experimental: {
    optimizeCss: true, // CSS optimize
  },
  
  // ESKİ HTML URL'LERİ YENİ NEXT.JS URL'LERİNE YÖNLENDİRME (301 - SEO DOSTU)
  async redirects() {
    return [
      // ANA SAYFALAR
      { source: '/index.html', destination: '/', permanent: true },
      { source: '/index.php', destination: '/', permanent: true },
      { source: '/anasayfa.html', destination: '/', permanent: true },
      { source: '/hakkimizda.html', destination: '/hakkimizda', permanent: true },
      { source: '/hakkimizda.php', destination: '/hakkimizda', permanent: true },
      { source: '/hizmetler.html', destination: '/hizmetler', permanent: true },
      { source: '/hizmetler.php', destination: '/hizmetler', permanent: true },
      { source: '/hizmetlerimiz.html', destination: '/hizmetler', permanent: true },
      { source: '/blog.html', destination: '/blog', permanent: true },
      { source: '/blog.php', destination: '/blog', permanent: true },
      { source: '/makaleler.html', destination: '/blog', permanent: true },
      { source: '/galeri.html', destination: '/galeri', permanent: true },
      { source: '/galeri.php', destination: '/galeri', permanent: true },
      { source: '/iletisim.html', destination: '/iletisim', permanent: true },
      { source: '/iletisim.php', destination: '/iletisim', permanent: true },
      { source: '/contact.html', destination: '/iletisim', permanent: true },
      { source: '/sikca-sorulan-sorular.html', destination: '/sss', permanent: true },
      { source: '/sss.html', destination: '/sss', permanent: true },
      { source: '/faq.html', destination: '/sss', permanent: true },
      { source: '/teklif-al.html', destination: '/teklif-al', permanent: true },
      { source: '/teklif.html', destination: '/teklif-al', permanent: true },
      
      // HİZMET SAYFALARI
      { source: '/adana-evden-eve-nakliyat.html', destination: '/hizmet/adana-evden-eve-nakliyat', permanent: true },
      { source: '/adana-asansorlu-nakliyat.html', destination: '/hizmet/adana-asansorlu-nakliyat', permanent: true },
      { source: '/adana-sehir-ici-nakliye.html', destination: '/hizmet/adana-sehir-ici-nakliye', permanent: true },
      { source: '/adana-sehirler-arasi-nakliyat.html', destination: '/hizmet/adana-sehirler-arasi-nakliyat', permanent: true },
      { source: '/adana-ofis-tasima.html', destination: '/hizmet/adana-ofis-tasima', permanent: true },
      { source: '/adana-asansor-kiralama.html', destination: '/hizmet/adana-asansor-kiralama', permanent: true },
      { source: '/adana-kamyonet-nakliyat.html', destination: '/hizmet/adana-kamyonet-nakliyat', permanent: true },
      { source: '/adana-ev-tasima.html', destination: '/hizmet/adana-ev-tasima', permanent: true },
      { source: '/adana-nakliyat.html', destination: '/hizmet/adana-nakliyat', permanent: true },
      { source: '/nakliye-adana.html', destination: '/hizmet/adana-nakliyat', permanent: true },
      { source: '/evden-eve-nakliyat.html', destination: '/hizmet/adana-evden-eve-nakliyat', permanent: true },
      { source: '/asansorlu-nakliyat.html', destination: '/hizmet/adana-asansorlu-nakliyat', permanent: true },
      { source: '/sehir-ici-nakliye.html', destination: '/hizmet/adana-sehir-ici-nakliye', permanent: true },
      { source: '/sehirler-arasi-nakliyat.html', destination: '/hizmet/adana-sehirler-arasi-nakliyat', permanent: true },
      { source: '/ofis-tasima.html', destination: '/hizmet/adana-ofis-tasima', permanent: true },
      { source: '/asansor-kiralama.html', destination: '/hizmet/adana-asansor-kiralama', permanent: true },
      { source: '/kamyonet-nakliyat.html', destination: '/hizmet/adana-kamyonet-nakliyat', permanent: true },
      
      // MAKALE / BLOG SAYFALARI
      { source: '/saricam-nakliyeci.html', destination: '/makale/saricam-nakliyeci', permanent: true },
      { source: '/cukurova-nakliyeci.html', destination: '/makale/cukurova-nakliyeci', permanent: true },
      { source: '/seyhan-nakliyeci.html', destination: '/makale/seyhan-nakliyeci', permanent: true },
      { source: '/yuregir-nakliyeci.html', destination: '/makale/yuregir-nakliyeci', permanent: true },
      { source: '/adana-nakliye-fiyatlari.html', destination: '/makale/adana-nakliye-fiyatlari', permanent: true },
      { source: '/evden-eve-nakliyat-fiyatlari.html', destination: '/makale/adana-nakliye-fiyatlari', permanent: true },
      
      // ESKİ KLASÖR YAPISI
      { source: '/hizmetler/:slug.html', destination: '/hizmet/:slug', permanent: true },
      { source: '/blog/:slug.html', destination: '/makale/:slug', permanent: true },
      { source: '/makale/:slug.html', destination: '/makale/:slug', permanent: true },
      { source: '/sayfa/:slug.html', destination: '/:slug', permanent: true },
    ];
  },
  
  // Headers - Cache ve Security
  async headers() {
    return [
      {
        source: '/:all*(svg|jpg|jpeg|png|gif|ico|webp|avif)',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      {
        source: '/:all*(js|css)',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      {
        source: '/:path*',
        headers: [
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
