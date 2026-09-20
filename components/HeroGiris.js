/**
 * Banner'ın hemen altındaki giriş bölümü: sayfanın tek H1'i ve kısa
 * tanıtım metni.
 *
 * H1 neden burada: hero afişinin bütün metni görselin içine basılı, yani
 * arama motoru ve ekran okuyucu için okunabilir bir başlık yok. Eskiden
 * H1 slayt başlığıydı; slayt kalkınca başlığın gerçek metin olarak bir
 * yerde durması gerekiyor. Sayfadaki ilk başlık bu, altındaki bütün
 * bölümler H2 ile devam ediyor.
 *
 * Metin panelden değiştirilebilsin diye `anasayfa_bolumleri` tablosundaki
 * `giris` kaydına bakıyor; kayıt yoksa buradaki varsayılan yazılıyor.
 */
export default function HeroGiris({ bolum }) {
  const baslik = bolum?.baslik || 'Adana Nakliye Hizmetleri'

  return (
    <section className="bg-white py-10 md:py-14">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-3xl font-bold md:text-4xl" style={{ color: '#1e3a5f' }}>
            {baslik}
          </h1>

          {bolum?.icerik ? (
            <div
              className="prose prose-slate mt-5 max-w-none text-left text-slate-700 md:text-center"
              dangerouslySetInnerHTML={{ __html: bolum.icerik }}
            />
          ) : (
            <div className="mt-5 space-y-4 text-left text-slate-700 md:text-center">
              <p>
                Adana Nakliye, Adana ve çevresinde evden eve nakliyat, şehir içi
                taşımacılık ve şehirler arası nakliyat hizmeti veriyor. Eşyalarınız
                deneyimli ekip tarafından paketleniyor, sigortalı olarak taşınıyor ve
                yeni adresinizde kurulumu yapılarak teslim ediliyor.
              </p>
              <p>
                Dar sokak, yüksek kat ve asansörsüz bina gibi zorlu adreslerde
                asansörlü taşıma yapıyoruz. Ofis ve işyeri taşımalarında çalışma
                düzeninizin en az aksaması için taşıma hafta sonu ya da mesai dışına
                planlanabiliyor. Keşif ve fiyat teklifi ücretsiz.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
