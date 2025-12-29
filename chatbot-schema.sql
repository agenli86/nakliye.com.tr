-- =====================================================
-- CHATBOT TABLOLARI - Mevcut veritabanına EKLENİR
-- Bu SQL'i Supabase SQL Editor'de çalıştırın
-- =====================================================

-- =====================================================
-- 1. CHATBOT SOHBET GEÇMİŞİ
-- Admin panelde görüntülenebilir
-- =====================================================
CREATE TABLE IF NOT EXISTS chatbot_sohbetler (
    id SERIAL PRIMARY KEY,
    
    -- Kullanıcı Kimliği
    fingerprint VARCHAR(100),
    ip_adresi VARCHAR(50),
    
    -- Sohbet
    kullanici_mesaji TEXT NOT NULL,
    bot_cevabi TEXT,
    
    -- Durum
    basarili BOOLEAN DEFAULT true,
    hata_mesaji TEXT,
    
    -- İstatistik
    cevap_suresi_ms INT, -- Milisaniye
    token_kullanimi INT,
    
    created_at TIMESTAMP DEFAULT NOW()
);

-- Index'ler
CREATE INDEX IF NOT EXISTS idx_chatbot_fingerprint ON chatbot_sohbetler(fingerprint);
CREATE INDEX IF NOT EXISTS idx_chatbot_tarih ON chatbot_sohbetler(created_at);
CREATE INDEX IF NOT EXISTS idx_chatbot_ip ON chatbot_sohbetler(ip_adresi);

-- =====================================================
-- 2. CHATBOT GÜNLÜK LİMİTLER
-- IP/Fingerprint başına günlük limit takibi
-- =====================================================
CREATE TABLE IF NOT EXISTS chatbot_limitler (
    id SERIAL PRIMARY KEY,
    
    -- Kimlik (IP veya Fingerprint)
    kimlik VARCHAR(100) UNIQUE NOT NULL,
    kimlik_tipi VARCHAR(20) DEFAULT 'fingerprint', -- fingerprint veya ip
    
    -- Limit Bilgileri
    soru_sayisi INT DEFAULT 0,
    max_limit INT DEFAULT 5,
    
    -- Son Aktivite
    son_soru_tarihi TIMESTAMP DEFAULT NOW(),
    limit_reset_tarihi DATE DEFAULT CURRENT_DATE,
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_chatbot_limitler_kimlik ON chatbot_limitler(kimlik);
CREATE INDEX IF NOT EXISTS idx_chatbot_limitler_tarih ON chatbot_limitler(limit_reset_tarihi);

-- =====================================================
-- 3. CHATBOT AYARLARI
-- Admin panelden yönetilebilir
-- =====================================================
CREATE TABLE IF NOT EXISTS chatbot_ayarlari (
    id SERIAL PRIMARY KEY,
    anahtar VARCHAR(100) UNIQUE NOT NULL,
    deger TEXT,
    aciklama VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

INSERT INTO chatbot_ayarlari (anahtar, deger, aciklama) VALUES
('aktif', 'true', 'Chatbot açık/kapalı'),
('gunluk_limit', '5', 'IP başına günlük soru limiti'),
('hosgeldin_mesaji', 'Merhaba! 👋 Ben Adana Nakliye yapay zeka asistanıyım. Size nakliyat, taşımacılık ve fiyatlar hakkında yardımcı olabilirim.', 'Karşılama mesajı'),
('limit_doldu_mesaji', 'Günlük soru limitiniz doldu. Daha fazla bilgi için bizi arayın: 0505 780 55 51', 'Limit dolduğunda gösterilecek mesaj'),
('hata_mesaji', 'Bir hata oluştu. Lütfen daha sonra tekrar deneyin veya bizi arayın.', 'Hata durumunda gösterilecek mesaj'),
('firma_telefon', '05057805551', 'Firmaya yönlendirme telefonu')
ON CONFLICT (anahtar) DO NOTHING;

-- =====================================================
-- 4. SAHTE TIKLAMA TESPİT TABLOSU
-- Şüpheli aktiviteleri kayıt altına alır
-- =====================================================
CREATE TABLE IF NOT EXISTS sahte_tiklamalar (
    id SERIAL PRIMARY KEY,
    
    -- Cihaz Kimliği
    fingerprint VARCHAR(100) NOT NULL,
    
    -- IP Geçmişi
    ip_listesi TEXT[], -- Farklı IP'lerin listesi
    
    -- İstatistikler
    toplam_giris INT DEFAULT 0,
    farkli_ip_sayisi INT DEFAULT 0,
    ortalama_sure_sn INT DEFAULT 0, -- Ortalama sayfa süresi (saniye)
    
    -- Durum
    engellendi BOOLEAN DEFAULT false,
    engel_tarihi TIMESTAMP,
    engel_bitis TIMESTAMP, -- 24 saat sonra
    
    -- Konum (son bilinen)
    il VARCHAR(100),
    ilce VARCHAR(100),
    
    -- Cihaz Bilgileri
    cihaz_turu VARCHAR(50),
    cihaz_markasi VARCHAR(100),
    cihaz_modeli VARCHAR(100),
    tarayici VARCHAR(100),
    
    -- Notlar
    notlar TEXT,
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sahte_fingerprint ON sahte_tiklamalar(fingerprint);
CREATE INDEX IF NOT EXISTS idx_sahte_engel ON sahte_tiklamalar(engellendi);
CREATE INDEX IF NOT EXISTS idx_sahte_tarih ON sahte_tiklamalar(created_at);

-- =====================================================
-- 5. RLS POLİTİKALARI
-- =====================================================

-- Sohbetler - Public insert, Admin read
ALTER TABLE chatbot_sohbetler ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public insert chatbot" ON chatbot_sohbetler FOR INSERT WITH CHECK (true);
CREATE POLICY "Auth read chatbot" ON chatbot_sohbetler FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Auth full chatbot" ON chatbot_sohbetler FOR ALL USING (auth.role() = 'authenticated');

-- Limitler - Public full (kendi limitini görebilir/güncelleyebilir)
ALTER TABLE chatbot_limitler ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public insert limitler" ON chatbot_limitler FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update limitler" ON chatbot_limitler FOR UPDATE USING (true);
CREATE POLICY "Public select limitler" ON chatbot_limitler FOR SELECT USING (true);
CREATE POLICY "Auth full limitler" ON chatbot_limitler FOR ALL USING (auth.role() = 'authenticated');

-- Ayarlar - Public read, Auth full
ALTER TABLE chatbot_ayarlari ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read chatbot_ayarlari" ON chatbot_ayarlari FOR SELECT USING (true);
CREATE POLICY "Auth full chatbot_ayarlari" ON chatbot_ayarlari FOR ALL USING (auth.role() = 'authenticated');

-- Sahte Tıklamalar - Public insert, Admin full
ALTER TABLE sahte_tiklamalar ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public insert sahte" ON sahte_tiklamalar FOR INSERT WITH CHECK (true);
CREATE POLICY "Auth read sahte" ON sahte_tiklamalar FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Auth full sahte" ON sahte_tiklamalar FOR ALL USING (auth.role() = 'authenticated');

-- =====================================================
-- 6. TRIGGER - Updated At
-- =====================================================
CREATE TRIGGER update_chatbot_limitler_updated_at 
    BEFORE UPDATE ON chatbot_limitler 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_chatbot_ayarlari_updated_at 
    BEFORE UPDATE ON chatbot_ayarlari 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sahte_tiklamalar_updated_at 
    BEFORE UPDATE ON sahte_tiklamalar 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- KURULUM TAMAMLANDI!
-- Şimdi .env.local dosyasına ANTHROPIC_API_KEY ekleyin
-- =====================================================
