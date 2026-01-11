import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

// MOBİL OPERATÖR TESPİTİ
function detectMobileOperator(ip) {
  if (!ip || ip === 'unknown') return null
  
  const operators = {
    'Türkcell': [
      '212.58.', '212.59.', '212.252.', '212.253.', 
      '31.223.', '88.240.', '88.241.', '88.242.',
      '78.176.', '78.177.', '78.178.', '78.179.'
    ],
    'Vodafone': [
      '212.175.', '212.174.', '195.174.', '195.175.', 
      '85.96.', '85.97.', '85.98.', '85.99.',
      '213.74.', '213.75.'
    ],
    'Turk Telekom': [
      '88.247.', '88.248.', '88.249.', 
      '78.188.', '78.189.', '78.190.',
      '176.88.', '176.89.', '176.90.'
    ]
  }
  
  for (const [operator, ipRanges] of Object.entries(operators)) {
    for (const range of ipRanges) {
      if (ip.startsWith(range)) {
        return operator
      }
    }
  }
  
  return null
}

function detectDeviceType(userAgent) {
  if (/tablet|ipad/i.test(userAgent)) return 'tablet'
  if (/mobile|android|iphone/i.test(userAgent)) return 'mobile'
  return 'desktop'
}

function detectBrowser(userAgent) {
  if (userAgent.includes('Chrome')) return 'Chrome'
  if (userAgent.includes('Safari')) return 'Safari'
  if (userAgent.includes('Firefox')) return 'Firefox'
  if (userAgent.includes('Edge')) return 'Edge'
  if (userAgent.includes('Opera')) return 'Opera'
  return 'Diğer'
}

function detectOS(userAgent) {
  if (userAgent.includes('Android')) return 'Android'
  if (userAgent.includes('iPhone') || userAgent.includes('iPad')) return 'iOS'
  if (userAgent.includes('Windows')) return 'Windows'
  if (userAgent.includes('Mac')) return 'macOS'
  if (userAgent.includes('Linux')) return 'Linux'
  return 'Diğer'
}

export async function POST(request) {
  console.log('🔵 API Route Çalıştı - track-visitor')
  
  try {
    const body = await request.json()
    console.log('🟡 Gelen body:', body)
    
    // IP adresi
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 
               request.headers.get('x-real-ip') || 
               'unknown'
    
    console.log('🟡 IP:', ip)
    
    // User Agent
    const userAgent = body.userAgent || request.headers.get('user-agent') || 'unknown'
    
    // Tespit sistemleri
    const mobileOperator = detectMobileOperator(ip)
    const deviceType = detectDeviceType(userAgent)
    const browser = detectBrowser(userAgent)
    const os = detectOS(userAgent)

    console.log('🟡 Tespit edilen:', { mobileOperator, deviceType, browser, os })

    // Konum bilgisi
    let locationData = {}
    if (body.location) {
      locationData = {
        enlem: body.location.lat,
        boylam: body.location.lng,
        konum_izni: true
      }
      console.log('🟢 Konum bilgisi var:', locationData)
    }

    // Supabase'e kaydet
    const insertData = {
      ip_adresi: ip,
      mobil_operator: mobileOperator,
      cihaz_turu: deviceType,
      tarayici: browser,
      isletim_sistemi: os,
      utm_source: body.source,
      utm_medium: body.medium,
      utm_campaign: body.campaign,
      referrer: body.referrer,
      giris_sayfasi: body.page,
      ...locationData
    }

    console.log('🔵 Supabase\'e kaydediliyor:', insertData)

    const { data, error } = await supabase
      .from('ziyaretciler')
      .insert(insertData)
      .select()

    if (error) {
      console.error('❌ Supabase error:', error)
      return NextResponse.json(
        { error: 'Database error', details: error.message },
        { status: 500 }
      )
    }

    console.log('✅ Supabase\'e kaydedildi:', data)

    return NextResponse.json({ 
      success: true, 
      operator: mobileOperator,
      deviceType,
      locationTracked: !!body.location
    })

  } catch (error) {
    console.error('❌ Track visitor error:', error)
    return NextResponse.json(
      { error: 'Tracking failed', details: error.message },
      { status: 500 }
    )
  }
}
