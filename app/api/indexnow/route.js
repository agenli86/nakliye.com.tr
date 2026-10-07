import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import { indexNowBildir } from '@/lib/indexnow'

/**
 * Panelden "arama motorlarına bildir" düğmesinin ucu.
 *
 * Gövdede adres listesi gönderilirse yalnızca onlar, gönderilmezse site
 * haritasındaki bütün sayfalar IndexNow'a bildirilir.
 *
 * Yetki: yalnızca panele giriş yapmış kullanıcı çağırabilir. Middleware
 * /api yollarını korumadığı için oturum burada ayrıca doğrulanıyor.
 */
export const dynamic = 'force-dynamic'

export async function POST(istek) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ hata: 'Giriş yapmanız gerekiyor.' }, { status: 401 })
  }

  let adresler = []
  try {
    const govde = await istek.json()
    if (Array.isArray(govde?.urls)) adresler = govde.urls
  } catch {
    // Gövdesiz istek: bütün site bildirilir.
  }

  try {
    const { gonderilen, sonuclar } = await indexNowBildir(adresler)
    const tamam = sonuclar.every((s) => s.tamam)

    return NextResponse.json({
      tamam,
      gonderilen,
      sonuclar,
      mesaj: tamam
        ? `${gonderilen} adres Bing, Yandex ve diğer IndexNow motorlarına bildirildi.`
        : 'Bildirim gönderildi ama arama motoru beklenmeyen bir yanıt verdi.',
    }, { status: tamam ? 200 : 502 })
  } catch (hata) {
    return NextResponse.json(
      { hata: 'Bildirim gönderilemedi: ' + (hata?.message || 'bilinmeyen hata') },
      { status: 500 }
    )
  }
}
