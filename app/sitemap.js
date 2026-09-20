import { createPublicClient } from '@/lib/supabase-public'
import { ILLER } from '@/lib/iller'
import { ROTALAR, ilHizmetUrl, rotaMakalesiMi } from '@/lib/rotalar'
import { sehirlerarasiUrl } from '@/lib/sehirlerarasi-icerik'
import { nakliyecilerUrl } from '@/lib/nakliyeciler-icerik'

const SITE_URL = 'https://www.adananakliye.com.tr'

// Sitemap günde bir tazelenir.
export const revalidate = 86400

const STATIC_ROUTES = [
  { path: '', priority: 1.0, changeFrequency: 'weekly' },
  { path: '/hakkimizda', priority: 0.8, changeFrequency: 'monthly' },
  { path: '/hizmetler', priority: 0.9, changeFrequency: 'weekly' },
  { path: '/galeri', priority: 0.6, changeFrequency: 'monthly' },
  { path: '/blog', priority: 0.8, changeFrequency: 'weekly' },
  { path: '/rota', priority: 0.9, changeFrequency: 'weekly' },
  { path: '/nakliye-hizmetleri', priority: 0.9, changeFrequency: 'weekly' },
  { path: '/sehirler-arasi-nakliye', priority: 0.9, changeFrequency: 'weekly' },
  { path: '/nakliyeciler-sitesi', priority: 0.9, changeFrequency: 'weekly' },
  { path: '/sss', priority: 0.6, changeFrequency: 'monthly' },
  { path: '/iletisim', priority: 0.7, changeFrequency: 'monthly' },
  { path: '/teklif-al', priority: 0.9, changeFrequency: 'monthly' },
  { path: '/kvkk', priority: 0.3, changeFrequency: 'yearly' },
  { path: '/gizlilik-politikasi', priority: 0.3, changeFrequency: 'yearly' },
]

/**
 * Dinamik sitemap.
 *
 * Eskiden public/sitemap.xml elle yazılmış 18 sabit URL içeriyordu;
 * hizmet ve makale detay sayfaları listede yoktu ve lastmod tarihleri
 * güncellenmiyordu. Artık hizmetler/makaleler veritabanından okunuyor,
 * yeni içerik eklendiğinde sitemap kendiliğinden güncelleniyor.
 */
export default async function sitemap() {
  const now = new Date()

  const staticEntries = STATIC_ROUTES.map(route => ({
    url: `${SITE_URL}${route.path}`,
    lastModified: now,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }))

  // Rota ve il hizmet sayfaları kod tarafındaki listeden geliyor; bunlar
  // veritabanına bağlı olmadığı için sitemap her koşulda eksiksiz.
  const rotaEntries = ROTALAR.map(rota => ({
    url: `${SITE_URL}${rota.url}`,
    lastModified: now,
    changeFrequency: 'monthly',
    priority: rota.tip === 'il' ? 0.8 : 0.7,
  }))

  const ilEntries = ILLER.map(il => ({
    url: `${SITE_URL}${ilHizmetUrl(il.slug)}`,
    lastModified: now,
    changeFrequency: 'monthly',
    priority: 0.75,
  }))

  // İl başına iki şablon seti daha: şehirler arası nakliye ve
  // nakliyeciler sitesi. Bunlar da kod tarafındaki il listesinden geliyor.
  const sehirlerarasiEntries = ILLER.map(il => ({
    url: `${SITE_URL}${sehirlerarasiUrl(il.slug)}`,
    lastModified: now,
    changeFrequency: 'monthly',
    priority: 0.75,
  }))

  const nakliyecilerEntries = ILLER.map(il => ({
    url: `${SITE_URL}${nakliyecilerUrl(il.slug)}`,
    lastModified: now,
    changeFrequency: 'monthly',
    priority: 0.7,
  }))

  let dynamicEntries = []

  try {
    const supabase = createPublicClient()
    const [{ data: hizmetler }, { data: makaleler }] = await Promise.all([
      supabase.from('hizmetler').select('slug, updated_at, created_at').eq('aktif', true),
      supabase.from('makaleler').select('slug, kategori, updated_at, created_at').eq('aktif', true),
    ])

    const toEntry = (prefix, priority, changeFrequency) => row => ({
      url: `${SITE_URL}${prefix}/${row.slug}`,
      lastModified: new Date(row.updated_at || row.created_at || now),
      changeFrequency,
      priority,
    })

    dynamicEntries = [
      ...(hizmetler || []).filter(r => r.slug).map(toEntry('/hizmet', 0.8, 'monthly')),
      // Rota içerikli eski yazılar /rota/... adresine 301 ile gidiyor,
      // sitemap'e yönlendirilen URL konmaz.
      ...(makaleler || []).filter(r => r.slug && !rotaMakalesiMi(r)).map(toEntry('/makale', 0.7, 'monthly')),
    ]
  } catch {
    // Veritabanına ulaşılamazsa en azından statik sayfalar yayınlansın.
  }

  return [
    ...staticEntries,
    ...rotaEntries,
    ...ilEntries,
    ...sehirlerarasiEntries,
    ...nakliyecilerEntries,
    ...dynamicEntries,
  ]
}
