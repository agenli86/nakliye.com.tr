import { siteHaritasiGirdileri } from '@/lib/site-haritasi'

// Sitemap günde bir tazelenir.
export const revalidate = 86400

/**
 * Dinamik sitemap.
 *
 * Eskiden public/sitemap.xml elle yazılmış 18 sabit URL içeriyordu;
 * hizmet ve makale detay sayfaları listede yoktu ve lastmod tarihleri
 * güncellenmiyordu. Listeyi üreten mantık lib/site-haritasi.js içinde,
 * çünkü IndexNow bildirimi de aynı adres listesini kullanıyor.
 */
export default async function sitemap() {
  return siteHaritasiGirdileri()
}
