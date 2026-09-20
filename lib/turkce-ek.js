/**
 * Türkçe özel ada hâl eki getirme.
 *
 * Semt sayfaları yer adlarını cümle içinde çekimliyor. Eki elle yazmak
 * "Seyhan'de", "Huzurevleri'de", "Gürselpaşa'in" gibi yanlışlar üretiyor;
 * 67 semtin her biri farklı ünlüyle bittiği için tek bir ek yetmiyor.
 * Burada ünlü uyumu, sert ünsüz benzeşmesi ve iyelik ekiyle biten adların
 * araya aldığı "n" kaydırma sesi uygulanıyor.
 */

const SESLI = 'aeıioöuü'
const KALIN = 'aıou'
const SERT_UNSUZ = 'fstkçşhp'

/**
 * Üçüncü tekil iyelik ekiyle biten yer adları. Bunlar ek almadan önce
 * araya "n" alıyor: Huzurevleri'nde, Gülbahçesi'nden, Dadaloğlu'na.
 * Otomatik anlaşılmıyor, çünkü "Denizli" ya da "Köprülü" de aynı harfle
 * bitiyor ama iyelik değil.
 */
const IYELIKLI = new Set([
  'Huzurevleri',
  'Belediye Evleri',
  'Kanalüstü',
  'Gülbahçesi',
  'Türkocağı',
  'Dadaloğlu',
])

function sonSesli(kelime) {
  for (let i = kelime.length - 1; i >= 0; i--) {
    const h = kelime[i].toLocaleLowerCase('tr-TR')
    if (SESLI.includes(h)) return h
  }
  return 'a'
}

function kalinMi(kelime) {
  return KALIN.includes(sonSesli(kelime))
}

function sonHarf(kelime) {
  return kelime.trim().slice(-1).toLocaleLowerCase('tr-TR')
}

function sesliyleBitiyor(kelime) {
  return SESLI.includes(sonHarf(kelime))
}

/** Bulunma hâli: -da / -de / -ta / -te. "Seyhan'da", "Toros'ta". */
export function bulunma(ad) {
  const kalin = kalinMi(ad)
  if (IYELIKLI.has(ad)) return `${ad}'${kalin ? 'nda' : 'nde'}`
  const sert = SERT_UNSUZ.includes(sonHarf(ad))
  const ek = sert ? (kalin ? 'ta' : 'te') : kalin ? 'da' : 'de'
  return `${ad}'${ek}`
}

/** Ayrılma hâli: -dan / -den / -tan / -ten. "Seyhan'dan", "Toros'tan". */
export function ayrilma(ad) {
  const kalin = kalinMi(ad)
  if (IYELIKLI.has(ad)) return `${ad}'${kalin ? 'ndan' : 'nden'}`
  const sert = SERT_UNSUZ.includes(sonHarf(ad))
  const ek = sert ? (kalin ? 'tan' : 'ten') : kalin ? 'dan' : 'den'
  return `${ad}'${ek}`
}

/** Yönelme hâli: -a / -e. "Adana'ya", "Huzurevleri'ne", "Seyhan'a". */
export function yonelme(ad) {
  const kalin = kalinMi(ad)
  if (IYELIKLI.has(ad)) return `${ad}'${kalin ? 'na' : 'ne'}`
  const kaydirma = sesliyleBitiyor(ad) ? 'y' : ''
  return `${ad}'${kaydirma}${kalin ? 'a' : 'e'}`
}

/** İlgi hâli: -ın / -in / -un / -ün. "Gürselpaşa'nın", "Toros'un". */
export function tamlayan(ad) {
  const sesli = sonSesli(ad)
  const ek = { a: 'ın', ı: 'ın', o: 'un', u: 'un', e: 'in', i: 'in', ö: 'ün', ü: 'ün' }[sesli] || 'ın'
  if (IYELIKLI.has(ad)) return `${ad}'n${ek}`
  const kaydirma = sesliyleBitiyor(ad) ? 'n' : ''
  return `${ad}'${kaydirma}${ek}`
}
