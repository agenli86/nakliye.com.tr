import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Supabase client (opsiyonel - hata verirse de çalışsın)
let supabase = null
try {
  if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    )
  }
} catch (e) {
  console.error('Supabase init error:', e)
}

// Sistem prompt'u - Firma bilgileri
const SYSTEM_PROMPT = `Sen Adana Nakliye firmasının yapay zeka asistanısın. Sadece nakliyat ve taşımacılık konularında yardımcı olursun.

## FİRMA BİLGİLERİ:
- Firma Adı: Adana Nakliye
- Telefon: 0505 780 55 51
- Hizmet Bölgesi: Adana ve tüm Türkiye (şehirler arası)

## HİZMETLERİMİZ:
- Evden eve nakliyat
- Şehir içi nakliyat
- Şehirler arası nakliyat
- Asansörlü taşımacılık
- Ofis taşıma
- Eşya paketleme

## AMBALAJLAMA VE PAKETLEME:
- Biz tüm eşyaları profesyonelce ambalajlıyoruz
- Kırılacak eşyalar özel olarak paketlenir
- Mutfak malzemeleri (bardak, tabak vs) biz topluyoruz
- ELBİSE VE TEKSTİL malzemelerini MÜŞTERİ KENDİSİ toplar, biz toplamıyoruz

## BEYAZ EŞYA VE MOBİLYA:
- Beyaz eşyaları (buzdolabı, çamaşır makinesi vs) biz söküp takıyoruz
- Mobilyaları (gardırop, yatak, koltuk vs) biz söküp takıyoruz
- Bu hizmetler ÜCRETSİZ olarak dahildir

## KLİMA:
- Klima sökme/takma işlemini BİZ YAPMIYORUZ
- Müşteri klimayı kendisi söktürüp taktıracak
- Bu konuda bir klimacı ile anlaşmaları gerekiyor

## ASANSÖR KURULUMU:
- 1. kat ve üzeri taşımalarda MUTLAKA asansörlü taşıma yapılır
- Merdivenden taşıma yapmıyoruz (1. kat üstü için)
- Balkon veya pencerede demir şebeke/parmaklık varsa KESİM MÜŞTERİYE AİTTİR
- Biz demir kesimi yapmıyoruz, müşteri kestirmeli

## FİYATLAR:
Fiyatlar ORTALAMA değerlerdir, kesin fiyat için keşif gerekir:

1. Her iki taraf da zemin veya 1. kat ise: Ortalama 14.000 TL
2. Bir taraf zemin/1. kat, diğer taraf 1. kattan yukarı ise: Ortalama 16.000 TL (tek asansör)
3. Her iki taraf da 1. kattan yukarı ise: Ortalama 18.000 TL (çift asansör gerekir)

İndirim isteyen müşterilere: "İndirim için firma yetkilimizle görüşebilirsiniz" de ve bu numarayı ver: [0505 780 55 51](tel:05057805551)

## ŞEHİRLER ARASI NAKLİYAT:
- Şehirler arası nakliyat fiyatları buradan verilmiyor
- Mesafe, eşya miktarı gibi faktörlere göre değişir
- Müşteri mutlaka firmayı aramalı: 0505 780 55 51

## RANDEVU VE TEKLİF:
- Randevu almak için sitemizdeki "Teklif Al" formunu kullanabilirler
- Veya direkt arayabilirler: 0505 780 55 51

## ÖNEMLİ KURALLAR:
1. SADECE nakliyat, taşımacılık, paketleme konularında cevap ver
2. Bilmediğin veya emin olmadığın konularda "Bu konuda bilgim yok, lütfen firmamızı arayın: 0505 780 55 51" de
3. Siyaset, din, spor gibi alakasız konularda CEVAP VERME
4. Her zaman nazik ve profesyonel ol
5. Telefon numarasını tıklanabilir olarak ver: [0505 780 55 51](tel:05057805551)
6. Fiyat sorarlarsa ORTALAMA olduğunu ve kesin fiyat için aranması gerektiğini belirt`

// Günlük limiti kontrol et ve güncelle
async function checkAndUpdateLimit(kimlik, ipAdresi) {
  if (!supabase) return { allowed: true, remaining: 5 }
  
  try {
    const today = new Date().toISOString().split('T')[0]
    
    let { data: limit } = await supabase
      .from('chatbot_limitler')
      .select('*')
      .eq('kimlik', kimlik)
      .single()

    if (!limit) {
      const { data: newLimit } = await supabase
        .from('chatbot_limitler')
        .insert({
          kimlik,
          kimlik_tipi: 'fingerprint',
          soru_sayisi: 0,
          max_limit: 5,
          limit_reset_tarihi: today
        })
        .select()
        .single()
      limit = newLimit
    }

    if (limit && limit.limit_reset_tarihi !== today) {
      await supabase
        .from('chatbot_limitler')
        .update({ soru_sayisi: 0, limit_reset_tarihi: today })
        .eq('kimlik', kimlik)
      limit.soru_sayisi = 0
    }

    if (limit && limit.soru_sayisi >= (limit.max_limit || 5)) {
      return { allowed: false, remaining: 0 }
    }

    const newCount = (limit?.soru_sayisi || 0) + 1
    await supabase
      .from('chatbot_limitler')
      .update({ soru_sayisi: newCount, son_soru_tarihi: new Date().toISOString() })
      .eq('kimlik', kimlik)

    return { allowed: true, remaining: (limit?.max_limit || 5) - newCount }
  } catch (error) {
    console.error('Limit check error:', error)
    return { allowed: true, remaining: 5 }
  }
}

// Sohbeti kaydet
async function saveChatLog(data) {
  if (!supabase) return
  try {
    await supabase.from('chatbot_sohbetler').insert(data)
  } catch (error) {
    console.error('Chat log error:', error)
  }
}

export async function POST(request) {
  const startTime = Date.now()
  
  try {
    const { message, fingerprint } = await request.json()

    if (!message || message.trim().length === 0) {
      return NextResponse.json({ error: 'Mesaj boş olamaz' }, { status: 400 })
    }

    const ipAdresi = request.headers.get('x-forwarded-for')?.split(',')[0] || 
                     request.headers.get('x-real-ip') || 'unknown'
    const kimlik = fingerprint || ipAdresi

    // Limit kontrolü (hata olursa devam et)
    const limitCheck = await checkAndUpdateLimit(kimlik, ipAdresi)
    
    if (!limitCheck.allowed) {
      saveChatLog({
        fingerprint: fingerprint || null,
        ip_adresi: ipAdresi,
        kullanici_mesaji: message,
        bot_cevabi: null,
        basarili: false,
        hata_mesaji: 'Günlük limit aşıldı'
      })
      return NextResponse.json({
        error: 'Günlük soru limitiniz doldu (5 soru). Daha fazla bilgi için bizi arayın: 0505 780 55 51',
        limitReached: true,
        remainingQuestions: 0
      }, { status: 429 })
    }

    // API key kontrolü
    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) {
      return NextResponse.json({ 
        reply: 'Sistem bakımda. Lütfen bizi arayın: [0505 780 55 51](tel:05057805551)',
        remainingQuestions: limitCheck.remaining 
      })
    }

    // Claude API çağrısı
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-haiku-20240307',
        max_tokens: 500,
        system: SYSTEM_PROMPT,
        messages: [{ role: 'user', content: message }]
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Claude API Error:', errorText)
      
      saveChatLog({
        fingerprint: fingerprint || null,
        ip_adresi: ipAdresi,
        kullanici_mesaji: message,
        bot_cevabi: null,
        basarili: false,
        hata_mesaji: 'Claude API hatası: ' + errorText
      })

      return NextResponse.json({ 
        reply: 'Şu an yoğunluk var. Lütfen bizi arayın: [0505 780 55 51](tel:05057805551)',
        remainingQuestions: limitCheck.remaining 
      })
    }

    const data = await response.json()
    const reply = data.content[0]?.text || 'Üzgünüm, bir hata oluştu.'
    const cevapSuresi = Date.now() - startTime

    // Başarılı sohbeti kaydet
    saveChatLog({
      fingerprint: fingerprint || null,
      ip_adresi: ipAdresi,
      kullanici_mesaji: message,
      bot_cevabi: reply,
      basarili: true,
      hata_mesaji: null,
      cevap_suresi_ms: cevapSuresi,
      token_kullanimi: data.usage?.input_tokens + data.usage?.output_tokens || null
    })

    return NextResponse.json({
      reply,
      remainingQuestions: limitCheck.remaining
    })

  } catch (error) {
    console.error('Chatbot Error:', error)
    return NextResponse.json({ 
      reply: 'Bağlantı hatası. Lütfen bizi arayın: [0505 780 55 51](tel:05057805551)',
      remainingQuestions: 5 
    })
  }
}
