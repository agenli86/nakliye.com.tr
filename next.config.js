/** @type {import('next').NextConfig} */
const nextConfig = {
  // 🚀 Resim Optimizasyonu
  images: {
    // ⚠️ GÜVENLİK: '**' yerine spesifik domainler kullan
    // Şu an tüm domainlere izin veriyor, risk var
    remotePatterns: [
      // Kendi domain'in
      { protocol: 'https', hostname: 'adananakliye.com.tr' },
      { protocol: 'https', hostname: 'www.adananakliye.com.tr' },
      // Supabase storage (eğer kullanıyorsan)
      { protocol: 'https', hostname: '*.supabase.co' },
      // CDN veya diğer güvenli kaynaklar buraya
    ],
    // Yalnızca WebP. AVIF daha küçük dosya üretiyor ama üretmesi çok
    // pahalı: kaynak görselin 750 piksellik sürümü ölçüldüğünde AVIF'e
    // kodlama 683 ms, WebP'ye kodlama 43 ms sürdü. Bu bedel önbellekte
    // karşılığı olmayan her istekte ödeniyor; hero görseli sayfanın LCP
    // öğesi olduğu için doğrudan LCP'ye yazılıyor. Kazanılan 5,6 kB yavaş
    // 4G'de ancak 30 ms'lik bir aktarım demek, yani 640 ms'lik kodlama
    // gecikmesinin yanında önemsiz.
    formats: ['image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840], // Büyük ekranlar eklendi
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384], // 384 eklendi
    minimumCacheTTL: 31536000, // 1 yıl - iyi
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },

  // 🚀 Performans
  compress: true,
  poweredByHeader: false,
  reactStrictMode: true, // ✅ true yapıldı (best practice)
  swcMinify: true,

  // 🚀 Paket içe aktarma optimizasyonu
  //
  // react-icons ve swiper "barrel" dosyalar üzerinden içe aktarılıyor
  // (react-icons/fa tek dosyada binlerce ikon export eder). Bu ayar
  // Next.js'in yalnızca gerçekten kullanılan export'ları paketlemesini
  // sağlar.
  //
  // Not: Buradaki özel splitChunks yapılandırması kaldırıldı. Tüm
  // node_modules'ü paket adına göre tek tek chunk'lara bölerken
  // pratikte her şeyi 137 kB'lık tek bir "npm.next" chunk'ına topluyor
  // ve Next.js'in kendi ayarlı chunk stratejisini devre dışı bırakıyordu.
  experimental: {
    optimizePackageImports: ['react-icons', 'swiper', '@tiptap/react', '@tiptap/starter-kit'],
  },

  // 🚀 Compiler Optimizasyonları
  compiler: {
    // Production'da console.log'ları kaldır
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
  },

  // 🔗 Redirects
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

  // 🔒 Security & Performance Headers
  async headers() {
    return [
      // Resim dosyaları için cache
      {
        source: '/:all*(svg|jpg|jpeg|png|gif|ico|webp|avif)',
        headers: [
          { 
            key: 'Cache-Control', 
            value: 'public, max-age=31536000, immutable' // immutable eklendi
          }
        ],
      },
      // Font dosyaları için cache
      {
        source: '/:all*(woff|woff2|ttf|otf|eot)',
        headers: [
          { 
            key: 'Cache-Control', 
            value: 'public, max-age=31536000, immutable'
          }
        ],
      },
      // Tüm sayfalar için security headers
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()'
          }
        ],
      },
    ];
  },

  // 🚀 Diğer Optimizasyonlar
  trailingSlash: false,
  generateEtags: true,
  productionBrowserSourceMaps: false, // Source map'leri kapat (daha küçük bundle)
};

module.exports = nextConfig;
