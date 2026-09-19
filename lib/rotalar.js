/**
 * Rota (Adana → hedef) ve il hizmet sayfalarının veri katmanı.
 *
 * Rotalar iki kaynaktan gelir:
 *   1. lib/iller.js içindeki 81 il (Adana hariç 80 il rotası),
 *   2. aşağıdaki ILCE_ROTALARI listesi (turistik ve yoğun talep gören ilçeler).
 *
 * Yönetim panelinden girilen rota_sayfalari kayıtları bu temel veriyi ezer;
 * kayıt yoksa sayfa yine de eksiksiz üretilir.
 */

import { BOLGELER, HEDEF_ILLER, ILLER, ilBul, slugify } from './iller.js'

export const ROTA_ONEK = 'adana'
export const ROTA_SONEK = 'nakliye'

/**
 * Turistik ve yoğun talep gören ilçe/belde rotaları.
 * [ad, il slug, tür] — tür 'ilce' resmî ilçe, 'belde' ilçeye bağlı yerleşim.
 * 'belde' kayıtlarında dördüncü alan bağlı olduğu ilçedir.
 */
const HAM_ILCE_ROTALARI = [
  // Adana çevresi ve şehir içi
  ['Ceyhan', 'adana', 'ilce'], ['Kozan', 'adana', 'ilce'], ['Karataş', 'adana', 'ilce'],
  ['Yumurtalık', 'adana', 'ilce'], ['Pozantı', 'adana', 'ilce'], ['Karaisalı', 'adana', 'ilce'],
  // Mersin
  ['Tarsus', 'mersin', 'ilce'], ['Erdemli', 'mersin', 'ilce'], ['Silifke', 'mersin', 'ilce'],
  ['Anamur', 'mersin', 'ilce'], ['Bozyazı', 'mersin', 'ilce'],
  // Hatay
  ['İskenderun', 'hatay', 'ilce'], ['Arsuz', 'hatay', 'ilce'], ['Samandağ', 'hatay', 'ilce'],
  ['Dörtyol', 'hatay', 'ilce'],
  // Antalya
  ['Kemer', 'antalya', 'ilce'], ['Alanya', 'antalya', 'ilce'], ['Manavgat', 'antalya', 'ilce'],
  ['Kaş', 'antalya', 'ilce'], ['Serik', 'antalya', 'ilce'], ['Kumluca', 'antalya', 'ilce'],
  ['Finike', 'antalya', 'ilce'], ['Demre', 'antalya', 'ilce'], ['Gazipaşa', 'antalya', 'ilce'],
  ['Side', 'antalya', 'belde', 'Manavgat'], ['Belek', 'antalya', 'belde', 'Serik'],
  ['Kalkan', 'antalya', 'belde', 'Kaş'],
  // Muğla
  ['Fethiye', 'mugla', 'ilce'], ['Marmaris', 'mugla', 'ilce'], ['Bodrum', 'mugla', 'ilce'],
  ['Datça', 'mugla', 'ilce'], ['Köyceğiz', 'mugla', 'ilce'], ['Dalaman', 'mugla', 'ilce'],
  ['Ortaca', 'mugla', 'ilce'], ['Milas', 'mugla', 'ilce'], ['Seydikemer', 'mugla', 'ilce'],
  ['Ölüdeniz', 'mugla', 'belde', 'Fethiye'], ['Akyaka', 'mugla', 'belde', 'Ula'],
  ['Turgutreis', 'mugla', 'belde', 'Bodrum'],
  // İzmir
  ['Çeşme', 'izmir', 'ilce'], ['Urla', 'izmir', 'ilce'], ['Foça', 'izmir', 'ilce'],
  ['Seferihisar', 'izmir', 'ilce'], ['Selçuk', 'izmir', 'ilce'], ['Dikili', 'izmir', 'ilce'],
  ['Bergama', 'izmir', 'ilce'], ['Alaçatı', 'izmir', 'belde', 'Çeşme'],
  ['Şirince', 'izmir', 'belde', 'Selçuk'],
  // Aydın
  ['Kuşadası', 'aydin', 'ilce'], ['Didim', 'aydin', 'ilce'], ['Söke', 'aydin', 'ilce'],
  // Balıkesir
  ['Ayvalık', 'balikesir', 'ilce'], ['Edremit', 'balikesir', 'ilce'],
  ['Burhaniye', 'balikesir', 'ilce'], ['Erdek', 'balikesir', 'ilce'],
  ['Cunda', 'balikesir', 'belde', 'Ayvalık'], ['Akçay', 'balikesir', 'belde', 'Edremit'],
  // Çanakkale
  ['Bozcaada', 'canakkale', 'ilce'], ['Gökçeada', 'canakkale', 'ilce'],
  ['Ayvacık', 'canakkale', 'ilce'], ['Gelibolu', 'canakkale', 'ilce'],
  ['Assos', 'canakkale', 'belde', 'Ayvacık'],
  // Diğer turistik noktalar
  ['Şile', 'istanbul', 'ilce'], ['Ürgüp', 'nevsehir', 'ilce'], ['Avanos', 'nevsehir', 'ilce'],
  ['Göreme', 'nevsehir', 'belde', 'Ürgüp'], ['Sapanca', 'sakarya', 'ilce'],
  ['Amasra', 'bartin', 'ilce'], ['Safranbolu', 'karabuk', 'ilce'],
  ['Akçakoca', 'duzce', 'ilce'], ['Cide', 'kastamonu', 'ilce'], ['Mudurnu', 'bolu', 'ilce'],
  ['Ünye', 'ordu', 'ilce'], ['Perşembe', 'ordu', 'ilce'], ['Ardeşen', 'rize', 'ilce'],
  ['Çamlıhemşin', 'rize', 'ilce'], ['Çaykara', 'trabzon', 'ilce'], ['Maçka', 'trabzon', 'ilce'],
  ['Uzungöl', 'trabzon', 'belde', 'Çaykara'], ['Eğirdir', 'isparta', 'ilce'],
  ['Pamukkale', 'denizli', 'ilce'], ['Karasu', 'sakarya', 'ilce'],
]

/** İlçe rotaları için Adana'ya yaklaşık mesafe: il mesafesine eklenen pay. */
const ILCE_MESAFE_EKI = {
  // il merkezinden uzak turistik ilçeler
  fethiye: 130, marmaris: 100, bodrum: 105, datca: 175, koycegiz: 70, dalaman: 95,
  ortaca: 80, milas: 60, seydikemer: 110, oludeniz: 145, akyaka: 25, turgutreis: 125,
  alanya: 135, manavgat: 75, kemer: 45, kas: 190, serik: 40, kumluca: 90, finike: 115,
  demre: 145, gazipasa: 180, side: 70, belek: 35, kalkan: 215,
  cesme: 85, urla: 40, foca: 70, seferihisar: 50, selcuk: 75, dikili: 120, bergama: 110,
  alacati: 80, sirince: 80,
  kusadasi: 70, didim: 110, soke: 55,
  ayvalik: 140, edremit: 105, burhaniye: 120, erdek: 125, cunda: 145, akcay: 115,
  bozcaada: 190, gokceada: 200, ayvacik: 110, gelibolu: 195, assos: 130,
  sile: 70, urgup: 20, avanos: 20, goreme: 15, sapanca: 25, amasra: 20, safranbolu: 10,
  akcakoca: 40, cide: 130, mudurnu: 55, unye: 75, persembe: 20, ardesen: 60,
  camlihemsin: 80, caykara: 95, macka: 30, uzungol: 110, egirdir: 35, pamukkale: 20,
  karasu: 60, tarsus: 40, erdemli: 110, silifke: 155, anamur: 300, bozyazi: 320,
  iskenderun: 60, arsuz: 80, samandag: 45, dortyol: 45,
  ceyhan: 45, kozan: 70, karatas: 50, yumurtalik: 80, pozanti: 70, karaisali: 45,
}

function ilceMesafe(ad, il) {
  const ek = ILCE_MESAFE_EKI[slugify(ad)]
  if (ek == null) return il.mesafe
  // Adana ilçeleri için mesafe doğrudan ilçenin kendisidir.
  if (il.slug === 'adana') return ek
  return il.mesafe + ek
}

export const ILCE_ROTALARI = HAM_ILCE_ROTALARI.map(([ad, ilSlug, tur, bagliIlce]) => {
  const il = ilBul(ilSlug)
  return {
    tip: 'ilce',
    ad,
    slug: slugify(ad),
    tur,
    bagliIlce: bagliIlce || null,
    il: il.ad,
    ilSlug: il.slug,
    bolge: il.bolge,
    bolgeAdi: BOLGELER[il.bolge],
    mesafe: ilceMesafe(ad, il),
    // İlçe rotalarında da bölge ve ilçe listesi gösteriliyor: bir ilçeye
    // taşınacak kişi çoğu zaman ilin diğer ilçelerini de arıyor.
    ilceler: il.ilceler,
  }
})

export const IL_ROTALARI = HEDEF_ILLER.map((il) => ({
  tip: 'il',
  ad: il.ad,
  slug: il.slug,
  tur: 'il',
  bagliIlce: null,
  il: il.ad,
  ilSlug: il.slug,
  plaka: il.plaka,
  bolge: il.bolge,
  bolgeAdi: il.bolgeAdi,
  mesafe: il.mesafe,
  ilceler: il.ilceler,
}))

/** Rota sayfası URL parçası: adana-adiyaman-nakliye */
export function rotaSlug(hedefSlug) {
  return `${ROTA_ONEK}-${hedefSlug}-${ROTA_SONEK}`
}

export function rotaUrl(hedefSlug) {
  return `/rota/${rotaSlug(hedefSlug)}`
}

export function ilHizmetUrl(ilSlug) {
  return `/nakliye-hizmetleri/${ilSlug}`
}

function rotaZenginlestir(rota) {
  const yolSaat = Math.max(1, Math.round(rota.mesafe / 65))
  return {
    ...rota,
    rotaSlug: rotaSlug(rota.slug),
    url: rotaUrl(rota.slug),
    ilUrl: ilHizmetUrl(rota.ilSlug),
    // "Adana Adıyaman Nakliye" — sayfa adı
    rotaAdi: `Adana ${rota.ad} Nakliye`,
    // "Adıyaman Adana Evden Eve Nakliyat" — istenen başlık kalıbı
    tersBaslik: `${rota.ad} Adana Evden Eve Nakliyat`,
    yolSaat,
    teslimGun: rota.mesafe <= 250 ? '1 gün' : rota.mesafe <= 700 ? '1-2 gün' : '2-3 gün',
  }
}

const TUM_ROTALAR = [...IL_ROTALARI, ...ILCE_ROTALARI].map(rotaZenginlestir)

// Aynı slug'a iki rota düşerse ilki kazanır; veri hatasını erken görmek için
// geliştirme ortamında uyarı basıyoruz.
const ROTA_HARITASI = new Map()
for (const rota of TUM_ROTALAR) {
  if (ROTA_HARITASI.has(rota.rotaSlug)) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('[rotalar] yinelenen rota slug:', rota.rotaSlug)
    }
    continue
  }
  ROTA_HARITASI.set(rota.rotaSlug, rota)
}

export const ROTALAR = [...ROTA_HARITASI.values()]

export function rotaBul(slug) {
  return ROTA_HARITASI.get(slug) || null
}

export const IL_ROTA_LISTESI = ROTALAR.filter((r) => r.tip === 'il')
export const ILCE_ROTA_LISTESI = ROTALAR.filter((r) => r.tip === 'ilce')

/** Rotaları bölgeye göre grupla (rota dizini sayfası için). */
export function rotalariBolgeyeGoreGrupla(liste = IL_ROTA_LISTESI) {
  const gruplar = new Map()
  for (const rota of liste) {
    if (!gruplar.has(rota.bolge)) gruplar.set(rota.bolge, [])
    gruplar.get(rota.bolge).push(rota)
  }
  for (const [, rotalar] of gruplar) rotalar.sort((a, b) => a.ad.localeCompare(b.ad, 'tr'))
  return gruplar
}

/**
 * Bir makalenin aslında rota içeriği olup olmadığını anlar.
 * Blog listesi bu makaleleri gizler, /makale/<slug> ise rota sayfasına
 * 301 ile yönlendirir; böylece eski bağlantılar ve sıralamalar korunur.
 */
const ROTA_KATEGORILERI = new Set(['rota', 'rotalar', 'guzergah', 'güzergah', 'sehirler-arasi', 'şehirler arası'])
const HEDEF_SLUGLAR = new Set(ROTALAR.map((r) => r.slug))

export function makaleRotaHedefi(makale) {
  if (!makale) return null
  const kategori = slugify(makale.kategori || '')
  const slug = String(makale.slug || '')
  const eslesme = slug.match(/^adana-(.+?)-(?:nakliye|nakliyat|evden-eve-nakliyat|evden-eve-nakliye|tasimacilik)$/)
  if (eslesme && HEDEF_SLUGLAR.has(eslesme[1])) return eslesme[1]
  const tersEslesme = slug.match(/^(.+?)-adana-(?:nakliye|nakliyat|evden-eve-nakliyat|evden-eve-nakliye|tasimacilik)$/)
  if (tersEslesme && HEDEF_SLUGLAR.has(tersEslesme[1])) return tersEslesme[1]
  if (ROTA_KATEGORILERI.has(kategori)) {
    const parcalar = slug.split('-')
    const bulunan = parcalar.find((p) => HEDEF_SLUGLAR.has(p))
    if (bulunan) return bulunan
  }
  return null
}

export function rotaMakalesiMi(makale) {
  return makaleRotaHedefi(makale) !== null
}

export function rotaOlmayanMakaleler(makaleler) {
  return (makaleler || []).filter((m) => !rotaMakalesiMi(m))
}

/** Aynı bölgedeki komşu rotalar — iç linkleme için. */
export function ilgiliRotalar(rota, adet = 8) {
  if (!rota) return []
  const ayniBolge = ROTALAR.filter((r) => r.bolge === rota.bolge && r.rotaSlug !== rota.rotaSlug)
  const ayniIl = ROTALAR.filter((r) => r.ilSlug === rota.ilSlug && r.rotaSlug !== rota.rotaSlug)
  const yakin = ROTALAR
    .filter((r) => r.rotaSlug !== rota.rotaSlug)
    .sort((a, b) => Math.abs(a.mesafe - rota.mesafe) - Math.abs(b.mesafe - rota.mesafe))
  const gorulen = new Set()
  const sonuc = []
  for (const aday of [...ayniIl, ...ayniBolge, ...yakin]) {
    if (gorulen.has(aday.rotaSlug)) continue
    gorulen.add(aday.rotaSlug)
    sonuc.push(aday)
    if (sonuc.length >= adet) break
  }
  return sonuc
}

export { BOLGELER, ILLER, ilBul, slugify }
