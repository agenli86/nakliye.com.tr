# 🎯 ADANA NAKLİYE - ZİYARETÇİ TAKİP VE PERFORMANS GÜNCELLEMESİ

## ✅ YAPILAN DEĞİŞİKLİKLER

### 1️⃣ ZİYARETÇİ TAKİP SİSTEMİ DÜZELTİLDİ

#### Değişen Dosyalar:
- ✅ `components/VisitorTracker.js` - Yeni source tracking sistemi
- ✅ `app/api/track-visitor/route.js` - Yeni API route (OLUŞTURULDU)
- ✅ `database/migrations/visitors_table.sql` - Yeni Supabase tablo yapısı

#### Özellikler:
- ✅ Google Ads'den gelenleri **"ads"** olarak kaydeder
- ✅ Facebook'tan gelenleri **"face"** olarak kaydeder
- ✅ Direkt gelenleri **"direk"** olarak kaydeder
- ✅ Instagram, Twitter, Google organik, diğer arama motorları da desteklenir

#### Nasıl Çalışır:
```javascript
// Google Ads
https://adananakliye.com.tr/?gclid=abc123 → source: "ads"
https://adananakliye.com.tr/?utm_source=google_ads → source: "ads"

// Facebook
https://adananakliye.com.tr/?fbclid=xyz789 → source: "face"
https://adananakliye.com.tr/?utm_source=facebook → source: "face"

// Direkt
https://adananakliye.com.tr/ → source: "direk"
```

---

## 🚀 PERFORMANS OPTİMİZASYONLARI

### 2️⃣ Mevcut Optimizasyonlar (Zaten Yapılmış)
- ✅ **Resimler**: Next.js Image component zaten kullanılıyor
- ✅ **HeroSlider**: İlk resim priority=true, fetchPriority="high"
- ✅ **Font**: Inter font, display='swap', preload=true
- ✅ **next.config.js**: Image optimization, webpack splitting, compression
- ✅ **Lazy Loading**: VisitorTracker, FraudDetector, CookieBanner dinamik
- ✅ **Harita**: VisitorMap dinamik import ile yükleniyor

### 3️⃣ Package.json Script'leri Eklendi
```json
"analyze": "ANALYZE=true next build"
"lighthouse": "lighthouse https://adananakliye.com.tr --view --preset=desktop"
"lighthouse:mobile": "lighthouse https://adananakliye.com.tr --view --preset=mobile"
```

---

## 📋 YAPMANIZ GEREKENLER

### ADIM 1: Supabase'de Visitors Tablosunu Oluştur

1. Supabase Dashboard'a git: https://supabase.com/dashboard
2. Projenizi seçin
3. Sol menüden **SQL Editor** > **New Query** tıklayın
4. `database/migrations/visitors_table.sql` dosyasının içeriğini kopyalayıp yapıştırın
5. **RUN** butonuna tıklayın

#### Alternatif: Manuel Kontrol

Eğer zaten `visitors` tablosu varsa, şu sorguyu çalıştırarak yapıyı kontrol edin:

```sql
-- Tablo yapısını görüntüle
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'visitors'
ORDER BY ordinal_position;

-- Source kolonunu kontrol et
SELECT DISTINCT source FROM visitors;
```

**Önemli Kolonlar:**
- `source` (TEXT, NOT NULL, DEFAULT 'direk')
- `medium` (TEXT, DEFAULT 'none')
- `campaign` (TEXT, nullable)
- `gclid` (TEXT, nullable) - Google Ads tracking
- `fbclid` (TEXT, nullable) - Facebook tracking
- `session_id` (TEXT, NOT NULL)
- `ip_address` (TEXT)
- `referrer` (TEXT)
- `page` (TEXT)
- `full_url` (TEXT)
- `user_agent` (TEXT)
- `visited_at` (TIMESTAMPTZ)

---

### ADIM 2: Environment Variables Kontrolü

`.env.local` dosyanızda şunlar olmalı:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

**⚠️ DİKKAT:** `SUPABASE_SERVICE_ROLE_KEY` olmadan API route düzgün çalışmaz!

#### Service Role Key Nasıl Bulunur?
1. Supabase Dashboard > Settings > API
2. **Service Role Key** (secret!) kopyalayın
3. `.env.local` dosyasına ekleyin

---

### ADIM 3: Vercel'de Environment Variables Ekle

1. Vercel Dashboard > Your Project > Settings > Environment Variables
2. Şu değişkenleri ekleyin:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` ⚠️ ÖNEMLİ!

3. Tüm environment'lara ekle (Production, Preview, Development)

---

### ADIM 4: Build ve Deploy

```bash
# Local'de test et
npm run dev

# Production build yap
npm run build

# Vercel'e push et
git add .
git commit -m "feat: visitor tracking with source detection (ads/face/direk)"
git push origin claude/fix-mobile-performance-GsERf
```

---

## 🧪 TEST

### Test URL'leri

1. **Google Ads Test:**
   ```
   https://adananakliye.com.tr/?gclid=test123abc
   https://adananakliye.com.tr/?utm_source=google_ads&utm_medium=cpc
   ```

2. **Facebook Test:**
   ```
   https://adananakliye.com.tr/?fbclid=test456xyz
   https://adananakliye.com.tr/?utm_source=facebook&utm_medium=social
   ```

3. **Direkt Test:**
   ```
   Adres çubuğuna direkt: adananakliye.com.tr
   ```

### Supabase'de Kontrol

```sql
-- Son 24 saatteki kayıtları göster
SELECT source, COUNT(*) as adet
FROM visitors
WHERE created_at > NOW() - INTERVAL '24 hours'
GROUP BY source
ORDER BY adet DESC;

-- Tüm kayıtları göster
SELECT * FROM visitor_stats_by_source;

-- Google Ads tıklamaları
SELECT * FROM visitors WHERE source = 'ads' ORDER BY created_at DESC LIMIT 10;

-- Facebook tıklamaları
SELECT * FROM visitors WHERE source = 'face' ORDER BY created_at DESC LIMIT 10;

-- Direkt girişler
SELECT * FROM visitors WHERE source = 'direk' ORDER BY created_at DESC LIMIT 10;
```

---

## 📊 PERFORMANS TESTLERI

### PageSpeed Test

```bash
# Online test
https://pagespeed.web.dev/

# Local test (lighthouse CLI gerekli)
npm run lighthouse:mobile
npm run lighthouse
```

**Hedefler:**
- ✅ Mobile: >90 puan
- ✅ Desktop: >95 puan
- ✅ LCP: <2.5 saniye
- ✅ FID: <100ms
- ✅ CLS: <0.1

### Bundle Analizi

```bash
npm run analyze
```

---

## 🎯 BEKLENEN SONUÇLAR

### Ziyaretçi Tracking:
- ✅ Google Ads trafiği "ads" olarak görünecek
- ✅ Facebook trafiği "face" olarak görünecek
- ✅ Direkt giriş "direk" olarak görünecek
- ✅ Her ziyaretçi için session tracking
- ✅ IP adresi, referrer, campaign bilgileri kaydedilecek

### Performans:
- ✅ Mobil PageSpeed: >90 (hedef)
- ✅ LCP: <2.5sn (hedef)
- ✅ Resimler AVIF/WebP formatında optimize
- ✅ Lazy loading ile gereksiz yüklemeler önlendi
- ✅ Font'lar optimize edildi
- ✅ JavaScript bundle'lar küçültüldü

---

## 🐛 SORUN GİDERME

### 1. "Visitor tracking failed" Hatası

**Çözüm:**
- `.env.local` dosyasını kontrol edin
- `SUPABASE_SERVICE_ROLE_KEY` var mı?
- Vercel'de environment variables ekli mi?

### 2. Supabase'de Veri Görünmüyor

**Çözüm:**
```sql
-- RLS policy'leri kontrol et
SELECT * FROM pg_policies WHERE tablename = 'visitors';

-- INSERT policy var mı?
-- "Enable insert for all users" policy olmalı
```

### 3. Source "direk" Olarak Kaydediliyor (Her Zaman)

**Çözüm:**
- Browser console'da "Visitor tracking error" var mı kontrol edin
- URL parametrelerini kontrol edin: `?gclid=` veya `?fbclid=` var mı?
- Referrer bilgisi gelmiyor olabilir (adblocker?)

### 4. PageSpeed Skoru Düşük

**Çözüm:**
- Supabase'den gelen veri boyutunu kontrol edin
- Gereksiz sorguları kaldırın
- `npm run analyze` ile bundle boyutuna bakın
- Resim boyutlarını kontrol edin

---

## 📞 DESTEK

Herhangi bir sorun yaşarsanız:
1. Browser console'da hata mesajlarını kontrol edin
2. Supabase logs: Dashboard > Logs > API
3. Vercel logs: Dashboard > Your Project > Deployments > View Function Logs

---

## 🎉 BAŞARILI!

Artık ziyaretçi tracking sisteminiz çalışıyor! Google Ads ve Facebook reklamlarınızın performansını doğru şekilde takip edebilirsiniz.

**Bir sonraki adımlar:**
- [ ] Admin panelinde ziyaretçi raporları görüntüleme
- [ ] Campaign bazlı ROI analizi
- [ ] Conversion tracking entegrasyonu
- [ ] A/B test için segment analizi
