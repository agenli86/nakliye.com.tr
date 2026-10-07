/**
 * Rota sayfalarından iş ortağı sitelere verilen bağlantılar.
 *
 * Neden koda yazılıyor: rota sayfalarının panelden düzenlenebilen metni
 * rota_sayfalari tablosundan geliyor, ama o tablo henüz kurulmadı. Buraya
 * yazılan kayıt veritabanına hiç dokunmadan sayfada görünüyor; tablo
 * sonradan kurulsa bile bu bağlantı yerinde kalır.
 *
 * Yeni ortak eklemek için anahtara rotanın slug'ını yazmak yeterli
 * (örnek: 'adana-istanbul-nakliye').
 */
export const IS_ORTAKLARI = {
  'adana-ankara-nakliye': {
    ad: 'Cansızoğlu Nakliyat',
    sehir: 'Ankara',
    url: 'https://www.cansizoglunakliyat.com.tr',
    aciklama:
      'Ankara tarafındaki yükleme, boşaltma ve asansör işlerini Cansızoğlu Nakliyat ile birlikte yürütüyoruz. ' +
      'Ankara içi taşıma, depolama ve parça eşya için doğrudan onlara da ulaşabilirsiniz.',
  },
}

export function isOrtagiGetir(rotaSlug) {
  return IS_ORTAKLARI[rotaSlug] || null
}

/**
 * Panelden girilen iş ortağı. Ad ile adres birlikte dolu olmadığında
 * null dönüyor: yarım kayıt, bağlantısı olmayan ya da adı olmayan bir
 * kutu çizerdi. Kayıt eksikse sayfa koddaki listeye düşüyor.
 */
export function panelIsOrtagi(kayit) {
  const ad = (kayit?.is_ortagi_ad || '').trim()
  const url = (kayit?.is_ortagi_url || '').trim()
  if (!ad || !url) return null

  return {
    ad,
    url,
    sehir: (kayit?.is_ortagi_sehir || '').trim(),
    aciklama: (kayit?.is_ortagi_aciklama || '').trim(),
  }
}
