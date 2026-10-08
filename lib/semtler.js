/**
 * Adana ilçe ve semt veri kümesi.
 *
 * "Huzurevleri nakliyeci", "Beyazevler hamal" gibi semt bazlı aramalar
 * için sayfa üretiyor. İl listesi gibi bu da kod tarafında duruyor;
 * veritabanı olmadan da çalışıyor.
 *
 * İlçe listesi lib/iller.js içindeki Adana kaydıyla birebir aynı, yani
 * resmi 15 ilçe. Merkez dört ilçede (Seyhan, Çukurova, Yüreğir, Sarıçam)
 * semt semt sayfa var. Diğer 11 ilçe için şimdilik yalnızca ilçe sayfası
 * üretiliyor; o ilçelere semt eklendiğinde semt sayfaları da kendiliğinden
 * oluşuyor.
 *
 * Semt listesi elle derlendi; eksiksiz bir mahalle kütüğü değil, bilinen
 * semtler. Resmi mahalle listesiyle karşılaştırılmadı, eklenen her ad
 * yayından önce kontrol edilmeli. Yeni bir semt eklemek aşağıdaki listeye
 * tek satır yazmak demek: sayfa, sitemap kaydı ve iç linkler kendiliğinden
 * oluşuyor.
 */

import { slugify } from './iller'

export const SEMT_KOK = '/nakliyat'

export function semtUrl(slug) {
  return `${SEMT_KOK}/${slug}`
}

/**
 * İlçe dokusu. Metinlerde kullanılıyor ve ilçeye göre değişiyor; bu
 * sayede aynı cümle bütün semtlerde tekrarlanmıyor.
 *
 * merkez : eski şehir dokusu, dar sokak, asansörsüz apartman ağırlıklı
 * yeni   : geniş cadde, yüksek katlı site, asansörlü bina ağırlıklı
 * karma  : ikisi bir arada
 * tasra  : merkeze uzak ilçe; ilçe merkezinde apartman, çevrede müstakil ev
 *
 * Taşra ilçelerindeki `not`, ilçe sayfasında o ilçeye özel cümle olarak
 * kullanılıyor; bu sayfalar birbirinin kopyası olmasın diye.
 */
const HAM_ILCELER = [
  {
    ad: 'Seyhan',
    doku: 'merkez',
    semtler: [
      'Reşatbey', 'Cemalpaşa', 'Kurtuluş', 'Çınarlı', 'Ziyapaşa', 'Sümer',
      'Gülbahçesi', 'Döşeme', 'Mithatpaşa', 'Kanalüstü', 'Denizli', 'Yeşiloba',
      'Barış', 'Gürselpaşa', 'Hürriyet', 'Onur', 'Fatih', 'Uçak', 'Akkapı',
      'Sarıhamzalı', 'Dağlıoğlu', 'Karasoku', 'Tepebağ', 'Kuruköprü',
      'Sucuzade', 'Türkocağı', 'Mirzaçelebi', 'Tellidere', 'Havuzlubahçe',
      'Şakirpaşa', 'Kiremithane', 'Yeşilyurt', 'Namık Kemal', 'Yavuzlar',
      'Alidede', 'Bey', 'Emek', 'Gazipaşa', 'Hadırlı', 'Hanedan', 'Kayalıbağ',
      'Kocavezir', 'Mestanzade', 'Meydan', 'Narlıca', 'Pınar', 'Sakarya',
      'Ulucami', 'Yenibaraj',
    ],
  },
  {
    ad: 'Çukurova',
    doku: 'yeni',
    semtler: [
      'Huzurevleri', 'Beyazevler', 'Güzelyalı', 'Mahfesığmaz', 'Kurttepe',
      'Toros', 'Belediye Evleri', 'Yüzüncü Yıl', 'Yurt', 'Karslılar',
      'Söğütlü', 'Turgut Özal',
    ],
  },
  {
    ad: 'Yüreğir',
    doku: 'karma',
    semtler: [
      'Sinanpaşa', 'Kışla', 'Köprülü', 'Dadaloğlu', 'Akıncılar', 'Çamlıbel',
      'Yeşilbağlar', 'Karşıyaka', 'Levent', 'Cumhuriyet', 'Anadolu',
      'Atakent', 'Serinevler', '19 Mayıs', 'Şehit Erkut Akbay',
      'Doğankent', 'Haydaroğlu', 'Kazım Karabekir', 'Selahattin Eyyübi',
      'Yakapınar', 'Yamaçlı', 'Yenidoğan',
    ],
  },
  {
    ad: 'Sarıçam',
    doku: 'karma',
    semtler: [
      'Şambayadı', 'Küçükdikili', 'İncirlik', 'Sofulu', 'Menekşe', 'Mutlu',
      'Balcalı', 'Buruk', 'Gültepe', 'Osmangazi', 'Remzi Oğuz Arık',
      'Yıldırım Beyazıt', 'Çarkıpare', 'Bayramhacılı',
    ],
  },
  {
    ad: 'Ceyhan',
    doku: 'tasra',
    not: "Ceyhan, Adana'nın merkez dışındaki en kalabalık ilçesi. İlçe merkezinde apartman, çevre mahallelerde bahçeli müstakil ev ağırlıkta; taşımaların bir kısmı ilçe içinde, bir kısmı Adana merkeze oluyor.",
    semtler: [],
  },
  {
    ad: 'Kozan',
    doku: 'tasra',
    not: 'Kozan, kalesi ve narenciye bahçeleriyle bilinen bir ilçe. Merkezde apartman, çevrede bahçeli müstakil evler çok; bahçeli evlerde taşınacak eşyaya bahçe ve depo eşyası da ekleniyor.',
    semtler: [],
  },
  {
    ad: 'İmamoğlu',
    doku: 'tasra',
    not: 'İmamoğlu, Çukurova ovasında tarımla geçinen bir ilçe. Taşımaların çoğu müstakil ev ve köy evi; araç adrese kadar rahat yanaşabildiği için yükleme hızlı ilerliyor.',
    semtler: [],
  },
  {
    ad: 'Karataş',
    doku: 'tasra',
    not: 'Karataş, Akdeniz kıyısında bir sahil ilçesi. Yaz başında ve sonunda yazlık eşyası taşıması yoğunlaşıyor; yıl boyunca da ilçe içi ve Adana merkeze ev taşıması yapılıyor.',
    semtler: [],
  },
  {
    ad: 'Yumurtalık',
    doku: 'tasra',
    not: 'Yumurtalık, İskenderun Körfezi kıyısında bir sahil ilçesi. Yazlık konut taşıması burada sık; sezon başında ve sonunda tarih bulmak için önceden aramak işinizi kolaylaştırıyor.',
    semtler: [],
  },
  {
    ad: 'Karaisalı',
    doku: 'tasra',
    not: "Karaisalı, Adana'nın kuzeyinde Toroslar'a doğru uzanan bir ilçe. İlçe merkezine yol rahat, köy ve yayla evlerine giden yollar ise dar ve virajlı olabiliyor; araç sınıfını yola göre seçiyoruz.",
    semtler: [],
  },
  {
    ad: 'Pozantı',
    doku: 'tasra',
    not: 'Pozantı, Toroslar içinde, Ankara yolunun üzerinde bir ilçe. Kış aylarında yol ve hava koşulları taşıma gününü belirliyor; Adana merkeze ve Ankara yönüne taşımalar sık.',
    semtler: [],
  },
  {
    ad: 'Aladağ',
    doku: 'tasra',
    not: 'Aladağ dağlık bir ilçe; yerleşim ilçe merkezi ve dağınık köylerden oluşuyor. Köy yollarında büyük kamyon yerine kamyonetle çalışmak çoğu zaman daha güvenli.',
    semtler: [],
  },
  {
    ad: 'Feke',
    doku: 'tasra',
    not: "Feke, Adana'nın kuzeyinde, ormanlık ve dağlık bir ilçe. Yol süresi uzun olduğu için taşımayı sabah erken başlatıp yükleme ve boşaltmayı aynı güne sığdırıyoruz.",
    semtler: [],
  },
  {
    ad: 'Saimbeyli',
    doku: 'tasra',
    not: "Saimbeyli, Adana'nın kuzeyindeki yüksek rakımlı ilçelerden. Kışın kar yolu etkileyebildiği için taşıma tarihini hava durumuna göre birlikte belirliyoruz.",
    semtler: [],
  },
  {
    ad: 'Tufanbeyli',
    doku: 'tasra',
    not: "Tufanbeyli, Adana'nın en kuzeyindeki ilçe ve Kayseri sınırına yakın. Mesafe uzun olduğu için taşıma tam günlük planlanıyor; kış aylarında yol durumu önceden kontrol ediliyor.",
    semtler: [],
  },
]

export const ILCELER = HAM_ILCELER.map((ilce, i) => ({
  ad: ilce.ad,
  slug: slugify(ilce.ad),
  doku: ilce.doku,
  not: ilce.not || null,
  sira: i,
}))

/**
 * Semt slug'ları. İki ilçede aynı adı taşıyan semt olursa slug'ın önüne
 * ilçe adı geliyor, yoksa sade ad kullanılıyor. Sade adres tercih
 * ediliyor çünkü arama "beyazevler nakliyeci" şeklinde yapılıyor.
 */
const adSayaci = new Map()
for (const ilce of HAM_ILCELER) {
  for (const semt of ilce.semtler) {
    const s = slugify(semt)
    adSayaci.set(s, (adSayaci.get(s) || 0) + 1)
  }
}

export const SEMTLER = HAM_ILCELER.flatMap((ilce, ilceIndex) => {
  const ilceKaydi = ILCELER[ilceIndex]
  return ilce.semtler.map((ad, i) => {
    const sade = slugify(ad)
    const benzersiz = adSayaci.get(sade) === 1
    return {
      ad,
      slug: benzersiz ? sade : `${ilceKaydi.slug}-${sade}`,
      ilce: ilceKaydi.ad,
      ilceSlug: ilceKaydi.slug,
      doku: ilceKaydi.doku,
      // Metin döndürmesi için sabit bir tohum; sayfa her üretildiğinde
      // aynı cümleler çıksın diye sırayla veriliyor.
      tohum: ilceIndex * 17 + i,
    }
  })
})

export const SEMT_HARITASI = new Map(SEMTLER.map((s) => [s.slug, s]))
export const ILCE_HARITASI = new Map(ILCELER.map((i) => [i.slug, i]))

export function semtBul(slug) {
  return SEMT_HARITASI.get(slug) || null
}

export function ilceBul(slug) {
  return ILCE_HARITASI.get(slug) || null
}

/** Merkez dört ilçe: semt sayfaları bunlarda var. */
export const MERKEZ_ILCELER = ILCELER.filter((i) => i.doku !== 'tasra')
export const TASRA_ILCELER = ILCELER.filter((i) => i.doku === 'tasra')

/** Bir ilçenin semtleri. */
export function ilceSemtleri(ilceSlug) {
  return SEMTLER.filter((s) => s.ilceSlug === ilceSlug)
}

/**
 * Bir semtin komşuları: aynı ilçedeki diğer semtler. Liste kendi etrafında
 * kaydırılıyor ki her sayfa farklı komşularla başlasın ve linkler
 * listenin hep ilk birkaç adına yığılmasın.
 */
export function komsuSemtler(semt, adet = 8) {
  const ayni = SEMTLER.filter((s) => s.ilceSlug === semt.ilceSlug && s.slug !== semt.slug)
  if (ayni.length <= adet) return ayni
  const baslangic = semt.tohum % ayni.length
  return [...ayni.slice(baslangic), ...ayni.slice(0, baslangic)].slice(0, adet)
}

/** Bütün sayfa kayıtları: önce ilçeler, sonra semtler. */
export const SEMT_SAYFALARI = [
  ...ILCELER.map((i) => ({ tip: 'ilce', slug: i.slug })),
  ...SEMTLER.map((s) => ({ tip: 'semt', slug: s.slug })),
]
