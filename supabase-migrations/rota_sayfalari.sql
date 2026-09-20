-- =====================================================
-- ROTA VE İL HİZMET SAYFALARI
-- Supabase > SQL Editor > New query içine yapıştırıp çalıştırın.
-- Tekrar çalıştırmak güvenlidir (IF NOT EXISTS / ON CONFLICT).
-- =====================================================

CREATE TABLE IF NOT EXISTS rota_sayfalari (
    id SERIAL PRIMARY KEY,
    -- tur: 'rota'  -> /rota/adana-adiyaman-nakliye  (slug = adana-adiyaman-nakliye)
    -- tur: 'il-hizmet' -> /nakliye-hizmetleri/ankara (slug = ankara)
    tur VARCHAR(20) NOT NULL DEFAULT 'rota',
    slug VARCHAR(255) NOT NULL,
    hedef_slug VARCHAR(255),
    baslik VARCHAR(255),
    h1 VARCHAR(255),
    ozet TEXT,
    icerik TEXT,
    makale_baslik VARCHAR(255),
    makale TEXT,
    resim VARCHAR(500),
    mesafe_km INT,
    sure_metni VARCHAR(100),
    ilceler TEXT,
    fiyat_notu TEXT,
    aktif BOOLEAN DEFAULT true,
    meta_title VARCHAR(255),
    meta_description TEXT,
    meta_keywords VARCHAR(500),
    og_image VARCHAR(500),
    canonical_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    CONSTRAINT rota_sayfalari_tur_slug_key UNIQUE (tur, slug)
);

CREATE INDEX IF NOT EXISTS rota_sayfalari_tur_idx ON rota_sayfalari (tur);
CREATE INDEX IF NOT EXISTS rota_sayfalari_aktif_idx ON rota_sayfalari (aktif);

ALTER TABLE rota_sayfalari ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read rota_sayfalari" ON rota_sayfalari;
CREATE POLICY "Public read rota_sayfalari" ON rota_sayfalari FOR SELECT USING (true);

DROP POLICY IF EXISTS "Auth full rota_sayfalari" ON rota_sayfalari;
CREATE POLICY "Auth full rota_sayfalari" ON rota_sayfalari FOR ALL USING (auth.role() = 'authenticated');

-- updated_at tetikleyicisi (fonksiyon ana şemada tanımlı)
DROP TRIGGER IF EXISTS update_rota_sayfalari_updated_at ON rota_sayfalari;
CREATE TRIGGER update_rota_sayfalari_updated_at
    BEFORE UPDATE ON rota_sayfalari
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- FİYAT AYARLARI
-- Rota sayfalarındaki tahmini fiyat = baz ücret + (mesafe x km ücreti).
-- Değerleri Admin > Rota Sayfaları ekranından da değiştirebilirsiniz.
-- =====================================================

INSERT INTO ayarlar (anahtar, deger, tur, grup, aciklama) VALUES
  ('rota_baz_ucret',        '6500',  'text',   'rota', 'Rota sayfalarındaki tahmini fiyatın sabit bileşeni (TL)'),
  ('rota_km_ucreti',        '22',    'text',   'rota', 'Rota sayfalarında kilometre başına eklenen tutar (TL)'),
  ('rota_fiyat_goster',     'true',  'text',   'rota', 'Rota sayfalarında fiyat tablosu gösterilsin mi (true/false)'),
  ('rota_fiyat_guncelleme', '',      'text',   'rota', 'Fiyat tablosunun son güncelleme tarihi (serbest metin)')
ON CONFLICT (anahtar) DO NOTHING;

-- =====================================================
-- MENÜ BAĞLANTILARI
-- Üst menüye "Rotalar" ve "İller" ekler. Zaten varsa tekrar eklemez.
-- =====================================================

INSERT INTO menu (baslik, link, sira, aktif)
SELECT 'Rotalar', '/rota', 55, true
WHERE NOT EXISTS (SELECT 1 FROM menu WHERE link = '/rota');

INSERT INTO menu (baslik, link, sira, aktif)
SELECT 'İller', '/nakliye-hizmetleri', 56, true
WHERE NOT EXISTS (SELECT 1 FROM menu WHERE link = '/nakliye-hizmetleri');
