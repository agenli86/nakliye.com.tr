/**
 * rota_sayfalari tablosundan gelen panel içeriğiyle kod tarafındaki temel
 * rota verisini birleştirir.
 *
 * Tablo henüz oluşturulmamışsa veya Supabase'e ulaşılamıyorsa sayfa yine de
 * üretilmeli; bu yüzden tüm okumalar hataya karşı korunuyor ve boş sonuç
 * dönüyor.
 */

import { createPublicClient } from './supabase-public'

const SECIM = 'slug, tur, hedef_slug, baslik, h1, ozet, icerik, makale_baslik, makale, resim, mesafe_km, sure_metni, ilceler, fiyat_notu, aktif, meta_title, meta_description, meta_keywords, og_image, canonical_url, updated_at'

async function guvenliSorgu(calistir) {
  try {
    const { data, error } = await calistir(createPublicClient())
    if (error) return []
    return data || []
  } catch {
    return []
  }
}

export async function rotaKaydiGetir(slug) {
  const kayitlar = await guvenliSorgu((supabase) =>
    supabase.from('rota_sayfalari').select(SECIM).eq('slug', slug).limit(1)
  )
  return kayitlar[0] || null
}

export async function rotaKayitlariGetir(tur) {
  return guvenliSorgu((supabase) => {
    let sorgu = supabase.from('rota_sayfalari').select(SECIM)
    if (tur) sorgu = sorgu.eq('tur', tur)
    return sorgu
  })
}

/** Panelden pasife alınmış sayfaların slug kümesi. */
export async function pasifSluglar() {
  const kayitlar = await guvenliSorgu((supabase) =>
    supabase.from('rota_sayfalari').select('slug, aktif').eq('aktif', false)
  )
  return new Set(kayitlar.map((k) => k.slug))
}

function bosMu(deger) {
  return deger === null || deger === undefined || String(deger).trim() === ''
}

/**
 * Temel rota verisini panel kaydıyla ezer. Panelde boş bırakılan her alan
 * kod tarafındaki değeri korur, böylece tek bir alan doldurmak için sayfanın
 * tamamını yeniden yazmak gerekmez.
 */
export function rotaBirlestir(rota, kayit) {
  if (!kayit) return { ...rota, panel: null }
  const mesafe = Number(kayit.mesafe_km)
  const birlesik = {
    ...rota,
    panel: kayit,
    mesafe: Number.isFinite(mesafe) && mesafe > 0 ? mesafe : rota.mesafe,
  }
  if (!bosMu(kayit.h1)) birlesik.rotaAdi = kayit.h1
  if (!bosMu(kayit.baslik)) birlesik.tersBaslik = kayit.baslik
  if (!bosMu(kayit.sure_metni)) birlesik.teslimGun = kayit.sure_metni
  if (!bosMu(kayit.ilceler)) {
    const ek = String(kayit.ilceler).split(',').map((s) => s.trim()).filter(Boolean)
    birlesik.ilceler = [...new Set([...(rota.ilceler || []), ...ek])]
  }
  birlesik.yolSaat = Math.max(1, Math.round(birlesik.mesafe / 65))
  return birlesik
}
