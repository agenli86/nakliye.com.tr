import { paraBicimle } from '@/lib/rota-icerik'

/**
 * Rota fiyat tablosu. Değerler tahminidir ve panelden girilen baz ücret ile
 * km ücretinden hesaplanır; bu yüzden tabloda her zaman "tahmini" ibaresi
 * ve kesin fiyatın ekspertizle verildiği notu bulunur.
 *
 * Mobil: "Kapsam" sütunu gizlenip açıklama taşıma türünün altına alınıyor.
 * Böylece tablo dar ekranda da sığıyor. Kapsayıcıda `w-full` ve üst
 * öğelerde `min-w-0` şart: grid item'ların varsayılan `min-width: auto`
 * değeri, geniş tablonun sayfayı yatay olarak taşırmasına yol açıyor.
 */
export default function RotaFiyatTablosu({ satirlar, baslik, not }) {
  if (!satirlar || satirlar.length === 0) return null

  return (
    <div className="w-full max-w-full overflow-x-auto rounded-2xl border border-slate-200 shadow-sm">
      <table className="w-full min-w-[320px] text-left text-sm">
        <caption className="sr-only">{baslik}</caption>
        <thead className="bg-[#1e3a5f] text-white">
          <tr>
            <th scope="col" className="px-3 py-3 font-semibold sm:px-4">Taşıma Türü</th>
            <th scope="col" className="hidden px-4 py-3 font-semibold sm:table-cell">Yaklaşık Hacim</th>
            <th scope="col" className="hidden px-4 py-3 font-semibold md:table-cell">Kapsam</th>
            <th scope="col" className="whitespace-nowrap px-3 py-3 text-right font-semibold sm:px-4 sm:text-left">
              Tahmini Fiyat (TL)
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200 bg-white">
          {satirlar.map((satir) => (
            <tr key={satir.ad} className="hover:bg-slate-50">
              <th scope="row" className="px-3 py-3 font-semibold text-[#1e3a5f] sm:px-4">
                {satir.ad}
                <span className="mt-1 block text-xs font-normal text-slate-600 sm:hidden">
                  {satir.hacim}
                </span>
              </th>
              <td className="hidden whitespace-nowrap px-4 py-3 text-slate-700 sm:table-cell">{satir.hacim}</td>
              <td className="hidden px-4 py-3 text-slate-600 md:table-cell">{satir.aciklama}</td>
              <td className="whitespace-nowrap px-3 py-3 text-right font-bold text-[#0b5bd3] sm:px-4 sm:text-left">
                {paraBicimle(satir.alt)} - {paraBicimle(satir.ust)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="bg-slate-50 px-4 py-3 text-xs text-slate-600">
        {not || 'Tablodaki tutarlar tahminidir; eşya hacmi, kat ve asansör durumuna göre değişir. Kesin fiyat ücretsiz ekspertiz sonrası yazılı olarak verilir.'}
      </p>
    </div>
  )
}
