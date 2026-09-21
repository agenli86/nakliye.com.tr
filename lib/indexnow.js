import { SITE_URL, tumSayfaAdresleri } from './site-haritasi.js'

/**
 * IndexNow: arama motorlarına "şu sayfa değişti" bildirimi.
 *
 * Google Indexing API'si yalnızca iş ilanı (JobPosting) ve canlı yayın
 * (BroadcastEvent) sayfalarını kabul ettiği için nakliyat sayfalarında
 * kullanılamaz. IndexNow ise her tür sayfayı kabul eder ve Bing, Yandex,
 * Naver, Seznam gibi motorlara tek istekle ulaşır. Google bu protokole
 * katılmıyor; Google tarafı sitemap ve Search Console ile ilerliyor.
 *
 * Doğrulama: motor, anahtarı site kökündeki dosyadan okur. Anahtar
 * değişirse public/ altındaki dosya adı da değişmelidir.
 */
export const INDEXNOW_ANAHTAR = process.env.INDEXNOW_KEY || 'b1cb32c835688f0081b0dc48558fa4d2'

export const INDEXNOW_ANAHTAR_ADRESI = `${SITE_URL}/${INDEXNOW_ANAHTAR}.txt`

const UC_NOKTA = 'https://api.indexnow.org/indexnow'

// Protokolün istek başına üst sınırı 10.000 adres.
const PARCA_BOYUTU = 10000

function siteAlanAdi() {
  return new URL(SITE_URL).host
}

/**
 * Verilen adresleri IndexNow'a bildirir.
 * Adres verilmezse site haritasındaki bütün sayfalar gönderilir.
 */
export async function indexNowBildir(adresler) {
  const liste = (adresler && adresler.length ? adresler : await tumSayfaAdresleri())
    .filter((u) => typeof u === 'string' && u.startsWith(SITE_URL))

  if (!liste.length) {
    return { gonderilen: 0, sonuclar: [] }
  }

  const sonuclar = []

  for (let i = 0; i < liste.length; i += PARCA_BOYUTU) {
    const parca = liste.slice(i, i + PARCA_BOYUTU)
    const cevap = await fetch(UC_NOKTA, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify({
        host: siteAlanAdi(),
        key: INDEXNOW_ANAHTAR,
        keyLocation: INDEXNOW_ANAHTAR_ADRESI,
        urlList: parca,
      }),
    })
    sonuclar.push({ adet: parca.length, durum: cevap.status, tamam: cevap.ok })
  }

  return { gonderilen: liste.length, sonuclar }
}
