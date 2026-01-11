import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Supabase client - Service role key ile
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

// MOBİL OPERATÖR TESPİTİ - Türk mobil operatörlerinin IP aralıkları
function detectMobileOperator(ip, userAgent) {
  if (!ip || ip === 'unknown') return null

  // Türk mobil operatörlerinin IP aralıkları
  const operators = {
    'Türkcell': ['212.58.', '212.59.', '212.252.', '212.253.', '31.223.', '88.241.', '88.242.'],
    'Vodafone': ['212.175.', '212.174.', '195.174.', '195.175.', '85.96.', '85.97.'],
    'Turk Telekom': ['88.247.', '88.248.', '88.249.', '78.188.', '78.189.', '176.88.', '176.89.']
  }

  for (const [operator, ipRanges] of Object.entries(operators)) {
    for (const range of ipRanges) {
      if (ip.startsWith(range)) {
        return operator
      }
    }
  }

  // User agent'tan mobil kontrolü
  const isMobile = /mobile|android|iphone|ipad/i.test(userAgent)
  if (isMobile && ip !== 'unknown') {
    return 'Mobil (Bilinmiyor)'
  }

  return null
}

// CİHAZ TİPİ TESPİTİ
function detectDeviceType(userAgent) {
  if (!userAgent || userAgent === 'unknown') return 'desktop'
  if (/tablet|ipad/i.test(userAgent)) return 'tablet'
  if (/mobile|android|iphone/i.test(userAgent)) return 'mobile'
  return 'desktop'
}

// TARAYICI TESPİTİ
function detectBrowser(userAgent) {
  if (!userAgent || userAgent === 'unknown') return 'Diğer'
  if (userAgent.includes('Edg')) return 'Edge'
  if (userAgent.includes('Chrome')) return 'Chrome'
  if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) return 'Safari'
  if (userAgent.includes('Firefox')) return 'Firefox'
  if (userAgent.includes('Opera') || userAgent.includes('OPR')) return 'Opera'
  return 'Diğer'
}

// İŞLETİM SİSTEMİ TESPİTİ
function detectOS(userAgent) {
  if (!userAgent || userAgent === 'unknown') return 'Diğer'
  if (userAgent.includes('Android')) return 'Android'
  if (userAgent.includes('iPhone') || userAgent.includes('iPad')) return 'iOS'
  if (userAgent.includes('Windows')) return 'Windows'
  if (userAgent.includes('Macintosh') || userAgent.includes('Mac OS')) return 'macOS'
  if (userAgent.includes('Linux')) return 'Linux'
  return 'Diğer'
}

export async function POST(request) {
  try {
    const body = await request.json()

    // IP adresi al
    const forwarded = request.headers.get('x-forwarded-for')
    const realIp = request.headers.get('x-real-ip')
    const ip = forwarded?.split(',')[0]?.trim() || realIp || 'unknown'

    // User Agent
    const userAgent = body.userAgent || request.headers.get('user-agent') || 'unknown'

    // Session ID (cookie'den al veya yeni oluştur)
    let sessionId = request.cookies.get('visitor_session')?.value
    if (!sessionId) {
      sessionId = crypto.randomUUID()
    }

    // Tespit sistemleri
    const mobileOperator = detectMobileOperator(ip, userAgent)
    const deviceType = detectDeviceType(userAgent)
    const browser = detectBrowser(userAgent)
    const os = detectOS(userAgent)

    // Supabase'e kaydet (GÜNCELLENMİŞ KOLONLARLA)
    const { data, error } = await supabase
      .from('visitors')
      .insert({
        session_id: sessionId,
        ip_address: ip,
        source: body.source || 'direk',
        medium: body.medium || 'none',
        campaign: body.campaign,
        referrer: body.referrer,
        gclid: body.gclid,
        fbclid: body.fbclid,
        page: body.page,
        full_url: body.fullUrl,
        user_agent: userAgent,
        mobile_operator: mobileOperator,
        device_type: deviceType,
        browser: browser,
        os: os,
        visited_at: new Date().toISOString()
      })

    if (error) {
      console.error('Supabase error:', error)
      throw error
    }

    // Response with cookie
    const response = NextResponse.json({
      success: true,
      sessionId,
      source: body.source,
      operator: mobileOperator,
      device: deviceType,
      browser: browser,
      os: os
    })

    // 30 günlük cookie set et
    response.cookies.set('visitor_session', sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 gün
      path: '/'
    })

    return response

  } catch (error) {
    console.error('Track visitor error:', error)
    return NextResponse.json(
      {
        error: 'Tracking failed',
        message: error.message
      },
      { status: 500 }
    )
  }
}
