import Link from 'next/link'

/**
 * Wikipedia tarzı iç linkleme bloğu.
 *
 * Her rota ve il sayfası; aynı ildeki diğer rotalara, aynı bölgedeki
 * illere ve il hizmet sayfasına bağlanır. Böylece 240'ın üzerindeki sayfa
 * birbirine bağlı tek bir ağ oluşturuyor ve hiçbiri yetim kalmıyor.
 */
export default function IcLinkAgi({ gruplar, baslik = 'İlgili Sayfalar' }) {
  const dolu = (gruplar || []).filter((g) => g.linkler && g.linkler.length > 0)
  if (dolu.length === 0) return null

  return (
    <nav aria-labelledby="ic-link-baslik" className="mt-12 rounded-2xl border border-slate-200 bg-slate-50 p-6">
      <h2 id="ic-link-baslik" className="text-xl font-bold text-[#1e3a5f] mb-4">{baslik}</h2>
      <div className="grid gap-6 md:grid-cols-2">
        {dolu.map((grup) => (
          <div key={grup.baslik}>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500 mb-2">{grup.baslik}</h3>
            <ul className="flex flex-wrap gap-x-2 gap-y-1 text-sm">
              {grup.linkler.map((link, i) => (
                <li key={link.href} className="flex items-center">
                  <Link href={link.href} className="text-[#0b5bd3] hover:underline py-1">
                    {link.metin}
                  </Link>
                  {i < grup.linkler.length - 1 && <span aria-hidden="true" className="ml-2 text-slate-300">·</span>}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </nav>
  )
}
