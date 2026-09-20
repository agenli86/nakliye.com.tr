/**
 * "Adıyaman Nakliyeciler Sitesi" sayfalarının veri ve metin üretimi.
 *
 * Bu set, ev taşımacılığı değil yük taşımacılığı arayan ziyaretçiye
 * yönelik: kamyon nakliye, tır nakliye, kamyon garajı ve şehirler arası
 * yük taşımada km başına fiyat. Evden eve sayfalarıyla aynı cümleleri
 * kullanmıyor.
 *
 * Fiyat esası tek bir yerden geliyor: 100 km = 15.000 TL. Panelden
 * `kamyon_100km_ucreti` anahtarı girildiğinde 81 ilin tamamındaki
 * tablolar ve hesaplama aracı birlikte güncelleniyor.
 */

import { ILLER } from './iller'
import { paraBicimle } from './rota-icerik'

export const NAKLIYECILER_KOK = '/nakliyeciler-sitesi'

export function nakliyecilerUrl(ilSlug) {
  return `${NAKLIYECILER_KOK}/${ilSlug}`
}

/** 100 km'lik referans ücret. Km başına ücret buradan türetiliyor. */
export const VARSAYILAN_YUZ_KM_UCRETI = 15000

/** Tabloda ve hesaplama aracında gösterilen mesafe basamakları. */
export const MESAFE_BASAMAKLARI = [100, 200, 300, 500, 750, 1000]

/**
 * Araç tipleri. Çarpanlar 10 tekerli kamyon (1.0) referans alınarak
 * belirlendi; kamyonet daha ucuz, tır daha pahalı.
 */
export const ARAC_TIPLERI = [
  {
    id: 'kamyonet',
    ad: 'Kamyonet',
    carpan: 0.6,
    kapasite: '3 - 8 ton',
    kasa: 'Kapalı kasa, 6 - 12 m³',
  },
  {
    id: 'kamyon',
    ad: '10 Teker Kamyon',
    carpan: 1,
    kapasite: '12 - 18 ton',
    kasa: 'Kapalı veya açık kasa, 40 - 55 m³',
  },
  {
    id: 'tir',
    ad: 'Tır',
    carpan: 1.45,
    kapasite: '24 - 27 ton',
    kasa: 'Tenteli veya frigo dorse, 80 - 92 m³',
  },
]

export function kamyonFiyatAyarlari(ayarlar) {
  const deger = (anahtar) => ayarlar?.find((a) => a.anahtar === anahtar)?.deger
  const yuzKm = Number(deger('kamyon_100km_ucreti'))
  return {
    yuzKm: Number.isFinite(yuzKm) && yuzKm > 0 ? yuzKm : VARSAYILAN_YUZ_KM_UCRETI,
    goster: String(deger('kamyon_fiyat_goster') ?? 'true') !== 'false',
  }
}

/** Km başına ücret: 100 km'lik referans ücretin yüzde biri. */
export function kmBasiUcret(ayarlar) {
  return kamyonFiyatAyarlari(ayarlar).yuzKm / 100
}

function yuvarla(deger, adim = 500) {
  return Math.max(adim, Math.round(deger / adim) * adim)
}

/**
 * Bir mesafe ve araç tipi için tahmini ücret.
 * Hesap doğrudan doğrusal: km × km başı ücret × araç çarpanı.
 */
export function kamyonUcreti(mesafe, aracId, ayarlar) {
  const arac = ARAC_TIPLERI.find((a) => a.id === aracId) || ARAC_TIPLERI[1]
  const km = Math.max(0, Number(mesafe) || 0)
  return yuvarla(km * kmBasiUcret(ayarlar) * arac.carpan)
}

/** Mesafe basamakları × araç tipleri tablosu. */
export function kmFiyatTablosu(ayarlar) {
  return MESAFE_BASAMAKLARI.map((km) => ({
    km,
    hucreler: ARAC_TIPLERI.map((arac) => ({
      aracId: arac.id,
      tutar: kamyonUcreti(km, arac.id, ayarlar),
    })),
  }))
}

/** İlin Adana'ya olan mesafesi için araç tipi bazlı tahmini ücretler. */
export function ilKamyonFiyatlari(il, ayarlar) {
  if (!il.mesafe) return []
  return ARAC_TIPLERI.map((arac) => {
    const tutar = kamyonUcreti(il.mesafe, arac.id, ayarlar)
    return {
      ad: `Adana ${il.ad} ${arac.ad} Nakliye`,
      hacim: arac.kapasite,
      aciklama: arac.kasa,
      alt: yuvarla(tutar * 0.9),
      ust: yuvarla(tutar * 1.15),
    }
  })
}

function sec(liste, tohum, kaydir = 0) {
  return liste[(tohum + kaydir) % liste.length]
}

export function nkGirisMetni(il, ayarlar) {
  const t = il.plaka || 0
  const kmUcret = kmBasiUcret(ayarlar)

  const acilis = [
    `${il.ad} nakliyeciler sitesi arayanların çoğu ev eşyası değil yük taşıtmak istiyor: palet, makine, inşaat malzemesi, ticari mal.`,
    `${il.ad} ve çevresinde kamyon ya da tır aracı arıyorsanız, Adana merkezli filomuz bu güzergahta düzenli çalışıyor.`,
    `${il.bolgeAdi}'ndeki ${il.ad}, kamyon ve tır seferlerimizin sabit duraklarından biri.`,
  ]

  const mesafeCumlesi = il.mesafe
    ? `Adana ile ${il.ad} arası yaklaşık ${il.mesafe} km. Km başına ${paraBicimle(kmUcret)} TL esasıyla, 10 tekerli kamyonla bu mesafenin tahmini ücreti ${paraBicimle(kamyonUcreti(il.mesafe, 'kamyon', ayarlar))} TL.`
    : `${il.ad} içi ve ${il.ad} çıkışlı yük taşımalarında ücret km başına ${paraBicimle(kmUcret)} TL esasıyla hesaplanıyor.`

  return [
    sec(acilis, t),
    mesafeCumlesi,
    `Kamyonet, 10 tekerli kamyon ve tır olmak üzere üç araç sınıfıyla çalışıyoruz. Yükün ağırlığı, hacmi ve boşaltma koşulları hangi aracın uygun olduğunu belirliyor.`,
  ]
}

export const NK_BOLUMLERI = [
  { id: 'kamyon-nakliye', ad: 'Kamyon Nakliye' },
  { id: 'tir-nakliye', ad: 'Tır Nakliye' },
  { id: 'kamyon-garaji', ad: 'Kamyon Garajı' },
  { id: 'km-fiyatlari', ad: 'Km Fiyatları' },
]

export function nkBolumMetni(bolumId, il, ayarlar) {
  const mesafe = il.mesafe || 0
  const kmUcret = kmBasiUcret(ayarlar)

  switch (bolumId) {
    case 'kamyon-nakliye':
      return [
        `${il.ad} kamyon nakliye hizmetimiz 10 tekerli araçlarla veriliyor. Kapalı kasa 40-55 m³ hacim, 12-18 ton taşıma kapasitesi demek; palet yük, makine, mobilya partisi ve inşaat malzemesi bu sınıfa giriyor.`,
        mesafe
          ? `Adana ${il.ad} kamyon nakliye için tahmini ücret ${paraBicimle(kamyonUcreti(mesafe, 'kamyon', ayarlar))} TL. Bu rakam ${mesafe} km üzerinden, km başına ${paraBicimle(kmUcret)} TL esasıyla hesaplandı; yükleme ve boşaltmada beklenen süre ücrete dahil.`
          : `${il.ad} içi kamyon nakliyede ücret mesafe yerine çoğunlukla gün ya da sefer üzerinden belirleniyor. Yükü gördükten sonra net rakam veriyoruz.`,
      ]
    case 'tir-nakliye':
      return [
        `${il.ad} tır nakliye, 24 ton üzeri ve 80 m³'ü aşan yükler için. Tenteli dorse standart tercihimiz; soğuk zincir gerektiren yükler için frigo dorse ayrıca planlanıyor.`,
        mesafe
          ? `Adana ${il.ad} tır nakliye tahmini ücreti ${paraBicimle(kamyonUcreti(mesafe, 'tir', ayarlar))} TL. Tırda boşaltma noktasının forklift veya rampa durumu önemli; dar sokak ve manevra alanı olmayan adreslerde kamyona bölmek daha ekonomik olabiliyor.`
          : `${il.ad} içi tır hareketlerinde asıl kısıt mesafe değil, adresin manevra alanı. Yükleme noktasını taşımadan önce yerinde kontrol ediyoruz.`,
      ]
    case 'kamyon-garaji':
      return [
        `${il.ad} kamyon garajı arayanlar genelde iki şey arıyor: aracın bekleyeceği güvenli bir alan ya da yükün geçici olarak indirileceği kapalı bir depo. Adana'daki kendi tesisimizde ikisi de var.`,
        `Yük ${il.ad} adresine teslim edilemeyecekse (adres hazır değil, tarih uyuşmuyor), eşya Adana'daki kapalı depoda sigortalı olarak bekletiliyor ve tarih geldiğinde aynı araçla çıkıyor. Depo ücreti gün üzerinden hesaplanıyor ve teklifte ayrı satır olarak gösteriliyor.`,
      ]
    case 'km-fiyatlari':
      return [
        `Km fiyatlarımızın esası basit: 100 km ${paraBicimle(kamyonFiyatAyarlari(ayarlar).yuzKm)} TL, yani km başına ${paraBicimle(kmUcret)} TL. Bu 10 tekerli kamyon için geçerli; kamyonette bu tutarın yüzde altmışı, tırda bir buçuk katına yakını uygulanıyor.`,
        `Aşağıdaki tablo mesafe basamaklarına göre tahmini tutarları gösteriyor. Dönüş yükü bulunduğunda fiyat aşağı çekilebiliyor, bu yüzden esnek tarih verebilen müşterilere genelde daha uygun rakam çıkıyor.`,
      ]
    default:
      return []
  }
}

/**
 * Sayfanın makalesi.
 *
 * NK_BOLUMLERI metinleri "bu hizmet nedir" sorusunu cevaplıyor; makale
 * bilerek onu tekrarlamıyor, "nasıl karar veririm" sorusunu cevaplıyor:
 * araç seçimi, sürecin işleyişi, parsiyel ile komple arasındaki hesap ve
 * fiyatı mesafe dışında belirleyen kalemler. Cümleler il plakasına göre
 * değişiyor, 81 sayfa arka arkaya okunduğunda aynı kalıp çıkmıyor.
 */
export function nkMakale(il, ayarlar) {
  const t = il.plaka || 0
  const mesafe = il.mesafe || 0
  const kmUcret = kmBasiUcret(ayarlar)

  const kamyonTutar = mesafe ? paraBicimle(kamyonUcreti(mesafe, 'kamyon', ayarlar)) : null
  const tirTutar = mesafe ? paraBicimle(kamyonUcreti(mesafe, 'tir', ayarlar)) : null
  const kamyonetTutar = mesafe ? paraBicimle(kamyonUcreti(mesafe, 'kamyonet', ayarlar)) : null

  return [
    {
      baslik: `${il.ad} İçin Kamyonet, Kamyon ve Tır Arasında Nasıl Seçim Yapılır?`,
      paragraflar: [
        sec([
          `Araç seçiminde ilk bakılan şey ağırlık değil hacim. Yükün tonajı düşük olsa bile hacmi büyükse üst sınıf araç gerekiyor; mobilya, ambalaj malzemesi ve boş palet bunun tipik örneği.`,
          `Yanlış araç seçimi iki türlü zarar veriyor: küçük araç seçilirse yük sığmıyor ve ikinci sefer çıkıyor, büyük araç seçilirse yarısı boş giden bir aracın ücreti ödeniyor.`,
          `Doğru aracı seçmek için üç sayı yeterli: yükün toplam ağırlığı, kapladığı hacim ve en büyük tek parçanın ölçüsü.`,
        ], t),
        `Pratikte sınırlar şöyle işliyor: 8 tona ve 12 m³'e kadar olan yükler kamyonetle, 18 tona ve 55 m³'e kadar olanlar 10 tekerli kamyonla, bunun üzeri tırla taşınıyor. ${mesafe ? `${il.ad} yönünde bu üç seçeneğin tahmini tutarı sırasıyla ${kamyonetTutar} TL, ${kamyonTutar} TL ve ${tirTutar} TL.` : `${il.ad} içi işlerde bu sınıflar arasındaki fark mesafeden çok araç ve ekip tahsisinden geliyor.`}`,
        `Emin olamadığınız durumda yükün fotoğrafını göndermeniz yeterli. Ölçüyü biz alıyoruz ve aracı biz seçiyoruz; seçim yanlış çıkarsa ikinci seferin bedelini müşteriye yansıtmıyoruz.`,
      ],
    },
    {
      baslik: `${il.ad} Yük Taşımada Süreç Nasıl İşliyor?`,
      paragraflar: [
        `Süreç talep ile başlıyor. Yükün cinsi, ağırlığı, çıkış ve varış adresleri alınıyor; kurumsal işlerde ayrıca fatura ve irsaliye bilgisi isteniyor. Bu bilgiyle aynı gün içinde yazılı fiyat çıkıyor.`,
        sec([
          `Fiyat onaylandığında araç planlanıyor. ${mesafe ? `Adana ile ${il.ad} arası ${mesafe} km olduğu için sefer genelde tek sürücüyle ve ${yolSaati(mesafe)} yol süresiyle planlanıyor.` : `${il.ad} içi seferler günlük programa yerleştiriliyor.`}`,
          `Onaydan sonraki adım araç planlaması. ${mesafe ? `${mesafe} km'lik güzergahta aracın dönüş yükü olup olmadığına bakılıyor; varsa fiyat aşağı çekilebiliyor.` : `${il.ad} içinde aynı gün birden fazla iş birleştirilebiliyorsa maliyet düşüyor.`}`,
          `Onay sonrası sefer takvime giriyor ve size araç plakası ile sürücü telefonu bildiriliyor. ${mesafe ? `${mesafe} km'lik yolda araç takip edilebiliyor.` : `Şehir içi işlerde de aynı bilgi paylaşılıyor.`}`,
        ], t),
        `Yükleme sırasında irsaliye kesiliyor ve yük sigorta kapsamına giriyor. Teslimde tutanak imzalanıyor; eksik ya da hasarlı parça varsa tutanağa işleniyor ve süreç sigorta üzerinden yürüyor. Sözlü mutabakatla iş kapatmıyoruz.`,
      ],
    },
    {
      baslik: `${il.ad} Parsiyel Yük mü, Komple Araç mı Daha Uygun?`,
      paragraflar: [
        `Komple araçta bütün kasa size tahsis ediliyor. Yük başka müşterinin malıyla karışmıyor, araç doğrudan varış adresine gidiyor ve teslim saati baştan belli oluyor. Acele işlerde ve kırılabilir yükte tercih edilen yöntem bu.`,
        `Parsiyelde ise ${il.ad} yönüne zaten giden bir araca yer alınıyor. ${mesafe ? `${mesafe} km'lik güzergahta parsiyel maliyeti komple araca göre belirgin şekilde düşük çıkıyor,` : `Maliyet komple araca göre düşük kalıyor,`} ama teslim tarihi aracın programına bağlı olduğu için bir iki gün esneyebiliyor.`,
        sec([
          `Kaba bir ölçüt olarak, yük aracın kasasının yarısından azını dolduruyorsa ve tarih esnekse parsiyel mantıklı. Aksi halde komple araç hem daha hızlı hem toplamda daha ucuz çıkıyor.`,
          `Karar çoğunlukla tarihe bağlı: gün kesinse komple araç, birkaç gün esneme kabul ediliyorsa parsiyel. Hacim aracın yarısını geçtiğinde parsiyelin avantajı zaten kayboluyor.`,
          `Yük ${il.ad} adresine belli bir günde yetişmek zorundaysa komple araçtan başka seçenek yok. Tarih esnekse parsiyel ciddi tasarruf sağlıyor.`,
        ], t, 1),
      ],
    },
    {
      baslik: `${il.ad} Kamyon Nakliye Fiyatını Mesafe Dışında Ne Belirliyor?`,
      paragraflar: [
        `Mesafe fiyatın omurgası: km başına ${paraBicimle(kmUcret)} TL esası bütün hesabın çıkış noktası. Ama iki iş aynı mesafede olsa da farklı tutabiliyor, çünkü mesafe dışında dört kalem daha var.`,
        `Birincisi boşaltma koşulu. Varış adresinde forklift ya da rampa varsa boşaltma yarım saatte bitiyor; elle boşaltma gerekiyorsa hem ekip hem süre artıyor. İkincisi bekleme. Araç adreste beklediği her saat için maliyet üretiyor, bu yüzden adresin taşıma gününde hazır olması önemli.`,
        `Üçüncüsü yükün cinsi. Tehlikeli madde, soğuk zincir ya da özel sabitleme isteyen makine yükleri farklı donanım gerektiriyor. Dördüncüsü dönüş yükü: ${il.ad} yönünden Adana'ya dönerken araca yük bulunabiliyorsa fiyat aşağı çekilebiliyor, bu yüzden esnek tarih verebilen müşterilere genelde daha iyi rakam çıkıyor.`,
        `Aşağıdaki tablo ve hesaplama aracı bu kalemler devreye girmeden önceki tahmini gösteriyor. Kesin fiyat yük görüldükten sonra yazılı olarak veriliyor.`,
      ],
    },
  ]
}

/** Ortalama 65 km/sa yük aracı hızıyla kaba yol süresi. */
function yolSaati(mesafe) {
  const saat = Math.round(mesafe / 65)
  if (saat <= 1) return 'yaklaşık 1 saatlik'
  if (saat >= 10) return 'bir günü aşan'
  return `yaklaşık ${saat} saatlik`
}

export function nkSSS(il, ayarlar) {
  const kmUcret = kmBasiUcret(ayarlar)
  return [
    {
      soru: `${il.ad} kamyon nakliye km fiyatı ne kadar?`,
      cevap: `Esas alınan rakam 100 km için ${paraBicimle(kamyonFiyatAyarlari(ayarlar).yuzKm)} TL, yani km başına ${paraBicimle(kmUcret)} TL. Kamyonette bu tutarın yaklaşık yüzde altmışı, tırda bir buçuk katına yakını uygulanıyor.`,
    },
    {
      soru: il.mesafe
        ? `Adana ${il.ad} arası kamyon nakliye kaç TL?`
        : `${il.ad} içi kamyon nakliye kaç TL?`,
      cevap: il.mesafe
        ? `${il.mesafe} km üzerinden 10 tekerli kamyonla tahmini ${paraBicimle(kamyonUcreti(il.mesafe, 'kamyon', ayarlar))} TL, tırla tahmini ${paraBicimle(kamyonUcreti(il.mesafe, 'tir', ayarlar))} TL. Kesin fiyat yük görüldükten sonra veriliyor.`
        : `${il.ad} içi işlerde ücret mesafe yerine sefer ya da gün üzerinden belirleniyor. Yükü gördükten sonra net rakam veriyoruz.`,
    },
    {
      soru: `${il.ad} için hangi araç tipini seçmeliyim?`,
      cevap: `8 tonun altındaki yükler kamyonete, 18 tona kadar olanlar 10 tekerli kamyona, daha ağır ve hacimli yükler tıra uygun. Emin değilseniz yükün fotoğrafını gönderin, biz seçelim.`,
    },
    {
      soru: `${il.ad} kamyon garajında eşya bekletebiliyor musunuz?`,
      cevap: `Evet. Adana'daki kapalı ve sigortalı depomuzda yük gün üzerinden bekletilebiliyor; teslim tarihi geldiğinde ${il.ad} adresine çıkarılıyor.`,
    },
    {
      soru: `Fiyata yükleme ve boşaltma dahil mi?`,
      cevap: `Standart yükleme ve boşaltma süresi dahil. Forklift, vinç ya da uzayan bekleme süresi gerekiyorsa bunlar teklifte ayrı satır olarak gösteriliyor, sonradan sürpriz ücret çıkmıyor.`,
    },
  ]
}

export function bolgeKomsulari(il, adet = 10) {
  return ILLER.filter((x) => x.bolge === il.bolge && x.slug !== il.slug).slice(0, adet)
}
