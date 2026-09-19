import { createClient as createSupabaseClient } from '@supabase/supabase-js'

/**
 * Herkese açık (giriş gerektirmeyen) sayfalar için Supabase istemcisi.
 *
 * Neden ayrı bir istemci: lib/supabase-server.js, next/headers'tan gelen
 * cookies() fonksiyonunu kullanır. cookies() bir "Dynamic API"dir; bir
 * sayfa onu okuduğu anda Next.js o rotayı tamamen dinamik kabul eder,
 * Full Route Cache'i devre dışı bırakır ve `export const revalidate`
 * değerini sessizce yok sayar. Sonuç: her ziyaretçide bütün Supabase
 * sorguları yeniden çalışır.
 *
 * Bu istemci hiç cookie okumaz, sadece anon key ile salt-okunur sorgu
 * yapar. Böylece sayfalar build sırasında üretilip ISR ile tazelenebilir.
 * Oturum gerektiren yerlerde (admin, auth) lib/supabase-server.js kullanılmaya
 * devam edilmelidir.
 */
export function createPublicClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    }
  )
}

// Mevcut sayfalardaki `const supabase = await createClient()` çağrılarını
// olduğu gibi bırakabilmek için aynı imzada bir yardımcı.
export async function createClient() {
  return createPublicClient()
}
