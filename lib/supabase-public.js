import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import {
  SUPABASE_ANON_KEY,
  SUPABASE_URL,
  createStubClient,
  hasSupabaseConfig,
  warnMissingConfig,
} from './supabase-config'

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
  // Sayfalar artık build sırasında ön üretildiği için, yapılandırma
  // eksikse burada fırlatılan hata bütün dağıtımı düşürüyor. Bunun
  // yerine boş sonuç dönen yedek istemciyi veriyoruz; sayfalar kendi
  // yedek içerikleriyle yayına çıkıyor.
  if (!hasSupabaseConfig()) {
    warnMissingConfig('supabase-public')
    return createStubClient()
  }

  return createSupabaseClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY,
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
