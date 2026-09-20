import { paraBicimle } from '@/lib/rota-icerik'

/**
 * Rota fiyat tablosu. Değerler tahminidir ve panelden girilen baz ücret ile
 * km ücretinden hesaplanır; bu yüzden tabloda her zaman "tahmini" ibaresi
 * ve kesin fiyatın ekspertizle verildiği notu bulunur.
 */
export default function RotaFiyatTablosu({ satirlar, baslik, not }) {
  if (!satirlar || satirlar.length === 0) return null

  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-200 shadow-sm">
      <table className="w-full min-w-[640px] text-left text-sm">
        <caption className="sr-only">{baslik}</caption>
        <thead className="bg-[#1e3a5f] text-white">
          <tr>
            <th scope="col" className="px-4 py-3 font-semibold">Taşıma Türü</th>
            <th scope="col" className="px-4 py-3 font-semibold">Yaklaşık Hacim</th>
            <th scope="col" className="px-4 py-3 font-semibold">Kapsam</th>
            <th scope="col" className="px-4 py-3 font-semibold whitespace-nowrap">Tahmini Fiyat (TL)</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200 bg-white">
          {satirlar.map((satir) => (
            <tr key={satir.ad} className="hover:bg-slate-50">
              <th scope="row" className="px-4 py-3 font-semibold text-[#1e3a5f]">{satir.ad}</th>
              <td className="px-4 py-3 text-slate-700 whitespace-nowrap">{satir.hacim}</td>
              <td className="px-4 py-3 text-slate-600">{satir.aciklama}</td>
              <td className="px-4 py-3 font-bold text-[#0b5bd3] whitespace-nowrap">
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
