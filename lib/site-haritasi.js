import { createPublicClient } from './supabase-public.js'
import { ILLER } from './iller.js'
import { ROTALAR, ilHizmetUrl, rotaMakalesiMi } from './rotalar.js'
import { sehirlerarasiUrl } from './sehirlerarasi-icerik.js'
import { nakliyecilerUrl } from './nakliyeciler-icerik.js'
import { HIZMET_SAYFALARI, hizmetSayfaUrl } from './hizmet-sayfalari.js'
import { SEMT_SAYFALARI, semtUrl } from './semtler.js'

export const SITE_URL = 'https://www.adananakliye.com.tr'

/**
 * Kod tarafındaki şablon sayfaların (rota, il, semt, hizmet) içeriği
 * yalnızca yeni bir sürüm yayınlandığında değişir. Buradaki tarih o
 * sayfaların sitemap'te bildirilen son güncelleme tarihidir.
 *
 * Neden sabit: eskiden bütün sayfalara `new Date()` yazılıyordu ve
 * sitemap günde bir tazelendiği için 600+ sayfa her gün "bugün
 * güncellendi" diye bildiriliyordu. Google lastmod'u güvenilmez bulduğu
 * anda bütün alan adı için yok sayıyor; yani değişen tek bir sayfa bile
 * öne çıkamıyordu. Şablon metinleri elden geçirildiğinde bu tarih
 * güncellenmelidir.
 */
export const SABLON_GUNCELLEME = new Date('2026-09-21T00:00:00.000Z')

const STATIK_ROTALAR = [
  { path: '', priority: 1.0, changeFrequency: 'weekly' },
  { path: '/hakkimizda', priority: 0.8, changeFrequency: 'monthly' },
  { path: '/hizmetler', priority: 0.9, changeFrequency: 'weekly' },
  { path: '/galeri', priority: 0.6, changeFrequency: 'monthly' },
  { path: '/blog', priority: 0.8, changeFrequency: 'weekly' },
  { path: '/rota', priority: 0.9, changeFrequency: 'weekly' },
  { path: '/nakliye-hizmetleri', priority: 0.9, changeFrequency: 'weekly' },
  { path: '/sehirler-arasi-nakliye', priority: 0.9, changeFrequency: 'weekly' },
  { path: '/nakliyeciler-sitesi', priority: 0.9, changeFrequency: 'weekly' },
  { path: '/nakliyat', priority: 0.9, changeFrequency: 'weekly' },
  { path: '/sss', priority: 0.6, changeFrequency: 'monthly' },
  { path: '/iletisim', priority: 0.7, changeFrequency: 'monthly' },
  { path: '/teklif-al', priority: 0.9, changeFrequency: 'monthly' },
  { path: '/kvkk', priority: 0.3, changeFrequency: 'yearly' },
  { path: '/gizlilik-politikasi', priority: 0.3, changeFrequency: 'yearly' },
]

const tarih = (deger) => {
  if (!deger) return null
  const d = new Date(deger)
  return Number.isNaN(d.getTime()) ? null : d
}

/**
 * Site haritasındaki bütün girdiler.
 *
 * Şablon sayfalar kod tarafındaki listelerden, hizmet ve makale detayları
 * veritabanından gelir. Panelden düzenlenen rota/il/şehirler arası/
 * nakliyeciler sayfalarının son güncelleme tarihi rota_sayfalari
 * kaydından okunur; kayıt yoksa şablon tarihi kullanılır.
 */
export async function siteHaritasiGirdileri() {
  let kayitTarihleri = new Map()
  let dinamikGirdiler = []

  try {
    const supabase = createPublicClient()
    const [{ data: hizmetler }, { data: makaleler }, rotaKayitlari] = await Promise.all([
      supabase.from('hizmetler').select('slug, updated_at, created_at').eq('aktif', true),
      supabase.from('makaleler').select('slug, kategori, updated_at, created_at').eq('aktif', true),
      supabase.from('rota_sayfalari').select('tur, slug, updated_at, created_at'),
    ])

    // Tablo henüz yoksa hata döner; şablon tarihleriyle devam edilir.
    for (const kayit of (rotaKayitlari?.error ? [] : rotaKayitlari?.data) || []) {
      const d = tarih(kayit.updated_at || kayit.created_at)
      if (d) kayitTarihleri.set(`${kayit.tur}:${kayit.slug}`, d)
    }

    const girdiye = (onek, priority, changeFrequency) => (row) => ({
      url: `${SITE_URL}${onek}/${row.slug}`,
      lastModified: tarih(row.updated_at || row.created_at) || SABLON_GUNCELLEME,
      changeFrequency,
      priority,
    })

    dinamikGirdiler = [
      ...(hizmetler || []).filter((r) => r.slug).map(girdiye('/hizmet', 0.8, 'monthly')),
      // Rota içerikli eski yazılar /rota/... adresine 301 ile gidiyor,
      // sitemap'e yönlendirilen URL konmaz.
      ...(makaleler || []).filter((r) => r.slug && !rotaMakalesiMi(r)).map(girdiye('/makale', 0.7, 'monthly')),
    ]
  } catch {
    // Veritabanına ulaşılamazsa en azından şablon sayfalar yayınlansın.
  }

  const kayitTarihi = (tur, slug) => kayitTarihleri.get(`${tur}:${slug}`) || SABLON_GUNCELLEME

  const statikGirdiler = STATIK_ROTALAR.map((route) => ({
    url: `${SITE_URL}${route.path}`,
    lastModified: SABLON_GUNCELLEME,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }))

  // Rota ve il hizmet sayfaları kod tarafındaki listeden geliyor; bunlar
  // veritabanına bağlı olmadığı için sitemap her koşulda eksiksiz.
  const rotaGirdileri = ROTALAR.map((rota) => ({
    url: `${SITE_URL}${rota.url}`,
    lastModified: kayitTarihi('rota', rota.rotaSlug),
    changeFrequency: 'monthly',
    priority: rota.tip === 'il' ? 0.8 : 0.7,
  }))

  const ilGirdileri = ILLER.map((il) => ({
    url: `${SITE_URL}${ilHizmetUrl(il.slug)}`,
    lastModified: kayitTarihi('il-hizmet', il.slug),
    changeFrequency: 'monthly',
    priority: 0.75,
  }))

  // İl başına iki şablon seti daha: şehirler arası nakliye ve
  // nakliyeciler sitesi.
  const sehirlerarasiGirdileri = ILLER.map((il) => ({
    url: `${SITE_URL}${sehirlerarasiUrl(il.slug)}`,
    lastModified: kayitTarihi('sehirler-arasi', il.slug),
    changeFrequency: 'monthly',
    priority: 0.75,
  }))

  const nakliyecilerGirdileri = ILLER.map((il) => ({
    url: `${SITE_URL}${nakliyecilerUrl(il.slug)}`,
    lastModified: kayitTarihi('nakliyeciler', il.slug),
    changeFrequency: 'monthly',
    priority: 0.7,
  }))

  // Kod tarafındaki dar konu hizmet sayfaları (pikap nakliye, hamaliye,
  // 1+1 ev taşıma ücretleri gibi).
  const ozelHizmetGirdileri = HIZMET_SAYFALARI.map((sayfa) => ({
    url: `${SITE_URL}${hizmetSayfaUrl(sayfa.slug)}`,
    lastModified: SABLON_GUNCELLEME,
    changeFrequency: 'monthly',
    priority: 0.8,
  }))

  // Adana semt ve ilçe sayfaları.
  const semtGirdileri = SEMT_SAYFALARI.map((sayfa) => ({
    url: `${SITE_URL}${semtUrl(sayfa.slug)}`,
    lastModified: SABLON_GUNCELLEME,
    changeFrequency: 'monthly',
    priority: sayfa.tip === 'ilce' ? 0.8 : 0.7,
  }))

  return [
    ...statikGirdiler,
    ...rotaGirdileri,
    ...ilGirdileri,
    ...sehirlerarasiGirdileri,
    ...nakliyecilerGirdileri,
    ...ozelHizmetGirdileri,
    ...semtGirdileri,
    ...dinamikGirdiler,
  ]
}

/** Site haritasındaki bütün adresler (IndexNow bildirimi için). */
export async function tumSayfaAdresleri() {
  const girdiler = await siteHaritasiGirdileri()
  return girdiler.map((g) => g.url)
}
