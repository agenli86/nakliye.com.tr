/**
 * Adana ilçe ve semt veri kümesi.
 *
 * "Huzurevleri nakliyeci", "Beyazevler hamal" gibi semt bazlı aramalar
 * için sayfa üretiyor. İl listesi gibi bu da kod tarafında duruyor;
 * veritabanı olmadan da çalışıyor.
 *
 * İlçe listesi lib/iller.js içindeki Adana kaydıyla birebir aynı, yani
 * resmi 15 ilçe. Kapsam bilerek Adana'nın merkez dört ilçesiyle sınırlı: Seyhan,
 * Çukurova, Yüreğir ve Sarıçam. Nakliye talebi buradan geliyor, taşra
 * ilçeleri için ayrı sayfa açılmadı.
 *
 * Semt listesi elle derlendi; eksiksiz bir mahalle kütüğü değil, bilinen
 * merkezi semtler. Yeni bir semt eklemek aşağıdaki listeye tek satır
 * yazmak demek: sayfa, sitemap kaydı ve iç linkler kendiliğinden oluşuyor.
 */

import { slugify } from './iller'

export const SEMT_KOK = '/nakliyat'

export function semtUrl(slug) {
  return `${SEMT_KOK}/${slug}`
}

/**
 * İlçe dokusu. Metinlerde kullanılıyor ve ilçeye göre değişiyor; bu
 * sayede aynı cümle bütün semtlerde tekrarlanmıyor.
 *
 * merkez : eski şehir dokusu, dar sokak, asansörsüz apartman ağırlıklı
 * yeni   : geniş cadde, yüksek katlı site, asansörlü bina ağırlıklı
 * karma  : ikisi bir arada
 */
const HAM_ILCELER = [
  {
    ad: 'Seyhan',
    doku: 'merkez',
    semtler: [
      'Reşatbey', 'Cemalpaşa', 'Kurtuluş', 'Çınarlı', 'Ziyapaşa', 'Sümer',
      'Gülbahçesi', 'Döşeme', 'Mithatpaşa', 'Kanalüstü', 'Denizli', 'Yeşiloba',
      'Barış', 'Gürselpaşa', 'Hürriyet', 'Onur', 'Fatih', 'Uçak', 'Akkapı',
      'Sarıhamzalı', 'Dağlıoğlu', 'Karasoku', 'Tepebağ', 'Kuruköprü',
      'Sucuzade', 'Türkocağı', 'Mirzaçelebi', 'Tellidere', 'Havuzlubahçe',
      'Şakirpaşa', 'Kiremithane', 'Yeşilyurt', 'Namık Kemal', 'Yavuzlar',
    ],
  },
  {
    ad: 'Çukurova',
    doku: 'yeni',
    semtler: [
      'Huzurevleri', 'Beyazevler', 'Güzelyalı', 'Mahfesığmaz', 'Kurttepe',
      'Toros', 'Belediye Evleri', 'Yüzüncü Yıl', 'Yurt', 'Karslılar',
      'Söğütlü', 'Turgut Özal',
    ],
  },
  {
    ad: 'Yüreğir',
    doku: 'karma',
    semtler: [
      'Sinanpaşa', 'Kışla', 'Köprülü', 'Dadaloğlu', 'Akıncılar', 'Çamlıbel',
      'Yeşilbağlar', 'Karşıyaka', 'Levent', 'Cumhuriyet', 'Anadolu',
      'Atakent', 'Serinevler', '19 Mayıs', 'Şehit Erkut Akbay',
    ],
  },
  {
    ad: 'Sarıçam',
    doku: 'karma',
    semtler: [
      'Şambayadı', 'Küçükdikili', 'İncirlik', 'Sofulu', 'Menekşe', 'Mutlu',
    ],
  },
]

export const ILCELER = HAM_ILCELER.map((ilce, i) => ({
  ad: ilce.ad,
  slug: slugify(ilce.ad),
  doku: ilce.doku,
  sira: i,
}))

/**
 * Semt slug'ları. İki ilçede aynı adı taşıyan semt olursa slug'ın önüne
 * ilçe adı geliyor, yoksa sade ad kullanılıyor. Sade adres tercih
 * ediliyor çünkü arama "beyazevler nakliyeci" şeklinde yapılıyor.
 */
const adSayaci = new Map()
for (const ilce of HAM_ILCELER) {
  for (const semt of ilce.semtler) {
    const s = slugify(semt)
    adSayaci.set(s, (adSayaci.get(s) || 0) + 1)
  }
}

export const SEMTLER = HAM_ILCELER.flatMap((ilce, ilceIndex) => {
  const ilceKaydi = ILCELER[ilceIndex]
  return ilce.semtler.map((ad, i) => {
    const sade = slugify(ad)
    const benzersiz = adSayaci.get(sade) === 1
    return {
      ad,
      slug: benzersiz ? sade : `${ilceKaydi.slug}-${sade}`,
      ilce: ilceKaydi.ad,
      ilceSlug: ilceKaydi.slug,
      doku: ilceKaydi.doku,
      // Metin döndürmesi için sabit bir tohum; sayfa her üretildiğinde
      // aynı cümleler çıksın diye sırayla veriliyor.
      tohum: ilceIndex * 17 + i,
    }
  })
})

export const SEMT_HARITASI = new Map(SEMTLER.map((s) => [s.slug, s]))
export const ILCE_HARITASI = new Map(ILCELER.map((i) => [i.slug, i]))

export function semtBul(slug) {
  return SEMT_HARITASI.get(slug) || null
}

export function ilceBul(slug) {
  return ILCE_HARITASI.get(slug) || null
}

/** Bir ilçenin semtleri. */
export function ilceSemtleri(ilceSlug) {
  return SEMTLER.filter((s) => s.ilceSlug === ilceSlug)
}

/**
 * Bir semtin komşuları: aynı ilçedeki diğer semtler. Liste kendi etrafında
 * kaydırılıyor ki her sayfa farklı komşularla başlasın ve linkler
 * listenin hep ilk birkaç adına yığılmasın.
 */
export function komsuSemtler(semt, adet = 8) {
  const ayni = SEMTLER.filter((s) => s.ilceSlug === semt.ilceSlug && s.slug !== semt.slug)
  if (ayni.length <= adet) return ayni
  const baslangic = semt.tohum % ayni.length
  return [...ayni.slice(baslangic), ...ayni.slice(0, baslangic)].slice(0, adet)
}

/** Bütün sayfa kayıtları: önce ilçeler, sonra semtler. */
export const SEMT_SAYFALARI = [
  ...ILCELER.map((i) => ({ tip: 'ilce', slug: i.slug })),
  ...SEMTLER.map((s) => ({ tip: 'semt', slug: s.slug })),
]
