import { FaPhone } from 'react-icons/fa'

export default function PriceTable({ fiyatlar, bolum }) {
  if (!fiyatlar || fiyatlar.length === 0) return null

  return (
    <section className="section" style={{ backgroundColor: '#f8fafc' }}>
      <div className="container mx-auto px-4">
        <h2 className="section-title">{bolum?.baslik || 'Adana Evden Eve Nakliyat Fiyatları'}</h2>
        <p className="section-subtitle">{bolum?.alt_baslik || '2025 Güncel Fiyat Listesi'}</p>

        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr style={{ backgroundColor: '#1e3a5f' }}>
                  <th className="text-left py-5 px-6 text-white font-semibold">Daire Tipi</th>
                  <th className="text-right py-5 px-6 text-white font-semibold">Fiyat Aralığı</th>
                </tr>
              </thead>
              <tbody>
                {fiyatlar.map((fiyat, index) => (
                  <tr key={fiyat.id} className={`border-b border-gray-100 hover:bg-blue-50 transition-colors ${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}>
                    <td className="py-5 px-6 font-medium" style={{ color: '#1e3a5f' }}>{fiyat.daire_tipi}</td>
                    <td className="py-5 px-6 text-right">
                      <span className="text-lg font-bold" style={{ color: '#046ffb' }}>
                        {Number(fiyat.min_fiyat).toLocaleString('tr-TR')} ₺ - {Number(fiyat.max_fiyat).toLocaleString('tr-TR')} ₺
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {bolum?.icerik && (
            <div className="mt-6 text-center text-gray-600" dangerouslySetInnerHTML={{ __html: bolum.icerik }} />
          )}

          <div className="text-center mt-8">
            <a href={bolum?.buton_link || 'tel:05057805551'} className="btn-primary inline-flex items-center gap-2">
              <FaPhone />
              {bolum?.buton_metin || 'Ücretsiz Keşif İçin Arayın'}
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
