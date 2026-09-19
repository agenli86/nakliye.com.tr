import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import { SUPABASE_ANON_KEY, SUPABASE_URL, hasSupabaseConfig } from '@/lib/supabase-config'

export async function middleware(request) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  // Yapılandırma yoksa oturum doğrulanamaz. Bu durumda güvenli tarafta
  // kalıp admin isteklerini giriş sayfasına yönlendiriyoruz; istemciyi
  // oluşturmaya çalışmak her istekte 500 dönmesine yol açıyordu.
  if (!hasSupabaseConfig()) {
    if (request.nextUrl.pathname.startsWith('/admin') &&
        request.nextUrl.pathname !== '/admin/giris') {
      const url = request.nextUrl.clone()
      url.pathname = '/admin/giris'
      return NextResponse.redirect(url)
    }
    return supabaseResponse
  }

  const supabase = createServerClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Admin sayfalarını koru
  if (request.nextUrl.pathname.startsWith('/admin')) {
    // Login sayfası hariç
    if (request.nextUrl.pathname !== '/admin/giris') {
      if (!user) {
        const url = request.nextUrl.clone()
        url.pathname = '/admin/giris'
        return NextResponse.redirect(url)
      }
    }
  }

  // Giriş yapılmışsa admin/giris'e gitmeyi engelle
  if (request.nextUrl.pathname === '/admin/giris' && user) {
    const url = request.nextUrl.clone()
    url.pathname = '/admin'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/admin/:path*'],
}
