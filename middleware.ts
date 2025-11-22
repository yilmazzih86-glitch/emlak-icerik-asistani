import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // 1. Yanıt nesnesini ve header'ları hazırla
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  // 2. Supabase Client'ı oluştur (Cookie yönetimi için)
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          // İstek ve Yanıt cookie'lerini senkronize et
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          response = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // 3. Kullanıcıyı kontrol et
  // DİKKAT: getSession yerine getUser kullanmak daha güvenlidir
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // --- YÖNLENDİRME KURALLARI ---

  // A. Kullanıcı giriş yapmamışsa ve Dashboard'a girmeye çalışıyorsa -> Login'e at
  if (!user && request.nextUrl.pathname.startsWith('/dashboard')) {
    const url = request.nextUrl.clone()
    url.pathname = '/login' // (veya senin auth klasör yapına göre '/auth/login')
    return NextResponse.redirect(url)
  }

  // B. Kullanıcı zaten giriş yapmışsa ve Login/Register sayfasına girmeye çalışıyorsa -> Dashboard'a at
  if (user && (request.nextUrl.pathname.startsWith('/login') || request.nextUrl.pathname.startsWith('/register'))) {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Aşağıdaki yollar HARİÇ tüm isteklerde middleware çalışsın:
     * - _next/static (statik dosyalar)
     * - _next/image (resim optimizasyonu)
     * - favicon.ico (favicon)
     * - resim dosyaları (svg, png, jpg, jpeg, gif, webp)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}