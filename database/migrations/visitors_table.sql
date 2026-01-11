-- ============================================
-- ADANA NAKLİYE - ZİYARETÇİ TAKİP SİSTEMİ
-- ============================================
-- Bu script Supabase SQL Editor'de çalıştırılmalıdır
-- Dashboard > SQL Editor > New Query

-- Mevcut tablo varsa sil (DİKKAT: Tüm veriler silinir!)
DROP TABLE IF EXISTS visitors CASCADE;

-- Yeni visitors tablosu
CREATE TABLE visitors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Session tracking
  session_id TEXT NOT NULL,
  ip_address TEXT,

  -- KAYNAK BİLGİLERİ - ÖNEMLİ!
  -- 'ads' = Google Ads
  -- 'face' = Facebook
  -- 'direk' = Doğrudan giriş
  -- 'instagram', 'twitter', 'google_organik', 'arama_motoru', 'referans'
  source TEXT NOT NULL DEFAULT 'direk',
  medium TEXT DEFAULT 'none',
  campaign TEXT,

  -- Tracking parametreleri
  referrer TEXT,
  gclid TEXT,  -- Google Ads Click ID
  fbclid TEXT, -- Facebook Click ID

  -- Sayfa bilgileri
  page TEXT,
  full_url TEXT,

  -- Cihaz bilgileri
  user_agent TEXT,

  -- Tarih bilgileri
  visited_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEX'LER - Sorgu performansı için
-- ============================================

-- Source bazlı sorgular için (En çok kullanılacak)
CREATE INDEX idx_visitors_source ON visitors(source);

-- Session tracking için
CREATE INDEX idx_visitors_session ON visitors(session_id);

-- Tarih bazlı sorgular için
CREATE INDEX idx_visitors_date ON visitors(visited_at DESC);

-- Campaign analizi için
CREATE INDEX idx_visitors_campaign ON visitors(campaign) WHERE campaign IS NOT NULL;

-- Google Ads tracking için
CREATE INDEX idx_visitors_gclid ON visitors(gclid) WHERE gclid IS NOT NULL;

-- Facebook tracking için
CREATE INDEX idx_visitors_fbclid ON visitors(fbclid) WHERE fbclid IS NOT NULL;

-- IP bazlı sorgular için
CREATE INDEX idx_visitors_ip ON visitors(ip_address);

-- ============================================
-- COMMENTS - Tablo dokümantasyonu
-- ============================================

COMMENT ON TABLE visitors IS 'Ziyaretçi takip sistemi - Reklamdan, sosyal medyadan ve direkt gelenleri takip eder';
COMMENT ON COLUMN visitors.source IS 'Kaynak: ads (Google Ads), face (Facebook), direk, instagram, twitter, google_organik, arama_motoru, referans';
COMMENT ON COLUMN visitors.gclid IS 'Google Ads Click ID - Google reklamlardan gelenleri takip eder';
COMMENT ON COLUMN visitors.fbclid IS 'Facebook Click ID - Facebook reklamlardan gelenleri takip eder';

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- RLS'i aktif et
ALTER TABLE visitors ENABLE ROW LEVEL SECURITY;

-- Public INSERT policy - Herkes veri ekleyebilir (tracking için)
CREATE POLICY "Enable insert for all users" ON visitors
  FOR INSERT
  WITH CHECK (true);

-- Admin READ policy - Sadece authenticated kullanıcılar okuyabilir
CREATE POLICY "Enable read for authenticated users" ON visitors
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- ============================================
-- YARDIMCI GÖRÜNÜMLER (VIEWS)
-- ============================================

-- Kaynak bazlı özet
CREATE OR REPLACE VIEW visitor_stats_by_source AS
SELECT
  source,
  COUNT(*) as total_visits,
  COUNT(DISTINCT session_id) as unique_visitors,
  COUNT(DISTINCT ip_address) as unique_ips,
  COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '24 hours') as last_24h,
  COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '7 days') as last_7d,
  COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '30 days') as last_30d
FROM visitors
GROUP BY source
ORDER BY total_visits DESC;

-- Günlük istatistikler
CREATE OR REPLACE VIEW visitor_stats_daily AS
SELECT
  DATE(created_at) as visit_date,
  source,
  COUNT(*) as visits,
  COUNT(DISTINCT session_id) as unique_visitors
FROM visitors
WHERE created_at > NOW() - INTERVAL '30 days'
GROUP BY DATE(created_at), source
ORDER BY visit_date DESC, visits DESC;

-- Campaign performansı
CREATE OR REPLACE VIEW campaign_performance AS
SELECT
  source,
  medium,
  campaign,
  COUNT(*) as total_visits,
  COUNT(DISTINCT session_id) as unique_visitors,
  MIN(created_at) as first_visit,
  MAX(created_at) as last_visit
FROM visitors
WHERE campaign IS NOT NULL
GROUP BY source, medium, campaign
ORDER BY total_visits DESC;

-- ============================================
-- ÖRNEK SORGULAR
-- ============================================

-- 1. Kaynak bazlı istatistik
-- SELECT * FROM visitor_stats_by_source;

-- 2. Son 24 saatteki ziyaretler
-- SELECT source, COUNT(*) as adet
-- FROM visitors
-- WHERE created_at > NOW() - INTERVAL '24 hours'
-- GROUP BY source
-- ORDER BY adet DESC;

-- 3. Google Ads'den gelen tıklamalar
-- SELECT * FROM visitors WHERE source = 'ads' ORDER BY created_at DESC LIMIT 100;

-- 4. Facebook'tan gelen tıklamalar
-- SELECT * FROM visitors WHERE source = 'face' ORDER BY created_at DESC LIMIT 100;

-- 5. Direkt gelen ziyaretçiler
-- SELECT * FROM visitors WHERE source = 'direk' ORDER BY created_at DESC LIMIT 100;

-- 6. Campaign bazlı analiz
-- SELECT * FROM campaign_performance;

-- 7. Bugünün özeti
-- SELECT source, COUNT(*) as adet
-- FROM visitors
-- WHERE DATE(created_at) = CURRENT_DATE
-- GROUP BY source
-- ORDER BY adet DESC;

-- ============================================
-- BAŞARILI! 🎉
-- ============================================
-- Artık ziyaretçi takip sistemi hazır.
--
-- TEST İÇİN:
-- 1. Google Ads: https://adananakliye.com.tr/?gclid=test123
-- 2. Facebook: https://adananakliye.com.tr/?fbclid=test456
-- 3. Direkt: https://adananakliye.com.tr/
--
-- Admin panelinde görüntülemek için:
-- SELECT * FROM visitor_stats_by_source;
