/**
 * Semt ve ilçe sayfalarının metin üretimi.
 *
 * 67 semt sayfası aynı cümleleri taşırsa arama motoru bunu tek sayfanın
 * kopyası sayıyor. Bu yüzden her paragrafın birkaç varyantı var ve semt
 * kaydındaki `tohum` alanına göre dönüyor; ayrıca ilçenin dokusuna
 * (merkez, yeni, karma) göre ayrı cümleler yazılıyor. Sonuçta iki semt
 * sayfası birbirinin aynısı olmuyor.
 *
 * Fiyat cümleleri lib/hizmet-sayfalari.js üzerinden geliyor, yani panel
 * ayarı değiştiğinde semt sayfalarındaki rakamlar da güncelleniyor.
 */

import { paraBicimle } from './rota-icerik'
import { ayrilma, bulunma, tamlayan, yonelme } from './turkce-ek'
import { evTasimaUcreti, evTipiBul, fiyatGosterilsin, hamalGunluk } from './hizmet-sayfalari'

function sec(liste, tohum, kaydir = 0) {
  return liste[(tohum + kaydir) % liste.length]
}

/**
 * Bölüm başına farklı bir tohum.
 *
 * Semtin sıra numarasını doğrudan kullanmak yetmiyordu: varyant sayısı
 * kadar aralıklı iki semt (beş varyantta listenin 4. ve 29. sırası) bütün
 * bölümlerde aynı cümleyi alıyor, iki sayfa neredeyse birebir çıkıyordu.
 * Sıraya kayma eklemek de çözmedi, çünkü kayma da aynı bölene tam
 * bölünüyordu. Bunun yerine semtin kendi adresinden ve bölüm numarasından
 * bir karma üretiliyor; karma sıralı olmadığı için iki semtin bütün
 * bölümlerde aynı varyanta düşmesi pratikte imkansız.
 */
function tohumla(semt, bolum) {
  const anahtar = `${semt.slug}#${bolum}`
  let h = 2166136261
  for (let i = 0; i < anahtar.length; i++) {
    h ^= anahtar.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return (h >>> 0) % 997
}


const tl = (n) => `${paraBicimle(n)} TL`

/** İlçe dokusuna göre binaların tarifi. Metinlerin çoğu buna dayanıyor. */
const DOKU = {
  merkez: {
    bina: 'eski apartman dokusu ağırlıkta; asansörsüz dört beş katlı binalar ve dar merdivenler sık',
    sokak: 'sokakların bir kısmı dar ve park eden araçlar yüzünden kamyon giremiyor',
    arac: 'kamyonet ve pikap çoğu adreste kamyondan daha kullanışlı',
    zorluk:
      'Dar merdivenden geçmeyen gardırop ve koltuk takımlarında asansörlü taşıma kuruyoruz. Sokağa asansör kurulacaksa park yerinin bir gün önceden ayrılması gerekiyor, bunu da biz hallediyoruz.',
  },
  yeni: {
    bina: 'yüksek katlı siteler ve asansörlü binalar ağırlıkta',
    sokak: 'caddeler geniş, araç sitenin kapısına kadar yanaşabiliyor',
    arac: 'hacim büyükse kamyon, küçük işlerde kamyonet rahatça giriyor',
    zorluk:
      'Sitelerde asıl mesele yönetim izni. Çoğu site taşınmayı belirli saatlerle sınırlıyor ve yük asansörü için önceden randevu istiyor. Taşıma gününü site yönetimiyle biz konuşup ayarlıyoruz.',
  },
  karma: {
    bina: 'eski apartmanlarla yeni bloklar yan yana; kimi adreste asansör var, kimisinde yok',
    sokak: 'ana caddeler rahat, ara sokaklarda araç sınıfını adrese göre seçmek gerekiyor',
    arac: 'adresi gördükten sonra kamyon mu kamyonet mi göndereceğimize karar veriyoruz',
    zorluk:
      'Aynı mahallenin iki ucunda iki farklı iş çıkabiliyor: birinde asansörle yarım günde biten taşıma, diğerinde beşinci kattan elle indirme. Bu yüzden fiyatı adresi görmeden kesinleştirmiyoruz.',
  },
}

/* ------------------------------------------------------------------ */
/* Semt sayfası                                                        */
/* ------------------------------------------------------------------ */

export function semtOzet(semt) {
  const secenekler = [
    `${semt.ad} ve çevresinde evden eve nakliyat, hamal, pikap taşıma ve mobilya montajı yapıyoruz. ${semt.ilce} içindeki adreslere aynı gün ekip çıkarabiliyoruz.`,
    `${semt.ad} nakliyeci arıyorsanız doğru yerdesiniz. ${bulunma(semt.ilce)} ev taşıma, tek eşya taşıma, hamaliye ve montaj işlerini tek ekiple bitiriyoruz.`,
    `${semt.ad} içinde ve ${ayrilma(semt.ad)} Adana'nın her semtine taşıma yapıyoruz. Evden eve nakliye, pikapçı, kamyonetçi ve hamal talepleriniz için aynı numara.`,
    `${bulunma(semt.ad)} ev taşıyor, tek eşya götürüyor, hamal ve montaj ekibi veriyoruz. Adres ${semt.ilce} sınırları içindeyse araç ve eleman kısa sürede kapınızda.`,
    `${semt.ad} nakliyat işlerinde araç sınıfını işe göre seçiyoruz: bir koli için pikap, tam ev için kamyon. ${semt.ilce} genelinde keşif ücretsiz, teklif yazılı.`,
  ]
  return sec(secenekler, tohumla(semt, 0))
}

export function semtBolumleri(semt, ayarlar) {
  const doku = DOKU[semt.doku] || DOKU.karma
  const goster = fiyatGosterilsin(ayarlar)
  const ikiBirUcret = evTasimaUcreti(evTipiBul('2-1'), ayarlar)
  const gunluk = hamalGunluk(ayarlar)

  return [
    {
      baslik: `${semt.ad} Evden Eve Nakliyat`,
      paragraflar: [
        sec(
          [
            `${bulunma(semt.ad)} ev taşıma taleplerinin çoğu ${semt.ilce} içinde kalıyor; yani yükleme ve boşaltma aynı gün, çoğu zaman aynı öğleden sonra bitiyor. Eşya araçta gecelemediği için hem hasar riski hem maliyet düşük kalıyor.`,
            `${ayrilma(semt.ad)} gelen ev taşıma işlerinin bir kısmı semt içinde, bir kısmı Adana'nın başka bir semtine oluyor. İkisi de tek günlük iş; sabah başlanan taşıma akşam yeni adreste kurulmuş halde teslim ediliyor.`,
            `${semt.ad} içinde evden eve nakliye yaparken yolun uzunluğu değil binanın durumu belirleyici oluyor. Mesafe kısa, asıl iş eşyayı indirip çıkarmakta.`,
            `${tamlayan(semt.ad)} içinden çıkan taşımalarda gün planı şöyle işliyor: sabah söküm ve paketleme, öğlen yükleme, öğleden sonra yeni adreste kurulum. Akşama kadar oturulabilir hale geliyor.`,
            `${bulunma(semt.ad)} oturup Adana'nın başka bir semtine geçenler de, semt içinde ev değiştirenler de aynı ekiple çalışıyor. Aradaki tek fark aracın kaç sefer yapacağı.`,
          ],
          tohumla(semt, 1),
        ),
        `${semt.ad} ve çevresinde ${doku.bina}. Bu yüzden ${doku.sokak}; ${doku.arac}.`,
        sec(
          [
            'Taşınma gününü hafta içi ortasına alabiliyorsanız hem araç bulmak kolay hem fiyat aşağıda kalıyor. Ay başı, ay sonu ve hafta sonu Adana genelinde yoğun.',
            'Koli malzemesini taşımadan iki gün önce adrese bırakıyoruz. Mutfağı ve kitaplığı önceden paketlerseniz taşıma günü iki üç saat kısalıyor.',
            'Eşyanın tamamını taşımak zorunda değilsiniz. Kullanmadığınız parçaları ayırmak hacmi düşürüyor, hacim düşünce araç sınıfı ve fiyat da düşüyor.',
            'Yeni adres hazır değilse eşyayı kapalı depoda bekletiyoruz. Depolama süresi ve ücreti teklifte ayrı satır olarak yazıyor, sonradan eklenmiyor.',
            'Fiyatı telefonda tahmini, keşiften sonra yazılı veriyoruz. Yazılı teklifte araç sınıfı, ekip sayısı ve hangi kalemin dahil olduğu tek tek duruyor.',
          ],
          tohumla(semt, 5),
        ),
        doku.zorluk,
        goster
          ? `Fikir vermesi için: ${bulunma(semt.ad)} 2+1 bir dairenin Adana içi taşıması tahmini ${tl(ikiBirUcret.alt)} ile ${tl(ikiBirUcret.ust)} arasında çıkıyor. Kat, asansör durumu ve ambalajlamanın kime ait olduğu bu rakamı değiştiriyor.`
          : `${bulunma(semt.ad)} fiyat kat, asansör durumu ve ambalajlamanın kime ait olduğuna göre belirleniyor. Keşif ücretsiz, teklif yazılı veriliyor.`,
      ],
    },
    {
      baslik: `${semt.ad} Hamal ve Hamaliye Hizmeti`,
      paragraflar: [
        sec(
          [
            `${bulunma(semt.ad)} en yakın hamal arıyorsanız ekibi semte en yakın noktadan yönlendiriyoruz. Sabah aradığınızda öğleden sonra adreste oluyorlar.`,
            `${semt.ad} hamal talepleri genelde aynı gün geliyor: aracı ayarlamışsınız ama taşıyacak eleman yok. ${semt.ilce} içinde bu talebi çoğu gün aynı gün karşılıyoruz.`,
            `${semt.ad} içinde yalnızca hamal da veriyoruz. Eşyayı siz taşıtacaksanız araç bizden olmak zorunda değil; eleman gönderip işi orada bitiriyoruz.`,
            `${semt.ad} hamaliye işlerinin bir kısmı taşıma bile değil: ev içinde mobilya yer değiştirmesi, halı kaldırma, depo ve bodrum boşaltma. Bunlar için de eleman veriyoruz.`,
            `${bulunma(semt.ad)} hamal derken tek kişi de olabiliyor, üç kişilik ekip de. İşi anlatmanız yeterli, kaç eleman gerektiğine biz karar verip söylüyoruz.`,
          ],
          tohumla(semt, 2),
          1,
        ),
        goster
          ? `${bulunma(semt.ad)} günlük hamal ücreti tek eleman için ${tl(gunluk)} seviyesinden başlıyor. Yarım günlük işler ve iki üç kişilik ekipler için ayrı fiyat veriyoruz; asansörsüz binalarda kat başına ek çalışıyor.`
          : `${bulunma(semt.ad)} hamal ücreti işin süresine, kat sayısına ve eşyanın cinsine göre belirleniyor. Rakam işe başlamadan yazılı olarak bildiriliyor.`,
        'Gönderdiğimiz elemanlar yalnız kol gücü değil. Ambalajlama, mobilya montajı ve beyaz eşya montajı bilen kalifiye elemanlarımız var; hangisini istediğinizi baştan söylerseniz ona göre ekip çıkıyor.',
        sec(
          [
            'Piyano, kasa, mermer tezgah ve büyük beyaz eşya gibi özel tutuş isteyen yüklerde ek eleman veriyoruz. Bu tip işlerde tek kişiyle çalışmıyoruz.',
            'İş sekiz saati aşarsa saat başı ek çalışıyor. Bunu gün sonunda değil, işe başlamadan söylüyoruz; hamaliyede en sık yaşanan sorun bu.',
            'Tadilat sonrası ambalaj ve moloz çıkarma, balkon ve teras eşyası kaldırma da hamal ekibinin yaptığı işler arasında.',
            'Mağaza ve ofis işlerinde raf dizme, palet indirme ve arşiv taşıma için ekip veriyoruz. Mesai dışına planlanabiliyor.',
            'Kombi, klima ve benzeri montajlarda ustaya yardımcı eleman veriyoruz. Usta kendi işini yapıyor, ağır işi ekip üstleniyor.',
          ],
          tohumla(semt, 6),
        ),
      ],
    },
    {
      baslik: `${semt.ad} Pikap Taşıma ve Kamyonetçi`,
      paragraflar: [
        sec(
          [
            `Bir kamyon dolduracak kadar eşyanız yoksa ${bulunma(semt.ad)} pikap taşıma daha mantıklı. Tek koltuk, birkaç koli, bir çamaşır makinesi ya da mağazadan alınmış bir mobilya bu sınıfa giriyor.`,
            `${bulunma(semt.ad)} pikapçı ve kamyonetçi talebi ev taşımadan daha sık geliyor. İkinci el eşya alımı, mağaza teslimi ve tek parça mobilya taşıması için araç yönlendiriyoruz.`,
            `${semt.ad} içinde küçük taşımalar için pikap ve kamyonet bulunduruyoruz. Hacim 4-7 m³ altındaysa pikap yetiyor, üstüne çıkınca kamyonet daha uygun oluyor.`,
            `${bulunma(semt.ad)} bir parça eşya için kamyon tutmanıza gerek yok. Pikapla tek sefer, iki elemanla yarım saatte biten işler günün büyük kısmını oluşturuyor.`,
            `${tamlayan(semt.ad)} çevresindeki mağaza ve depolardan alınan eşyayı da taşıyoruz. Faturayı gösterip adresi vermeniz yeterli, teslim alıp kapınıza getiriyoruz.`,
          ],
          tohumla(semt, 3),
          2,
        ),
        `Araç tek başına gelmiyor; şoförün yanında en az bir taşıma elemanı bulunuyor. Streç, battaniye ve kolan kemeri araçta hazır, eşya kasada sabitlenmeden yola çıkılmıyor.`,
        sec(
          [
            'Aracın kaçta geleceğini baştan söylüyoruz ve gecikme olacaksa arayıp haber veriyoruz. Nakliyede en çok şikayet edilen konu bu.',
            'Mobilya sökme ve kurma isteğe bağlı. Sadece taşıma isterseniz o fiyat, söküm ve montaj isterseniz teklifte ayrı satır olarak yazılıyor.',
            'Hacmi siz ölçmek zorunda değilsiniz. Eşyanın fotoğrafını gönderin, hangi aracın yeteceğini biz söyleyelim; tahmini olduğundan büyük tutmuyoruz.',
            'Kapalı kasa tercih ediyoruz. Açık kasada toz ve yağmur riski var, kısa mesafede bile eşyanın üstü örtülmeden yola çıkılmıyor.',
            'İkinci el eşya alımlarında satıcı adresinden teslim alıp size getiriyoruz. İki adres arasında koşturmanız gerekmiyor.',
          ],
          tohumla(semt, 7),
        ),
        semt.doku === 'merkez'
          ? `${tamlayan(semt.ad)} dar sokaklarında pikabın bir avantajı daha var: kapıya kadar yanaşabiliyor. Eşyanın elde taşınacağı mesafe kısaldıkça hem süre hem ücret düşüyor.`
          : `${bulunma(semt.ad)} araç adrese yanaşabildiği için yükleme hızlı ilerliyor. Yine de site içi giriş kurallarını önceden sormanızda fayda var.`,
      ],
    },
    {
      baslik: `${semt.ad} Mobilya Montaj ve Beyaz Eşya Taşıma`,
      paragraflar: [
        `${bulunma(semt.ad)} taşıma yaptırmadan yalnızca montaj için de ekip gönderiyoruz. Gardırop, yatak odası takımı, tv ünitesi ve mutfak masası kurulumu; çamaşır makinesi, bulaşık makinesi ve buzdolabı bağlantısı yapılıyor.`,
        sec(
          [
            'Tek bir buzdolabı ya da çamaşır makinesi taşıtmak için ev taşıma fiyatı ödemenize gerek yok. Tek beyaz eşya ayrı bir kalem ve çok daha uygun.',
            'Beyaz eşya taşımada dik taşıma kuralına uyuyoruz: buzdolabı yan yatırılmıyor, kasada dik sabitleniyor. Yeni adreste bağlantı yapılıp kaçak kontrolü ediliyor.',
            'Mobilya sökümünde vidalar numaralanıp ayrı torbada saklanıyor, paneller köşe koruma ile paketleniyor. Yeni adreste eksik parça çıkmıyor.',
            'Cam kapaklı vitrin, aynalı gardırop ve mermer tezgahlı masalarda cam ve mermer gövdeden ayrı taşınıyor. Takılı halde taşımak hasarın en sık sebebi.',
            'Çamaşır makinesinde nakliye cıvatası takılmadan yola çıkılmıyor; cıvata yoksa tambur alternatif yöntemle sabitleniyor. Amortisörün zarar görmesi böyle önleniyor.',
          ],
          tohumla(semt, 4),
          3,
        ),
        'Ambalaj malzemesini taşımadan önce adrese bırakıyoruz. Kullanmadığınız koliler geri alınıyor, yalnızca kullandığınız kadarı hesaba yazılıyor.',
        sec(
          [
            'Montaj için taşıma yaptırmanız gerekmiyor. Mağaza mobilyayı kapıya bırakıp gittiyse yalnızca kurulum için usta gönderiyoruz.',
            'Usta kendi el aletiyle geliyor: matkap, tornavida takımı, su terazisi ve yedek bağlantı elemanı yanında. Sizden alet istemiyor.',
            'Buzdolabı yerine yerleştirilirken arkasına hava boşluğu bırakılıyor ve ayakları su terazisiyle dengeleniyor. Dengesiz duran dolap ses yapıyor.',
            'Eski mobilyanın yeniden kurulumunda eksik vida ve yıpranmış bağlantı çıkabiliyor. Bu ihtimale karşı yedek malzemeyle geliyoruz.',
            'Makineler bağlandıktan sonra kısa bir programla çalıştırılıp su kaçağı kontrol ediliyor. Kontrol yapılmadan iş bitmiş sayılmıyor.',
          ],
          tohumla(semt, 8),
        ),
      ],
    },
  ]
}

export function semtSSS(semt, ayarlar) {
  const goster = fiyatGosterilsin(ayarlar)
  const ikiBir = evTasimaUcreti(evTipiBul('2-1'), ayarlar)
  const gunluk = hamalGunluk(ayarlar)

  return [
    {
      soru: `${bulunma(semt.ad)} nakliyeci ne kadar sürede gelir?`,
      cevap: `${semt.ilce} içindeki adreslere çoğu gün aynı gün ekip çıkarabiliyoruz. Sabah aradığınızda öğleden sonra araç ve eleman ${bulunma(semt.ad)} oluyor.`,
    },
    {
      soru: `${semt.ad} ev taşıma fiyatı ne kadar?`,
      cevap: goster
        ? `${bulunma(semt.ad)} 2+1 bir daire için tahmini ${tl(ikiBir.alt)} - ${tl(ikiBir.ust)} bandı geçerli. Kat, asansör durumu, ambalajlama ve tarih rakamı değiştiriyor; kesin fiyat keşiften sonra yazılı veriliyor.`
        : `Kat, asansör durumu, ambalajlama ve tarih fiyatı belirliyor. Keşif ücretsiz, teklif yazılı veriliyor.`,
    },
    {
      soru: `${bulunma(semt.ad)} en yakın hamal nasıl bulunur?`,
      cevap: goster
        ? `Aramanız yeterli; ekibi ${yonelme(semt.ad)} en yakın noktadan yönlendiriyoruz. Tek eleman tam gün ${tl(gunluk)} seviyesinden başlıyor, yarım günlük iş ve ekip çalışması için ayrı fiyat veriliyor.`
        : `Aramanız yeterli; ekibi ${yonelme(semt.ad)} en yakın noktadan yönlendiriyoruz. Ücret işin süresine ve kat sayısına göre baştan bildiriliyor.`,
    },
    {
      soru: `${bulunma(semt.ad)} asansörsüz binadan taşıma yapıyor musunuz?`,
      cevap:
        'Yapıyoruz. Merdivenden geçmeyen eşyalarda dışarıdan asansörlü taşıma kuruluyor, geçen eşyalarda kat başına ek çalışılıyor. İkisi de teklifte ayrı satır olarak yazıyor.',
    },
    {
      soru: `${ayrilma(semt.ad)} başka şehre taşınıyorum, yapıyor musunuz?`,
      cevap:
        'Evet. Adana dışına evden eve nakliyat ve yük taşıma hizmetimiz var; hedef şehre göre araç sınıfı ve fiyat belirleniyor. Şehirler arası sayfalarımızdan rota bazlı fiyatlara bakabilirsiniz.',
    },
  ]
}

/* ------------------------------------------------------------------ */
/* İlçe sayfası                                                        */
/* ------------------------------------------------------------------ */

export function ilceOzet(ilce, semtSayisi) {
  return `${ilce.ad} genelinde evden eve nakliyat, hamal, pikap taşıma ve mobilya montajı yapıyoruz. ${yonelme(ilce.ad)} bağlı ${semtSayisi} semtte aynı gün ekip çıkarabiliyoruz.`
}

export function ilceBolumleri(ilce, semtler, ayarlar) {
  const doku = DOKU[ilce.doku] || DOKU.karma
  const goster = fiyatGosterilsin(ayarlar)
  const ikiBir = evTasimaUcreti(evTipiBul('2-1'), ayarlar)

  return [
    {
      baslik: `${bulunma(ilce.ad)} Nakliyat Nasıl İşliyor?`,
      paragraflar: [
        `${ilce.ad}, Adana'nın merkez ilçelerinden biri ve nakliye talebinin en yoğun geldiği bölgelerden. ${ilce.ad} genelinde ${doku.bina}, bu yüzden ${doku.sokak}.`,
        doku.zorluk,
        goster
          ? `${ilce.ad} içinde 2+1 bir dairenin taşınması tahmini ${tl(ikiBir.alt)} - ${tl(ikiBir.ust)} bandında. Semtten semte belirgin bir fark yok; fiyatı belirleyen mesafe değil, binanın kat ve asansör durumu.`
          : `${ilce.ad} içinde fiyatı belirleyen mesafe değil, binanın kat ve asansör durumu. Keşif ücretsiz, teklif yazılı veriliyor.`,
      ],
    },
    {
      baslik: `${ilce.ad} Semtlerinde Hangi Hizmetleri Veriyoruz?`,
      paragraflar: [
        'Evden eve nakliyat, ofis taşıma, tek beyaz eşya taşıma, pikap ve kamyonetle parça eşya taşıma, hamal ve hamaliye, mobilya söküm ve montajı, ambalajlama ve kısa süreli depolama.',
        `Talep hangi semtten gelirse gelsin ekip ${ilce.ad} içinden çıkıyor, bu yüzden bekleme süresi kısa. Aşağıdaki listeden kendi semtinize ait sayfaya geçip o semte özel bilgileri görebilirsiniz.`,
      ],
    },
  ]
}

export function ilceSSS(ilce, ayarlar) {
  const goster = fiyatGosterilsin(ayarlar)
  const ikiBir = evTasimaUcreti(evTipiBul('2-1'), ayarlar)
  return [
    {
      soru: `${bulunma(ilce.ad)} hangi semtlere hizmet veriyorsunuz?`,
      cevap: `${yonelme(ilce.ad)} bağlı bütün semtlere gidiyoruz. Sayfadaki listede semtlerin kendi sayfaları var; listede olmayan bir adres için de aramanız yeterli.`,
    },
    {
      soru: `${ilce.ad} ev taşıma ücreti ne kadar?`,
      cevap: goster
        ? `2+1 bir daire için tahmini ${tl(ikiBir.alt)} - ${tl(ikiBir.ust)}. Kat, asansör durumu ve ambalajlama rakamı değiştiriyor.`
        : 'Kat, asansör durumu ve ambalajlama fiyatı belirliyor. Keşif ücretsiz.',
    },
    {
      soru: `${bulunma(ilce.ad)} aynı gün taşıma yapılıyor mu?`,
      cevap:
        'Küçük işlerde ve müsait araç olduğunda evet. Tam ev taşımasında en az bir gün önceden haber vermeniz ekip planlaması için daha sağlıklı oluyor.',
    },
  ]
}
