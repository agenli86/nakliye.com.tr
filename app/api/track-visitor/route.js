import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Supabase client - Service role key ile
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

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

    // Supabase'e kaydet
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
      source: body.source
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
