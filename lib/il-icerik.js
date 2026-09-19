/**
 * İl hizmet sayfalarının ("Ankara Nakliye Hizmetleri") metin üretimi.
 *
 * Rota sayfası Adana ↔ hedef güzergahını anlatır; il hizmet sayfası ise o
 * ilde verdiğimiz hizmet çeşitlerini anlatır. İki sayfanın metni bilinçli
 * olarak ayrıştırıldı, böylece birbirinin kopyası olmuyorlar.
 */

export const IL_HIZMETLERI = [
  {
    id: 'evden-eve-nakliyat',
    ad: 'Evden Eve Nakliyat',
    ozet: 'Söküm, ambalajlama, taşıma ve montaj dahil anahtar teslim ev taşıma.',
  },
  {
    id: 'sehirler-arasi-nakliyat',
    ad: 'Şehirler Arası Nakliyat',
    ozet: 'Adana çıkışlı tek araçla, aktarmasız ve sigortalı şehirler arası taşımacılık.',
  },
  {
    id: 'ofis-tasima',
    ad: 'Ofis ve İş Yeri Taşıma',
    ozet: 'Hafta sonu ve mesai dışı çalışmayla iş akışını durdurmadan ofis taşıma.',
  },
  {
    id: 'asansorlu-nakliyat',
    ad: 'Asansörlü Nakliyat',
    ozet: 'Yüksek katlı ve asansörsüz binalar için mobil asansörle güvenli taşıma.',
  },
  {
    id: 'parca-esya-tasima',
    ad: 'Parça Eşya Taşıma',
    ozet: 'Tek koltuk, beyaz eşya veya birkaç koli için parsiyel yükleme.',
  },
  {
    id: 'esya-depolama',
    ad: 'Eşya Depolama',
    ozet: 'Taşınma tarihleri uyuşmadığında kapalı ve sigortalı depoda kısa/uzun süreli saklama.',
  },
]

function sec(liste, tohum, kaydir = 0) {
  return liste[(tohum + kaydir) % liste.length]
}

export function ilGirisMetni(il) {
  const t = il.plaka || 0
  const kaliplar = [
    `${il.ad} nakliye hizmetlerimiz, Adana merkezli filomuzla ${il.bolgeAdi} genelinde yürüttüğümüz taşımacılığın bir parçası.`,
    `Adana çıkışlı araçlarımız ${il.ad} ve çevresine düzenli sefer yapıyor; bu yüzden ${il.ad} nakliye taleplerini kısa sürede planlayabiliyoruz.`,
    `${il.bolgeAdi}'nde yer alan ${il.ad}, Adana depomuzun sabit hizmet bölgelerinden biri.`,
  ]
  return [
    sec(kaliplar, t),
    `${il.ad} merkez ve ${il.ilceler.length} ilçesinde evden eve nakliyat, ofis taşıma, asansörlü nakliyat, parça eşya taşıma ve eşya depolama hizmeti veriyoruz. Adana ile ${il.ad} arası yaklaşık ${il.mesafe} km.`,
    `Her işte önce ücretsiz ekspertiz yapılır. Eşya listesi çıkarılır, kat ve asansör durumu belirlenir, fiyat yazılı olarak verilir. Verilen fiyat taşıma günü değişmez.`,
  ]
}

export function ilHizmetAciklamasi(hizmet, il) {
  switch (hizmet.id) {
    case 'evden-eve-nakliyat':
      return `${il.ad} evden eve nakliyatta mobilyalar demonte edilir, streç ve balonlu naylonla sarılır, yeni adreste aynı ekip tarafından kurulur. Koliler odalarına göre etiketlenir.`
    case 'sehirler-arasi-nakliyat':
      return `Adana ${il.ad} arası yaklaşık ${il.mesafe} km. Eşyanız tek araçla gider, başka bir araca aktarılmaz. Yol boyunca araç takip edilir ve teslim saati önceden bildirilir.`
    case 'ofis-tasima':
      return `${il.ad} ofis taşımalarını genellikle cuma akşamı başlatıp pazartesi sabahına yetiştiriyoruz. Sunucu, arşiv ve dosya dolapları numaralanarak taşınır.`
    case 'asansorlu-nakliyat':
      return `${il.ad} merkezdeki yüksek katlı binalarda mobil asansör kullanıyoruz. Asansör ihtiyacı ekspertizde belirlenir ve ücreti teklife baştan eklenir.`
    case 'parca-esya-tasima':
      return `${il.ad} yönüne giden araçlarımıza parsiyel yükleme yapıyoruz. Tek bir buzdolabı ya da birkaç koli için aracın tamamının ücretini ödemezsiniz.`
    case 'esya-depolama':
      return `Eski evden çıkış ile yeni eve giriş tarihleri uyuşmuyorsa eşyanız Adana'daki kapalı depomuzda sigortalı olarak bekletilir, tarih geldiğinde ${il.ad} adresine teslim edilir.`
    default:
      return hizmet.ozet
  }
}

export function ilSSS(il, rota) {
  return [
    {
      soru: `${il.ad} nakliye hizmetleri hangi ilçeleri kapsıyor?`,
      cevap: `${il.ad} merkez dahil ${il.ilceler.slice(0, 8).join(', ')} başta olmak üzere ilin tüm ilçelerine hizmet veriyoruz.`,
    },
    {
      soru: `Adana ${il.ad} arası taşıma ne kadar sürer?`,
      cevap: `Yaklaşık ${il.mesafe} km'lik mesafede yükleme, yol ve boşaltma dahil ortalama teslim süresi ${rota?.teslimGun || '1-2 gün'}.`,
    },
    {
      soru: `${il.ad} için fiyat nasıl belirleniyor?`,
      cevap: `Fiyat; eşya hacmi, iki adresteki kat ve asansör durumu ile mesafeye göre hesaplanır. Ücretsiz ekspertiz sonrası yazılı teklif veriyoruz ve bu fiyat taşıma günü değişmiyor.`,
    },
    {
      soru: `${il.ad} taşımalarında sigorta var mı?`,
      cevap: `Evet. Tüm şehirler arası taşımalarımız sigortalıdır; eşya listesi taşıma öncesi yazılı olarak kayda alınır.`,
    },
    {
      soru: `${il.ad}'den Adana'ya ters yönde taşıma yapıyor musunuz?`,
      cevap: `Evet. ${il.ad} Adana yönündeki taşımaları da aynı ekip ve aynı koşullarla yapıyoruz. Dönüş yükü olduğunda fiyat daha uygun olabiliyor.`,
    },
  ]
}
