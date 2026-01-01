/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Resimlerin görünmeme sorununu buradaki '**' ile çözdük.
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
      { protocol: 'http', hostname: '**' },
    ],
    formats: ['image/webp', 'image/avif'], 
    deviceSizes: [640, 750, 828, 1080, 1200], 
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
    minimumCacheTTL: 31536000,
  },
  compress: true,
  poweredByHeader: false,
  reactStrictMode: false,
  swcMinify: true, 
  async redirects() {
    return [
      { source: '/index.html', destination: '/', permanent: true },
      { source: '/index.php', destination: '/', permanent: true },
      { source: '/hakkimizda.html', destination: '/hakkimizda', permanent: true },
      { source: '/hizmetler.html', destination: '/hizmetler', permanent: true },
      { source: '/blog.html', destination: '/blog', permanent: true },
      { source: '/galeri.html', destination: '/galeri', permanent: true },
      { source: '/iletisim.html', destination: '/iletisim', permanent: true },
      { source: '/teklif-al.html', destination: '/teklif-al', permanent: true },
    ];
  },
  async headers() {
    return [
      {
        source: '/:all*(svg|jpg|jpeg|png|gif|ico|webp|avif)',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, stale-while-revalidate=59' }],
      },
    ];
  },
};
module.exports = nextConfig;
