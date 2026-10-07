import toast from 'react-hot-toast'

/**
 * Panelde yapılan bir değişikliği siteye hemen yansıtır.
 *
 * Neden gerekli: sayfalar ISR ile önbellekleniyor (rota sayfalarında 24
 * saat). Kayıt veritabanına yazılsa bile site o süre dolana kadar eski
 * hâlini gösteriyor, kullanıcı da değişikliğin kabul edilmediğini
 * sanıyor. Her yazma çağrısından sonra burası çağrılmalı.
 *
 * Çağrı başarısızsa kayıt yine de duruyor; kullanıcıya soldaki
 * "Değişiklikleri Yayınla" düğmesi hatırlatılıyor.
 */
export async function onbellegiTazele(mesaj = 'Site güncellendi, sayfayı yenileyin.') {
  try {
    const cevap = await fetch('/api/onbellek-temizle', { method: 'POST' })
    if (!cevap.ok) throw new Error(String(cevap.status))
    toast.success(mesaj)
    return true
  } catch {
    toast('Kaydedildi. Sitede görünmesi için soldaki "Değişiklikleri Yayınla" düğmesine basın.')
    return false
  }
}
