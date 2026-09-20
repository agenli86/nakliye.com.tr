-- =====================================================
-- ADANA NAKLİYE - SUPABASE VERİTABANI ŞEMASI (V2)
-- Tüm özellikler dahil
-- =====================================================

-- Önce mevcut tabloları temizle
DROP TABLE IF EXISTS iletisim_mesajlari CASCADE;
DROP TABLE IF EXISTS duyurular CASCADE;
DROP TABLE IF EXISTS galeri CASCADE;
DROP TABLE IF EXISTS sss CASCADE;
DROP TABLE IF EXISTS fiyatlar CASCADE;
DROP TABLE IF EXISTS makaleler CASCADE;
DROP TABLE IF EXISTS hizmetler CASCADE;
DROP TABLE IF EXISTS sliders CASCADE;
DROP TABLE IF EXISTS sayfalar CASCADE;
DROP TABLE IF EXISTS anasayfa_bolumleri CASCADE;
DROP TABLE IF EXISTS anasayfa_tablari CASCADE;
DROP TABLE IF EXISTS menu CASCADE;
DROP TABLE IF EXISTS seo_ayarlari CASCADE;
DROP TABLE IF EXISTS ayarlar CASCADE;

-- =====================================================
-- 1. AYARLAR (Site Genel Ayarları)
-- =====================================================
CREATE TABLE ayarlar (
    id SERIAL PRIMARY KEY,
    anahtar VARCHAR(100) UNIQUE NOT NULL,
    deger TEXT,
    tur VARCHAR(50) DEFAULT 'text',
    grup VARCHAR(50) DEFAULT 'genel',
    aciklama VARCHAR(255),
    sira INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

INSERT INTO ayarlar (anahtar, deger, tur, grup, aciklama, sira) VALUES
('site_adi', 'Adana Nakliye', 'text', 'genel', 'Site başlığı', 1),
('site_slogan', 'Güvenilir Evden Eve Nakliyat', 'text', 'genel', 'Site sloganı', 2),
('logo', '/resimler/adananakliye.png', 'image', 'genel', 'Site logosu', 3),
('favicon', '/resimler/adana-evden-eve-nakliyat.png', 'image', 'genel', 'Favicon', 4),
('footer_logo', '/resimler/adananakliye.png', 'image', 'genel', 'Footer logosu', 5),
('telefon', '05051774097', 'text', 'iletisim', 'Telefon', 1),
('telefon2', '', 'text', 'iletisim', 'İkinci telefon', 2),
('email', 'info@adananakliye.com.tr', 'text', 'iletisim', 'E-posta', 3),
('adres', 'Belediye Evleri, 84244. Sk. No:9 Adana / Çukurova', 'textarea', 'iletisim', 'Adres', 4),
('harita_embed', 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3186.0!2d35.3!3d37.0', 'textarea', 'iletisim', 'Google Maps', 5),
('whatsapp', '905051774097', 'text', 'iletisim', 'WhatsApp', 6),
('calisma_saatleri', 'Pazartesi - Pazar: 07:00 - 21:30', 'text', 'iletisim', 'Çalışma saatleri', 7),
('facebook', 'https://www.facebook.com/adanaevdenevetasima/', 'text', 'sosyal', 'Facebook', 1),
('instagram', 'https://www.instagram.com/adananabarajevdenevenakliyat/', 'text', 'sosyal', 'Instagram', 2),
('youtube', 'https://www.youtube.com/channel/UC8ZcBL6T-OELy9B_ykx79zQ', 'text', 'sosyal', 'YouTube', 3),
('twitter', '', 'text', 'sosyal', 'Twitter', 4),
('meta_title', 'Adana Nakliye | Evden Eve Nakliyat | 05051774097', 'text', 'seo', 'Meta başlık', 1),
('meta_description', 'Adana evden eve nakliyat fiyatlarında %25 indirim. Profesyonel Adana nakliye.', 'textarea', 'seo', 'Meta açıklama', 2),
('meta_keywords', 'adana nakliye, adana evden eve nakliyat', 'textarea', 'seo', 'Anahtar kelimeler', 3),
('og_image', '/resimler/adanaevdenevenakliyat.jpg', 'image', 'seo', 'OG Image', 4),
('google_analytics', 'G-FQBQFLNBJ8', 'text', 'seo', 'Google Analytics', 5),
('facebook_pixel', '779004901018883', 'text', 'seo', 'Facebook Pixel', 6),
('site_url', 'https://adananakliye.com.tr', 'text', 'seo', 'Site URL', 7),
('renk_primary', '#046ffb', 'color', 'tema', 'Ana renk (Mavi)', 1),
('renk_secondary', '#f59e0b', 'color', 'tema', 'İkincil renk (Sarı)', 2),
('arac_sayisi', '3', 'text', 'sayac', 'Araç sayısı', 1),
('asansor_sayisi', '1', 'text', 'sayac', 'Asansör sayısı', 2),
('tecrube_yili', '17', 'text', 'sayac', 'Tecrübe yılı', 3),
('mutlu_musteri', '7800', 'text', 'sayac', 'Mutlu müşteri', 4),
('copyright', 'Adana Nakliye © 2024 Tüm Hakları Saklıdır.', 'text', 'genel', 'Copyright', 20);

-- =====================================================
-- 2. ANASAYFA BÖLÜMLERİ
-- =====================================================
CREATE TABLE anasayfa_bolumleri (
    id SERIAL PRIMARY KEY,
    bolum_adi VARCHAR(100) UNIQUE NOT NULL,
    baslik VARCHAR(255),
    alt_baslik TEXT,
    icerik TEXT,
    resim VARCHAR(500),
    buton_metin VARCHAR(100),
    buton_link VARCHAR(255),
    aktif BOOLEAN DEFAULT true,
    sira INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

INSERT INTO anasayfa_bolumleri (bolum_adi, baslik, alt_baslik, icerik, resim, buton_metin, buton_link, sira) VALUES
('slider_alti', 'Adana Evden Eve Nakliyat', 'Sitemize Hoşgeldiniz', 
'<p><strong>Adana Nakliye</strong>, müşteri memnuniyetini ön planda tutan evden eve nakliyat hizmetlerinde lider firmalardan biridir.</p><p>Profesyonel ekip ve modern ekipmanlarla eşyalarınız güvenle taşınır.</p>', 
'/resimler/anasayfa-hakkimizda.webp', 'Hakkımızda', '/hakkimizda', 1),
('hizmetler_baslik', 'Öne Çıkan Hizmetlerimiz', 'Profesyonel nakliyat hizmetlerimizle taşınma sürecinizi kolaylaştırıyoruz', NULL, NULL, 'Tüm Hizmetlerimiz', '/hizmetler', 2),
('fiyatlar_baslik', 'Adana Evden Eve Nakliyat Fiyatları', '2025 Güncel Fiyat Listesi', '<p><strong>Not:</strong> Fiyatlar tahmini olup, kesin fiyat için ücretsiz keşif hizmetimizden yararlanabilirsiniz.</p>', '/resimler/adanaevdenevenakliyatfiyatlari.jpg', 'Ücretsiz Keşif İçin Arayın', 'tel:05051774097', 3),
('sayac_baslik', 'Rakamlarla Biz', 'Yılların tecrübesi ve binlerce mutlu müşteri', NULL, NULL, NULL, NULL, 4),
('cta', 'Yardıma mı İhtiyacınız Var?', 'Uzman ekibimiz taşınma sürecinizde size yardımcı olmak için hazır.', NULL, NULL, 'Hemen Arayın', 'tel:05051774097', 5),
('blog_baslik', 'Son Makaleler', 'Nakliyat hakkında faydalı bilgiler ve ipuçları', NULL, NULL, 'Tüm Makaleler', '/blog', 6);

-- =====================================================
-- 3. ANASAYFA TABLARI (Tab içerikleri)
-- =====================================================
CREATE TABLE anasayfa_tablari (
    id SERIAL PRIMARY KEY,
    baslik VARCHAR(255) NOT NULL,
    icerik TEXT,
    resim VARCHAR(500),
    sira INT DEFAULT 0,
    aktif BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

INSERT INTO anasayfa_tablari (baslik, icerik, sira) VALUES
('Adana Evden Eve Nakliyat', 
'<p>Adana evden eve nakliyat hizmeti sunan firmamız, yılların deneyimi ve profesyonel ekibiyle sizlere güvenilir taşımacılık çözümleri sunmaktadır.</p><h3>Hizmet Kapsamımız</h3><ul><li>Ev eşyası taşıma</li><li>Ofis taşıma</li><li>Asansörlü nakliyat</li><li>Şehirler arası nakliyat</li></ul>', 1),
('Adana Nakliyat Fiyatları', 
'<p>Adana nakliyat fiyatları, taşınacak eşya miktarı, mesafe ve ek hizmetlere göre değişiklik göstermektedir.</p><h3>Fiyatı Etkileyen Faktörler</h3><ul><li>Eşya miktarı</li><li>Kat durumu</li><li>Mesafe</li><li>Paketleme</li></ul>', 2),
('Neden Bizi Tercih Etmelisiniz?', 
'<p>17 yılı aşkın tecrübemiz, profesyonel ekibimiz ve müşteri memnuniyeti odaklı çalışma anlayışımızla Adana''nın en güvenilir nakliyat firmalarından biriyiz.</p><h3>Avantajlarımız</h3><ul><li>Sigortalı Taşımacılık</li><li>Profesyonel Ekip</li><li>Modern Ekipman</li><li>7/24 Destek</li></ul>', 3);

-- =====================================================
-- 4. SLIDERS
-- =====================================================
CREATE TABLE sliders (
    id SERIAL PRIMARY KEY,
    baslik VARCHAR(255) NOT NULL,
    alt_baslik TEXT,
    resim VARCHAR(500) NOT NULL,
    buton_metin VARCHAR(100),
    buton_link VARCHAR(255),
    sira INT DEFAULT 0,
    aktif BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

INSERT INTO sliders (baslik, alt_baslik, resim, buton_metin, buton_link, sira) VALUES
('Adana Evden Eve Nakliyat', 'Adana evden eve nakliyat asansörlü taşımacılık hizmetleri', '/resimler/915-adana-evden-eve-nakliyat.webp', 'İNCELEYİN', '/hizmetler', 1);

-- =====================================================
-- 5. HİZMETLER
-- =====================================================
CREATE TABLE hizmetler (
    id SERIAL PRIMARY KEY,
    baslik VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    kisa_aciklama TEXT,
    icerik TEXT,
    resim VARCHAR(500),
    icon VARCHAR(100),
    sira INT DEFAULT 0,
    anasayfada_goster BOOLEAN DEFAULT true,
    aktif BOOLEAN DEFAULT true,
    meta_title VARCHAR(255),
    meta_description TEXT,
    meta_keywords VARCHAR(500),
    og_image VARCHAR(500),
    canonical_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

INSERT INTO hizmetler (baslik, slug, kisa_aciklama, icerik, resim, sira, meta_title, meta_description) VALUES
('Adana Asansörlü Nakliyat', 'adana-asansorlu-nakliyat', 'Modern asansör sistemleriyle hızlı ve güvenilir taşımacılık.', '<h2>Adana Asansörlü Nakliyat</h2><p>Asansörlü nakliyat hizmetlerimizle eşyalarınızı güvenle taşıyoruz.</p><ul><li>Modern asansör sistemleri</li><li>Profesyonel ekip</li><li>Sigortalı taşımacılık</li></ul>', '/resimler/901-adana-asansorlu-nakliyat.webp', 1, 'Adana Asansörlü Nakliyat - 05051774097', 'Adana asansörlü nakliyat hizmeti.'),
('Adana Şehir İçi Nakliye', 'adana-sehir-ici-nakliye', 'Şehir içi nakliyat hizmetleri.', '<h2>Şehir İçi Nakliye</h2><p>Adana şehir içi nakliyat hizmeti.</p>', '/resimler/207-adana-sehir-ici-nakliye.webp', 2, 'Adana Şehir İçi Nakliye - 05051774097', 'Adana şehir içi nakliye.'),
('Adana Şehirler Arası Nakliyat', 'adana-sehirler-arasi-nakliyat', 'Sigortalı şehirler arası nakliyat.', '<h2>Şehirler Arası Nakliyat</h2><p>Türkiye geneli nakliyat.</p>', '/resimler/782-adana-sehirler-arasi-nakliyat.webp', 3, 'Adana Şehirler Arası Nakliyat - 05051774097', 'Şehirler arası nakliyat.'),
('Adana Ofis Taşıma', 'adana-ofis-tasima', 'Profesyonel ofis taşıma.', '<h2>Ofis Taşıma</h2><p>Ofis taşıma hizmeti.</p>', '/resimler/338-adana-ofis-tasima.webp', 4, 'Adana Ofis Taşıma - 05051774097', 'Ofis taşıma hizmeti.'),
('Adana Asansör Kiralama', 'adana-asansor-kiralama', 'Mobil asansör kiralama.', '<h2>Asansör Kiralama</h2><p>Mobil asansör kiralama.</p>', '/resimler/843-adana-asansor-kiralama.webp', 5, 'Adana Asansör Kiralama - 05051774097', 'Asansör kiralama.'),
('Adana Kamyonet Nakliyat', 'adana-kamyonet-nakliyat', 'Ekonomik kamyonet nakliyat.', '<h2>Kamyonet Nakliyat</h2><p>Parça eşya taşıma.</p>', '/resimler/134-adana-kamyonet-nakliyat.webp', 6, 'Adana Kamyonet Nakliyat - 05051774097', 'Kamyonet nakliyat.');

-- =====================================================
-- 6. MAKALELER
-- =====================================================
CREATE TABLE makaleler (
    id SERIAL PRIMARY KEY,
    baslik VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    ozet TEXT,
    icerik TEXT,
    resim VARCHAR(500),
    kategori VARCHAR(100),
    etiketler TEXT,
    yazar VARCHAR(100) DEFAULT 'Admin',
    goruntulenme INT DEFAULT 0,
    aktif BOOLEAN DEFAULT true,
    meta_title VARCHAR(255),
    meta_description TEXT,
    meta_keywords VARCHAR(500),
    og_image VARCHAR(500),
    canonical_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

INSERT INTO makaleler (baslik, slug, ozet, icerik, resim, meta_title, meta_description) VALUES
('Sarıçam Nakliyeci', 'saricam-nakliyeci', 'Sarıçam nakliye hizmeti.', '<h2>Sarıçam Nakliyeci</h2><p>Sarıçam evden eve nakliyat.</p>', '/resimler/829-saricam-nakliyeci.webp', 'Sarıçam Nakliyeci - 05051774097', 'Sarıçam nakliyeci.'),
('Çukurova Nakliyeci', 'cukurova-nakliyeci', 'Çukurova nakliye hizmeti.', '<h2>Çukurova Nakliyeci</h2><p>Çukurova evden eve nakliyat.</p>', '/resimler/950-cukurova-nakliyeci.webp', 'Çukurova Nakliyeci - 05051774097', 'Çukurova nakliyeci.');

-- =====================================================
-- 7. SAYFALAR
-- =====================================================
CREATE TABLE sayfalar (
    id SERIAL PRIMARY KEY,
    baslik VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    icerik TEXT,
    resim VARCHAR(500),
    aktif BOOLEAN DEFAULT true,
    menude_goster BOOLEAN DEFAULT true,
    meta_title VARCHAR(255),
    meta_description TEXT,
    meta_keywords VARCHAR(500),
    og_image VARCHAR(500),
    canonical_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

INSERT INTO sayfalar (baslik, slug, icerik, resim, meta_title, meta_description) VALUES
('Hakkımızda', 'hakkimizda', '<h2>Adana Nakliye</h2><p>17 yıllık tecrübe ile güvenilir hizmet.</p>', '/resimler/201-hakkimizda.webp', 'Hakkımızda - Adana Nakliye', 'Adana Nakliye hakkında.'),
('İletişim', 'iletisim', '<h2>İletişim</h2><p>Bizimle iletişime geçin.</p>', NULL, 'İletişim - Adana Nakliye', 'Adana Nakliye iletişim.'),
('Galeri', 'galeri', '<h2>Galeri</h2><p>Çalışmalarımızdan kareler.</p>', NULL, 'Galeri - Adana Nakliye', 'Adana Nakliye galeri.');

-- =====================================================
-- 8. DUYURULAR (Kayan Duyuru Bandı)
-- =====================================================
CREATE TABLE duyurular (
    id SERIAL PRIMARY KEY,
    metin VARCHAR(500) NOT NULL,
    link VARCHAR(255),
    icon VARCHAR(10) DEFAULT '📢',
    sira INT DEFAULT 0,
    aktif BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

INSERT INTO duyurular (metin, icon, sira) VALUES
('📞 Ücretsiz keşif için hemen arayın!', '📞', 1),
('🚚 Adana ve çevresine hızlı teslimat', '🚚', 2),
('💰 Evden eve nakliyatta %25 indirim', '💰', 3),
('⭐ 7800+ mutlu müşteri', '⭐', 4);

-- =====================================================
-- 9. ÖZELLİK KUTUCUKLARI (AdWords Uyumlu)
-- =====================================================
CREATE TABLE ozellik_kutucuklari (
    id SERIAL PRIMARY KEY,
    baslik VARCHAR(255) NOT NULL,
    aciklama TEXT,
    icon VARCHAR(50) DEFAULT 'award',
    link VARCHAR(255),
    sira INT DEFAULT 0,
    aktif BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

INSERT INTO ozellik_kutucuklari (baslik, aciklama, icon, link, sira) VALUES
('%100 Garanti Veriyoruz', 'Adana evden eve nakliyat olarak şehir içi ya da şehirler arası taşıdığımız her yük için %100 garanti veriyoruz.', 'award', '/hakkimizda', 1),
('%100 Sigortalı Taşıyoruz', 'Eşyalarınızın boyutu ve değeri ne olursa olsun, teslim aldığımız andan itibaren nakliye sigortası ile özel olarak güvenceye alıyoruz.', 'shield', '/hizmetler', 2),
('En Uygun Fiyat Bizde', 'Hem kaliteli hem de uygun fiyatlı taşımacılık hizmetini yalnızca Adana Nakliye ayrıcalığı ile yaşayabilirsiniz.', 'money', '/teklif-al', 3);

-- =====================================================
-- 10. GALERİ
-- =====================================================
CREATE TABLE galeri (
    id SERIAL PRIMARY KEY,
    baslik VARCHAR(255),
    aciklama TEXT,
    resim VARCHAR(500) NOT NULL,
    kategori VARCHAR(100),
    sira INT DEFAULT 0,
    aktif BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

INSERT INTO galeri (baslik, resim, kategori, sira) VALUES
('Evden Eve Nakliyat', '/resimler/915-adana-evden-eve-nakliyat.webp', 'Nakliyat', 1),
('Asansörlü Taşıma', '/resimler/901-adana-asansorlu-nakliyat.webp', 'Asansör', 2),
('Şehir İçi Nakliye', '/resimler/207-adana-sehir-ici-nakliye.webp', 'Nakliyat', 3),
('Ofis Taşıma', '/resimler/338-adana-ofis-tasima.webp', 'Ofis', 4);

-- =====================================================
-- 9. SSS
-- =====================================================
CREATE TABLE sss (
    id SERIAL PRIMARY KEY,
    soru TEXT NOT NULL,
    cevap TEXT NOT NULL,
    sira INT DEFAULT 0,
    aktif BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

INSERT INTO sss (soru, cevap, sira) VALUES
('Nakliye fiyatları neye göre belirlenir?', 'Eşya miktarı, kat, mesafe ve ek hizmetlere göre belirlenir.', 1),
('Eşyalarım sigortalı mı?', 'Evet, tüm taşımalar sigortalıdır.', 2),
('Taşınma ne kadar sürer?', 'Ortalama 4-8 saat sürer.', 3),
('Paketleme yapıyor musunuz?', 'Evet, profesyonel paketleme hizmeti sunuyoruz.', 4),
('Hafta sonu çalışıyor musunuz?', 'Evet, 7/24 hizmet veriyoruz.', 5);

-- =====================================================
-- 10. FİYATLAR
-- =====================================================
CREATE TABLE fiyatlar (
    id SERIAL PRIMARY KEY,
    daire_tipi VARCHAR(100) NOT NULL,
    min_fiyat DECIMAL(10,2) NOT NULL,
    max_fiyat DECIMAL(10,2) NOT NULL,
    aciklama TEXT,
    sira INT DEFAULT 0,
    aktif BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

INSERT INTO fiyatlar (daire_tipi, min_fiyat, max_fiyat, sira) VALUES
('1+1 Evden Eve Nakliyat', 8000, 10000, 1),
('2+1 Evden Eve Nakliyat', 13000, 15000, 2),
('3+1 Evden Eve Nakliyat', 14000, 17000, 3),
('4+1 Evden Eve Nakliyat', 15000, 18000, 4),
('5+1 Evden Eve Nakliyat', 17000, 20000, 5);

-- =====================================================
-- 11. İLETİŞİM MESAJLARI
-- =====================================================
CREATE TABLE iletisim_mesajlari (
    id SERIAL PRIMARY KEY,
    ad_soyad VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    telefon VARCHAR(50),
    konu VARCHAR(255),
    mesaj TEXT NOT NULL,
    okundu BOOLEAN DEFAULT false,
    ip_adresi VARCHAR(50),
    created_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- 12. MENÜ
-- =====================================================
CREATE TABLE menu (
    id SERIAL PRIMARY KEY,
    baslik VARCHAR(100) NOT NULL,
    link VARCHAR(255) NOT NULL,
    parent_id INT REFERENCES menu(id) ON DELETE SET NULL,
    sira INT DEFAULT 0,
    aktif BOOLEAN DEFAULT true,
    yeni_sekmede_ac BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

INSERT INTO menu (baslik, link, sira) VALUES
('Anasayfa', '/', 1),
('Hakkımızda', '/hakkimizda', 2),
('Hizmetler', '/hizmetler', 3),
('Galeri', '/galeri', 4),
('Blog', '/blog', 5),
('İletişim', '/iletisim', 6),
('S.S.S', '/sss', 7);

INSERT INTO menu (baslik, link, parent_id, sira) VALUES
('Adana Asansörlü Nakliyat', '/hizmet/adana-asansorlu-nakliyat', 3, 1),
('Adana Şehir İçi Nakliye', '/hizmet/adana-sehir-ici-nakliye', 3, 2),
('Adana Şehirler Arası Nakliyat', '/hizmet/adana-sehirler-arasi-nakliyat', 3, 3),
('Adana Ofis Taşıma', '/hizmet/adana-ofis-tasima', 3, 4),
('Adana Asansör Kiralama', '/hizmet/adana-asansor-kiralama', 3, 5),
('Adana Kamyonet Nakliyat', '/hizmet/adana-kamyonet-nakliyat', 3, 6);

-- =====================================================
-- 13. SEO AYARLARI
-- =====================================================
CREATE TABLE seo_ayarlari (
    id SERIAL PRIMARY KEY,
    sayfa_turu VARCHAR(50) NOT NULL,
    sayfa_slug VARCHAR(255),
    meta_title VARCHAR(255),
    meta_description TEXT,
    meta_keywords VARCHAR(500),
    og_image VARCHAR(500),
    canonical_url VARCHAR(500),
    robots VARCHAR(100) DEFAULT 'index, follow',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(sayfa_turu, sayfa_slug)
);

INSERT INTO seo_ayarlari (sayfa_turu, sayfa_slug, meta_title, meta_description, canonical_url) VALUES
('anasayfa', NULL, 'Adana Nakliye | Evden Eve Nakliyat | 05051774097', 'Adana evden eve nakliyat.', 'https://adananakliye.com.tr/'),
('hizmetler', NULL, 'Hizmetlerimiz | Adana Nakliye', 'Nakliye hizmetlerimiz.', 'https://adananakliye.com.tr/hizmetler'),
('blog', NULL, 'Blog | Adana Nakliye', 'Nakliyat blog.', 'https://adananakliye.com.tr/blog'),
('iletisim', NULL, 'İletişim | Adana Nakliye', 'İletişim bilgileri.', 'https://adananakliye.com.tr/iletisim'),
('sss', NULL, 'S.S.S | Adana Nakliye', 'Sıkça sorulan sorular.', 'https://adananakliye.com.tr/sss'),
('galeri', NULL, 'Galeri | Adana Nakliye', 'Galeri.', 'https://adananakliye.com.tr/galeri'),
('hakkimizda', NULL, 'Hakkımızda | Adana Nakliye', 'Hakkımızda.', 'https://adananakliye.com.tr/hakkimizda');

-- =====================================================
-- RLS POLİTİKALARI
-- =====================================================
ALTER TABLE ayarlar ENABLE ROW LEVEL SECURITY;
ALTER TABLE anasayfa_bolumleri ENABLE ROW LEVEL SECURITY;
ALTER TABLE anasayfa_tablari ENABLE ROW LEVEL SECURITY;
ALTER TABLE sliders ENABLE ROW LEVEL SECURITY;
ALTER TABLE hizmetler ENABLE ROW LEVEL SECURITY;
ALTER TABLE makaleler ENABLE ROW LEVEL SECURITY;
ALTER TABLE sayfalar ENABLE ROW LEVEL SECURITY;
ALTER TABLE galeri ENABLE ROW LEVEL SECURITY;
ALTER TABLE sss ENABLE ROW LEVEL SECURITY;
ALTER TABLE fiyatlar ENABLE ROW LEVEL SECURITY;
ALTER TABLE iletisim_mesajlari ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu ENABLE ROW LEVEL SECURITY;
ALTER TABLE seo_ayarlari ENABLE ROW LEVEL SECURITY;
ALTER TABLE duyurular ENABLE ROW LEVEL SECURITY;
ALTER TABLE ozellik_kutucuklari ENABLE ROW LEVEL SECURITY;

-- Public read
CREATE POLICY "Public read ayarlar" ON ayarlar FOR SELECT USING (true);
CREATE POLICY "Public read anasayfa_bolumleri" ON anasayfa_bolumleri FOR SELECT USING (true);
CREATE POLICY "Public read anasayfa_tablari" ON anasayfa_tablari FOR SELECT USING (true);
CREATE POLICY "Public read sliders" ON sliders FOR SELECT USING (true);
CREATE POLICY "Public read hizmetler" ON hizmetler FOR SELECT USING (true);
CREATE POLICY "Public read makaleler" ON makaleler FOR SELECT USING (true);
CREATE POLICY "Public read sayfalar" ON sayfalar FOR SELECT USING (true);
CREATE POLICY "Public read galeri" ON galeri FOR SELECT USING (true);
CREATE POLICY "Public read sss" ON sss FOR SELECT USING (true);
CREATE POLICY "Public read fiyatlar" ON fiyatlar FOR SELECT USING (true);
CREATE POLICY "Public read menu" ON menu FOR SELECT USING (true);
CREATE POLICY "Public read seo_ayarlari" ON seo_ayarlari FOR SELECT USING (true);
CREATE POLICY "Public read duyurular" ON duyurular FOR SELECT USING (true);
CREATE POLICY "Public read ozellik_kutucuklari" ON ozellik_kutucuklari FOR SELECT USING (true);
CREATE POLICY "Public insert iletisim" ON iletisim_mesajlari FOR INSERT WITH CHECK (true);

-- Auth full
CREATE POLICY "Auth full ayarlar" ON ayarlar FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Auth full anasayfa_bolumleri" ON anasayfa_bolumleri FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Auth full anasayfa_tablari" ON anasayfa_tablari FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Auth full sliders" ON sliders FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Auth full hizmetler" ON hizmetler FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Auth full makaleler" ON makaleler FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Auth full sayfalar" ON sayfalar FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Auth full galeri" ON galeri FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Auth full sss" ON sss FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Auth full fiyatlar" ON fiyatlar FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Auth full iletisim" ON iletisim_mesajlari FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Auth full menu" ON menu FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Auth full seo_ayarlari" ON seo_ayarlari FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Auth full duyurular" ON duyurular FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Auth full ozellik_kutucuklari" ON ozellik_kutucuklari FOR ALL USING (auth.role() = 'authenticated');

-- Updated at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column() RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ language 'plpgsql';

CREATE TRIGGER update_ayarlar_updated_at BEFORE UPDATE ON ayarlar FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_anasayfa_bolumleri_updated_at BEFORE UPDATE ON anasayfa_bolumleri FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_anasayfa_tablari_updated_at BEFORE UPDATE ON anasayfa_tablari FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_sliders_updated_at BEFORE UPDATE ON sliders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_hizmetler_updated_at BEFORE UPDATE ON hizmetler FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_makaleler_updated_at BEFORE UPDATE ON makaleler FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_sayfalar_updated_at BEFORE UPDATE ON sayfalar FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_galeri_updated_at BEFORE UPDATE ON galeri FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_sss_updated_at BEFORE UPDATE ON sss FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_fiyatlar_updated_at BEFORE UPDATE ON fiyatlar FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_menu_updated_at BEFORE UPDATE ON menu FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_seo_ayarlari_updated_at BEFORE UPDATE ON seo_ayarlari FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_duyurular_updated_at BEFORE UPDATE ON duyurular FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_ozellik_kutucuklari_updated_at BEFORE UPDATE ON ozellik_kutucuklari FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- ZİYARETÇİ ANALİZ TABLOSU
-- =====================================================
CREATE TABLE ziyaretciler (
    id SERIAL PRIMARY KEY,
    
    -- Temel Bilgiler
    fingerprint VARCHAR(100),
    ip_adresi VARCHAR(50),
    
    -- Konum Bilgileri
    ulke VARCHAR(100),
    il VARCHAR(100),
    ilce VARCHAR(100),
    enlem DECIMAL(10, 8),
    boylam DECIMAL(11, 8),
    konum_izni BOOLEAN DEFAULT false,
    
    -- Cihaz Bilgileri
    cihaz_turu VARCHAR(50), -- mobile, tablet, desktop
    cihaz_markasi VARCHAR(100), -- Samsung, Apple, Xiaomi vs
    cihaz_modeli VARCHAR(100),
    isletim_sistemi VARCHAR(100),
    isletim_versiyonu VARCHAR(50),
    tarayici VARCHAR(100),
    tarayici_versiyonu VARCHAR(50),
    
    -- Ekran Bilgileri
    ekran_genislik INT,
    ekran_yukseklik INT,
    ekran_pixel_ratio DECIMAL(4,2),
    
    -- Donanım Bilgileri
    cpu_core INT,
    ram_gb INT,
    gpu_vendor VARCHAR(100),
    gpu_renderer VARCHAR(255),
    
    -- Kaynak Bilgileri
    referrer TEXT,
    giris_sayfasi TEXT,
    utm_source VARCHAR(100),
    utm_medium VARCHAR(100),
    utm_campaign VARCHAR(100),
    utm_term VARCHAR(100),
    utm_content VARCHAR(100),
    
    -- Ek Bilgiler
    dil VARCHAR(20),
    timezone VARCHAR(100),
    baglanti_turu VARCHAR(50), -- 4g, wifi, ethernet
    pil_seviyesi INT,
    sarjda_mi BOOLEAN,
    
    -- Oturum Bilgileri
    sayfa_goruntulenme INT DEFAULT 1,
    son_sayfa TEXT,
    oturum_suresi INT DEFAULT 0,
    
    -- Zaman
    ilk_giris TIMESTAMP DEFAULT NOW(),
    son_giris TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Index'ler
CREATE INDEX idx_ziyaretciler_fingerprint ON ziyaretciler(fingerprint);
CREATE INDEX idx_ziyaretciler_ip ON ziyaretciler(ip_adresi);
CREATE INDEX idx_ziyaretciler_tarih ON ziyaretciler(created_at);
CREATE INDEX idx_ziyaretciler_il ON ziyaretciler(il);

-- RLS
ALTER TABLE ziyaretciler ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public insert ziyaretciler" ON ziyaretciler FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update ziyaretciler" ON ziyaretciler FOR UPDATE USING (true);
CREATE POLICY "Auth read ziyaretciler" ON ziyaretciler FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Auth full ziyaretciler" ON ziyaretciler FOR ALL USING (auth.role() = 'authenticated');
