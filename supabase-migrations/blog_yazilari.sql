-- =====================================================
-- BLOG YAZILARI (rota içermeyen, genel faydalı içerikler)
-- Supabase > SQL Editor içine yapıştırıp çalıştırın.
-- Aynı slug varsa tekrar eklenmez, mevcut yazı değiştirilmez.
-- =====================================================

INSERT INTO makaleler (baslik, slug, ozet, icerik, kategori, etiketler, yazar, aktif, meta_title, meta_description)
SELECT 'Evden Eve Nakliyatta Ambalaj Rehberi: Hangi Eşya Nasıl Paketlenir?', 'evden-eve-nakliyatta-ambalaj-rehberi', 'Koli seçiminden streç filme, cam eşyadan elektronik cihazlara kadar taşınmada kullanılan ambalaj malzemeleri ve doğru paketleme yöntemleri.',
       '<h2>Ambalaj neden fiyattan daha önemli?</h2>
<p>Taşınmada hasarların büyük bölümü yolda değil, yükleme ve boşaltma sırasında oluşur. Doğru ambalajlanmış bir eşya, kamyonun içinde kaysa bile zarar görmez. Bu yüzden ambalaj malzemesinden kısmak, çoğu zaman tamir masrafı olarak geri döner.</p>

<h2>Hangi malzeme ne işe yarar?</h2>
<ul>
<li><strong>Çift oluklu koli:</strong> Kitap, mutfak eşyası ve ağır küçük parçalar için. Tek oluklu koliler 12 kg üzerinde dibinden açılır.</li>
<li><strong>Balonlu naylon:</strong> Cam, porselen, tablo ve ekran için. Baloncuklu yüzey eşyaya bakacak şekilde sarılır.</li>
<li><strong>Streç film:</strong> Çekmeceleri ve dolap kapaklarını kapalı tutmak, kumaş yüzeyleri tozdan korumak için.</li>
<li><strong>Battaniye (nakliye battaniyesi):</strong> Mobilya köşeleri ve cilalı yüzeyler için. Streç doğrudan cilalı ahşaba sarılırsa yüzeyi lekeler; önce battaniye, sonra streç.</li>
<li><strong>Ahşap sandık:</strong> Piyano, heykel, antika ve büyük ayna için.</li>
</ul>

<h2>Oda oda paketleme</h2>
<h3>Mutfak</h3>
<p>Tabaklar yan yana değil, dik olarak yerleştirilir; aralarına kağıt konur. Bardaklar tek tek sarılır ve kolinin üst sırasına konur. Bıçaklar bir bez içine sarılıp bantlanır. Açılmış sıvı ürünler taşınmaz, kapakları ne kadar sıkı olursa olsun sızdırır.</p>

<h3>Yatak odası</h3>
<p>Gardırop içeriği için portatif elbise kolisi kullanın; askıdaki kıyafetler askıda taşınır, ütü masrafı çıkmaz. Yatak başlıkları sökülüp battaniyeyle sarılır, yatak koruyucu poşete geçirilir.</p>

<h3>Salon</h3>
<p>Televizyonun kendi kutusu varsa en iyisi odur. Yoksa ekran balonlu naylonla kaplanır, iki taraftan karton plakayla desteklenir ve <strong>her zaman dik</strong> taşınır. Yatık taşınan LCD panellerde basınç lekesi oluşur.</p>

<h2>Etiketleme: en çok işe yarayan beş dakika</h2>
<p>Her kolinin üstüne değil <em>yanına</em> yazın; koliler üst üste dizildiğinde üst yüzey görünmez. Etikete üç şey yazmak yeterli: gideceği oda, içindekiler ve kırılacaksa büyük harfle uyarı. Kolileri numaralandırıp telefonunuza kısa bir liste tutmak, boşaltmayı gerçekten hızlandırır.</p>

<h2>Ambalajı firma mı yapsın?</h2>
<p>Bizim <a href="/hizmet/adana-asansorlu-nakliyat">Adana asansörlü nakliyat</a> ve evden eve hizmetlerimizde ambalaj malzemesi ve işçiliği fiyata dahildir. Kendiniz paketlemek isterseniz de malzemeyi önceden bırakabiliyoruz. Şehir dışına taşınıyorsanız <a href="/rota">rota sayfalarımızda</a> güzergaha özel süre ve fiyat bilgisi bulabilirsiniz.</p>',
       'Taşınma Rehberi', 'ambalaj, paketleme, koli, evden eve nakliyat', 'Adana Nakliye', true, 'Evden Eve Nakliyatta Ambalaj Rehberi: Hangi Eşya Nasıl Paketlenir? | Adana Nakliye', 'Koli seçiminden streç filme, cam eşyadan elektronik cihazlara kadar taşınmada kullanılan ambalaj malzemeleri ve doğru paketleme yöntemleri.'
WHERE NOT EXISTS (SELECT 1 FROM makaleler WHERE slug = 'evden-eve-nakliyatta-ambalaj-rehberi');

INSERT INTO makaleler (baslik, slug, ozet, icerik, kategori, etiketler, yazar, aktif, meta_title, meta_description)
SELECT 'Taşınma Öncesi 30 Günlük Kontrol Listesi', 'tasinma-oncesi-30-gunluk-kontrol-listesi', 'Taşınma tarihinden 30 gün önce başlayıp son güne kadar haftalara bölünmüş, işaretleyerek ilerleyebileceğiniz pratik bir kontrol listesi.',
       '<h2>30 gün kala</h2>
<ul>
<li>En az iki firmadan yerinde ekspertiz isteyin. Telefonda verilen fiyat bağlayıcı değildir.</li>
<li>Taşınma gününü belirleyin. Ay ortası ve hafta içi günler hem daha ucuz hem daha esnektir.</li>
<li>Elden çıkaracağınız eşyaları ayırın. Taşımayacağınız her metreküp doğrudan paradan düşer.</li>
<li>Yeni evde tadilat gerekiyorsa şimdi başlatın; boya kokusu taşınmadan önce çıksın.</li>
</ul>

<h2>3 hafta kala</h2>
<ul>
<li>İnternet ve TV aboneliği için nakil başvurusu yapın. Bu işlem çoğu sağlayıcıda 7-10 gün sürüyor.</li>
<li>Okul kaydı değişecekse nakil evraklarını hazırlayın.</li>
<li>Kullanmadığınız odalardan paketlemeye başlayın: misafir odası, kiler, depo.</li>
<li>Sigorta poliçenizin yeni adresi kapsayıp kapsamadığını sorun.</li>
</ul>

<h2>2 hafta kala</h2>
<ul>
<li>Elektrik, su ve doğalgaz için kapama/açma randevusu alın. Doğalgaz açılışı bazı illerde randevu ile yapılıyor.</li>
<li>Adres değişikliğini e-Devlet üzerinden yapmaya hazırlanın (taşındıktan sonra 20 gün içinde bildirim zorunlu).</li>
<li>Banka, kargo ve abonelik adreslerini listeleyin.</li>
<li>Apartman yönetimine taşınma gününü bildirin; asansör ve giriş kullanımı için izin gerekebilir.</li>
</ul>

<h2>1 hafta kala</h2>
<ul>
<li>Derin dondurucuyu boşaltmaya başlayın.</li>
<li>Reçeteli ilaç, kimlik, tapu, pasaport gibi evrakları tek bir çantada toplayın; bu çanta kamyona binmez.</li>
<li>Taşınma gününde lazım olacak kutuyu hazırlayın: temizlik malzemesi, tuvalet kağıdı, telefon şarj aleti, birkaç bardak, çay-kahve, ilk gece nevresimi.</li>
<li>Firmayla saat ve park yerini teyit edin.</li>
</ul>

<h2>Son 24 saat</h2>
<ul>
<li>Buzdolabını kapatıp defrost edin (en az 6 saat, ideali 12 saat).</li>
<li>Çamaşır makinesinin suyunu boşaltın, <strong>tambur sabitleme vidalarını takın</strong>. Vidasız taşınan makinelerin rulmanı yolda bozulur.</li>
<li>Değerli takı ve nakit parayı kendi yanınıza alın.</li>
<li>Eski evin son sayaç değerlerini fotoğraflayın.</li>
</ul>

<h2>Taşınma günü</h2>
<p>Ekip gelmeden önce koridorları boşaltın. Eşya listesini birlikte kontrol edip imzalayın. Boşaltma bittiğinde odaları gezip eksik var mı bakın, tutanağı ondan sonra kapatın.</p>
<p>Şehir dışına taşınıyorsanız teslim süresi mesafeye göre değişir; <a href="/rota">rota sayfalarımızda</a> her il için yaklaşık mesafe ve ortalama teslim süresi yazıyor.</p>',
       'Taşınma Rehberi', 'kontrol listesi, taşınma planı, hazırlık', 'Adana Nakliye', true, 'Taşınma Öncesi 30 Günlük Kontrol Listesi | Adana Nakliye', 'Taşınma tarihinden 30 gün önce başlayıp son güne kadar haftalara bölünmüş, işaretleyerek ilerleyebileceğiniz pratik bir kontrol listesi.'
WHERE NOT EXISTS (SELECT 1 FROM makaleler WHERE slug = 'tasinma-oncesi-30-gunluk-kontrol-listesi');

INSERT INTO makaleler (baslik, slug, ozet, icerik, kategori, etiketler, yazar, aktif, meta_title, meta_description)
SELECT 'Beyaz Eşya Taşıma: Buzdolabı ve Çamaşır Makinesi Nasıl Hazırlanır?', 'beyaz-esya-tasima-hazirlik', 'Buzdolabı, çamaşır makinesi, bulaşık makinesi ve fırının taşınmaya nasıl hazırlanacağı; en sık yapılan hatalar ve servis masrafından kaçınma yolları.',
       '<h2>Buzdolabı</h2>
<p>Buzdolabında kritik parça kompresördeki yağdır. Dolap yan yatırıldığında yağ soğutucu borulara kaçar ve fişe takıldığında kompresör zarar görür. Kural basit: <strong>buzdolabı her zaman dik taşınır.</strong> Zorunlu olarak yatırıldıysa yeni adreste en az 6 saat, mümkünse 12 saat dik bekletilmeden fişe takılmaz.</p>
<ul>
<li>Taşımadan 12 saat önce fişten çekin, tamamen boşaltın.</li>
<li>Buz çözüldükten sonra iç yüzeyi kurulayın; nem yolda küf yapar.</li>
<li>Rafları çıkarıp ayrı sarın veya yerinde streçleyin.</li>
<li>Kapıyı bantla sabitleyin ama kapağı tamamen hava almayacak şekilde kapatmayın.</li>
</ul>

<h2>Çamaşır makinesi</h2>
<p>En çok atlanan adım burada. Yeni makineyle birlikte gelen <strong>tambur sabitleme (nakliye) vidaları</strong> makinenin arkasındaki deliklere takılmadan taşınırsa, tambur yol boyunca salınır ve rulman dağılır. Vidalarınız kaybolduysa yetkili servisten temin edilebilir; maliyeti rulman değişiminin çok altındadır.</p>
<ul>
<li>Su giriş hortumunu sökün, musluk tarafını da kapatın.</li>
<li>Pompa filtresini açıp kalan suyu tahliye edin, bir havlu hazır bulundurun.</li>
<li>Tamburun içine havlu koyup kapağı bantlayın.</li>
</ul>

<h2>Bulaşık makinesi</h2>
<p>Çamaşır makinesine benzer şekilde tahliye hortumunda su kalır. Sökmeden önce bir program boşta çalıştırıp kurutma yapmak, küf kokusunu engeller. Sepetleri çıkarıp ayrı taşıyın.</p>

<h2>Fırın ve ocak</h2>
<p>Ankastre ürünlerin sökümü elektrik ve gaz bağlantısı gerektirir. Doğalgazlı ocakların sökülüp takılması yetkili kişi işidir; taşınma planınızı buna göre yapın. Cam kapaklı fırınlarda kapak menteşesi darbeye duyarlıdır, kapağı bantla sabitleyin.</p>

<h2>Klima</h2>
<p>Klima sökümü gaz tahliyesi gerektirir ve nakliye ekibinin işi değildir. Taşınmadan birkaç gün önce klima servisine söktürüp, yeni adreste yine servise taktırmak gerekir. Aksi halde gaz kaçar ve montajda yeniden gaz dolumu ücreti çıkar.</p>

<h2>Bizde nasıl ilerliyor?</h2>
<p>Ekibimiz beyaz eşyayı yerinden çıkarır, battaniye ve streçle sarar, taşır ve yeni adreste yerine koyar. Su ve elektrik bağlantısı yapılır; doğalgaz ve klima bağlantısı yasal olarak yetkili servisin işidir. Şehir dışı taşımalarda süre ve fiyat için <a href="/nakliye-hizmetleri">ilinize ait hizmet sayfasına</a> bakabilirsiniz.</p>',
       'Taşınma Rehberi', 'beyaz eşya, buzdolabı, çamaşır makinesi, taşıma', 'Adana Nakliye', true, 'Beyaz Eşya Taşıma: Buzdolabı ve Çamaşır Makinesi Nasıl Hazırlanır? | Adana Nakliye', 'Buzdolabı, çamaşır makinesi, bulaşık makinesi ve fırının taşınmaya nasıl hazırlanacağı; en sık yapılan hatalar ve servis masrafından kaçınma yolları.'
WHERE NOT EXISTS (SELECT 1 FROM makaleler WHERE slug = 'beyaz-esya-tasima-hazirlik');

INSERT INTO makaleler (baslik, slug, ozet, icerik, kategori, etiketler, yazar, aktif, meta_title, meta_description)
SELECT 'Nakliyat Sigortası Nedir, Neyi Kapsar, Neyi Kapsamaz?', 'nakliyat-sigortasi-nedir-neyi-kapsar', 'Evden eve nakliyat sigortasının kapsamı, beyan değeri, muafiyet ve hasar durumunda izlenecek adımlar sade bir dille anlatıldı.',
       '<h2>Nakliyat sigortası ne demek?</h2>
<p>Evden eve nakliyatta kullanılan sigorta, eşyanızın taşıma sırasında uğrayabileceği fiziksel hasarı karşılayan bir poliçedir. Firmanın kendi sorumluluğundan ayrı bir üründür ve poliçede eşya listesi ile beyan edilen değer esas alınır.</p>

<h2>Genellikle kapsar</h2>
<ul>
<li>Yükleme ve boşaltma sırasında düşme, çarpma, kırılma</li>
<li>Araç kazası, devrilme, yangın</li>
<li>Taşıma sırasında suya maruz kalma</li>
<li>Hırsızlık (araçtan tüm yükün çalınması)</li>
</ul>

<h2>Genellikle kapsamaz</h2>
<ul>
<li>Müşterinin kendi paketlediği kolilerin içindeki kırılmalar</li>
<li>Eskime, çizik, aşınma gibi kullanımdan gelen kusurlar</li>
<li>Beyan edilmemiş değerli eşya (mücevher, nakit, koleksiyon)</li>
<li>Elektronik cihazın dış hasar olmadan çalışmaması</li>
<li>Canlı hayvan ve bitki</li>
</ul>

<h2>Beyan değeri neden önemli?</h2>
<p>Poliçedeki tutar, eşyanızın toplam değerinden düşükse hasar ödemesi oransal yapılır. Örneğin 400.000 TL değerindeki eşya 200.000 TL üzerinden sigortalandıysa, 20.000 TL''lik bir hasarda ödeme 10.000 TL olur. Bu yüzden beyanı gerçekçi tutmak gerekir.</p>

<h2>Hasar durumunda ne yapılır?</h2>
<ol>
<li>Hasarı <strong>teslim anında</strong> tutanağa yazdırın. Ekip gittikten sonra bildirilen hasarlarda ispat zorlaşır.</li>
<li>Hasarlı eşyayı ve ambalajını fotoğraflayın.</li>
<li>Firmaya yazılı bildirin; poliçe numarasını isteyin.</li>
<li>Eksper gelene kadar eşyayı tamir ettirmeyin veya atmayın.</li>
</ol>

<h2>Sormanız gereken üç soru</h2>
<p>Teklif alırken şunları sorun: Poliçe hangi sigorta şirketinden? Muafiyet tutarı ne kadar? Sigorta fiyata dahil mi, yoksa ek ücret mi? Bizim <a href="/rota">şehirler arası taşımalarımızın</a> tamamı sigorta kapsamındadır ve poliçe bilgisi sözleşmede yazılıdır.</p>',
       'Bilgi', 'sigorta, nakliyat sigortası, hasar', 'Adana Nakliye', true, 'Nakliyat Sigortası Nedir, Neyi Kapsar, Neyi Kapsamaz? | Adana Nakliye', 'Evden eve nakliyat sigortasının kapsamı, beyan değeri, muafiyet ve hasar durumunda izlenecek adımlar sade bir dille anlatıldı.'
WHERE NOT EXISTS (SELECT 1 FROM makaleler WHERE slug = 'nakliyat-sigortasi-nedir-neyi-kapsar');

INSERT INTO makaleler (baslik, slug, ozet, icerik, kategori, etiketler, yazar, aktif, meta_title, meta_description)
SELECT 'Asansörlü Nakliyat Ne Zaman Gerekir, Maliyeti Nasıl Hesaplanır?', 'asansorlu-nakliyat-ne-zaman-gerekir', 'Mobil asansörün hangi durumlarda gerektiği, kat ve cephe koşulları, güvenlik önlemleri ve maliyeti etkileyen unsurlar.',
       '<h2>Mobil asansör nedir?</h2>
<p>Mobil asansör, bir araca monte edilen ve eşyayı pencere ya da balkondan indirip çıkaran teleskopik raylı sistemdir. Merdiven taşımasına göre hem çok daha hızlı hem de eşya ve bina için daha güvenlidir.</p>

<h2>Hangi durumlarda gerekir?</h2>
<ul>
<li>Bina asansörü yoksa ve daire 2. kattan yukarıdaysa</li>
<li>Bina asansörü varsa ama kabin gardırop, kanepe veya buzdolabını almıyorsa</li>
<li>Merdiven boşluğu dar veya dönüşlü ise</li>
<li>Apartman yönetimi eşya taşımada asansör kullanımına izin vermiyorsa</li>
<li>Yeni boyanmış merdiven boşluğunun zarar görmesi istenmiyorsa</li>
</ul>

<h2>Uygun olmayan durumlar</h2>
<p>Mobil asansör her binada kurulamaz. Şu koşullara bakılır:</p>
<ul>
<li>Aracın cepheye yaklaşabileceği bir park alanı olmalı</li>
<li>Cephede pencere veya balkon, eşyanın geçebileceği genişlikte olmalı</li>
<li>Cephe önünden geçen elektrik hattı, ağaç veya tente rayı engellememeli</li>
<li>Çok yüksek katlarda (genelde 10. kat üzeri) araç tipine göre sınır olabilir</li>
</ul>
<p>Bu yüzden asansör ihtiyacı telefonda değil, yerinde ekspertizde karara bağlanır.</p>

<h2>Maliyeti ne belirler?</h2>
<p>Asansör ücretini üç şey etkiler: kat yüksekliği, asansörün sahada kalacağı süre ve kurulum zorluğu. Genelde saatlik veya yarım gün üzerinden fiyatlanır. İki adresin ikisinde de asansör gerekiyorsa iki ayrı kurulum sayılır.</p>
<p>Önemli olan bu kalemin teklife baştan eklenmesidir. Taşıma günü "asansör lazımmış" denip ek ücret istenmesi, sektörün en yaygın şikayet konusudur; biz asansör ihtiyacını ekspertizde belirleyip yazılı teklife dahil ediyoruz.</p>

<h2>Güvenlik</h2>
<p>Asansör kurulurken araç sabitlenir ve çalışma alanı kapatılır. Rüzgar hızı belli bir seviyenin üzerindeyse operasyon durdurulur; bu bir gecikme değil, zorunlu bir güvenlik kuralıdır.</p>
<p>Ayrıntılı bilgi için <a href="/hizmet/adana-asansorlu-nakliyat">Adana asansörlü nakliyat</a> sayfamıza bakabilirsiniz.</p>',
       'Bilgi', 'asansörlü nakliyat, mobil asansör, kat', 'Adana Nakliye', true, 'Asansörlü Nakliyat Ne Zaman Gerekir, Maliyeti Nasıl Hesaplanır? | Adana Nakliye', 'Mobil asansörün hangi durumlarda gerektiği, kat ve cephe koşulları, güvenlik önlemleri ve maliyeti etkileyen unsurlar.'
WHERE NOT EXISTS (SELECT 1 FROM makaleler WHERE slug = 'asansorlu-nakliyat-ne-zaman-gerekir');

INSERT INTO makaleler (baslik, slug, ozet, icerik, kategori, etiketler, yazar, aktif, meta_title, meta_description)
SELECT 'Ofis Taşırken İş Kaybını Önlemenin 8 Yolu', 'ofis-tasirken-is-kaybini-onleme', 'Ofis ve iş yeri taşımalarında çalışma düzenini bozmadan ilerlemek için planlama, etiketleme, BT altyapısı ve arşiv yönetimi başlıkları.',
       '<h2>1. Taşımayı hafta sonuna yayın</h2>
<p>Cuma akşamı yükleme, cumartesi taşıma ve yerleşim, pazar günü BT kurulumu ve test. Pazartesi sabahı ekip masasına oturur. Hafta içi taşımalarda kaybedilen iş günü, hafta sonu farkından neredeyse her zaman pahalıya gelir.</p>

<h2>2. Kat planını önceden çizin</h2>
<p>Yeni ofiste her masanın, dolabın ve yazıcının nereye gideceği belli olmalı. Plan çıktısını iki adreste de duvara asın ve her mobilyaya plandaki numarayı yapıştırın. Bu tek adım, yerleşim süresini yarıya indirir.</p>

<h2>3. Kişisel eşyayı çalışana bırakın</h2>
<p>Her çalışana numaralı bir koli verin ve masasını kendisinin toplamasını isteyin. Hem sorumluluk dağılır hem de kayıp eşya tartışması çıkmaz.</p>

<h2>4. BT altyapısını ayrı yönetin</h2>
<p>Sunucu, switch ve yedekleme üniteleri normal mobilyayla birlikte taşınmaz. Taşımadan önce tam yedek alın, kabloları etiketleyin ve fotoğraflayın. Yeni ofiste internet hattının <strong>taşınmadan önce</strong> aktif olduğundan emin olun; hat gecikmesi en sık yaşanan aksaklıktır.</p>

<h2>5. Arşivi fırsat bilin</h2>
<p>Saklama süresi dolmuş evrakı taşımak, hem hacim hem para demek. Taşınma, arşiv temizliği için doğal bir bahane. İmha edilecek evrak için güvenli imha hizmeti kullanın.</p>

<h2>6. Müşterilere ve tedarikçilere önceden haber verin</h2>
<p>Adres değişikliğini en az iki hafta önce duyurun: web sitesi, e-posta imzası, fatura bilgileri, harita kayıtları ve sosyal medya. Kargo yönlendirmesi için eski adreste bir süre bilgilendirme bırakın.</p>

<h2>7. Bina yönetimleriyle konuşun</h2>
<p>İki binada da yük asansörü rezervasyonu, giriş saatleri ve otopark izni gerekebilir. Plaza ve iş merkezlerinde çoğu zaman mesai dışı taşıma zorunludur.</p>

<h2>8. İlk gün için bir "hayatta kalma kutusu" hazırlayın</h2>
<p>Çay-kahve makinesi, temizlik malzemesi, uzatma kabloları, çöp poşeti, birkaç kırtasiye malzemesi. Bunlar yoksa ilk gün üretkenlik değil, market alışverişi yapılır.</p>

<p>Ofis taşıma hizmetimizin kapsamı için <a href="/hizmet/adana-ofis-tasima">Adana ofis taşıma</a> sayfasına, şehir dışı taşımalar için <a href="/nakliye-hizmetleri">il hizmet sayfalarımıza</a> bakabilirsiniz.</p>',
       'Kurumsal', 'ofis taşıma, iş yeri, kurumsal nakliyat', 'Adana Nakliye', true, 'Ofis Taşırken İş Kaybını Önlemenin 8 Yolu | Adana Nakliye', 'Ofis ve iş yeri taşımalarında çalışma düzenini bozmadan ilerlemek için planlama, etiketleme, BT altyapısı ve arşiv yönetimi başlıkları.'
WHERE NOT EXISTS (SELECT 1 FROM makaleler WHERE slug = 'ofis-tasirken-is-kaybini-onleme');

INSERT INTO makaleler (baslik, slug, ozet, icerik, kategori, etiketler, yazar, aktif, meta_title, meta_description)
SELECT 'Eşya Depolama: Ne Zaman İhtiyaç Olur, Depoda Nelere Dikkat Edilir?', 'esya-depolama-rehberi', 'Taşınma tarihleri uyuşmadığında, yurt dışına çıkarken veya tadilat sırasında eşya depolama: süre, maliyet ve depo seçerken bakılacaklar.',
       '<h2>Depolama en çok ne zaman gerekiyor?</h2>
<ul>
<li>Eski evden çıkış ile yeni eve giriş tarihleri arasında boşluk olduğunda</li>
<li>Yeni evde tadilat ya da boya işi bitmediğinde</li>
<li>Geçici olarak yurt dışına veya başka şehre gidildiğinde</li>
<li>Küçük bir eve taşınıp fazla eşyayı elden çıkarmak istemediğinizde</li>
<li>İş yerlerinde sezonluk stok ve arşiv için</li>
</ul>

<h2>Depo seçerken bakılacak beş şey</h2>
<ol>
<li><strong>Nem ve sıcaklık:</strong> Ahşap mobilya ve deri koltuk nemli ortamda kalıcı hasar görür. Deponun nem kontrolü olup olmadığını sorun.</li>
<li><strong>Sigorta:</strong> Depolama süresince eşya sigortalı mı, poliçe kimin adına?</li>
<li><strong>Erişim:</strong> Eşyanıza ara ara ulaşmanız gerekecekse randevulu erişim veriliyor mu?</li>
<li><strong>Envanter:</strong> Giriş sırasında numaralı liste ve fotoğraf çekiliyor mu? Bu, çıkışta tartışmayı bitirir.</li>
<li><strong>Fiyatlama:</strong> Metreküp mü, palet mi, oda mı üzerinden? Asgari süre var mı, erken çıkışta iade yapılıyor mu?</li>
</ol>

<h2>Depoya girmeden önce</h2>
<p>Yiyecek, sıvı ve yanıcı madde depoya alınmaz. Beyaz eşya tamamen kurutulmuş olmalı; içinde kalan bir bardak su üç ay sonra küf demektir. Yatak ve koltuk nefes alabilen kılıflara geçirilir, plastikle tamamen kapatılmaz.</p>

<h2>Maliyeti nasıl düşürürsünüz?</h2>
<p>Depolama hacim üzerinden fiyatlandığı için, depoya girmeden önce elden çıkaracaklarınızı ayırmak doğrudan tasarruf sağlar. Sökülebilen mobilyaları demonte göndermek de ciddi yer kazandırır.</p>

<p>Adana''daki kapalı depomuzda kısa ve uzun süreli saklama yapıyoruz; tarih geldiğinde eşya doğrudan yeni adresinize teslim ediliyor. Şehir dışı teslimler için <a href="/rota">rota sayfalarına</a> bakabilirsiniz.</p>',
       'Bilgi', 'eşya depolama, depo, saklama', 'Adana Nakliye', true, 'Eşya Depolama: Ne Zaman İhtiyaç Olur, Depoda Nelere Dikkat Edilir? | Adana Nakliye', 'Taşınma tarihleri uyuşmadığında, yurt dışına çıkarken veya tadilat sırasında eşya depolama: süre, maliyet ve depo seçerken bakılacaklar.'
WHERE NOT EXISTS (SELECT 1 FROM makaleler WHERE slug = 'esya-depolama-rehberi');

INSERT INTO makaleler (baslik, slug, ozet, icerik, kategori, etiketler, yazar, aktif, meta_title, meta_description)
SELECT 'Nakliyat Fiyatlarını Etkileyen 7 Faktör', 'nakliyat-fiyatlarini-etkileyen-faktorler', 'Aynı eve iki firmanın neden çok farklı fiyat verdiğini anlamak için: hacim, mesafe, kat, asansör, sezon, ek hizmetler ve sigorta.',
       '<h2>1. Eşya hacmi</h2>
<p>Fiyatın en büyük bileşeni metreküptür. 1+1 bir daire ortalama 15-20 m³, 2+1 daire 25-35 m³, 3+1 daire 35-45 m³ tutar. Kullanmadığınız eşyayı elden çıkarmak, faturayı en hızlı düşüren yöntemdir.</p>

<h2>2. Mesafe</h2>
<p>Şehirler arası taşımada yakıt, köprü-otoyol ve sürücü maliyeti mesafeyle doğru orantılı artar. Ancak mesafe tek başına belirleyici değildir: 70 km''lik bir taşımada da tam bir günlük ekip çalışması vardır. Her güzergah için yaklaşık mesafe ve tahmini tutarları <a href="/rota">rota sayfalarımızda</a> görebilirsiniz.</p>

<h2>3. Kat ve asansör durumu</h2>
<p>Asansörsüz 5. kattan merdivenle taşıma, aynı eşyayı zemin kattan taşımanın iki katı iş gücü demektir. Mobil asansör kullanımı bu farkı kapatır ama kendi ücreti vardır.</p>

<h2>4. Araç erişimi</h2>
<p>Kamyonun binanın önüne yanaşamadığı dar sokaklarda eşya elle taşınır ya da küçük araçla aktarma yapılır. Her iki durumda da süre ve maliyet artar. Bu yüzden ekspertizde sokak da görülür.</p>

<h2>5. Sezon ve tarih</h2>
<p>Haziran-Eylül arası taşınma sezonudur, fiyatlar yükselir. Ay sonu ve hafta sonu da yoğun dönemlerdir. Ay ortası, hafta içi bir gün seçmek ciddi fark yaratabilir.</p>

<h2>6. Ek hizmetler</h2>
<p>Mobil asansör, ambalaj malzemesi, marangoz, elektrikçi, depolama, ekstra sigorta ve katlı taşıma hizmetleri ayrı kalemlerdir. Teklifte bunların dahil olup olmadığı mutlaka yazılı olmalıdır.</p>

<h2>7. Sigorta ve beyan değeri</h2>
<p>Sigorta primi, beyan edilen eşya değeri üzerinden hesaplanır. Değerli antika, piyano veya sanat eseri varsa prim yükselir ama korumasız taşımaktan çok daha ucuzdur.</p>

<h2>Teklifleri karşılaştırırken</h2>
<p>Aynı işe verilen iki fiyat arasında büyük fark varsa, kapsam farkına bakın: ambalaj dahil mi, asansör dahil mi, sigorta var mı, montaj yapılıyor mu? Kapsamı yazılı olmayan bir fiyat, taşıma günü değişebilir demektir.</p>',
       'Bilgi', 'nakliyat fiyatları, fiyat hesaplama, teklif', 'Adana Nakliye', true, 'Nakliyat Fiyatlarını Etkileyen 7 Faktör | Adana Nakliye', 'Aynı eve iki firmanın neden çok farklı fiyat verdiğini anlamak için: hacim, mesafe, kat, asansör, sezon, ek hizmetler ve sigorta.'
WHERE NOT EXISTS (SELECT 1 FROM makaleler WHERE slug = 'nakliyat-fiyatlarini-etkileyen-faktorler');

INSERT INTO makaleler (baslik, slug, ozet, icerik, kategori, etiketler, yazar, aktif, meta_title, meta_description)
SELECT 'Kırılacak Eşya Taşıma: Cam, Tablo ve Porselen İçin Paketleme', 'kirilacak-esya-tasima-paketleme', 'Tabak, bardak, ayna, tablo, televizyon ve avize gibi kırılgan eşyaların taşınmaya hazırlanması için adım adım yöntemler.',
       '<h2>Temel kural: boşluk düşmandır</h2>
<p>Kırılan eşyaların çoğu darbeden değil, koli içinde hareket etmekten kırılır. Kolinin içindeki her boşluk kağıt, köpük veya havlu ile doldurulmalı; koliyi salladığınızda içeriden ses gelmemeli.</p>

<h2>Tabak ve bardak</h2>
<p>Tabaklar <strong>dik</strong> dizilir, yan yatırılmaz. Dik duran bir tabak kendi ağırlığını taşır, yatık duran tabak üstündekinin ağırlığıyla çatlar. Her tabağın arasına kağıt konur. Bardaklar tek tek sarılır, ağızları aşağı bakacak şekilde üst sıraya yerleştirilir. Kadeh gibi ince ayaklı ürünlerde ayak kısmı ayrıca sarılır.</p>

<h2>Ayna ve tablo</h2>
<p>Cam yüzeye köşeden köşeye çapraz bant çekin: bu cam kırılırsa parçaların dağılmasını engeller. Ardından köşe koruyucu takın, balonlu naylona sarın ve iki karton plaka arasına alın. Aynalar ve tablolar <strong>her zaman dik</strong> taşınır ve araçta yan yatırılmaz.</p>

<h2>Televizyon ve monitör</h2>
<p>Orijinal kutu en iyisidir. Yoksa ekran önce mikrofiber bezle, sonra balonlu naylonla kaplanır. Ekrana doğrudan bant yapıştırmayın, kaplama tabakasını kaldırır. Dik taşıyın; yatık taşınan panellerde basınç izi oluşur.</p>

<h2>Avize</h2>
<p>Ampuller ve sarkıt parçaları sökülür, her biri ayrı sarılır ve fotoğraf çekilerek hangi parçanın nereye geldiği kaydedilir. Gövde kendi kutusuna ya da köpük dolgulu bir koliye yerleştirilir. Avize sökümünün elektrik kesilerek yapılması gerekir.</p>

<h2>Porselen, biblo, koleksiyon</h2>
<p>Küçük ve değerli parçalar için ahşap sandık ya da çift koli yöntemi kullanın: parça küçük bir koliye yerleştirilir, o koli de dolgu malzemesiyle daha büyük bir koliye konur. Sigorta beyanında bu parçaları ayrıca belirtin.</p>

<h2>Etiketleme</h2>
<p>Kırılacak kolilerin <strong>dört yüzüne birden</strong> uyarı yazın ve üst yüzeyine "üstüne yük koymayın" notu düşün. Tek bir yüze yazılan uyarı, koli ters dizildiğinde görünmez.</p>

<p>Ambalaj ve söküm-montaj hizmetlerimiz fiyata dahildir; ayrıntı için <a href="/hizmetler">hizmetlerimize</a> göz atabilirsiniz.</p>',
       'Taşınma Rehberi', 'kırılacak eşya, cam, tablo, porselen, paketleme', 'Adana Nakliye', true, 'Kırılacak Eşya Taşıma: Cam, Tablo ve Porselen İçin Paketleme | Adana Nakliye', 'Tabak, bardak, ayna, tablo, televizyon ve avize gibi kırılgan eşyaların taşınmaya hazırlanması için adım adım yöntemler.'
WHERE NOT EXISTS (SELECT 1 FROM makaleler WHERE slug = 'kirilacak-esya-tasima-paketleme');

INSERT INTO makaleler (baslik, slug, ozet, icerik, kategori, etiketler, yazar, aktif, meta_title, meta_description)
SELECT 'Taşınırken Abonelik ve Adres Değişikliği İşlemleri', 'tasinirken-abonelik-adres-degisikligi', 'Elektrik, su, doğalgaz, internet, e-Devlet adres bildirimi ve diğer kurumsal adres güncellemeleri için sıraya konmuş bir işlem listesi.',
       '<h2>Sıralama önemli</h2>
<p>Abonelik işlemlerinde en sık yapılan hata, her şeyi taşınma gününe bırakmaktır. Bazı işlemler randevu gerektirir ve gün içinde bitmez. Aşağıdaki sırayla ilerlemek en pratiği.</p>

<h2>2-3 hafta önce: internet ve TV</h2>
<p>Nakil başvurusu çoğu sağlayıcıda 7-10 iş günü sürüyor, yoğun dönemde daha uzun. Yeni adreste altyapı uygunluğunu mutlaka sorun; fiber varsayıp taşınıp da VDSL''e düşmek can sıkıcı olur. Taahhüdünüz varsa nakilde taahhüt devam eder, iptalde cayma bedeli çıkar.</p>

<h2>1-2 hafta önce: elektrik ve su</h2>
<p>Elektrikte eski adres için kapama, yeni adres için açılış başvurusu yapılır. Genellikle kimlik, DASK poliçesi (yeni abonelikte) ve kira sözleşmesi ya da tapu istenir. Güvence bedeli iadesi kapama başvurusuyla başlar. Su aboneliği de benzer evrakla, belediye su idaresinden yürütülür.</p>

<h2>1 hafta önce: doğalgaz</h2>
<p>Doğalgazda açılış çoğu ilde randevulu yapılır ve teknisyen kombi/ocak bağlantısını kontrol eder. Randevu tarihini taşınma gününden birkaç gün <em>sonrasına</em> almak en sağlıklısı; eşyalar yerleşmiş olur.</p>

<h2>Taşındıktan sonra 20 gün içinde: e-Devlet adres bildirimi</h2>
<p>Yerleşim yeri değişikliği bildirimi yasal olarak zorunludur ve e-Devlet üzerinden birkaç dakikada yapılır. Bu bildirim, nüfus kaydınızı günceller; seçmen kaydı, tebligat ve resmi yazışmalar buna bağlıdır.</p>

<h2>Unutulan ama önemli olanlar</h2>
<ul>
<li>Banka ve kredi kartı adresleri (kart yenilemesi eski adrese gider)</li>
<li>Sigorta poliçeleri: konut, DASK, kasko yazışma adresi</li>
<li>Kargo ve e-ticaret hesaplarındaki kayıtlı adresler</li>
<li>Aile hekimi değişikliği</li>
<li>Okul ve kreş kayıtları</li>
<li>Apartman aidat ve yönetim iletişim bilgileri</li>
<li>Google Haritalar''daki iş yeri kaydı (kurumsal taşımalarda)</li>
</ul>

<h2>Son sayaç değerlerini fotoğraflayın</h2>
<p>Eski adresten çıkarken elektrik, su ve doğalgaz sayaçlarının son değerlerini fotoğraflayın. Sonradan gelen fatura itirazlarında en güçlü belgeniz bu olur.</p>

<p>Şehir dışına taşınıyorsanız teslim gününü bu randevulara göre planlayın; her il için yaklaşık teslim süresi <a href="/nakliye-hizmetleri">il hizmet sayfalarımızda</a> yazıyor.</p>',
       'Taşınma Rehberi', 'abonelik, adres değişikliği, e-devlet, nakil', 'Adana Nakliye', true, 'Taşınırken Abonelik ve Adres Değişikliği İşlemleri | Adana Nakliye', 'Elektrik, su, doğalgaz, internet, e-Devlet adres bildirimi ve diğer kurumsal adres güncellemeleri için sıraya konmuş bir işlem listesi.'
WHERE NOT EXISTS (SELECT 1 FROM makaleler WHERE slug = 'tasinirken-abonelik-adres-degisikligi');

INSERT INTO makaleler (baslik, slug, ozet, icerik, kategori, etiketler, yazar, aktif, meta_title, meta_description)
SELECT 'Piyano, Kasa ve Ağır Eşya Taşıma', 'piyano-kasa-agir-esya-tasima', 'Piyano, çelik kasa, mermer masa ve akvaryum gibi ağır ve hassas eşyaların taşınmasında kullanılan ekipman ve yöntemler.',
       '<h2>Ağır eşya neden ayrı bir iş?</h2>
<p>200 kilonun üzerindeki bir eşyada risk yalnızca eşyada değil, insanda ve binadadır. Bu tür taşımalarda kayış sistemi, taşıma arabası, rampa ve gerektiğinde vinç kullanılır. Ekip sayısı da farklıdır.</p>

<h2>Piyano</h2>
<p>Duvar piyanosu (konsol) ortalama 200-350 kg, kuyruklu piyano 300-500 kg gelir. Taşıma öncesi kapak kilitlenir, pedallar sökülür ve gövde kalın battaniyeyle sarılır. Kuyruklu piyanoda ayaklar ve lir sökülür, gövde özel bir kızak üzerine yan yatırılarak taşınır; bu, piyano için doğru olan tek yöntemdir.</p>
<p>Taşımadan sonra piyanonun akordu bozulur. Bu bir hasar değil, normaldir: yeni ortamın sıcaklık ve nemine alışması için 2-3 hafta beklenip sonra akort yaptırılması önerilir.</p>

<h2>Çelik kasa</h2>
<p>Kasa taşımada iki kritik nokta var: zemine sabitlenmişse sökümü, ve merdiven kullanımı. Ankraj sökümü matkapla yapılır ve yeni adreste yeniden sabitleme gerekir. Merdivenden kasa taşımak, basamak dayanımı nedeniyle çoğu binada uygun değildir; bu durumda mobil asansör veya vinç kullanılır. Kasanın şifresini ve anahtarını taşımadan önce mutlaka kontrol edin, kapağın taşıma sırasında açılmadığından emin olun.</p>

<h2>Mermer ve cam masa</h2>
<p>Mermer tabla <strong>her zaman dik</strong> taşınır. Yatay taşınan mermer kendi ağırlığıyla ortadan çatlar. Tabla ayaklarından sökülür, iki yüzü de köpükle kaplanır ve ahşap kızak üzerinde dik sabitlenir.</p>

<h2>Akvaryum</h2>
<p>Dolu akvaryum kesinlikle taşınmaz; cam birleşim yerleri suyun ağırlığıyla ayrılır. Balıklar havalandırmalı taşıma kaplarına alınır, su bidonlara aktarılır (filtre bakterisini korumak için suyun bir kısmını saklayın), akvaryum tamamen boşaltılıp kurutulur ve dik taşınır.</p>

<h2>Bina sorumluluğu</h2>
<p>Ağır eşya taşımalarında merdiven korkuluğu, asansör kapısı ve zemin kaplaması zarar görebilir. Ciddi firmalar bu alanları önceden koruyucu malzemeyle kaplar. Apartman yönetimini önceden bilgilendirmek de gerekir.</p>

<p>Ağır ve hassas eşyalarınız için ekspertizde ayrı bir plan çıkarıyoruz. <a href="/teklif-al">Ücretsiz teklif formundan</a> ulaşabilirsiniz.</p>',
       'Bilgi', 'piyano taşıma, kasa taşıma, ağır eşya', 'Adana Nakliye', true, 'Piyano, Kasa ve Ağır Eşya Taşıma | Adana Nakliye', 'Piyano, çelik kasa, mermer masa ve akvaryum gibi ağır ve hassas eşyaların taşınmasında kullanılan ekipman ve yöntemler.'
WHERE NOT EXISTS (SELECT 1 FROM makaleler WHERE slug = 'piyano-kasa-agir-esya-tasima');

INSERT INTO makaleler (baslik, slug, ozet, icerik, kategori, etiketler, yazar, aktif, meta_title, meta_description)
SELECT 'Çocuklu ve Evcil Hayvanlı Ailelere Taşınma Rehberi', 'cocuklu-evcil-hayvanli-tasinma-rehberi', 'Taşınmanın çocuklar ve evcil hayvanlar için stresli tarafını azaltmak: hazırlık, taşınma günü planı ve yeni eve alışma süreci.',
       '<h2>Çocuklara önceden anlatın</h2>
<p>Taşınmayı son anda duyurmak, çocuklarda en çok kaygı yaratan davranıştır. Karar netleştiğinde yaşına uygun bir dille anlatın: neden taşınıyoruz, ne zaman, yeni ev nasıl bir yer. Mümkünse yeni evi ya da en azından fotoğraflarını gösterin.</p>

<h2>Kendi kutusu olsun</h2>
<p>Her çocuğa kendi kolisini verin ve en sevdiği oyuncakları oraya koymasını isteyin. Bu koli kamyona değil, sizin aracınıza biner ve yeni evde <strong>ilk açılan</strong> koli olur. Odasının tanıdık bir parçasını ilk günden görmek, alışma süresini belirgin şekilde kısaltır.</p>

<h2>Taşınma günü çocuk evde olmasın</h2>
<p>Mümkünse taşınma gününü bir akraba ya da arkadaşta geçirsinler. Ev boşalırken ortada dolaşmak hem güvenli değil hem de duygusal olarak zor. Küçük bebekler için ise sabit bir odayı en sona bırakıp orada bir düzen korumak işe yarar.</p>

<h2>Odasını ilk kurun</h2>
<p>Yeni evde ilk toplanacak oda çocuk odası olsun. Salon dağınık kalabilir; çocuğun yatağı kurulu ve oyuncakları yerindeyse gece çok daha rahat geçer.</p>

<h2>Kediler: mekâna bağlanırlar</h2>
<p>Kedi için taşınma, köpekten daha zorlayıcıdır çünkü kedi sahibine değil mekâna bağlanır. Taşınmadan birkaç gün önce taşıma kabını ortada bırakın, içine tanıdık bir battaniye koyun ki kap "tehlike" işareti olmaktan çıksın.</p>
<p>Yeni evde kediyi doğrudan tüm eve salmayın. Tek bir odada başlayın: mama, su, kum kabı ve saklanabileceği bir yer. Birkaç gün içinde alanı yavaşça genişletin. Taşınma sonrası ilk 2-3 hafta kediyi dışarı çıkarmayın.</p>

<h2>Köpekler: rutin önemli</h2>
<p>Köpekte kritik olan rutindir. Yürüyüş ve mama saatlerini taşınma haftasında bozmayın. Yeni evde ilk günden itibaren aynı saatlerde yürüyüşe çıkın; yeni mahalleyi tanımak da alışmayı hızlandırır.</p>

<h2>Sağlık ve kimlik</h2>
<ul>
<li>Mikroçip kaydındaki adres ve telefonu güncelleyin.</li>
<li>Aşı karnesini yanınıza alın, yeni bir veteriner bulun.</li>
<li>Uzun yolculuklarda su molası verin; araçta havalandırmayı ihmal etmeyin.</li>
<li>Çok stresli hayvanlar için veterinerle sakinleştirici seçeneklerini konuşun.</li>
</ul>

<h2>Evcil hayvan kamyona binmez</h2>
<p>Hiçbir koşulda hayvanı eşya aracında taşımayın. Isı kontrolü, havalandırma ve gözlem yok demektir. Hayvanlar sizin aracınızda, uygun taşıma kabında seyahat etmelidir.</p>

<p>Şehir dışına taşınıyorsanız yolculuk süresini önceden bilmek planlamayı kolaylaştırır; <a href="/rota">rota sayfalarımızda</a> her güzergah için yaklaşık mesafe ve süre yazıyor.</p>',
       'Taşınma Rehberi', 'çocuk, evcil hayvan, taşınma stresi', 'Adana Nakliye', true, 'Çocuklu ve Evcil Hayvanlı Ailelere Taşınma Rehberi | Adana Nakliye', 'Taşınmanın çocuklar ve evcil hayvanlar için stresli tarafını azaltmak: hazırlık, taşınma günü planı ve yeni eve alışma süreci.'
WHERE NOT EXISTS (SELECT 1 FROM makaleler WHERE slug = 'cocuklu-evcil-hayvanli-tasinma-rehberi');
