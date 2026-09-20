import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase-server'

/**
 * Panelden yapılan değişiklikleri siteye anında yansıtır.
 *
 * Neden gerekli: sayfalar ISR ile üretiliyor (`export const revalidate`
 * anasayfada 1 saat, şablon sayfalarda 24 saat). Panelde telefon, metin
 * veya görsel değiştirildiğinde site o süre dolana kadar eski hâlini
 * göstermeye devam ediyor ve değişiklik "olmamış" gibi görünüyor.
 * Burası çağrıldığında bütün rotaların önbelleği düşürülüyor, ilk
 * ziyaretçide sayfa veritabanından yeniden üretiliyor.
 *
 * Yetki: yalnızca panele giriş yapmış kullanıcı çağırabilir. Middleware
 * /api yollarını korumadığı için oturum burada ayrıca doğrulanıyor.
 */
export const dynamic = 'force-dynamic'

export async function POST() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ hata: 'Giriş yapmanız gerekiyor.' }, { status: 401 })
  }

  // 'layout' tipi, kök düzeni paylaşan bütün alt rotaları da kapsıyor.
  revalidatePath('/', 'layout')

  return NextResponse.json({
    tamam: true,
    mesaj: 'Önbellek temizlendi. Sayfayı yenilediğinizde güncel hâli görünür.',
  })
}
