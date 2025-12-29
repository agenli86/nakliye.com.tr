import { createClient } from '@/lib/supabase-server'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import StickyButtons from '@/components/StickyButtons'

export const metadata = {
  title: 'KVKK Aydınlatma Metni | Adana Nakliye',
  description: '6698 sayılı Kişisel Verilerin Korunması Kanunu kapsamında aydınlatma metni.',
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

export default async function KVKKPage() {
  const { ayarlar, menu, hizmetler } = await getData()
  const getAyar = (key) => ayarlar?.find(a => a.anahtar === key)?.deger || ''
  const whatsapp = getAyar('whatsapp') || '905057805551'
  const telefon = getAyar('telefon') || '05057805551'

  return (
    <>
      <Header ayarlar={ayarlar} menu={menu} />
      <main className="pt-[140px] md:pt-[160px]">
        {/* Hero */}
        <section className="py-12 bg-gradient-to-r from-[#1e3a5f] to-[#2d4a6f]">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
              KVKK Aydınlatma Metni
            </h1>
            <p className="text-blue-100">
              6698 Sayılı Kişisel Verilerin Korunması Kanunu Kapsamında Aydınlatma Metni
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

                <h2>1. Veri Sorumlusu</h2>
                <p>
                  6698 sayılı Kişisel Verilerin Korunması Kanunu ("KVKK") uyarınca, kişisel verileriniz 
                  veri sorumlusu sıfatıyla <strong>Adana Nakliye</strong> tarafından aşağıda açıklanan 
                  kapsamda işlenebilecektir.
                </p>
                <ul>
                  <li><strong>Firma Adı:</strong> Adana Nakliye</li>
                  <li><strong>Adres:</strong> Belediye Evleri, 84244. Sk. No:9 Adana / Çukurova</li>
                  <li><strong>Telefon:</strong> 0505 780 55 51</li>
                  <li><strong>E-posta:</strong> info@adananakliye.com.tr</li>
                </ul>

                <h2>2. Toplanan Kişisel Veriler</h2>
                <p>Web sitemizi ziyaret ettiğinizde aşağıdaki veriler otomatik olarak toplanabilmektedir:</p>
                
                <h3>a) Cihaz ve Teknik Veriler</h3>
                <ul>
                  <li>IP adresi</li>
                  <li>Cihaz türü, markası ve modeli</li>
                  <li>İşletim sistemi ve versiyonu</li>
                  <li>Tarayıcı türü ve versiyonu</li>
                  <li>Ekran çözünürlüğü</li>
                  <li>Cihaz tanımlayıcısı (fingerprint)</li>
                </ul>

                <h3>b) Konum Verileri</h3>
                <ul>
                  <li>IP adresinden elde edilen yaklaşık konum (il/ilçe)</li>
                  <li>İzin verilmesi halinde hassas konum bilgisi (koordinat)</li>
                </ul>

                <h3>c) Kullanım Verileri</h3>
                <ul>
                  <li>Ziyaret edilen sayfalar</li>
                  <li>Sitede geçirilen süre</li>
                  <li>Referans kaynağı (nereden geldiğiniz)</li>
                  <li>Tıklama ve etkileşim verileri</li>
                </ul>

                <h3>d) İletişim Formları</h3>
                <ul>
                  <li>Ad, soyad</li>
                  <li>Telefon numarası</li>
                  <li>E-posta adresi</li>
                  <li>Mesaj içeriği</li>
                </ul>

                <h2>3. Kişisel Verilerin İşlenme Amaçları</h2>
                <p>Toplanan kişisel veriler aşağıdaki amaçlarla işlenmektedir:</p>
                <ul>
                  <li>Nakliyat hizmetlerinin sunulması ve teklif verilmesi</li>
                  <li>Müşteri taleplerinin karşılanması ve iletişim</li>
                  <li>Web sitesi güvenliğinin sağlanması</li>
                  <li>Sahte tıklama ve kötü niyetli aktivitelerin tespiti</li>
                  <li>İstatistiksel analizler ve site iyileştirmeleri</li>
                  <li>Yasal yükümlülüklerin yerine getirilmesi</li>
                  <li>Reklam performansının ölçülmesi</li>
                </ul>

                <h2>4. Kişisel Verilerin İşlenme Hukuki Sebepleri</h2>
                <p>Kişisel verileriniz KVKK'nın 5. ve 6. maddesinde belirtilen:</p>
                <ul>
                  <li>Açık rızanızın bulunması</li>
                  <li>Bir sözleşmenin kurulması veya ifasıyla doğrudan ilgili olması</li>
                  <li>Veri sorumlusunun hukuki yükümlülüğünü yerine getirmesi</li>
                  <li>İlgili kişinin temel hak ve özgürlüklerine zarar vermemek kaydıyla, veri sorumlusunun meşru menfaatleri için veri işlenmesinin zorunlu olması</li>
                </ul>
                <p>hukuki sebeplerine dayanılarak işlenmektedir.</p>

                <h2>5. Kişisel Verilerin Aktarılması</h2>
                <p>Kişisel verileriniz aşağıdaki taraflarla paylaşılabilir:</p>
                <ul>
                  <li>Yasal zorunluluk halinde yetkili kamu kurum ve kuruluşları</li>
                  <li>Hizmet aldığımız sunucu ve altyapı sağlayıcıları</li>
                  <li>Analitik ve reklam hizmet sağlayıcıları (Google, Facebook vb.)</li>
                </ul>

                <h2>6. Kişisel Veri Sahibinin Hakları</h2>
                <p>KVKK'nın 11. maddesi uyarınca aşağıdaki haklara sahipsiniz:</p>
                <ul>
                  <li>Kişisel verilerinizin işlenip işlenmediğini öğrenme</li>
                  <li>Kişisel verileriniz işlenmişse buna ilişkin bilgi talep etme</li>
                  <li>Kişisel verilerinizin işlenme amacını ve bunların amacına uygun kullanılıp kullanılmadığını öğrenme</li>
                  <li>Yurt içinde veya yurt dışında kişisel verilerinizin aktarıldığı üçüncü kişileri bilme</li>
                  <li>Kişisel verilerinizin eksik veya yanlış işlenmiş olması hâlinde bunların düzeltilmesini isteme</li>
                  <li>KVKK'nın 7. maddesinde öngörülen şartlar çerçevesinde kişisel verilerinizin silinmesini veya yok edilmesini isteme</li>
                  <li>İşlenen verilerin münhasıran otomatik sistemler vasıtasıyla analiz edilmesi suretiyle aleyhinize bir sonucun ortaya çıkmasına itiraz etme</li>
                  <li>Kişisel verilerinizin kanuna aykırı olarak işlenmesi sebebiyle zarara uğramanız hâlinde zararın giderilmesini talep etme</li>
                </ul>

                <h2>7. Veri Güvenliği</h2>
                <p>
                  Kişisel verilerinizin güvenliğini sağlamak için gerekli teknik ve idari tedbirler alınmaktadır. 
                  Verileriniz SSL sertifikası ile şifrelenerek iletilmekte ve güvenli sunucularda saklanmaktadır.
                </p>

                <h2>8. Çerezler (Cookies)</h2>
                <p>
                  Web sitemizde çerezler kullanılmaktadır. Çerezler hakkında detaylı bilgi için{' '}
                  <a href="/gizlilik-politikasi" className="text-blue-600 hover:underline">Gizlilik Politikası</a> sayfamızı 
                  inceleyebilirsiniz.
                </p>

                <h2>9. Başvuru Yöntemi</h2>
                <p>
                  Yukarıda belirtilen haklarınızı kullanmak için aşağıdaki iletişim kanallarından bize ulaşabilirsiniz:
                </p>
                <ul>
                  <li><strong>E-posta:</strong> info@adananakliye.com.tr</li>
                  <li><strong>Telefon:</strong> 0505 780 55 51</li>
                  <li><strong>Adres:</strong> Belediye Evleri, 84244. Sk. No:9 Adana / Çukurova</li>
                </ul>
                <p>
                  Başvurularınız en geç 30 gün içinde sonuçlandırılacaktır.
                </p>

                <h2>10. Değişiklikler</h2>
                <p>
                  İşbu aydınlatma metni gerektiğinde güncellenebilir. Güncellemeler web sitemizde yayınlandığı 
                  tarihte yürürlüğe girer.
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
