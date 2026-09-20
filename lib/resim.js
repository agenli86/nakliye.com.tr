/**
 * Görsel adreslerine sürüm damgası ekler.
 *
 * Neden gerekli: next.config.js `/resimler` altındaki dosyalara uzun
 * ömürlü bir Cache-Control veriyor. Bir dosyanın adını değiştirmeden
 * içeriğini güncellediğimizde tarayıcıda ve CDN'de duran eski kopya
 * yenilenmiyor; ziyaretçi aylarca eski resmi görüyor. Dosya adını
 * değiştirmek ise veritabanındaki (`hizmetler.resim`, `galeri.resim`,
 * `ayarlar.logo` gibi) yolları kırardı.
 *
 * Çözüm: yol aynı kalıyor, sonuna `?v=` ekleniyor. Adres değişince
 * önbellek anahtarı da değişiyor, dosya sisteminde hiçbir şey kırılmıyor.
 *
 * Bir görselin içeriğini yerinde değiştirdiğinde RESIM_SURUMU'nu bir
 * artır; aksi halde değişiklik ziyaretçilere ulaşmaz.
 */
export const RESIM_SURUMU = '2'

export function resimYolu(yol) {
  if (typeof yol !== 'string' || yol.length === 0) return yol
  // Yalnızca kendi sunduğumuz dosyalar; dış URL'lere ve data: adreslerine dokunma.
  if (!yol.startsWith('/resimler/') && !yol.startsWith('/resimler-optimized/')) return yol
  if (yol.includes('v=')) return yol
  return yol.includes('?') ? `${yol}&v=${RESIM_SURUMU}` : `${yol}?v=${RESIM_SURUMU}`
}
