/**
 * Rota sayfalarının metin, tablo ve fiyat üretimi.
 *
 * Amaç: 160'ın üzerinde rota sayfasının birbirinin kopyası olmaması.
 * Metinler rotanın mesafesi, bölgesi, ilçe listesi ve plaka koduna göre
 * değişiyor; plaka kodu aynı zamanda alternatif cümle kalıplarını seçen
 * deterministik bir tohum olarak kullanılıyor (her derlemede aynı sonuç).
 */

import { BOLGELER } from './iller.js'

function tohum(rota) {
  const kaynak = rota.plaka || rota.slug.length + rota.mesafe
  return Number(kaynak) || 0
}

function sec(liste, rota, kaydir = 0) {
  return liste[(tohum(rota) + kaydir) % liste.length]
}

/* ------------------------------------------------------------------ */
/* Fiyatlandırma                                                       */
/* ------------------------------------------------------------------ */

export const VARSAYILAN_BAZ_UCRET = 6500
export const VARSAYILAN_KM_UCRETI = 22

export function fiyatAyarlari(ayarlar) {
  const deger = (anahtar) => ayarlar?.find((a) => a.anahtar === anahtar)?.deger
  const baz = Number(deger('rota_baz_ucret'))
  const km = Number(deger('rota_km_ucreti'))
  return {
    baz: Number.isFinite(baz) && baz > 0 ? baz : VARSAYILAN_BAZ_UCRET,
    km: Number.isFinite(km) && km > 0 ? km : VARSAYILAN_KM_UCRETI,
    goster: String(deger('rota_fiyat_goster') ?? 'true') !== 'false',
    guncelleme: deger('rota_fiyat_guncelleme') || '',
  }
}

const PAKETLER = [
  { ad: '1+1 Daire', carpan: 0.78, hacim: '15 - 20 m³', aciklama: 'Tek yatak odası, salon; ortalama 25-35 koli' },
  { ad: '2+1 Daire', carpan: 1, hacim: '25 - 35 m³', aciklama: 'İki yatak odası, salon; ortalama 40-55 koli' },
  { ad: '3+1 Daire', carpan: 1.28, hacim: '35 - 45 m³', aciklama: 'Üç yatak odası, salon; ortalama 60-80 koli' },
  { ad: '4+1 Daire / Dubleks', carpan: 1.62, hacim: '45 - 60 m³', aciklama: 'Geniş daire veya dubleks; ek araç gerekebilir' },
  { ad: 'Villa / Müstakil Ev', carpan: 2.05, hacim: '60 m³ ve üzeri', aciklama: 'Bahçe eşyası ve ek depolama dahil' },
  { ad: 'Ofis / İş Yeri', carpan: 1.35, hacim: '30 - 45 m³', aciklama: 'Masa, dolap, sunucu ve arşiv taşıması' },
  { ad: 'Küçük Nakliye (Kamyonet)', carpan: 0.34, hacim: '6 - 10 m³', aciklama: 'Öğrenci evi, tek oda, birkaç mobilya' },
  { ad: 'Parça Eşya Taşıma', carpan: 0.19, hacim: '1 - 4 m³', aciklama: 'Tek koltuk, beyaz eşya, birkaç koli' },
]

function yuvarla(deger, adim = 250) {
  return Math.max(adim, Math.round(deger / adim) * adim)
}

export function paraBicimle(deger) {
  return new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 0 }).format(deger)
}

/**
 * Rota için tahmini fiyat tablosu.
 * Taban formül: baz ücret + (yaklaşık mesafe × km ücreti), ardından paket
 * çarpanı. Panelden iki sayı değiştirildiğinde tüm rota sayfaları güncellenir.
 */
export function fiyatTablosu(rota, ayarlar) {
  const { baz, km } = fiyatAyarlari(ayarlar)
  const taban = baz + rota.mesafe * km
  return PAKETLER.map((paket) => {
    const orta = taban * paket.carpan
    return {
      ad: paket.ad,
      hacim: paket.hacim,
      aciklama: paket.aciklama,
      alt: yuvarla(orta * 0.88),
      ust: yuvarla(orta * 1.14),
    }
  })
}

/* ------------------------------------------------------------------ */
/* Metinler                                                            */
/* ------------------------------------------------------------------ */

function mesafeCumlesi(rota) {
  if (rota.mesafe <= 120) return `Adana ile ${rota.ad} arası yaklaşık ${rota.mesafe} km. Bu kısa mesafede taşıma çoğunlukla aynı gün içinde tamamlanır.`
  if (rota.mesafe <= 350) return `Adana ile ${rota.ad} arası yaklaşık ${rota.mesafe} km ve araç yaklaşık ${rota.yolSaat} saatlik bir yol yapıyor. Sabah başlayan bir yükleme aynı gün teslim edilebiliyor.`
  if (rota.mesafe <= 700) return `Adana ile ${rota.ad} arası yaklaşık ${rota.mesafe} km. Yükleme, yol ve boşaltma birlikte düşünüldüğünde taşıma ${rota.teslimGun} sürüyor.`
  return `Adana ile ${rota.ad} arası yaklaşık ${rota.mesafe} km. Uzun mesafe olduğu için sürücü dinlenmeleri de hesaba katılır ve teslim süresi ${rota.teslimGun} olur.`
}

function bolgeCumlesi(rota) {
  const bolge = rota.bolgeAdi || BOLGELER[rota.bolge]
  const kaliplar = [
    `${rota.ad}, ${bolge}'nde yer alıyor ve Adana çıkışlı araçlarımızın düzenli olarak sefer yaptığı güzergahlar arasında.`,
    `${bolge}'nde bulunan ${rota.ad}, Adana depomuzdan çıkan şehirler arası araçların sabit duraklarından biri.`,
    `${rota.ad} ${bolge} sınırlarında. Bu bölgeye her hafta çıkan araçlarımız sayesinde tek ev taşımaları için bile uygun fiyat verebiliyoruz.`,
  ]
  return sec(kaliplar, rota)
}

function evdenEveParagraflari(rota) {
  const hedef = rota.ad
  const giris = [
    `${hedef} Adana evden eve nakliyat hizmetimiz, evinizdeki eşyanın sökülmesinden yeni adresinizde kurulumuna kadar her adımı kapsıyor.`,
    `Adana ${hedef} arası evden eve nakliyatta işi baştan sona biz üstleniyoruz: paketleme, söküm, yükleme, taşıma, montaj.`,
    `${hedef} yönüne yaptığımız evden eve nakliyatta eşyanız tek araçla gider, aktarma yapılmaz.`,
  ]
  return [
    sec(giris, rota),
    mesafeCumlesi(rota),
    `Taşıma öncesi ekibimiz adrese gelip ekspertiz yapar. Eşya listesi çıkarılır, asansör gerekip gerekmediği belirlenir ve size yazılı fiyat verilir. Fiyat, taşıma günü değişmez.`,
    `Mobilyalar demonte edilip streç ve balonlu naylonla sarılır; cam, tablo ve beyaz eşya için ayrı ambalaj kullanılır. ${hedef} adresinde aynı ekip montajı yapar, koliler odalara yerleştirilir.`,
    `Tüm taşımalar sigortalıdır. Yol boyunca araç takip edilir, isterseniz teslim saatini telefonla bildiririz.`,
  ]
}

function kucukNakliyeParagraflari(rota) {
  return [
    `Tek oda, öğrenci evi veya birkaç parça mobilya taşıtacaksanız koca bir kamyon kiralamanız gerekmiyor. Adana ${rota.ad} küçük nakliye hizmetimizde kamyonet ve panelvan araçlar kullanıyoruz.`,
    `Küçük nakliyede ücret, aracın tamamı yerine kapladığınız hacim üzerinden hesaplanıyor. Bu da ${rota.mesafe} km'lik ${rota.ad} güzergahında maliyeti belirgin şekilde düşürüyor.`,
    `Dar sokak, düşük kat yüksekliği veya asansörsüz binalarda küçük araçlar çok daha rahat çalışıyor. Yükleme genelde 1-2 saat sürüyor.`,
  ]
}

function parcaEsyaParagraflari(rota) {
  return [
    `Parça eşya taşıma, tek bir koltuk, buzdolabı, çamaşır makinesi ya da birkaç koli gibi küçük yüklerin taşınmasıdır. Adana ${rota.ad} hattında bu tip yükleri parsiyel olarak, yani aynı yöne giden başka yüklerle birlikte taşıyoruz.`,
    `Parsiyel taşımada aracın tamamının ücretini ödemezsiniz; yalnızca eşyanızın kapladığı yer faturalanır. ${rota.ad} yönüne düzenli sefer yaptığımız için bekleme süresi kısa oluyor.`,
    `Eşya alınırken fotoğraflanır, teslim edilirken tekrar kontrol edilir. Kırılacak parçalar için ek ambalaj ve ahşap sandık seçeneğimiz var.`,
  ]
}

/** Uzun makale bölümü — her rota için farklı başlık ve içerik. */
export function rotaMakalesi(rota) {
  const hedef = rota.ad
  const bolge = rota.bolgeAdi || BOLGELER[rota.bolge]
  const baslikKaliplari = [
    `Adana'dan ${hedef}'e Taşınırken Bilmeniz Gerekenler`,
    `${hedef} Taşınma Rehberi: Adana Çıkışlı Nakliyatta Süreç Nasıl İşliyor?`,
    `Adana ${hedef} Arası Nakliyatta Maliyeti Belirleyen Etkenler`,
  ]
  const paragraflar = [
    `Adana'dan ${hedef}'e taşınmanın maliyetini belirleyen üç şey var: eşyanın hacmi, iki adresteki kat ve asansör durumu, bir de ${rota.mesafe} km'lik yol. Bu üçü netleşmeden verilen telefon fiyatları çoğu zaman taşıma günü değişiyor, bu yüzden ekspertizde ısrarcıyız.`,
    `Hacim, ödeyeceğiniz tutarın en büyük bileşeni. 2+1 bir daire ortalama 25-35 m³ tutar; bu da tek bir 10 tekerli araca rahatlıkla sığar. 4+1 ve üzeri evlerde ikinci araç gerekebilir ve fiyat buna göre artar. Taşımadan önce kullanmadığınız eşyaları elden çıkarmak, ${hedef} güzergahında ciddi bir tasarruf sağlar.`,
    `Kat ve asansör durumu ikinci etken. Yüksek katta asansör yoksa mobil asansör kiralanır. Adana tarafında bu hizmeti kendi ekipmanımızla veriyoruz; ${hedef} tarafında ise yerel tedarikçiyle çalışıyoruz ve ücreti teklife baştan ekliyoruz.`,
    `Üçüncüsü mevsim. Haziran-Eylül arası Türkiye'de taşınma yoğunluğunun zirve yaptığı dönem. ${bolge} yönüne giden araçlar bu aylarda dolu gidiyor, dolayısıyla hem fiyat yükseliyor hem de istediğiniz tarihi bulmak zorlaşıyor. Mümkünse ay ortası ve hafta içi bir gün seçin; ${hedef} taşımanız hem daha ucuz hem daha rahat olur.`,
    `Taşıma günü için hazırlık listesi kısa: elektrik, su ve doğalgaz aboneliklerini kapatın, internet nakil başvurusunu en az bir hafta önce yapın, değerli evrak ve takıları kendi yanınızda taşıyın, buzdolabını taşımadan 6 saat önce kapatıp defrost edin. Çamaşır makinesinin tambur sabitleme vidalarını takmayı unutmayın; ${rota.mesafe} km yolda sabitlenmemiş tambur rulmanı bozuyor.`,
    `${hedef} adresine vardığımızda önce büyük mobilyalar yerleştirilir, sonra koliler odalara dağıtılır. Kolileri odaya göre etiketlemek boşaltmayı yarı yarıya hızlandırıyor. Montaj bittikten sonra eşya listesi üzerinden birlikte kontrol yapıyor, tutanağı imzalayıp işi kapatıyoruz.`,
  ]
  return {
    baslik: sec(baslikKaliplari, rota),
    paragraflar,
  }
}

export function rotaBolumleri(rota) {
  return [
    {
      id: 'evden-eve-nakliyat',
      baslik: `${rota.ad} Adana Evden Eve Nakliyat`,
      paragraflar: evdenEveParagraflari(rota),
    },
    {
      id: 'kucuk-nakliye',
      baslik: `Adana ${rota.ad} Küçük Nakliye`,
      paragraflar: kucukNakliyeParagraflari(rota),
    },
    {
      id: 'parca-esya-tasima',
      baslik: `Adana ${rota.ad} Parça Eşya Taşıma`,
      paragraflar: parcaEsyaParagraflari(rota),
    },
  ]
}

export function rotaGirisMetni(rota) {
  return [bolgeCumlesi(rota), mesafeCumlesi(rota)].join(' ')
}

/** Rotaya özel sık sorulan sorular — sayfada ve FAQPage şemasında kullanılır. */
export function rotaSSS(rota, fiyatlar) {
  const enUcuz = fiyatlar?.find((f) => f.ad === 'Parça Eşya Taşıma')
  const iki = fiyatlar?.find((f) => f.ad === '2+1 Daire')
  const sorular = [
    {
      soru: `Adana ${rota.ad} arası nakliyat kaç gün sürer?`,
      cevap: `Yaklaşık ${rota.mesafe} km'lik bu güzergahta yükleme, yol ve boşaltma dahil ortalama teslim süresi ${rota.teslimGun}. Sabah yapılan yüklemelerde araç aynı gün yola çıkar.`,
    },
    {
      soru: `${rota.ad} Adana evden eve nakliyat fiyatı ne kadar?`,
      cevap: iki
        ? `2+1 bir daire için tahmini aralık ${paraBicimle(iki.alt)} - ${paraBicimle(iki.ust)} TL. Kesin fiyat, ücretsiz ekspertiz sonrası eşya hacmi, kat ve asansör durumuna göre yazılı olarak verilir.`
        : `Fiyat; eşya hacmi, kat ve asansör durumu ile ${rota.mesafe} km'lik mesafeye göre belirlenir. Ücretsiz ekspertiz sonrası yazılı teklif veriyoruz.`,
    },
    {
      soru: `Sadece birkaç parça eşyamı ${rota.ad}'e gönderebilir miyim?`,
      cevap: enUcuz
        ? `Evet. Parça eşya taşımada aynı yöne giden araçlara parsiyel yükleme yapıyoruz; tahmini aralık ${paraBicimle(enUcuz.alt)} - ${paraBicimle(enUcuz.ust)} TL. Tek koltuk, beyaz eşya veya birkaç koli için uygundur.`
        : `Evet. Parça eşya taşımada aynı yöne giden araçlara parsiyel yükleme yapıyoruz; aracın tamamının ücretini ödemezsiniz.`,
    },
    {
      soru: `Eşyalarım sigortalı mı taşınıyor?`,
      cevap: `Evet. Adana ${rota.ad} dahil tüm şehirler arası taşımalarımız sigorta kapsamındadır. Eşya listesi taşıma öncesinde yazılı olarak kayda alınır.`,
    },
    {
      soru: `Asansör gerekirse ne oluyor?`,
      cevap: `Yüksek katlı ve asansörsüz binalarda mobil asansör kullanıyoruz. Adana tarafında asansör kendi ekipmanımızdır; ${rota.ad} tarafında gerekiyorsa ücreti teklife baştan eklenir, sonradan ek ücret çıkmaz.`,
    },
    {
      soru: `Ambalaj ve montaj fiyata dahil mi?`,
      cevap: `Streç film, balonlu naylon, koli bandı ve battaniye ile ambalajlama, mobilya söküm ve ${rota.ad} adresinde yeniden montaj standart hizmete dahildir.`,
    },
  ]
  return sorular
}
