/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Burayı 'hostname' bazlı yaparak güvenliği ve hızı artırıyoruz
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'www.adananakliye.com.tr',
      },
      {
        protocol: 'https',
        hostname: 'hvkwboukgzblmqvjcyjt.supabase.co', // Supabase kullanıyorsan burası kalsın
      },
    ],
    // Avif çok iyidir ama işlemciyi yorar, WebP öncelikli kalsın
    formats: ['image/webp', 'image/avif'], 
    // Gereksiz büyük boyutları eledik, hızı artırdık
    deviceSizes: [640, 750, 828, 1080, 1200], 
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
    minimumCacheTTL: 31536000,
  },
  
  compress: true, // Gzip sıkıştırmasını açtık
  poweredByHeader: false, // Güvenlik için kapattık
  reactStrictMode: false, // Üretim modunda hız için false yapılabilir (opsiyonel)
  
  // Sayfa geçişlerini hızlandırmak için deneysel olmayan ama etkili özellikler
  swcMinify: true, 
  
  async redirects() {
    return [
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
      { source: '/saricam-nakliyeci.html', destination: '/makale/saricam-nakliyeci', permanent: true },
      { source: '/cukurova-nakliyeci.html', destination: '/makale/cukurova-nakliyeci', permanent: true },
      { source: '/seyhan-nakliyeci.html', destination: '/makale/seyhan-nakliyeci', permanent: true },
      { source: '/yuregir-nakliyeci.html', destination: '/makale/yuregir-nakliyeci', permanent: true },
      { source: '/adana-nakliye-fiyatlari.html', destination: '/makale/adana-nakliye-fiyatlari', permanent: true },
      { source: '/evden-eve-nakliyat-fiyatlari.html', destination: '/makale/adana-nakliye-fiyatlari', permanent: true },
      { source: '/hizmetler/:slug.html', destination: '/hizmet/:slug', permanent: true },
      { source: '/blog/:slug.html', destination: '/makale/:slug', permanent: true },
      { source: '/makale/:slug.html', destination: '/makale/:slug', permanent: true },
      { source: '/sayfa/:slug.html', destination: '/:slug', permanent: true },
    ];
  },

  async headers() {
    return [
      {
        source: '/:all*(svg|jpg|jpeg|png|gif|ico|webp|avif)',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, stale-while-revalidate=59' },
        ],
      },
      {
        source: '/:path*',
        headers: [
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' }, // SEO ve Güvenlik için eklendi
        ],
      },
    ];
  },
};

module.exports = nextConfig;
