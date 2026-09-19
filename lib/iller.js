/**
 * Türkiye il/ilçe veri kümesi ve slug yardımcıları.
 *
 * Rota sayfaları (Adana → X) ve il hizmet sayfaları bu listeden üretilir.
 * Veri kod tarafında durduğu için sayfalar veritabanı olmadan da çalışır;
 * yönetim panelinden girilen kayıtlar bu temel veriyi yalnızca ezer.
 *
 * mesafe alanı Adana merkezden yaklaşık karayolu mesafesidir (km) ve
 * sayfalarda "yaklaşık" ibaresiyle gösterilir.
 */

const TR_HARF = { ğ: 'g', Ğ: 'g', ü: 'u', Ü: 'u', ş: 's', Ş: 's', ı: 'i', I: 'i', İ: 'i', ö: 'o', Ö: 'o', ç: 'c', Ç: 'c' }

export function slugify(text) {
  return String(text || '')
    .replace(/[ğĞüÜşŞıIİöÖçÇ]/g, (h) => TR_HARF[h])
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

export const BOLGELER = {
  akdeniz: 'Akdeniz Bölgesi',
  ege: 'Ege Bölgesi',
  marmara: 'Marmara Bölgesi',
  ic: 'İç Anadolu Bölgesi',
  karadeniz: 'Karadeniz Bölgesi',
  dogu: 'Doğu Anadolu Bölgesi',
  guneydogu: 'Güneydoğu Anadolu Bölgesi',
}

export const BOLGE_SIRASI = ['akdeniz', 'guneydogu', 'ic', 'ege', 'marmara', 'karadeniz', 'dogu']

const HAM_ILLER = [
  [1, 'Adana', 'akdeniz', 0, ['Seyhan', 'Yüreğir', 'Çukurova', 'Sarıçam', 'Ceyhan', 'Kozan', 'İmamoğlu', 'Karaisalı', 'Karataş', 'Pozantı', 'Aladağ', 'Feke', 'Saimbeyli', 'Tufanbeyli', 'Yumurtalık']],
  [2, 'Adıyaman', 'guneydogu', 330, ['Merkez', 'Besni', 'Kahta', 'Gölbaşı', 'Gerger', 'Samsat', 'Sincik', 'Çelikhan', 'Tut']],
  [3, 'Afyonkarahisar', 'ege', 610, ['Merkez', 'Sandıklı', 'Dinar', 'Bolvadin', 'Emirdağ', 'Sultandağı', 'Şuhut', 'Çay', 'İscehisar']],
  [4, 'Ağrı', 'dogu', 1080, ['Merkez', 'Doğubayazıt', 'Patnos', 'Diyadin', 'Eleşkirt', 'Tutak', 'Hamur', 'Taşlıçay']],
  [5, 'Amasya', 'karadeniz', 700, ['Merkez', 'Merzifon', 'Suluova', 'Taşova', 'Gümüşhacıköy', 'Göynücek', 'Hamamözü']],
  [6, 'Ankara', 'ic', 490, ['Çankaya', 'Keçiören', 'Yenimahalle', 'Mamak', 'Etimesgut', 'Sincan', 'Altındağ', 'Pursaklar', 'Gölbaşı', 'Polatlı', 'Beypazarı', 'Kızılcahamam', 'Çubuk']],
  [7, 'Antalya', 'akdeniz', 560, ['Muratpaşa', 'Kepez', 'Konyaaltı', 'Alanya', 'Manavgat', 'Serik', 'Kemer', 'Kaş', 'Kumluca', 'Finike', 'Demre', 'Gazipaşa', 'Döşemealtı', 'Aksu']],
  [8, 'Artvin', 'karadeniz', 1130, ['Merkez', 'Hopa', 'Arhavi', 'Borçka', 'Yusufeli', 'Şavşat', 'Ardanuç', 'Murgul']],
  [9, 'Aydın', 'ege', 850, ['Efeler', 'Nazilli', 'Söke', 'Kuşadası', 'Didim', 'Germencik', 'İncirliova', 'Çine', 'Koçarlı']],
  [10, 'Balıkesir', 'marmara', 940, ['Karesi', 'Altıeylül', 'Bandırma', 'Edremit', 'Ayvalık', 'Burhaniye', 'Gönen', 'Erdek', 'Susurluk', 'Bigadiç']],
  [11, 'Bilecik', 'marmara', 750, ['Merkez', 'Bozüyük', 'Osmaneli', 'Söğüt', 'Gölpazarı', 'Pazaryeri']],
  [12, 'Bingöl', 'dogu', 720, ['Merkez', 'Genç', 'Solhan', 'Karlıova', 'Adaklı', 'Kiğı']],
  [13, 'Bitlis', 'dogu', 900, ['Merkez', 'Tatvan', 'Ahlat', 'Güroymak', 'Adilcevaz', 'Hizan', 'Mutki']],
  [14, 'Bolu', 'karadeniz', 660, ['Merkez', 'Gerede', 'Mudurnu', 'Mengen', 'Göynük', 'Yeniçağa', 'Dörtdivan']],
  [15, 'Burdur', 'akdeniz', 620, ['Merkez', 'Bucak', 'Gölhisar', 'Yeşilova', 'Tefenni', 'Ağlasun']],
  [16, 'Bursa', 'marmara', 840, ['Osmangazi', 'Nilüfer', 'Yıldırım', 'İnegöl', 'Gemlik', 'Mudanya', 'Mustafakemalpaşa', 'Karacabey', 'Orhangazi', 'İznik', 'Gürsu', 'Kestel']],
  [17, 'Çanakkale', 'marmara', 1050, ['Merkez', 'Biga', 'Çan', 'Gelibolu', 'Ayvacık', 'Ezine', 'Bayramiç', 'Bozcaada', 'Gökçeada', 'Lapseki']],
  [18, 'Çankırı', 'ic', 620, ['Merkez', 'Çerkeş', 'Ilgaz', 'Orta', 'Şabanözü', 'Kurşunlu']],
  [19, 'Çorum', 'karadeniz', 660, ['Merkez', 'Sungurlu', 'Osmancık', 'İskilip', 'Alaca', 'Bayat', 'Mecitözü']],
  [20, 'Denizli', 'ege', 720, ['Merkezefendi', 'Pamukkale', 'Acıpayam', 'Çivril', 'Tavas', 'Sarayköy', 'Buldan', 'Honaz']],
  [21, 'Diyarbakır', 'guneydogu', 550, ['Bağlar', 'Kayapınar', 'Yenişehir', 'Sur', 'Ergani', 'Bismil', 'Silvan', 'Çermik', 'Çınar']],
  [22, 'Edirne', 'marmara', 1180, ['Merkez', 'Keşan', 'Uzunköprü', 'İpsala', 'Havsa', 'Enez', 'Meriç']],
  [23, 'Elazığ', 'dogu', 540, ['Merkez', 'Kovancılar', 'Karakoçan', 'Palu', 'Baskil', 'Maden', 'Sivrice']],
  [24, 'Erzincan', 'dogu', 700, ['Merkez', 'Tercan', 'Refahiye', 'Üzümlü', 'Kemah', 'Çayırlı']],
  [25, 'Erzurum', 'dogu', 900, ['Yakutiye', 'Palandöken', 'Aziziye', 'Oltu', 'Horasan', 'Pasinler', 'İspir', 'Tortum']],
  [26, 'Eskişehir', 'ic', 630, ['Odunpazarı', 'Tepebaşı', 'Sivrihisar', 'Çifteler', 'Seyitgazi', 'Mihalıççık']],
  [27, 'Gaziantep', 'guneydogu', 215, ['Şahinbey', 'Şehitkamil', 'Nizip', 'İslahiye', 'Araban', 'Oğuzeli', 'Nurdağı']],
  [28, 'Giresun', 'karadeniz', 910, ['Merkez', 'Bulancak', 'Espiye', 'Görele', 'Tirebolu', 'Şebinkarahisar', 'Dereli']],
  [29, 'Gümüşhane', 'karadeniz', 930, ['Merkez', 'Kelkit', 'Şiran', 'Torul', 'Köse', 'Kürtün']],
  [30, 'Hakkari', 'dogu', 1080, ['Merkez', 'Yüksekova', 'Şemdinli', 'Çukurca', 'Derecik']],
  [31, 'Hatay', 'akdeniz', 190, ['Antakya', 'İskenderun', 'Defne', 'Dörtyol', 'Samandağ', 'Kırıkhan', 'Reyhanlı', 'Arsuz', 'Payas', 'Erzin', 'Altınözü', 'Belen']],
  [32, 'Isparta', 'akdeniz', 570, ['Merkez', 'Yalvaç', 'Eğirdir', 'Şarkikaraağaç', 'Gelendost', 'Senirkent', 'Keçiborlu']],
  [33, 'Mersin', 'akdeniz', 70, ['Akdeniz', 'Yenişehir', 'Toroslar', 'Mezitli', 'Tarsus', 'Erdemli', 'Silifke', 'Anamur', 'Mut', 'Bozyazı', 'Gülnar']],
  [34, 'İstanbul', 'marmara', 940, ['Kadıköy', 'Beşiktaş', 'Şişli', 'Bakırköy', 'Üsküdar', 'Maltepe', 'Ataşehir', 'Pendik', 'Kartal', 'Bahçelievler', 'Esenyurt', 'Beylikdüzü', 'Başakşehir', 'Sarıyer', 'Beyoğlu', 'Fatih', 'Ümraniye', 'Tuzla', 'Şile']],
  [35, 'İzmir', 'ege', 900, ['Konak', 'Karşıyaka', 'Bornova', 'Buca', 'Bayraklı', 'Çiğli', 'Gaziemir', 'Balçova', 'Narlıdere', 'Urla', 'Çeşme', 'Seferihisar', 'Foça', 'Menemen', 'Torbalı', 'Selçuk', 'Dikili', 'Bergama']],
  [36, 'Kars', 'dogu', 1090, ['Merkez', 'Sarıkamış', 'Kağızman', 'Selim', 'Digor', 'Arpaçay']],
  [37, 'Kastamonu', 'karadeniz', 740, ['Merkez', 'Tosya', 'Taşköprü', 'İnebolu', 'Cide', 'Devrekani', 'Araç', 'Daday']],
  [38, 'Kayseri', 'ic', 330, ['Melikgazi', 'Kocasinan', 'Talas', 'Develi', 'Yahyalı', 'Bünyan', 'İncesu', 'Pınarbaşı', 'Tomarza']],
  [39, 'Kırklareli', 'marmara', 1150, ['Merkez', 'Lüleburgaz', 'Babaeski', 'Vize', 'Pınarhisar', 'Demirköy']],
  [40, 'Kırşehir', 'ic', 400, ['Merkez', 'Kaman', 'Mucur', 'Çiçekdağı', 'Akpınar']],
  [41, 'Kocaeli', 'marmara', 850, ['İzmit', 'Gebze', 'Darıca', 'Gölcük', 'Körfez', 'Derince', 'Çayırova', 'Kartepe', 'Başiskele', 'Karamürsel']],
  [42, 'Konya', 'ic', 350, ['Selçuklu', 'Meram', 'Karatay', 'Ereğli', 'Akşehir', 'Beyşehir', 'Seydişehir', 'Çumra', 'Ilgın', 'Cihanbeyli']],
  [43, 'Kütahya', 'ege', 670, ['Merkez', 'Tavşanlı', 'Simav', 'Gediz', 'Emet', 'Altıntaş', 'Domaniç']],
  [44, 'Malatya', 'dogu', 400, ['Battalgazi', 'Yeşilyurt', 'Doğanşehir', 'Akçadağ', 'Darende', 'Hekimhan', 'Pütürge']],
  [45, 'Manisa', 'ege', 860, ['Şehzadeler', 'Yunusemre', 'Akhisar', 'Turgutlu', 'Salihli', 'Soma', 'Alaşehir', 'Saruhanlı', 'Kula']],
  [46, 'Kahramanmaraş', 'akdeniz', 190, ['Onikişubat', 'Dulkadiroğlu', 'Elbistan', 'Afşin', 'Pazarcık', 'Türkoğlu', 'Göksun', 'Andırın']],
  [47, 'Mardin', 'guneydogu', 620, ['Artuklu', 'Kızıltepe', 'Midyat', 'Nusaybin', 'Derik', 'Mazıdağı', 'Savur']],
  [48, 'Muğla', 'ege', 830, ['Menteşe', 'Bodrum', 'Fethiye', 'Marmaris', 'Milas', 'Ortaca', 'Dalaman', 'Datça', 'Köyceğiz', 'Seydikemer', 'Ula', 'Yatağan']],
  [49, 'Muş', 'dogu', 840, ['Merkez', 'Bulanık', 'Malazgirt', 'Varto', 'Hasköy', 'Korkut']],
  [50, 'Nevşehir', 'ic', 320, ['Merkez', 'Ürgüp', 'Avanos', 'Gülşehir', 'Derinkuyu', 'Acıgöl', 'Hacıbektaş', 'Kozaklı']],
  [51, 'Niğde', 'ic', 210, ['Merkez', 'Bor', 'Çiftlik', 'Ulukışla', 'Altunhisar', 'Çamardı']],
  [52, 'Ordu', 'karadeniz', 860, ['Altınordu', 'Ünye', 'Fatsa', 'Perşembe', 'Kumru', 'Korgan', 'Gölköy']],
  [53, 'Rize', 'karadeniz', 1030, ['Merkez', 'Çayeli', 'Ardeşen', 'Pazar', 'Fındıklı', 'Çamlıhemşin', 'İyidere']],
  [54, 'Sakarya', 'marmara', 810, ['Adapazarı', 'Serdivan', 'Erenler', 'Hendek', 'Akyazı', 'Karasu', 'Sapanca', 'Geyve', 'Pamukova']],
  [55, 'Samsun', 'karadeniz', 780, ['İlkadım', 'Atakum', 'Canik', 'Bafra', 'Çarşamba', 'Vezirköprü', 'Terme', 'Havza', 'Alaçam']],
  [56, 'Siirt', 'guneydogu', 780, ['Merkez', 'Kurtalan', 'Pervari', 'Baykan', 'Şirvan', 'Eruh']],
  [57, 'Sinop', 'karadeniz', 830, ['Merkez', 'Boyabat', 'Gerze', 'Ayancık', 'Türkeli', 'Durağan']],
  [58, 'Sivas', 'ic', 480, ['Merkez', 'Şarkışla', 'Suşehri', 'Zara', 'Gürün', 'Yıldızeli', 'Divriği', 'Kangal']],
  [59, 'Tekirdağ', 'marmara', 1050, ['Süleymanpaşa', 'Çorlu', 'Çerkezköy', 'Kapaklı', 'Malkara', 'Saray', 'Hayrabolu', 'Şarköy', 'Ergene', 'Marmaraereğlisi', 'Muratlı']],
  [60, 'Tokat', 'karadeniz', 620, ['Merkez', 'Erbaa', 'Turhal', 'Niksar', 'Zile', 'Reşadiye', 'Almus']],
  [61, 'Trabzon', 'karadeniz', 980, ['Ortahisar', 'Akçaabat', 'Of', 'Araklı', 'Yomra', 'Sürmene', 'Vakfıkebir', 'Maçka', 'Arsin']],
  [62, 'Tunceli', 'dogu', 640, ['Merkez', 'Pertek', 'Çemişgezek', 'Ovacık', 'Mazgirt', 'Hozat']],
  [63, 'Şanlıurfa', 'guneydogu', 370, ['Eyyübiye', 'Haliliye', 'Karaköprü', 'Siverek', 'Viranşehir', 'Suruç', 'Birecik', 'Akçakale', 'Ceylanpınar', 'Bozova', 'Halfeti', 'Harran']],
  [64, 'Uşak', 'ege', 700, ['Merkez', 'Banaz', 'Eşme', 'Sivaslı', 'Ulubey', 'Karahallı']],
  [65, 'Van', 'dogu', 1000, ['İpekyolu', 'Tuşba', 'Edremit', 'Erciş', 'Çaldıran', 'Gevaş', 'Muradiye', 'Başkale', 'Özalp']],
  [66, 'Yozgat', 'ic', 480, ['Merkez', 'Sorgun', 'Yerköy', 'Akdağmadeni', 'Boğazlıyan', 'Sarıkaya', 'Çekerek']],
  [67, 'Zonguldak', 'karadeniz', 740, ['Merkez', 'Ereğli', 'Çaycuma', 'Devrek', 'Alaplı', 'Gökçebey', 'Kilimli', 'Kozlu']],
  [68, 'Aksaray', 'ic', 250, ['Merkez', 'Ortaköy', 'Eskil', 'Gülağaç', 'Güzelyurt', 'Sultanhanı']],
  [69, 'Bayburt', 'karadeniz', 880, ['Merkez', 'Demirözü', 'Aydıntepe']],
  [70, 'Karaman', 'ic', 230, ['Merkez', 'Ermenek', 'Ayrancı', 'Kazımkarabekir', 'Sarıveliler', 'Başyayla']],
  [71, 'Kırıkkale', 'ic', 470, ['Merkez', 'Keskin', 'Delice', 'Yahşihan', 'Balışeyh', 'Sulakyurt']],
  [72, 'Batman', 'guneydogu', 690, ['Merkez', 'Kozluk', 'Sason', 'Beşiri', 'Gercüş', 'Hasankeyf']],
  [73, 'Şırnak', 'guneydogu', 780, ['Merkez', 'Cizre', 'Silopi', 'İdil', 'Uludere', 'Beytüşşebap']],
  [74, 'Bartın', 'karadeniz', 780, ['Merkez', 'Amasra', 'Ulus', 'Kurucaşile']],
  [75, 'Ardahan', 'dogu', 1140, ['Merkez', 'Göle', 'Çıldır', 'Hanak', 'Posof', 'Damal']],
  [76, 'Iğdır', 'dogu', 1150, ['Merkez', 'Tuzluca', 'Aralık', 'Karakoyunlu']],
  [77, 'Yalova', 'marmara', 880, ['Merkez', 'Çınarcık', 'Termal', 'Altınova', 'Çiftlikköy', 'Armutlu']],
  [78, 'Karabük', 'karadeniz', 720, ['Merkez', 'Safranbolu', 'Yenice', 'Eskipazar', 'Eflani', 'Ovacık']],
  [79, 'Kilis', 'guneydogu', 260, ['Merkez', 'Musabeyli', 'Elbeyli', 'Polateli']],
  [80, 'Osmaniye', 'akdeniz', 90, ['Merkez', 'Kadirli', 'Düziçi', 'Bahçe', 'Toprakkale', 'Sumbas', 'Hasanbeyli']],
  [81, 'Düzce', 'karadeniz', 700, ['Merkez', 'Akçakoca', 'Kaynaşlı', 'Gölyaka', 'Yığılca', 'Çilimli', 'Cumayeri', 'Gümüşova']],
]

export const ILLER = HAM_ILLER.map(([plaka, ad, bolge, mesafe, ilceler]) => ({
  plaka,
  ad,
  slug: slugify(ad),
  bolge,
  bolgeAdi: BOLGELER[bolge],
  mesafe,
  ilceler,
}))

export const IL_HARITASI = new Map(ILLER.map((il) => [il.slug, il]))

export function ilBul(slug) {
  return IL_HARITASI.get(slug) || null
}

/** Adana dışındaki iller: rota sayfaları yalnızca bunlar için üretilir. */
export const HEDEF_ILLER = ILLER.filter((il) => il.slug !== 'adana')

export const ADANA = ilBul('adana')
