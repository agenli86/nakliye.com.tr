/**
 * Supabase yapılandırmasının var olup olmadığını kontrol eder ve
 * yoksa build'i çökertmeyen bir yedek istemci üretir.
 *
 * Neden gerekli: NEXT_PUBLIC_SUPABASE_URL veya NEXT_PUBLIC_SUPABASE_ANON_KEY
 * tanımlı değilse @supabase/ssr ve @supabase/supabase-js istemci
 * oluştururken doğrudan hata fırlatıyor. Bu hata `next build` sırasında
 * sayfa ön üretimini (prerender) durdurduğu için dağıtım tamamen
 * başarısız oluyor — sitenin tek bir sayfası bile yayına çıkmıyor.
 *
 * Yapılandırma eksikse artık build tamamlanıyor, sorgular boş sonuç
 * dönüyor ve sayfalar yedek içerikleriyle çiziliyor. Sorun sessiz
 * kalmasın diye derleme günlüğüne net bir uyarı yazılıyor.
 */

export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export function hasSupabaseConfig() {
  return Boolean(SUPABASE_URL && SUPABASE_ANON_KEY)
}

let warned = false

export function warnMissingConfig(where) {
  if (warned) return
  warned = true
  const missing = [
    !SUPABASE_URL && 'NEXT_PUBLIC_SUPABASE_URL',
    !SUPABASE_ANON_KEY && 'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  ].filter(Boolean).join(', ')
  console.warn(
    `[supabase] ${missing} tanımlı değil (${where}). ` +
    'Veritabanı sorguları boş dönecek ve sayfalar yedek içerikle çizilecek. ' +
    'Vercel projesinin Environment Variables ayarlarını kontrol edin.'
  )
}

const MISSING_CONFIG_ERROR = {
  message: 'Supabase yapılandırması eksik (NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY).',
  code: 'SUPABASE_CONFIG_MISSING',
}

// Sorgu zinciri hem zincirlenebilir hem de await edilebilir olmalı:
// supabase.from('x').select('*').eq('a', 1).order('sira') gibi bir zincir
// sonunda await ediliyor. Proxy ile her iki davranışı da veriyoruz.
function createQueryStub(resolved) {
  const target = function () {}
  return new Proxy(target, {
    get(_t, prop) {
      if (prop === 'then') {
        return (onFulfilled, onRejected) =>
          Promise.resolve(resolved).then(onFulfilled, onRejected)
      }
      if (prop === 'catch') {
        return (onRejected) => Promise.resolve(resolved).catch(onRejected)
      }
      if (prop === 'finally') {
        return (onFinally) => Promise.resolve(resolved).finally(onFinally)
      }
      // Zincirin geri kalanı (select, eq, order, limit, single, insert, ...)
      return () => createQueryStub(resolved)
    },
    apply() {
      return createQueryStub(resolved)
    },
  })
}

/**
 * Gerçek istemcinin yerine geçen, hiçbir ağ isteği yapmayan yedek istemci.
 */
export function createStubClient() {
  const emptyResult = { data: null, error: MISSING_CONFIG_ERROR, count: null, status: 0 }

  return {
    from: () => createQueryStub(emptyResult),
    rpc: () => createQueryStub(emptyResult),
    auth: {
      getUser: async () => ({ data: { user: null }, error: MISSING_CONFIG_ERROR }),
      getSession: async () => ({ data: { session: null }, error: MISSING_CONFIG_ERROR }),
      signInWithPassword: async () => ({ data: { user: null, session: null }, error: MISSING_CONFIG_ERROR }),
      signOut: async () => ({ error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe() {} } } }),
    },
    storage: {
      from: () => ({
        upload: async () => ({ data: null, error: MISSING_CONFIG_ERROR }),
        remove: async () => ({ data: null, error: MISSING_CONFIG_ERROR }),
        getPublicUrl: () => ({ data: { publicUrl: '' } }),
      }),
    },
  }
}
