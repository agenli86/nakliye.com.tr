import { createBrowserClient } from '@supabase/ssr'
import {
  SUPABASE_ANON_KEY,
  SUPABASE_URL,
  createStubClient,
  hasSupabaseConfig,
  warnMissingConfig,
} from './supabase-config'

export function createClient() {
  // Admin sayfaları istemci bileşeni olsa da build sırasında bir kez
  // sunucuda ön üretiliyor; yapılandırma yoksa burada hata fırlatmak
  // tüm dağıtımı düşürüyordu.
  if (!hasSupabaseConfig()) {
    warnMissingConfig('supabase-browser')
    return createStubClient()
  }

  return createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY)
}
