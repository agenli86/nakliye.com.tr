'use client'

import { useMemo, useState } from 'react'
import { FaCalculator, FaPhone } from 'react-icons/fa'

/**
 * Km bazlı kamyon/tır nakliye fiyat hesaplama aracı.
 *
 * Hesap sunucudan gelen iki sayıyla yapılıyor: km başına ücret ve araç
 * çarpanları. Böylece panelden 100 km ücreti değiştirildiğinde hem
 * sayfadaki tablo hem bu araç aynı rakamı veriyor.
 *
 * Bilerek istemci tarafında: kullanıcı km'yi değiştirdikçe sonucun anında
 * güncellenmesi gerekiyor, sunucuya gidip gelmesi anlamsız.
 */
export default function KmFiyatHesaplama({ kmUcret, araclar, baslangicKm = 100, telefon }) {
  const [km, setKm] = useState(String(baslangicKm))
  const [aracId, setAracId] = useState(araclar?.[1]?.id || araclar?.[0]?.id)

  const arac = useMemo(
    () => araclar.find((a) => a.id === aracId) || araclar[0],
    [araclar, aracId]
  )

  const mesafe = Number(km)
  const gecerli = Number.isFinite(mesafe) && mesafe > 0

  const tutar = useMemo(() => {
    if (!gecerli || !arac) return null
    const ham = mesafe * kmUcret * arac.carpan
    return Math.max(500, Math.round(ham / 500) * 500)
  }, [gecerli, mesafe, kmUcret, arac])

  const bicimle = (deger) => new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 0 }).format(deger)

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h3 className="mb-1 flex items-center gap-2 text-lg font-bold text-[#1e3a5f]">
        <FaCalculator aria-hidden="true" className="text-[#0561e0]" />
        Km Bazlı Fiyat Hesaplama
      </h3>
      <p className="mb-5 text-sm text-slate-600">
        100 km {bicimle(kmUcret * 100)} TL esasına göre tahmini tutar.
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="min-w-0">
          <label htmlFor="hesap-km" className="mb-2 block text-sm font-medium text-slate-700">
            Mesafe (km)
          </label>
          <input
            id="hesap-km"
            type="number"
            inputMode="numeric"
            min="1"
            max="2000"
            step="10"
            value={km}
            onChange={(e) => setKm(e.target.value)}
            className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-[#0561e0]"
          />
        </div>

        <div className="min-w-0">
          <label htmlFor="hesap-arac" className="mb-2 block text-sm font-medium text-slate-700">
            Araç tipi
          </label>
          <select
            id="hesap-arac"
            value={aracId}
            onChange={(e) => setAracId(e.target.value)}
            className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-[#0561e0]"
          >
            {araclar.map((a) => (
              <option key={a.id} value={a.id}>
                {a.ad} ({a.kapasite})
              </option>
            ))}
          </select>
        </div>
      </div>

      <div
        aria-live="polite"
        className="mt-5 rounded-xl bg-slate-50 px-5 py-4 text-center"
      >
        {tutar === null ? (
          <p className="text-sm text-slate-600">Hesaplamak için geçerli bir mesafe girin.</p>
        ) : (
          <>
            <p className="text-sm text-slate-600">
              {bicimle(mesafe)} km &middot; {arac.ad}
            </p>
            <p className="mt-1 text-3xl font-bold text-[#0b5bd3]">{bicimle(tutar)} TL</p>
            <p className="mt-2 text-xs text-slate-600">
              Tahmini tutar. Yükün ağırlığı, boşaltma koşulları ve dönüş yükü durumuna göre değişir.
            </p>
          </>
        )}
      </div>

      {telefon && (
        <a
          href={`tel:${telefon}`}
          className="mt-4 flex items-center justify-center gap-3 rounded-xl bg-[#0561e0] py-3 font-bold text-white shadow-md hover:bg-[#1e3a5f]"
        >
          <FaPhone aria-hidden="true" /> Kesin fiyat için arayın
        </a>
      )}
    </div>
  )
}
