import { createClient } from '@/lib/supabase-server'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import StickyButtons from '@/components/StickyButtons'

export const metadata = {
  title: 'Gizlilik Politikası | Adana Nakliye',
  description: 'Adana Nakliye gizlilik politikası, çerez kullanımı ve kişisel verilerin korunması hakkında bilgilendirme.',
}

async function getData() {
  const supabase = await createClient()
  const [{ data: ayarlar }, { data: menu }, { data: hizmetler }] = await Promise.all([
    supabase.from('ayarlar').select('*'),
    supabase.from('menu').select('*').eq('aktif', true).order('sira'),
    supabase.from('hizmetler').select('*').eq('aktif', true).order('sira'),
  ])
  return { ayarlar, menu, hizmetler }
}

export default async function GizlilikPolitikasiPage() {
  const { ayarlar, menu, hizmetler } = await getData()
  const getAyar = (key) => ayarlar?.find(a => a.anahtar === key)?.deger || ''
  const whatsapp = getAyar('whatsapp') || '905057805551'
  const telefon = getAyar('telefon') || '05057805551'

  return (
    <>
      <Header ayarlar={ayarlar} menu={menu} />
      <main>
        {/* Hero */}
        <section className="py-12 bg-gradient-to-r from-[#1e3a5f] to-[#2d4a6f]">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Gizlilik Politikası
            </h1>
            <p className="text-blue-100">
              Kişisel Verilerinizin Korunması ve Çerez Kullanımı Hakkında
            </p>
          </div>
        </section>

        {/* İçerik */}
        <section className="py-12 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg p-8 md:p-12">
              
              <div className="prose prose-lg max-w-none">
                <p className="text-gray-500 text-sm mb-8">
                  Son Güncelleme: {new Date().toLocaleDateString('tr-TR')}
                </p>

                <h2>1. Giriş</h2>
                <p>
                  Adana Nakliye olarak, web sitemizi ziyaret eden kullanıcılarımızın gizliliğine önem veriyoruz. 
                  Bu Gizlilik Politikası, hangi bilgileri topladığımızı, bu bilgileri nasıl kullandığımızı ve 
                  koruduğumuzu açıklamaktadır.
                </p>
                <p>
                  Web sitemizi kullanarak, bu politikada belirtilen uygulamaları kabul etmiş sayılırsınız.
                </p>

                <h2>2. Toplanan Bilgiler</h2>
                
                <h3>2.1. Otomatik Olarak Toplanan Bilgiler</h3>
                <p>Web sitemizi ziyaret ettiğinizde aşağıdaki bilgiler otomatik olarak toplanır:</p>
                <ul>
                  <li><strong>IP Adresi:</strong> İnternet bağlantınızın IP adresi</li>
                  <li><strong>Cihaz Bilgileri:</strong> Cihaz türü, markası, modeli, işletim sistemi</li>
                  <li><strong>Tarayıcı Bilgileri:</strong> Tarayıcı türü ve versiyonu</li>
                  <li><strong>Ekran Bilgileri:</strong> Ekran çözünürlüğü ve piksel oranı</li>
                  <li><strong>Konum Bilgileri:</strong> IP adresinden tespit edilen yaklaşık konum</li>
                  <li><strong>Ziyaret Bilgileri:</strong> Ziyaret edilen sayfalar, geçirilen süre, tıklamalar</li>
                  <li><strong>Referans Bilgileri:</strong> Siteye nereden geldiğiniz (Google, sosyal medya vb.)</li>
                  <li><strong>Cihaz Parmak İzi (Fingerprint):</strong> Cihazınıza özgü teknik özelliklerden oluşturulan benzersiz tanımlayıcı</li>
                </ul>

                <h3>2.2. Kullanıcı Tarafından Sağlanan Bilgiler</h3>
                <p>İletişim formlarını doldurduğunuzda aşağıdaki bilgileri toplayabiliriz:</p>
                <ul>
                  <li>Ad ve soyad</li>
                  <li>Telefon numarası</li>
                  <li>E-posta adresi</li>
                  <li>Taşınma adresleri</li>
                  <li>Mesaj içeriği</li>
                </ul>

                <h3>2.3. Konum Bilgileri</h3>
                <p>
                  Tarayıcınız aracılığıyla konum izni isteyebiliriz. Bu izni vermeniz tamamen isteğe bağlıdır. 
                  İzin verirseniz, hassas konum bilgileriniz (enlem/boylam) toplanır ve size daha iyi hizmet 
                  sunmak için kullanılır. İzin vermezseniz, IP adresinizden yaklaşık konum bilgisi alınır.
                </p>

                <h2>3. Bilgilerin Kullanım Amaçları</h2>
                <p>Topladığımız bilgileri aşağıdaki amaçlarla kullanıyoruz:</p>
                <ul>
                  <li>Nakliyat hizmeti sunmak ve teklif vermek</li>
                  <li>Müşteri taleplerine yanıt vermek</li>
                  <li>Web sitesi deneyimini iyileştirmek</li>
                  <li>Site güvenliğini sağlamak</li>
                  <li><strong>Sahte tıklama ve kötü niyetli aktiviteleri tespit etmek</strong></li>
                  <li>İstatistiksel analizler yapmak</li>
                  <li>Reklam performansını ölçmek</li>
                  <li>Yasal yükümlülükleri yerine getirmek</li>
                </ul>

                <h2>4. Sahte Tıklama Tespit Sistemi</h2>
                <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 my-4">
                  <p className="font-bold text-yellow-800">⚠️ Önemli Bilgilendirme</p>
                  <p className="text-yellow-700 mt-2">
                    Web sitemiz, reklam sahteciliğini önlemek amacıyla gelişmiş bir tespit sistemi kullanmaktadır. 
                    Bu sistem:
                  </p>
                  <ul className="text-yellow-700 mt-2 list-disc ml-4">
                    <li>Aynı cihazdan farklı IP adresleriyle yapılan şüpheli girişleri tespit eder</li>
                    <li>Anormal kısa süreli ziyaretleri takip eder</li>
                    <li>Şüpheli aktivite tespit edildiğinde erişimi geçici olarak engelleyebilir</li>
                    <li>Tüm şüpheli aktiviteler yasal delil olarak kayıt altına alınır</li>
                  </ul>
                </div>

                <h2>5. Çerezler (Cookies)</h2>
                
                <h3>5.1. Çerez Nedir?</h3>
                <p>
                  Çerezler, web sitelerinin tarayıcınıza gönderdiği küçük metin dosyalarıdır. Bu dosyalar, 
                  siteyi bir sonraki ziyaretinizde sizi tanımak ve tercihlerinizi hatırlamak için kullanılır.
                </p>

                <h3>5.2. Kullandığımız Çerez Türleri</h3>
                <table className="w-full border-collapse border border-gray-300 my-4">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border border-gray-300 p-2 text-left">Çerez Türü</th>
                      <th className="border border-gray-300 p-2 text-left">Amaç</th>
                      <th className="border border-gray-300 p-2 text-left">Süre</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-gray-300 p-2"><strong>Zorunlu Çerezler</strong></td>
                      <td className="border border-gray-300 p-2">Site işlevselliği için gerekli</td>
                      <td className="border border-gray-300 p-2">Oturum</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 p-2"><strong>Analitik Çerezler</strong></td>
                      <td className="border border-gray-300 p-2">Ziyaretçi istatistikleri (Google Analytics)</td>
                      <td className="border border-gray-300 p-2">2 yıl</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 p-2"><strong>Pazarlama Çerezleri</strong></td>
                      <td className="border border-gray-300 p-2">Reklam performansı (Facebook Pixel)</td>
                      <td className="border border-gray-300 p-2">90 gün</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 p-2"><strong>Güvenlik Çerezleri</strong></td>
                      <td className="border border-gray-300 p-2">Sahte tıklama tespiti</td>
                      <td className="border border-gray-300 p-2">24 saat</td>
                    </tr>
                  </tbody>
                </table>

                <h3>5.3. Çerezleri Yönetme</h3>
                <p>
                  Tarayıcı ayarlarınızdan çerezleri engelleyebilir veya silebilirsiniz. Ancak bu durumda 
                  web sitesinin bazı özellikleri düzgün çalışmayabilir.
                </p>

                <h2>6. Üçüncü Taraf Hizmetleri</h2>
                <p>Web sitemizde aşağıdaki üçüncü taraf hizmetleri kullanılmaktadır:</p>
                <ul>
                  <li><strong>Google Analytics:</strong> Ziyaretçi istatistikleri için</li>
                  <li><strong>Google Ads:</strong> Reklam performansı için</li>
                  <li><strong>Facebook Pixel:</strong> Reklam performansı için</li>
                  <li><strong>Supabase:</strong> Veritabanı hizmetleri için</li>
                </ul>
                <p>
                  Bu hizmetlerin kendi gizlilik politikaları bulunmaktadır ve onların veri toplama 
                  uygulamalarından sorumlu değiliz.
                </p>

                <h2>7. Veri Güvenliği</h2>
                <p>
                  Kişisel verilerinizi korumak için aşağıdaki güvenlik önlemlerini uyguluyoruz:
                </p>
                <ul>
                  <li>SSL/TLS şifreleme ile güvenli veri iletimi</li>
                  <li>Güvenli sunucu altyapısı</li>
                  <li>Erişim kontrolü ve yetkilendirme</li>
                  <li>Düzenli güvenlik güncellemeleri</li>
                </ul>

                <h2>8. Veri Saklama Süresi</h2>
                <ul>
                  <li><strong>Ziyaretçi verileri:</strong> 1 yıl</li>
                  <li><strong>İletişim form verileri:</strong> 3 yıl</li>
                  <li><strong>Sahte tıklama kayıtları:</strong> 5 yıl (yasal delil olarak)</li>
                </ul>

                <h2>9. Haklarınız</h2>
                <p>
                  6698 sayılı KVKK kapsamında aşağıdaki haklara sahipsiniz:
                </p>
                <ul>
                  <li>Kişisel verilerinizin işlenip işlenmediğini öğrenme</li>
                  <li>Kişisel verilerinize erişim talep etme</li>
                  <li>Kişisel verilerinizin düzeltilmesini isteme</li>
                  <li>Kişisel verilerinizin silinmesini isteme</li>
                  <li>Veri işlemeye itiraz etme</li>
                </ul>
                <p>
                  Detaylı bilgi için <a href="/kvkk" className="text-blue-600 hover:underline">KVKK Aydınlatma Metni</a> 
                  sayfamızı inceleyebilirsiniz.
                </p>

                <h2>10. İletişim</h2>
                <p>
                  Gizlilik politikamız hakkında sorularınız için bize ulaşabilirsiniz:
                </p>
                <ul>
                  <li><strong>E-posta:</strong> info@adananakliye.com.tr</li>
                  <li><strong>Telefon:</strong> 0505 780 55 51</li>
                  <li><strong>Adres:</strong> Belediye Evleri, 84244. Sk. No:9 Adana / Çukurova</li>
                </ul>

                <h2>11. Politika Değişiklikleri</h2>
                <p>
                  Bu gizlilik politikası gerektiğinde güncellenebilir. Önemli değişiklikler web sitemizde 
                  duyurulacaktır. Politikayı düzenli olarak kontrol etmenizi öneririz.
                </p>

              </div>

            </div>
          </div>
        </section>
      </main>
      <Footer ayarlar={ayarlar} hizmetler={hizmetler} />
      <StickyButtons whatsapp={whatsapp} telefon={telefon} />
    </>
  )
}
