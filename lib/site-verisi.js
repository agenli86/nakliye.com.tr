/**
 * Rota ve il sayfalarının ortak verisi (ayarlar, menü, hizmetler, panel
 * kayıtları) için kısa ömürlü süreç içi önbellek.
 *
 * 240'ın üzerinde sayfa build sırasında statik üretiliyor. Her sayfa bu
 * veriyi ayrı ayrı sorgulasaydı derleme başına binin üzerinde Supabase
 * isteği çıkardı. Önbellek sayesinde tüm sayfalar tek bir sorgu kümesini
 * paylaşıyor; TTL dolduğunda (ISR tazelenmesinde) veri yeniden okunuyor.
 */

import { createPublicClient } from './supabase-public'

const TTL_MS = 60_000

let onbellek = null
let onbellekZamani = 0
let bekleyen = null

async function yukle() {
  const bos = { ayarlar: [], menu: [], hizmetler: [], rotaKayitlari: [] }
  try {
    const supabase = createPublicClient()
    const [ayarlar, menu, hizmetler, rotaKayitlari] = await Promise.all([
      supabase.from('ayarlar').select('*'),
      supabase.from('menu').select('*').eq('aktif', true).order('sira'),
      supabase.from('hizmetler').select('id, baslik, slug').eq('aktif', true).order('sira'),
      supabase.from('rota_sayfalari').select('*'),
    ])
    return {
      ayarlar: ayarlar.data || [],
      menu: menu.data || [],
      hizmetler: hizmetler.data || [],
      // Tablo henüz oluşturulmadıysa hata döner; sayfalar temel veriyle çalışır.
      rotaKayitlari: rotaKayitlari.error ? [] : rotaKayitlari.data || [],
    }
  } catch {
    return bos
  }
}

export async function siteVerisi() {
  const simdi = Date.now()
  if (onbellek && simdi - onbellekZamani < TTL_MS) return onbellek
  if (bekleyen) return bekleyen

  bekleyen = yukle()
    .then((veri) => {
      onbellek = veri
      onbellekZamani = Date.now()
      return veri
    })
    .finally(() => {
      bekleyen = null
    })

  return bekleyen
}

export function ayarAl(ayarlar, anahtar, varsayilan = '') {
  return ayarlar?.find((a) => a.anahtar === anahtar)?.deger || varsayilan
}

export const SITE_URL = 'https://www.adananakliye.com.tr'
