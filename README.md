# Adana Nakliye - Next.js Web Sitesi

Modern, SEO dostu ve yönetim panelli nakliyat firması web sitesi.

## 🚀 Özellikler

- ✅ Next.js 14 (App Router)
- ✅ Supabase veritabanı ve auth
- ✅ Responsive tasarım (Tailwind CSS)
- ✅ Admin paneli (tüm içerikler yönetilebilir)
- ✅ SEO optimizasyonu
- ✅ Eski URL yönlendirmeleri (301)
- ✅ WhatsApp ve telefon sticky butonları
- ✅ İletişim formu
- ✅ Fiyat tablosu
- ✅ Blog/Makale sistemi
- ✅ Hizmetler sayfaları
- ✅ SSS (Accordion)
- ✅ Sayaç animasyonları
- ✅ Google Analytics & Facebook Pixel

## 📋 Kurulum

### 1. Bağımlılıkları Yükleyin

```bash
npm install
```

### 2. Supabase Kurulumu

1. [Supabase](https://supabase.com) hesabı oluşturun
2. Yeni proje oluşturun
3. SQL Editor'e gidin ve `supabase-schema.sql` dosyasını çalıştırın
4. Storage > New Bucket > "resimler" adında public bucket oluşturun

### 3. Environment Variables

`.env.local.example` dosyasını `.env.local` olarak kopyalayın:

```bash
cp .env.local.example .env.local
```

Supabase bilgilerinizi girin:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.xxxxx
```

### 4. Admin Kullanıcı Oluşturma

Supabase Dashboard > Authentication > Users > Add user

- Email: admin@adananakliye.com.tr
- Password: güçlü bir şifre

### 5. Geliştirme Sunucusunu Başlatın

```bash
npm run dev
```

Site: http://localhost:3000
Admin: http://localhost:3000/admin

## 📁 Proje Yapısı

```
adana-nakliye-nextjs/
├── app/
│   ├── admin/           # Admin paneli sayfaları
│   ├── blog/            # Blog listesi
│   ├── hakkimizda/      # Hakkımızda sayfası
│   ├── hizmet/[slug]/   # Hizmet detay
│   ├── hizmetler/       # Hizmetler listesi
│   ├── iletisim/        # İletişim sayfası
│   ├── makale/[slug]/   # Makale detay
│   ├── sss/             # Sıkça Sorulan Sorular
│   ├── globals.css      # Global stiller
│   ├── layout.js        # Ana layout
│   └── page.js          # Anasayfa
├── components/          # React bileşenleri
├── lib/                 # Supabase client
├── public/resimler/     # Resimler
├── middleware.js        # Auth middleware
├── next.config.js       # Next.js config (yönlendirmeler)
├── supabase-schema.sql  # Veritabanı şeması
└── tailwind.config.js   # Tailwind config
```

## 🔄 URL Yönlendirmeleri

Eski HTML siteden yeni URL'lere 301 yönlendirmeler:

| Eski URL | Yeni URL |
|----------|----------|
| /index.html | / |
| /hakkimizda.html | /hakkimizda |
| /hizmetler.html | /hizmetler |
| /adana-asansorlu-nakliyat.html | /hizmet/adana-asansorlu-nakliyat |
| /blog.html | /blog |
| /iletisim.html | /iletisim |
| /sikca-sorulan-sorular.html | /sss |

## 🛠️ Admin Paneli

Admin paneline `/admin` adresinden erişin.

### Yönetilebilir İçerikler:
- **Ayarlar**: Site adı, telefon, email, sosyal medya, logo vb.
- **Sliders**: Ana sayfa slider'ları
- **Hizmetler**: Hizmet sayfaları (CRUD)
- **Makaleler**: Blog yazıları (CRUD)
- **Fiyatlar**: Fiyat tablosu
- **SSS**: Sıkça sorulan sorular
- **Menü**: Site menüsü
- **Mesajlar**: İletişim formu mesajları

## 🚀 Yayınlama

### Vercel (Önerilen)

1. [Vercel](https://vercel.com) hesabı oluşturun
2. GitHub'a push edin
3. Vercel'de import edin
4. Environment variables ekleyin
5. Deploy!

### Diğer Hostingler

```bash
npm run build
npm run start
```

## 📞 İletişim Bilgileri

- **Telefon**: 05057805551
- **Email**: info@adananakliye.com.tr
- **Firma**: Adana Nakliye

## 📄 Lisans

Bu proje özel kullanım içindir.
