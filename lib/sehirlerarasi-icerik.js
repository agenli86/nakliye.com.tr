/**
 * "Adıyaman Şehirler Arası Nakliye" sayfalarının veri ve metin üretimi.
 *
 * Sitede il başına zaten iki sayfa var: rota sayfası (Adana ↔ hedef
 * güzergahını anlatır) ve il hizmet sayfası (o ilde verdiğimiz hizmet
 * çeşitlerini anlatır). Bu üçüncü set şehirler arası taşımacılığın
 * kendisine odaklanıyor: hangi taşıma türü hangi araçla yapılıyor, ne
 * kadar sürüyor, nasıl fiyatlanıyor.
 *
 * Üç sayfanın metni bilinçli olarak ayrıştırıldı; aynı cümleler tekrar
 * etmiyor, aksi halde 240'ın üzerindeki sayfa birbirinin kopyası olurdu.
 */

import { ILLER, slugify } from './iller'
import { fiyatAyarlari, paraBicimle } from './rota-icerik'

export const SEHIRLERARASI_KOK = '/sehirler-arasi-nakliye'

export function sehirlerarasiUrl(ilSlug) {
  return `${SEHIRLERARASI_KOK}/${ilSlug}`
}

/**
 * Sayfadaki dört ana taşıma türü. Sıra hem makaledeki başlıkları hem de
 * fiyat tablosunun satırlarını belirler.
 */
export const SA_TASIMALARI = [
  {
    id: 'evden-eve-nakliyat',
    ad: 'Evden Eve Nakliyat',
    hacim: '25 - 45 m³',
    carpan: 1,
    kapsam: 'Söküm, ambalaj, taşıma ve montaj dahil tam ev taşıma',
  },
  {
    id: 'sehirler-arasi-ev-tasima',
    ad: 'Şehirler Arası Ev Taşıma',
    hacim: '35 - 60 m³',
    carpan: 1.32,
    kapsam: 'Tek araçla, aktarmasız; uzun mesafe için ek ambalaj',
  },
  {
    id: 'sehirler-arasi-kucuk-nakliye',
    ad: 'Şehirler Arası Küçük Nakliye',
    hacim: '6 - 12 m³',
    carpan: 0.38,
    kapsam: 'Öğrenci evi, tek oda, birkaç mobilya ve koli',
  },
  {
    id: 'asansor-tasima',
    ad: 'Asansörlü Taşıma',
    hacim: 'Kat farkı gözetmeksizin',
    carpan: 0.22,
    kapsam: 'Mobil asansörle pencereden yükleme ve indirme',
  },
]

function sec(liste, tohum, kaydir = 0) {
  return liste[(tohum + kaydir) % liste.length]
}

function yuvarla(deger, adim = 250) {
  return Math.max(adim, Math.round(deger / adim) * adim)
}

/** Adana çıkışlı taşımada yol süresi; ortalama 65 km/sa üzerinden. */
export function yolSuresi(mesafe) {
  if (!mesafe) return 'aynı gün'
  const saat = Math.max(1, Math.round(mesafe / 65))
  return `yaklaşık ${saat} saat`
}

export function teslimSuresi(mesafe) {
  if (!mesafe) return 'aynı gün'
  if (mesafe <= 250) return '1 gün'
  if (mesafe <= 700) return '1-2 gün'
  return '2-3 gün'
}

/**
 * Dört taşıma türü için tahmini fiyat tablosu.
 *
 * Rota sayfalarıyla aynı iki panel değeri kullanılıyor (baz ücret ve km
 * ücreti), böylece iki sayfa birbiriyle çelişen rakam göstermiyor.
 */
export function saFiyatTablosu(il, ayarlar) {
  const { baz, km } = fiyatAyarlari(ayarlar)
  const taban = baz + il.mesafe * km
  return SA_TASIMALARI.map((tasima) => {
    const orta = taban * tasima.carpan
    return {
      ad: `${il.ad} ${tasima.ad}`,
      hacim: tasima.hacim,
      aciklama: tasima.kapsam,
      alt: yuvarla(orta * 0.88),
      ust: yuvarla(orta * 1.14),
    }
  })
}

export function saGirisMetni(il) {
  const t = il.plaka || 0
  const acilis = [
    `${il.ad} şehirler arası nakliye işlerini Adana'daki kendi filomuzla yürütüyoruz; aracınız başka bir firmaya devredilmiyor.`,
    `Adana çıkışlı araçlarımız ${il.ad} yönüne düzenli sefer yaptığı için ${il.ad} şehirler arası nakliye taleplerini çoğu zaman aynı hafta içinde planlayabiliyoruz.`,
    `${il.bolgeAdi}'ndeki ${il.ad}, Adana depomuzun sabit güzergahlarından biri; bu yüzden şehirler arası taşımalarda boş dönüş maliyetini müşteriye yansıtmıyoruz.`,
  ]

  const mesafeCumlesi = il.mesafe
    ? `Adana ile ${il.ad} arası yaklaşık ${il.mesafe} km, yolculuk ${yolSuresi(il.mesafe)} sürüyor ve eşya ortalama ${teslimSuresi(il.mesafe)} içinde teslim ediliyor.`
    : `${il.ad} içinde ve ${il.ad} çıkışlı şehirler arası taşımalarda yükleme ile teslim çoğu zaman aynı gün tamamlanıyor.`

  return [
    sec(acilis, t),
    mesafeCumlesi,
    `Evden eve nakliyat, şehirler arası ev taşıma, şehirler arası küçük nakliye ve asansörlü taşıma dört ayrı hizmet olarak fiyatlanıyor. Hangisine ihtiyacınız olduğunu ücretsiz ekspertizde birlikte belirliyoruz.`,
  ]
}

export function saTasimaAciklamasi(tasima, il) {
  const mesafe = il.mesafe || 0
  switch (tasima.id) {
    case 'evden-eve-nakliyat':
      return `${il.ad} evden eve nakliyatta mobilyalar demonte edilir, streç ve balonlu naylonla sarılır, koliler oda oda etiketlenir. Yeni adreste montajı aynı ekip yapar, ekstra ustaya ihtiyaç kalmaz.`
    case 'sehirler-arasi-ev-tasima':
      return mesafe
        ? `${il.ad} şehirler arası ev taşımada eşyanız ${mesafe} km boyunca tek araçta kalır, ara depoya indirilmez. Uzun mesafede titreşime karşı ek köpük ve kasa içi sabitleme uygulanır.`
        : `${il.ad} çıkışlı şehirler arası ev taşımada eşyanız tek araçta kalır, ara depoya indirilmez. Kasa içi sabitleme yolun uzunluğuna göre planlanır.`
    case 'sehirler-arasi-kucuk-nakliye':
      return `Tek oda, öğrenci evi ya da birkaç parça mobilya için ${il.ad} yönüne giden araca parsiyel yükleme yapıyoruz. Aracın tamamının ücretini ödemediğiniz için küçük nakliye belirgin şekilde ucuza geliyor.`
    case 'asansor-tasima':
      return `${il.ad} asansörlü taşımada mobil asansör pencereden yükleme yapar; merdivenden taşıma olmadığı için hem eşya hem bina korunur. Asansör ihtiyacı ekspertizde belirlenir ve ücreti teklife baştan yazılır.`
    default:
      return tasima.kapsam
  }
}

export function saMakale(il) {
  const mesafe = il.mesafe || 0
  const bolumler = [
    {
      baslik: `${il.ad} Şehirler Arası Nakliyede Süreç Nasıl İşliyor?`,
      paragraflar: [
        `Her iş ücretsiz ekspertizle başlıyor. Eşya listesi çıkarılıyor, iki adresteki kat ve asansör durumu not ediliyor, araç tipi buna göre seçiliyor. ${il.ad} gibi ${mesafe ? `${mesafe} km` : 'kısa mesafe'} uzaklıktaki bir güzergahta doğru araç seçimi fiyatı en çok etkileyen kalem.`,
        `Ekspertiz sonrası fiyat yazılı olarak veriliyor ve taşıma günü değişmiyor. Yükleme günü ekip sabah geliyor, ambalajlama ve yükleme ortalama yarım gün sürüyor, araç aynı gün yola çıkıyor.`,
      ],
    },
    {
      baslik: `${il.ad} Şehirler Arası Ev Taşıma ile Küçük Nakliye Arasındaki Fark`,
      paragraflar: [
        `Şehirler arası ev taşıma, evin tamamının tek araçla taşınması demek. Araç sizin eşyanıza tahsis ediliyor, başka müşterinin yüküyle karışmıyor ve teslim saati baştan belli oluyor.`,
        `Şehirler arası küçük nakliyede ise ${il.ad} yönüne zaten giden bir araca parsiyel yükleme yapılıyor. Maliyet düşüyor ama teslim tarihi aracın programına bağlı olduğu için bir iki gün esneme olabiliyor. Taşınacak eşya 12 m³'ün altındaysa çoğu zaman bu seçenek daha mantıklı.`,
      ],
    },
    {
      baslik: `${il.ad} Asansörlü Taşıma Ne Zaman Gerekiyor?`,
      paragraflar: [
        `Binada yük asansörü yoksa ya da mevcut asansöre kanepe, buzdolabı gibi büyük parçalar sığmıyorsa mobil asansör kullanılıyor. Üçüncü kattan sonra merdivenden taşıma hem süreyi hem hasar riskini ciddi şekilde artırıyor.`,
        `${il.ad} merkezdeki yüksek katlı binalarda asansör kurulumu için sokakta yeterli alan olup olmadığını ekspertizde kontrol ediyoruz. Alan yoksa alternatif çözümü taşıma gününden önce planlıyoruz.`,
      ],
    },
    {
      baslik: `${il.ad} Şehirler Arası Nakliye Fiyatları Neye Göre Değişiyor?`,
      paragraflar: [
        `Fiyatı belirleyen dört kalem var: eşya hacmi, mesafe, iki adresteki kat ve asansör durumu, bir de ambalaj malzemesi miktarı. ${mesafe ? `Adana ${il.ad} arası ${mesafe} km olduğu için yakıt ve yol maliyeti toplam tutarın belirgin bir bölümünü oluşturuyor.` : 'Kısa mesafede yakıt kalemi küçük kalıyor, fiyatı asıl belirleyen eşya hacmi ve kat durumu oluyor.'}`,
        `Aşağıdaki tablo ortalama değerleri gösteriyor. Kesin rakam ücretsiz ekspertiz sonrası yazılı olarak veriliyor; sözlü tahminlerle iş bağlamıyoruz.`,
      ],
    },
  ]
  return bolumler
}

export function saSSS(il, fiyatlar) {
  const enUcuz = fiyatlar?.length ? paraBicimle(Math.min(...fiyatlar.map((f) => f.alt))) : null
  return [
    {
      soru: `${il.ad} şehirler arası nakliye ne kadar sürüyor?`,
      cevap: il.mesafe
        ? `Adana ile ${il.ad} arası ${il.mesafe} km. Yol ${yolSuresi(il.mesafe)}, yükleme ve boşaltma dahil ortalama teslim süresi ${teslimSuresi(il.mesafe)}.`
        : `${il.ad} içindeki ve ${il.ad} çıkışlı taşımalarda yükleme ile teslim çoğunlukla aynı gün tamamlanıyor.`,
    },
    {
      soru: `${il.ad} şehirler arası ev taşıma fiyatları ne kadar?`,
      cevap: enUcuz
        ? `Taşıma türüne göre değişiyor; küçük nakliye ${enUcuz} TL civarından başlıyor, tam ev taşıma eşya hacmine göre yukarı çıkıyor. Kesin fiyat ücretsiz ekspertiz sonrası yazılı veriliyor.`
        : `Fiyat eşya hacmi, mesafe, kat ve asansör durumuna göre belirleniyor. Ücretsiz ekspertiz sonrası yazılı teklif veriyoruz.`,
    },
    {
      soru: `${il.ad} küçük nakliye için tek araç tutmak zorunda mıyım?`,
      cevap: `Hayır. ${il.ad} yönüne giden araçlarımıza parsiyel yükleme yapıyoruz; birkaç parça eşya için aracın tamamının ücretini ödemiyorsunuz.`,
    },
    {
      soru: `${il.ad} asansörlü taşıma ücreti ayrı mı hesaplanıyor?`,
      cevap: `Asansör ihtiyacı ekspertizde belirleniyor ve ücreti teklifin içine baştan yazılıyor. Taşıma günü sürpriz ek ücret çıkmıyor.`,
    },
    {
      soru: `${il.ad} taşımalarında eşyalar sigortalı mı?`,
      cevap: `Evet. Tüm şehirler arası taşımalarımız sigortalı. Eşya listesi taşımadan önce yazılı olarak kayda alınıyor, teslimde aynı liste üzerinden kontrol ediliyor.`,
    },
  ]
}

/** Aynı bölgedeki diğer iller — iç linkleme için. */
export function bolgeKomsulari(il, adet = 10) {
  return ILLER.filter((x) => x.bolge === il.bolge && x.slug !== il.slug).slice(0, adet)
}

export { slugify }
