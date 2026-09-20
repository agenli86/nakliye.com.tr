/**
 * Kod tarafında duran Adana hizmet sayfaları.
 *
 * Panelden girilen hizmetler `hizmetler` tablosunda ve /hizmet/<slug>
 * adresinde duruyor. Buradaki sayfalar ondan ayrı: arama hacmi olan ama
 * panele tek tek girilmesi zahmetli olan dar konular (pikap nakliye,
 * hamal hizmeti, buzdolabı taşıma, 1+1 ev taşıma ücreti gibi). Veri kodda
 * olduğu için sayfalar veritabanı olmadan da ayakta duruyor ve fiyatlar
 * tek bir ayardan besleniyor.
 *
 * Fiyat esası: panelden `rota_baz_ucret` (şehir içi taban ücret) ve
 * `hamal_gunluk_ucret`. İkisi de değiştirildiğinde bu sayfalardaki bütün
 * rakamlar birlikte güncelleniyor; hiçbir yerde elle yazılmış tutar yok.
 */

import { fiyatAyarlari, paraBicimle } from './rota-icerik'

export const HIZMET_KOK = '/hizmetler'

export function hizmetSayfaUrl(slug) {
  return `${HIZMET_KOK}/${slug}`
}

/* ------------------------------------------------------------------ */
/* Fiyatlandırma                                                       */
/* ------------------------------------------------------------------ */

/** Hamalın günlük yevmiyesi. Panelden `hamal_gunluk_ucret` ile değişir. */
export const VARSAYILAN_HAMAL_GUNLUK = 2000

function yuvarla(deger, adim = 250) {
  return Math.max(adim, Math.round(deger / adim) * adim)
}

/**
 * Şehir içi taşımanın taban ücreti. Rota sayfalarındaki formülün mesafeye
 * bağlı olmayan kısmı bu; Adana içi iş de zaten mesafe değil hacim ve kat
 * üzerinden fiyatlanıyor.
 */
export function sehiriciBaz(ayarlar) {
  return fiyatAyarlari(ayarlar).baz
}

export function fiyatGosterilsin(ayarlar) {
  return fiyatAyarlari(ayarlar).goster
}

/**
 * Ev tipleri. Çarpanlar 2+1 daire (1.0) referans alınarak belirlendi ve
 * rota sayfalarındaki paket çarpanlarıyla aynı; iki yerde farklı fiyat
 * çıkmasın diye.
 */
export const EV_TIPLERI = [
  {
    id: '1-1',
    ad: '1+1 Daire',
    carpan: 0.78,
    hacim: '15 - 20 m³',
    koli: '25 - 35 koli',
    arac: 'Kamyonet veya tek sefer kapalı kasa',
    ekip: '1 şoför + 2 taşıma elemanı',
    sure: '4 - 6 saat',
  },
  {
    id: '2-1',
    ad: '2+1 Daire',
    carpan: 1,
    hacim: '25 - 35 m³',
    koli: '40 - 55 koli',
    arac: 'Kapalı kasa kamyonet veya küçük kamyon',
    ekip: '1 şoför + 3 taşıma elemanı',
    sure: '6 - 8 saat',
  },
  {
    id: '3-1',
    ad: '3+1 Daire',
    carpan: 1.28,
    hacim: '35 - 45 m³',
    koli: '60 - 80 koli',
    arac: 'Kapalı kasa kamyon',
    ekip: '1 şoför + 3-4 taşıma elemanı',
    sure: '8 - 10 saat',
  },
  {
    id: '4-1',
    ad: '4+1 Daire / Dubleks',
    carpan: 1.62,
    hacim: '45 - 60 m³',
    koli: '80 - 110 koli',
    arac: 'Kapalı kasa kamyon, gerekirse iki sefer',
    ekip: '1 şoför + 4 taşıma elemanı',
    sure: '1 - 1,5 gün',
  },
]

export function evTipiBul(id) {
  return EV_TIPLERI.find((e) => e.id === id) || null
}

/** Bir ev tipi için tahmini şehir içi ücret aralığı. */
export function evTasimaUcreti(tip, ayarlar) {
  const orta = sehiriciBaz(ayarlar) * tip.carpan
  return { alt: yuvarla(orta * 0.85), ust: yuvarla(orta * 1.25), orta: yuvarla(orta) }
}

export function evTasimaTablosu(ayarlar) {
  return EV_TIPLERI.map((tip) => ({ ...tip, ...evTasimaUcreti(tip, ayarlar) }))
}

/** Küçük iş kalemleri: pikap taşıma, parça eşya, tek beyaz eşya. */
export const KUCUK_ISLER = [
  { id: 'parca', ad: 'Parça Eşya (tek koltuk, birkaç koli)', carpan: 0.19, hacim: '1 - 4 m³' },
  { id: 'pikap', ad: 'Pikap ile Tek Sefer Taşıma', carpan: 0.28, hacim: '4 - 7 m³' },
  { id: 'mini', ad: 'Mini Nakliyat (öğrenci evi, tek oda)', carpan: 0.34, hacim: '6 - 10 m³' },
  { id: 'beyaz', ad: 'Tek Beyaz Eşya (buzdolabı, çamaşır makinesi)', carpan: 0.16, hacim: '1 - 2 m³' },
]

export function kucukIsTablosu(ayarlar) {
  const baz = sehiriciBaz(ayarlar)
  return KUCUK_ISLER.map((is) => {
    const orta = baz * is.carpan
    return { ...is, alt: yuvarla(orta * 0.8, 100), ust: yuvarla(orta * 1.3, 100) }
  })
}

/** Hamaliye ücretleri. Hepsi tek bir günlük yevmiyeden türetiliyor. */
export function hamalUcretleri(ayarlar) {
  const deger = ayarlar?.find((a) => a.anahtar === 'hamal_gunluk_ucret')?.deger
  const sayi = Number(deger)
  const gunluk = Number.isFinite(sayi) && sayi > 0 ? sayi : VARSAYILAN_HAMAL_GUNLUK
  return [
    { ad: 'Tek hamal - yarım gün (4 saate kadar)', tutar: yuvarla(gunluk * 0.65, 100) },
    { ad: 'Tek hamal - tam gün (8 saat)', tutar: yuvarla(gunluk, 100) },
    { ad: 'İki kişilik hamal ekibi - tam gün', tutar: yuvarla(gunluk * 2, 100) },
    { ad: 'Üç kişilik hamal ekibi - tam gün', tutar: yuvarla(gunluk * 3, 100) },
    { ad: 'Asansörsüz binada kat başına ek', tutar: yuvarla(gunluk * 0.1, 50) },
  ]
}

export function hamalGunluk(ayarlar) {
  const deger = ayarlar?.find((a) => a.anahtar === 'hamal_gunluk_ucret')?.deger
  const sayi = Number(deger)
  return Number.isFinite(sayi) && sayi > 0 ? sayi : VARSAYILAN_HAMAL_GUNLUK
}

const tl = (n) => `${paraBicimle(n)} TL`

/* ------------------------------------------------------------------ */
/* Ev taşıma ücreti sayfaları (1+1, 2+1, 3+1)                          */
/* ------------------------------------------------------------------ */

/**
 * Üç daire tipi için ayrı sayfa üretiliyor. Metin tek şablondan çıkmıyor:
 * her tipin hacmi, ekibi, süresi ve tipik sıkıntısı farklı olduğu için
 * paragraflar tip bazında yazıldı. Ortak olan yalnızca iskelet.
 */
const EV_SAYFA_METNI = {
  '1-1': {
    kimICin:
      'Tek yatak odası ve salondan oluşan daireler, öğrenci evleri ve yeni kurulan evler bu gruba giriyor. Eşya sayısı az olduğu için iş çoğunlukla tek seferde bitiyor ve yarım günde teslim ediliyor.',
    zorluk:
      '1+1 dairelerde asıl mesele eşyanın azlığı değil, binanın durumu. Adana merkezde bu tip daireler çoğunlukla ara katlarda ve dar merdivenli apartmanlarda oluyor. Dolap ve yatak baza merdivenden inmiyorsa asansörlü taşıma devreye giriyor, bu da fiyatın üzerine eklenen tek kalem oluyor.',
    tasarruf:
      'Kolileri kendiniz hazırlarsanız ekip yalnızca taşıma ve montaj yapıyor, süre kısalıyor. Koli malzemesini biz bırakıyoruz, taşımadan iki gün önce adrese teslim ediliyor.',
  },
  '2-1': {
    kimICin:
      'Adana içinde en çok taşınan daire tipi 2+1. İki yatak odası, salon ve mutfak; yanında balkon eşyası ve genellikle bir çocuk odası takımı oluyor.',
    zorluk:
      '2+1 taşımalarda işi uzatan şey mutfak. Tabak, bardak ve küçük ev aletleri koli sayısını beklenenin üzerine çıkarıyor. Mutfağı bir gün önceden paketlemek taşıma gününü iki üç saat kısaltıyor. Ekip isterseniz mutfağı da paketliyor, bu ayrı bir kalem olarak yazılı teklifte görünüyor.',
    tasarruf:
      'Hafta içi günler hafta sonuna göre daha uygun. Ay sonu ve ayın ilk haftası Adana genelinde yoğun; tarihi ortalara çekebiliyorsanız hem araç bulmak kolay hem fiyat aşağıda kalıyor.',
  },
  '3-1': {
    kimICin:
      'Üç yatak odası ve salonu olan geniş daireler. Genellikle uzun süredir oturulan evler olduğu için depo, balkon ve kiler eşyası da işin içine giriyor.',
    zorluk:
      '3+1 taşımada tek sefer çoğunlukla yetmiyor ya da sınırda kalıyor. Keşifte hacmi olduğundan küçük tahmin etmek, gün sonunda ikinci sefer demek. Bu yüzden 3+1 evlerde fiyat vermeden önce eşyayı görmeyi tercih ediyoruz; fotoğraf üzerinden verilen rakam yanılabiliyor.',
    tasarruf:
      'Kullanmadığınız eşyayı taşımadan önce ayırmak en büyük tasarruf kalemi. Hacim düştükçe araç sınıfı da düşüyor, fiyat doğrudan aşağı iniyor.',
  },
}

function evTasimaSayfasi(tipId) {
  const tip = evTipiBul(tipId)
  const metin = EV_SAYFA_METNI[tipId]
  const kisa = tip.ad.replace(' Daire', '')

  return {
    slug: `adana-${tipId}-ev-tasima-ucretleri`,
    baslik: `Adana ${kisa} Ev Taşıma Ücretleri`,
    ozet: `Adana içinde ${kisa} daire taşıma ${tip.hacim} hacim, ${tip.ekip} ve yaklaşık ${tip.sure} çalışma demek. Tahmini ücret aralığı ve fiyatı belirleyen kalemler aşağıda.`,
    metaTitle: `Adana ${kisa} Ev Taşıma Ücretleri - ${new Date().getFullYear()} Fiyat Listesi`,
    metaDescription: `Adana ${kisa} ev taşıma ücretleri: tahmini fiyat aralığı, ${tip.hacim} hacim, ${tip.ekip}. Evden eve nakliye, ambalajlama ve mobilya montajı dahil.`,
    keywords: `adana ${kisa} ev taşıma ücretleri, adana ${kisa} nakliyat fiyatları, adana ev taşıma, adana evden eve nakliye, ${kisa} daire taşıma fiyatı`,
    tablo: 'ev',
    vurgulananTip: tipId,
    ilgili: ['adana-mini-nakliyat', 'adana-hamal-hizmeti', 'adana-mobilya-montaj', 'adana-ceyiz-esyasi-tasima'],
    bolumler: (ayarlar) => {
      const { alt, ust } = evTasimaUcreti(tip, ayarlar)
      const goster = fiyatGosterilsin(ayarlar)
      return [
        {
          baslik: `Adana ${kisa} Ev Taşıma Ne Kadar Tutuyor?`,
          paragraflar: [
            goster
              ? `Adana içinde ${kisa} bir dairenin evden eve nakliye ücreti tahmini olarak ${tl(alt)} ile ${tl(ust)} arasında çıkıyor. Aradaki fark tek bir sebepten kaynaklanmıyor: kat, asansör durumu, ambalajlamanın bize mi size mi ait olduğu ve taşınma tarihi rakamı bu bandın altına ya da üstüne çekiyor.`
              : `Adana içinde ${kisa} bir dairenin evden eve nakliye ücreti kat, asansör durumu, ambalajlama ve taşınma tarihine göre değişiyor. Güncel rakam için keşif sonrası yazılı teklif veriyoruz.`,
            `Bu rakam nakliye aracını, ${tip.ekip} ekibini, temel ambalaj malzemesini, mobilyaların sökülüp yeni adreste kurulmasını ve sigorta kapsamını içeriyor. Asansörlü taşıma, ek depolama ve komple paketleme hizmeti isteyip istememenize göre ayrı kalem olarak ekleniyor.`,
            metin.kimICin,
          ],
        },
        {
          baslik: `${kisa} Dairede Hacim, Ekip ve Süre`,
          paragraflar: [
            `${kisa} bir daire ortalama ${tip.hacim} hacim tutuyor ve ${tip.koli} çıkıyor. Bu hacim için ${tip.arac.toLocaleLowerCase('tr-TR')} kullanıyoruz; ekip ${tip.ekip} şeklinde geliyor.`,
            `İşin tamamı, yani sökme, paketleme, yükleme, taşıma, boşaltma ve yeniden kurulum, sabah başlandığında yaklaşık ${tip.sure} sürüyor. Aynı gün içinde teslim ediliyor, eşya araçta gecelemiyor.`,
            metin.zorluk,
          ],
        },
        {
          baslik: `${kisa} Ev Taşımada Fiyatı Neler Değiştiriyor?`,
          paragraflar: [
            'Kat ve asansör ilk sırada. Asansörü olan bir binadan asansörü olan bir binaya taşınmak, iki tarafı da merdivenli olan işe göre belirgin biçimde ucuz. Asansörsüz binalarda kat başına ek çalışıyoruz ya da dışarıdan asansörlü taşıma kuruyoruz.',
            'İkinci kalem ambalajlama. Kolileri kendiniz hazırlarsanız yalnızca taşıma ücreti ödüyorsunuz. Mutfak, kitaplık ve kırılacak eşyanın paketlenmesini bize bırakırsanız malzeme ve işçilik ekleniyor.',
            'Üçüncüsü tarih. Ay başı, ay sonu ve hafta sonu Adana genelinde yoğun günler. Aynı iş hafta içi ortasına alındığında araç planlaması rahatlıyor ve fiyat aşağı iniyor.',
            metin.tasarruf,
          ],
        },
        {
          baslik: 'Taşıma Günü Nasıl İşliyor?',
          paragraflar: [
            'Keşif ücretsiz. Adana içinde aynı gün ya da ertesi gün adrese gelip eşyayı görüyoruz, isterseniz fotoğraf üzerinden de ön fiyat veriyoruz. Ardından yazılı teklif gönderiliyor; teklifte araç sınıfı, ekip sayısı, hangi kalemin dahil olduğu ve toplam tutar tek tek yazıyor.',
            'Taşıma günü ekip anlaşılan saatte adreste oluyor. Önce mobilyalar sökülüyor, sonra kırılacak eşya paketleniyor, en son yükleme yapılıyor. Yeni adreste sıra tersine dönüyor: mobilyalar kurulup yerine yerleştiriliyor, beyaz eşya bağlantıları yapılıyor.',
            'Teslimde tutanak imzalanıyor. Eşyada hasar varsa aynı gün kayda geçiyor ve sigorta üzerinden karşılanıyor. Taşıma sonrası ambalaj atıklarını da biz topluyoruz.',
          ],
        },
      ]
    },
    sss: (ayarlar) => {
      const { alt, ust } = evTasimaUcreti(tip, ayarlar)
      const goster = fiyatGosterilsin(ayarlar)
      return [
        {
          soru: `Adana ${kisa} ev taşıma ücreti ne kadar?`,
          cevap: goster
            ? `Adana içinde ${kisa} daire taşıma tahmini ${tl(alt)} - ${tl(ust)} bandında. Kat, asansör durumu, ambalajlama ve tarih bu rakamı değiştiriyor. Kesin fiyat eşya görüldükten sonra yazılı veriliyor.`
            : `Kat, asansör durumu, ambalajlama ve tarih fiyatı belirliyor. Eşya görüldükten sonra yazılı teklif veriyoruz.`,
        },
        {
          soru: `${kisa} ev taşıma kaç saat sürüyor?`,
          cevap: `Sabah başlandığında sökme, paketleme, taşıma ve yeniden kurulum dahil yaklaşık ${tip.sure} sürüyor. Aynı gün teslim ediliyor.`,
        },
        {
          soru: 'Mobilyaları söküp yeniden kuruyor musunuz?',
          cevap:
            'Evet, mobilya sökümü ve montajı fiyata dahil. Gardırop, yatak baza, yemek masası ve karyola yeni adreste kurularak teslim ediliyor. Beyaz eşya bağlantıları da yapılıyor.',
        },
        {
          soru: 'Asansörsüz binada ek ücret var mı?',
          cevap:
            'Asansörsüz binalarda kat başına ek çalışıyoruz; yüksek katlarda dışarıdan asansörlü taşıma kuruluyor. İkisi de yazılı teklifte ayrı satır olarak görünüyor, sonradan sürpriz çıkmıyor.',
        },
        {
          soru: 'Eşyalar sigortalı mı?',
          cevap:
            'Taşınan eşya teslim alındığı andan yeni adreste teslim edildiği ana kadar sigorta kapsamında. Hasar durumunda tutanak aynı gün tutuluyor.',
        },
      ]
    },
  }
}

/* ------------------------------------------------------------------ */
/* Tekil hizmet sayfaları                                              */
/* ------------------------------------------------------------------ */

const CEYIZ = {
  slug: 'adana-ceyiz-esyasi-tasima',
  baslik: 'Adana Çeyiz Eşyası Taşıma',
  ozet:
    'Çeyiz eşyası hiç kullanılmamış, çoğu kutusunda ve tek tek hasarsız teslim edilmesi gereken yük demek. Adana içinde ve Adana dışına çeyiz taşımayı ayrı bir iş kalemi olarak yapıyoruz.',
  metaTitle: 'Adana Çeyiz Eşyası Taşıma - Çeyiz Nakliyesi ve Ambalajlama',
  metaDescription:
    'Adana çeyiz eşyası taşıma: beyaz eşya, mobilya ve kırılacak çeyiz malzemesinin kutulu ambalajla taşınması. Kamyonet ve pikap taşıma, montaj dahil, sigortalı.',
  keywords:
    'adana çeyiz eşyası taşıma, adana çeyiz nakliyesi, adana çeyiz taşıma fiyatları, adana evden eve nakliye, adana pikap taşıma, çeyiz eşyası ambalajlama',
  tablo: 'kucuk',
  ilgili: ['adana-mini-nakliyat', 'adana-pikap-nakliye', 'adana-mobilya-montaj', 'adana-buzdolabi-nakliyesi'],
  bolumler: () => [
    {
      baslik: 'Çeyiz Taşıma Normal Ev Taşımadan Neden Farklı?',
      paragraflar: [
        'Ev taşımada eşya kullanılmış olur; bir çiziğin yeri bellidir, kimse ona bakmaz. Çeyizde durum tersine: eşyanın tamamı yeni, çoğu kutusunda ve teslim edildiği gün açılıp tek tek bakılıyor. Bu yüzden çeyiz taşımada asıl iş taşımak değil, ambalajlamak.',
        'Çeyiz yükü genellikle üç gruptan oluşuyor: kutulu beyaz eşya ve mobilya, kırılacak mutfak takımları, bir de yorgan, nevresim, havlu gibi hacimli ama hafif tekstil. Üçünün paketlemesi birbirinden farklı; hepsini aynı koliye doldurmak hasarın en sık sebebi.',
        'Biz çeyiz işlerinde kutulu eşyanın kutusunu bozmuyoruz, üzerine ek koruma sarıyoruz. Kutusu açılmış ya da hiç kutusu olmayan mobilyaya balonlu naylon ve köşe koruma uyguluyoruz. Cam, porselen ve kristal takımlar ayrı, bölmeli kolilere gidiyor.',
      ],
    },
    {
      baslik: 'Adana İçinde ve Adana Dışına Çeyiz Nakliyesi',
      paragraflar: [
        'Adana içinde çeyiz taşıma çoğunlukla tek sefer, yarım günlük bir iş. Mağazadan ya da baba evinden alınıp yeni eve götürülüyor; hacme göre pikap taşıma ya da kapalı kasa kamyonet yetiyor. Kapalı kasa tercih ediyoruz, açık kasada toz ve yağmur riski var.',
        'Şehir dışına çeyiz gönderiminde yük tek başına bir aracı doldurmuyorsa parsiyel taşıma daha mantıklı oluyor. Bu durumda çeyiz paletleniyor ve streçleniyor, diğer yüklerle karışmıyor. Düğün tarihi sabit olduğu için teslim gününü baştan yazılı veriyoruz.',
        'Çeyiz genellikle düğünden birkaç hafta önce alınıyor ama ev henüz hazır olmuyor. Bu durumda eşyayı depoda bekletip hazır olduğunda teslim ediyoruz; depolama süresi ve ücreti teklifte ayrı satır olarak yazıyor.',
      ],
    },
    {
      baslik: 'Montaj ve Yerleştirme Dahil',
      paragraflar: [
        'Çeyiz taşımanın son adımı kurulum. Gardırop, yatak odası takımı ve yemek masası yeni evde monte ediliyor; buzdolabı, çamaşır makinesi ve bulaşık makinesi bağlantıları yapılıyor. Montajı yapan elemanlar taşıma ekibinin içinde geliyor, ayrıca usta çağırmanız gerekmiyor.',
        'Beyaz eşya bağlantısından sonra makineler çalıştırılıp kontrol ediliyor, su kaçağı olup olmadığına bakılıyor. Mutfak takımları isteğe bağlı olarak dolaplara yerleştiriliyor; ambalaj atıkları evden çıkarılıyor.',
      ],
    },
  ],
  sss: () => [
    {
      soru: 'Çeyiz eşyası taşımada ambalaj malzemesi dahil mi?',
      cevap:
        'Balonlu naylon, streç, köşe koruma ve bölmeli koli dahil. Kutusu duran eşyanın kutusu bozulmuyor, üzerine ek koruma sarılıyor.',
    },
    {
      soru: 'Çeyizi düğüne kadar depolayabilir misiniz?',
      cevap:
        'Evet. Ev hazır olmadığında çeyiz kapalı depoda bekletiliyor ve istediğiniz gün teslim ediliyor. Depolama süresi ve ücreti teklifte ayrı yazıyor.',
    },
    {
      soru: 'Çeyiz taşımada sigorta var mı?',
      cevap:
        'Çeyiz yükü de diğer taşımalar gibi sigorta kapsamında. Kutulu beyaz eşyanın seri numaraları teslim tutanağına yazılıyor.',
    },
    {
      soru: 'Küçük bir çeyiz için kamyon tutmak zorunda mıyım?',
      cevap:
        'Hayır. Hacim 4-7 m³ civarındaysa pikap taşıma yeterli oluyor, ücret de buna göre düşüyor. Araç sınıfını eşyayı gördükten sonra biz belirliyoruz.',
    },
  ],
}

const PIKAP = {
  slug: 'adana-pikap-nakliye',
  baslik: 'Adana Pikap Nakliye',
  ozet:
    'Bir kamyon tutacak kadar eşyanız yoksa doğru araç pikap. Adana içinde tek koltuk, birkaç koli, tek beyaz eşya ve küçük ofis taşımaları için pikapçı hizmeti veriyoruz.',
  metaTitle: 'Adana Pikap Nakliye - Pikapçı ve Kamyonetçi Hizmeti',
  metaDescription:
    'Adana pikap nakliye ve pikapçı hizmeti: parça eşya, tek beyaz eşya, küçük ev taşıma. Kamyonetçi arıyorsanız aynı gün araç ve taşıma elemanı.',
  keywords:
    'adana pikap nakliye, adana pikapçı, adana kamyonetçi, adana pikap taşıma, adana parça eşya taşıma, adana küçük nakliye',
  tablo: 'kucuk',
  ilgili: ['adana-mini-nakliyat', 'adana-hamal-hizmeti', 'adana-buzdolabi-nakliyesi', 'adana-ceyiz-esyasi-tasima'],
  bolumler: () => [
    {
      baslik: 'Pikap Ne Zaman Yeterli, Ne Zaman Kamyonet Gerekiyor?',
      paragraflar: [
        'Pikap taşıma 4-7 m³ arasındaki yükler için doğru seçim. Bir koltuk takımı, on beş yirmi koli, bir çamaşır makinesi ve birkaç küçük mobilya bu hacme sığıyor. Bunun üzerine çıkan işlerde pikap iki sefer yapmak zorunda kalıyor, o zaman tek seferde kamyonetçi çağırmak hem ucuz hem hızlı oluyor.',
        'Hacmi kendiniz ölçmek zorunda değilsiniz. Eşyanın fotoğrafını gönderin, hangi aracın yeteceğini biz söyleyelim. Yanlış araç göndermek iki tarafın da vaktini alıyor, bu yüzden tahmini olduğundan büyük tutmuyoruz.',
        'Pikabın bir avantajı daha var: dar sokağa giriyor. Adana merkezde eski mahallelerin bazı sokaklarına kamyon giremiyor, kamyonet bile zorlanıyor. Pikap o adreslerde kapıya kadar yanaşabiliyor, eşyanın elde taşınacağı mesafe kısalıyor.',
      ],
    },
    {
      baslik: 'Pikapçı Hizmetine Neler Dahil?',
      paragraflar: [
        'Araç tek başına gelmiyor. Şoförün yanında en az bir taşıma elemanı bulunuyor; isterseniz ek hamal ekleniyor. Eşyanın indirilmesi, araca yüklenmesi, yeni adreste boşaltılması ve istenen odaya bırakılması fiyata dahil.',
        'Streç, battaniye ve kolan kemeri araçta hazır duruyor. Koltuk ve beyaz eşya streçlenip battaniyeyle sarılıyor, kasa içinde kaymaması için kemerle sabitleniyor. Kısa mesafede bile bu adımı atlamıyoruz, hasarın çoğu yolda değil kasada oluşuyor.',
        'Mobilya sökme ve kurma isteğe bağlı. Sadece taşıma isterseniz o fiyat, sökme ve montaj isterseniz teklifte ayrı satır olarak yazılıyor.',
      ],
    },
    {
      baslik: 'Aynı Gün Pikap Bulmak',
      paragraflar: [
        'Adana içinde pikap taleplerinin çoğu aynı gün geliyor: mobilya mağazadan alınacak, ikinci el eşya satın alınmış, ev arkadaşı taşınıyor. Araçlarımız şehir içinde dolaştığı için çoğu gün birkaç saat içinde adrese araç yönlendirebiliyoruz.',
        'Saat konusunda net konuşuyoruz. Aracın kaçta geleceğini baştan söylüyoruz ve gecikme olacaksa arayıp haber veriyoruz. Nakliyede en çok şikayet edilen konu bu, o yüzden söz verdiğimiz saate bağlı kalıyoruz.',
      ],
    },
  ],
  sss: () => [
    {
      soru: 'Adana pikap nakliye ücreti nasıl hesaplanıyor?',
      cevap:
        'Mesafe, kat durumu ve eşyanın hacmi belirliyor. Şehir içi tek sefer işlerde sabit bir aralık veriyoruz; kat ve asansör durumu bu rakamı değiştiriyor.',
    },
    {
      soru: 'Pikapçı mı kamyonetçi mi lazım, nasıl anlarım?',
      cevap:
        'Eşya 4-7 m³ altındaysa pikap yeter, üzerine çıkıyorsa kamyonet daha uygun. Fotoğraf gönderin, hangi aracın yeteceğini söyleyelim.',
    },
    {
      soru: 'Şoför tek başına mı geliyor?',
      cevap:
        'Hayır, araçla birlikte en az bir taşıma elemanı geliyor. İhtiyaca göre ek hamal veriliyor.',
    },
    {
      soru: 'Aynı gün pikap bulabilir miyim?',
      cevap:
        'Çoğu gün birkaç saat içinde araç yönlendirebiliyoruz. Arayıp adresi ve eşyayı söylemeniz yeterli.',
    },
  ],
}

const MINI = {
  slug: 'adana-mini-nakliyat',
  baslik: 'Adana Mini Nakliyat',
  ozet:
    'Tek oda, öğrenci evi, stüdyo daire ve küçük ofis taşımaları için mini nakliyat. Büyük araç ve kalabalık ekip yerine işin boyuna göre araç ve eleman.',
  metaTitle: 'Adana Mini Nakliyat - Küçük Ev ve Tek Oda Taşıma',
  metaDescription:
    'Adana mini nakliyat: öğrenci evi, stüdyo daire, tek oda ve küçük ofis taşıma. Kamyonetçi ve pikapçı hizmeti, ambalajlama ve montaj dahil.',
  keywords:
    'adana mini nakliyat, adana küçük nakliyat, adana öğrenci evi taşıma, adana tek oda taşıma, adana kamyonetçi, adana ev taşıma',
  tablo: 'kucuk',
  ilgili: ['adana-pikap-nakliye', 'adana-1-1-ev-tasima-ucretleri', 'adana-hamal-hizmeti', 'adana-mobilya-montaj'],
  bolumler: () => [
    {
      baslik: 'Mini Nakliyat Kimin İçin?',
      paragraflar: [
        'Adana üniversite şehri; her dönem başı ve sonu binlerce öğrenci ev değiştiriyor. Bu taşımaların çoğu tek oda eşyası: bir yatak, bir çalışma masası, gardırop, buzdolabı ve on beş yirmi koli. Böyle bir iş için kamyon çağırmak hem gereksiz hem pahalı.',
        'Mini nakliyat aynı zamanda stüdyo daireler, yeni ayrılmış tek kişilik evler ve küçük ofisler için de geçerli. Hacim 6-10 m³ bandında kalıyorsa iş bu sınıfa giriyor ve yarım günde bitiyor.',
        'İşin küçük olması özensiz yapılacağı anlamına gelmiyor. Aynı ambalaj malzemesi, aynı sigorta ve aynı montaj hizmeti geçerli. Tek fark araç sınıfı ve ekip sayısı.',
      ],
    },
    {
      baslik: 'Dönem Başı ve Dönem Sonu Yoğunluğu',
      paragraflar: [
        'Eylül ile ekim arası ve haziran Adana içinde en yoğun dönem. Bu haftalarda araç bulmak zorlaşıyor ve fiyatlar yukarı gidiyor. Taşınma tarihinizi biliyorsanız iki hafta önceden yer ayırtmak hem tarihi garantiliyor hem daha uygun fiyat demek.',
        'Yurt çıkışlarında eşyayı birkaç gün depolamak gerekebiliyor. Kısa süreli depolama veriyoruz; eşya kapalı depoda bekliyor ve yeni adres hazır olduğunda teslim ediliyor.',
      ],
    },
    {
      baslik: 'Mini Nakliyatta Neler Dahil?',
      paragraflar: [
        'Araç, şoför ve iki taşıma elemanı standart. Temel ambalaj malzemesi, mobilyanın sökülüp yeni adreste kurulması ve beyaz eşya bağlantısı fiyatın içinde.',
        'Koli isterseniz taşımadan önce adrese bırakıyoruz. Kullanmadığınız koliler geri alınıyor, sadece kullandığınız kadarı hesaba yazılıyor.',
        'Evden eve nakliye işinin küçüğünde de yazılı teklif veriyoruz. Telefonda söylenen rakamla gün sonunda istenen rakamın farklı olması diye bir şey yok.',
      ],
    },
  ],
  sss: () => [
    {
      soru: 'Mini nakliyat kaç m³ eşyaya kadar geçerli?',
      cevap:
        'Yaklaşık 6-10 m³. Bunun altındaki işler pikap taşıma sınıfına, üstündekiler 1+1 ev taşımaya giriyor.',
    },
    {
      soru: 'Öğrenci evi taşımada indirim var mı?',
      cevap:
        'Dönem başı ve sonu dışındaki haftalarda fiyat zaten aşağıda kalıyor. Aynı binadan birden fazla taşıma olduğunda tek araçla birleştirip ikisine de daha uygun fiyat veriyoruz.',
    },
    {
      soru: 'Taşıma kaç saat sürer?',
      cevap: 'Tek oda eşyası genelde 3-5 saatte bitiyor ve aynı gün teslim ediliyor.',
    },
    {
      soru: 'Eşyamı birkaç gün depolayabilir misiniz?',
      cevap:
        'Evet, kısa süreli depolama veriyoruz. Süre ve ücret teklifte ayrı satır olarak yazılıyor.',
    },
  ],
}

const HAMAL = {
  slug: 'adana-hamal-hizmeti',
  baslik: 'Adana Hamal Hizmeti',
  ozet:
    'Aracınız var ama taşıyacak adamınız yok, ya da evde yalnızca ağır işler için eleman lazım. Adana hamaliye hizmetinde günlük ücretle kalifiye eleman veriyoruz; aynı ekip ambalajlama, mobilya montajı ve beyaz eşya montajı da yapıyor.',
  metaTitle: 'Adana Hamal Hizmeti - Hamaliye ve Günlük Hamal Ücretleri',
  metaDescription:
    'Adana hamal hizmeti ve hamaliye: günlük hamal ücretleri, ambalajlama, mobilya montajı ve beyaz eşya montajı yapan kalifiye elemanlar. Aynı gün ekip.',
  keywords:
    'adana hamal, adana hamaliye, adana hamal hizmeti, adana günlük hamal ücretleri, adana hamal fiyatları, adana taşıma elemanı, en yakın hamal',
  tablo: 'hamal',
  ilgili: ['adana-mobilya-montaj', 'adana-pikap-nakliye', 'adana-buzdolabi-nakliyesi', 'adana-2-1-ev-tasima-ucretleri'],
  bolumler: (ayarlar) => {
    const gunluk = hamalGunluk(ayarlar)
    const goster = fiyatGosterilsin(ayarlar)
    return [
      {
        baslik: 'Adana Günlük Hamal Ücretleri',
        paragraflar: [
          goster
            ? `Adana'da günlük hamal ücreti tek eleman için ${tl(gunluk)} seviyesinden başlıyor ve işin ağırlığına göre değişiyor. Yarım günlük iş, tam gün ve ekip halinde çalışma için ayrı fiyat veriyoruz; aşağıdaki tabloda güncel rakamlar duruyor.`
            : `Adana'da günlük hamal ücreti işin ağırlığına, kat sayısına ve süreye göre değişiyor. Adres ve işi söyleyin, aynı gün net rakam verelim.`,
          'Ücreti değiştiren üç şey var. Birincisi kat: asansörsüz binada dördüncü kattan eşya indirmek, zeminden yükleme yapmaya göre çok daha ağır bir iş. İkincisi eşyanın cinsi; piyano, kasa, mermer tezgah ve büyük beyaz eşya özel tutuş ve ek eleman istiyor. Üçüncüsü süre; iş sekiz saati aşarsa saat başı ek çalışıyoruz.',
          'Rakamı baştan söylüyoruz ve gün sonunda değiştirmiyoruz. Hamaliyede en sık yaşanan sorun, iş bitince fiyatın yukarı çekilmesi. Bizde ücret işe başlamadan yazılı olarak belli oluyor.',
        ],
      },
      {
        baslik: 'Sadece Hamal mı, Yoksa Kalifiye Eleman mı?',
        paragraflar: [
          'İki farklı talep geliyor. Bir kısmı sadece kol gücü istiyor: eşyayı indir, araca yükle, yukarı çıkar. Bir kısmı ise taşımanın yanında iş bekliyor; gardırop sökülecek, buzdolabı bağlanacak, koliler düzgün paketlenecek.',
          'Ekibimizdeki elemanlar ikincisini de yapıyor. Ambalajlama, mobilya montajı ve beyaz eşya montajı bilen kalifiye elemanlar var; talebinize göre saf taşıma elemanı ya da montaj yapabilen eleman gönderiyoruz. İkisinin yevmiyesi farklı, hangisini istediğinizi baştan konuşuyoruz.',
          'Kalifiye eleman kendi el aletiyle geliyor. Gardırop, yatak baza, yemek masası ve karyola sökümü, ardından yeni adreste kurulumu; çamaşır makinesi, bulaşık makinesi ve buzdolabı bağlantısı bu kapsamda.',
        ],
      },
      {
        baslik: 'Hangi İşlerde Hamal Tutuluyor?',
        paragraflar: [
          'En sık gelen talep, aracı kendi ayarlayan ama taşıyacak eleman bulamayanlar. İkinci sırada ev içi düzenleme var: mobilyanın yer değiştirmesi, halı kaldırma, depo ve bodrum boşaltma. Üçüncüsü mağaza ve ofis işleri; raf dizme, palet indirme, arşiv taşıma.',
          'Tadilat sonrası moloz ve ambalaj atığı çıkarma, balkon ve teras eşyası kaldırma, kombi ve klima taşımasında ustaya yardımcı eleman verme de sık istenen işler arasında.',
          'Adana içinde hangi semtte olursanız olun ekibi en yakın noktadan yönlendiriyoruz. Seyhan, Çukurova, Yüreğir ve Sarıçam içinde aynı gün eleman çıkarabiliyoruz.',
        ],
      },
      {
        baslik: 'Kaç Eleman Gerekiyor?',
        paragraflar: [
          'Tek eleman hafif eşya ve az sayıda koli için yetiyor. Buzdolabı, çamaşır makinesi, koltuk takımı ve gardırop gibi iki kişi kaldırması gereken eşyalarda tek elemanla iş yapılmıyor; hem eşya hem eleman zarar görüyor.',
          'İki kişilik ekip standart ev işlerinin çoğunu görüyor. Asansörsüz yüksek katlarda ya da iş sekiz saati aşacaksa üç kişilik ekip hem daha hızlı hem toplamda daha ucuz çıkıyor, çünkü ek saat ücreti işlemiyor.',
          'Kaç kişi gerektiğini siz tahmin etmek zorunda değilsiniz. İşi anlatın, kaç eleman göndereceğimizi biz söyleyelim.',
        ],
      },
    ]
  },
  sss: (ayarlar) => {
    const gunluk = hamalGunluk(ayarlar)
    const goster = fiyatGosterilsin(ayarlar)
    return [
      {
        soru: 'Adana günlük hamal ücreti ne kadar?',
        cevap: goster
          ? `Tek eleman için tam gün ${tl(gunluk)} seviyesinden başlıyor. Kat sayısı, eşyanın cinsi ve süre bu rakamı değiştiriyor; yarım günlük ve ekip fiyatları ayrı.`
          : 'Kat sayısı, eşyanın cinsi ve süre belirliyor. Adres ve işi söyleyin, aynı gün net rakam verelim.',
      },
      {
        soru: 'Hamal mobilya montajı da yapıyor mu?',
        cevap:
          'Ekibimizde ambalajlama, mobilya montajı ve beyaz eşya montajı bilen kalifiye elemanlar var. Talebinizi baştan belirtin, montaj yapabilen eleman gönderelim.',
      },
      {
        soru: 'Yarım günlük hamal tutabilir miyim?',
        cevap: 'Evet, dört saate kadar olan işler için yarım gün ücreti geçerli.',
      },
      {
        soru: 'Asansörsüz binada ek ücret alıyor musunuz?',
        cevap:
          'Asansörsüz binalarda kat başına ek çalışıyoruz. Rakam işe başlamadan söyleniyor, gün sonunda değişmiyor.',
      },
      {
        soru: 'Aynı gün hamal bulabilir miyim?',
        cevap:
          'Adana merkez ilçelerde çoğu gün aynı gün eleman çıkarabiliyoruz. Sabah aradığınızda öğleden sonra ekip adreste oluyor.',
      },
    ]
  },
}

const MOBILYA = {
  slug: 'adana-mobilya-montaj',
  baslik: 'Adana Mobilya Montaj Hizmeti',
  ozet:
    'Sökülmüş mobilyayı kurmak, yeni alınan mobilyayı monte etmek ve beyaz eşya bağlantılarını yapmak için usta. Taşıma yaptırmasanız da yalnızca montaj için çağırabilirsiniz.',
  metaTitle: 'Adana Mobilya Montaj Hizmeti - Mobilya ve Beyaz Eşya Montajı',
  metaDescription:
    'Adana mobilya montaj hizmeti: gardırop, yatak odası, mutfak dolabı kurulumu ve beyaz eşya montajı. Kalifiye usta, aynı gün randevu.',
  keywords:
    'adana mobilya montaj, adana mobilya montaj ustası, adana beyaz eşya montajı, adana gardırop montajı, adana mobilya söküm, adana montaj hizmeti',
  tablo: null,
  ilgili: ['adana-hamal-hizmeti', 'adana-buzdolabi-nakliyesi', 'adana-ceyiz-esyasi-tasima', 'adana-3-1-ev-tasima-ucretleri'],
  bolumler: () => [
    {
      baslik: 'Hangi Mobilyaları Monte Ediyoruz?',
      paragraflar: [
        'Yatak odası takımı, gardırop, şifonyer, karyola ve baza; oturma odasında tv ünitesi, kitaplık ve vitrin; mutfakta masa, sandalye ve modüler dolap. Çocuk odası ranzaları ve çalışma masaları da sık gelen işler arasında.',
        'Yeni alınmış kutulu mobilyanın ilk kurulumunu da yapıyoruz, taşıma sırasında sökülmüş mobilyanın yeniden kurulumunu da. İkisinin işçiliği farklı: kutulu mobilyada parça tam ve montaj şeması var, sökülmüş mobilyada eksik vida ve yıpranmış bağlantı çıkabiliyor. İkincisinde yedek bağlantı elemanı getiriyoruz.',
        'Beyaz eşya tarafında çamaşır makinesi, bulaşık makinesi ve buzdolabı bağlantısı; ankastre fırın ve ocak yerleştirmesi yapılıyor. Bağlantı sonrası makine çalıştırılıp su kaçağı kontrolü yapılmadan iş bitmiş sayılmıyor.',
      ],
    },
    {
      baslik: 'Taşıma Yaptırmadan Sadece Montaj',
      paragraflar: [
        'Montaj hizmeti taşımaya bağlı değil. Mobilyayı kendiniz getirdiyseniz, mağaza kapıya bırakıp gittiyse ya da eski mobilyanızı başka odaya taşıyıp yeniden kurmak istiyorsanız yalnızca montaj için usta gönderiyoruz.',
        'Ücret işin kalemine göre belirleniyor; parça sayısı ve süre esas alınıyor. Telefonda ne monte edileceğini söylediğinizde fiyatı baştan veriyoruz.',
        'Usta kendi el aletiyle geliyor. Matkap, tornavida takımı, su terazisi ve gerekli bağlantı elemanları yanında oluyor; sizden alet istemiyor.',
      ],
    },
    {
      baslik: 'Söküm Kurulumdan Daha Önemli',
      paragraflar: [
        'Mobilyanın ömrünü belirleyen şey sökümün nasıl yapıldığı. Aceleyle sökülen bir gardırobun sunta yuvaları dağılıyor ve yeni adreste sağlam kurulamıyor. Bu yüzden söküm sırasında vidaları numaralandırıp ayrı torbalarda saklıyoruz, panelleri köşe koruma ile paketliyoruz.',
        'Cam kapaklı vitrin, aynalı gardırop ve mermer tezgahlı masalarda cam ve mermer ayrı taşınıyor. Bunları gövdeye takılı halde taşımak hasarın en sık sebebi.',
      ],
    },
  ],
  sss: () => [
    {
      soru: 'Sadece montaj için usta çağırabilir miyim?',
      cevap: 'Evet. Taşıma yaptırmanız gerekmiyor, yalnızca montaj için randevu veriyoruz.',
    },
    {
      soru: 'Beyaz eşya montajı da yapıyor musunuz?',
      cevap:
        'Çamaşır makinesi, bulaşık makinesi ve buzdolabı bağlantısı, ankastre fırın ve ocak yerleştirmesi yapılıyor. Bağlantı sonrası kaçak kontrolü de dahil.',
    },
    {
      soru: 'Montaj ücreti nasıl belirleniyor?',
      cevap:
        'Monte edilecek parça sayısı ve tahmini süre üzerinden. Telefonda ne kurulacağını söylediğinizde fiyat baştan veriliyor.',
    },
    {
      soru: 'Eksik vida çıkarsa ne oluyor?',
      cevap:
        'Usta yedek bağlantı elemanıyla geliyor. Standart vida ve dübeller yanında olduğu için iş yarıda kalmıyor.',
    },
  ],
}

const BUZDOLABI = {
  slug: 'adana-buzdolabi-nakliyesi',
  baslik: 'Adana Buzdolabı Nakliyesi',
  ozet:
    'Tek bir buzdolabını taşıtmak için ev taşıma fiyatı ödemenize gerek yok. Adana içinde buzdolabı, çamaşır makinesi ve diğer beyaz eşyaları tek kalem olarak taşıyoruz.',
  metaTitle: 'Adana Buzdolabı Nakliyesi - Beyaz Eşya Taşıma',
  metaDescription:
    'Adana buzdolabı nakliyesi ve beyaz eşya taşıma: dik taşıma, bağlantı ve montaj dahil. Pikap taşıma ile aynı gün, sigortalı.',
  keywords:
    'adana buzdolabı nakliyesi, adana buzdolabı taşıma, adana beyaz eşya taşıma, adana çamaşır makinesi taşıma, adana pikap taşıma, adana tek eşya taşıma',
  tablo: 'kucuk',
  ilgili: ['adana-pikap-nakliye', 'adana-hamal-hizmeti', 'adana-mobilya-montaj', 'adana-mini-nakliyat'],
  bolumler: () => [
    {
      baslik: 'Buzdolabı Nasıl Taşınmalı?',
      paragraflar: [
        'Buzdolabının en hassas parçası kompresör ve içindeki gaz. Dolap yan yatırıldığında kompresör yağı soğutma borularına kaçıyor; fişe takıldığında bu yağ geri dönmemişse kompresör zarar görüyor. Bu yüzden buzdolabını dik taşıyoruz, kasada kolan kemeriyle dik sabitliyoruz.',
        'Taşımadan önce dolabın en az dört saat, mümkünse bir gece önceden kapatılıp buzunun çözülmesi gerekiyor. İçindeki su boşaltılmazsa yolda akıyor ve hem araca hem alt kattaki eşyaya zarar veriyor. Raflar ve çekmeceler çıkarılıp ayrı paketleniyor, kapı bantlanıyor.',
        'Yeni adreste dolap hemen fişe takılmıyor. Dik taşındıysa iki üç saat, mecburen yatırıldıysa en az yirmi dört saat beklenmesi gerekiyor. Bunu ekip size hatırlatıyor ve teslim tutanağına yazıyor.',
      ],
    },
    {
      baslik: 'Tek Eşya İçin Araç ve Ekip',
      paragraflar: [
        'Tek beyaz eşya taşıma için pikap yeterli oluyor. Araçla birlikte iki eleman geliyor; buzdolabı tek kişinin kaldıracağı bir yük değil, özellikle asansörsüz binalarda.',
        'Dar merdiven ve asansöre sığmayan dolaplarda sırt kemeri ve merdiven arabası kullanılıyor. Kapıdan geçmeyen büyük gardırop tipi dolaplarda kapı kanadı söküldükten sonra geçiş sağlanıyor, yeni adreste yeniden takılıyor.',
        'Çamaşır makinesinde de benzer bir kural var: taşımadan önce tamburu sabitleyen nakliye cıvataları takılmalı. Cıvata yoksa tambur yolda savruluyor ve amortisörler zarar görüyor. Ekip cıvata yoksa alternatif sabitleme yapıyor.',
      ],
    },
    {
      baslik: 'Bağlantı ve Kontrol',
      paragraflar: [
        'Teslim yalnızca eşyayı bırakmak değil. Çamaşır ve bulaşık makinesinin su giriş ve tahliye bağlantıları yapılıyor, makine kısa bir program ile çalıştırılıp kaçak kontrol ediliyor.',
        'Buzdolabı yerine yerleştirilirken arkasına hava boşluğu bırakılıyor ve ayakları su terazisiyle dengeleniyor. Dengesiz duran dolap hem ses yapıyor hem kapağı tam kapanmıyor.',
        'Taşınan beyaz eşya sigorta kapsamında. Teslimde tutanak imzalanıyor; marka, model ve varsa mevcut çizikler tutanakta yazılı oluyor.',
      ],
    },
  ],
  sss: () => [
    {
      soru: 'Buzdolabı yan yatırılarak taşınır mı?',
      cevap:
        'Taşımıyoruz. Yan yatırma kompresör yağını borulara kaçırıyor. Dolap dik taşınıyor ve kasada dik sabitleniyor.',
    },
    {
      soru: 'Taşımadan önce ne yapmam gerekiyor?',
      cevap:
        'Dolabı en az dört saat, mümkünse bir gece önceden kapatın, buzunu çözdürün ve suyunu boşaltın. Rafları çıkarmanız yeterli, gerisini ekip yapıyor.',
    },
    {
      soru: 'Yeni evde ne zaman fişe takabilirim?',
      cevap:
        'Dik taşındıysa iki üç saat sonra. Zorunlu olarak yatırıldıysa en az yirmi dört saat beklemek gerekiyor.',
    },
    {
      soru: 'Tek buzdolabı için ne kadar ödüyorum?',
      cevap:
        'Tek beyaz eşya taşıma, ev taşımanın çok altında bir kalem. Mesafe ve kat durumuna göre aralık veriyoruz, rakam baştan belli oluyor.',
    },
  ],
}

export const HIZMET_SAYFALARI = [
  CEYIZ,
  PIKAP,
  MINI,
  HAMAL,
  MOBILYA,
  BUZDOLABI,
  evTasimaSayfasi('1-1'),
  evTasimaSayfasi('2-1'),
  evTasimaSayfasi('3-1'),
]

export const HIZMET_SAYFA_HARITASI = new Map(HIZMET_SAYFALARI.map((s) => [s.slug, s]))

export function hizmetSayfasiBul(slug) {
  return HIZMET_SAYFA_HARITASI.get(slug) || null
}
