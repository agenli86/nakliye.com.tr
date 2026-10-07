import { FaHandshake, FaExternalLinkAlt } from 'react-icons/fa'

/**
 * Rota sayfasında hedef şehirdeki iş ortağına yönlendiren blok.
 *
 * Ortak tanımlı değilse hiçbir şey çizilmiyor, böylece bileşen bütün
 * rota sayfalarında koşulsuz çağrılabiliyor.
 *
 * Bağlantı yeni sekmede açılıyor: ziyaretçi rota sayfasını kaybetmesin.
 * rel'de yalnızca noopener var; noreferrer eklenmedi çünkü ortak sitenin
 * trafiğin nereden geldiğini görebilmesi isteniyor.
 */
export default function IsOrtagiKutusu({ ortak }) {
  if (!ortak) return null

  return (
    <section
      aria-labelledby="is-ortagi-baslik"
      className="mt-12 rounded-2xl border border-slate-200 bg-slate-50 p-6"
    >
      <h2
        id="is-ortagi-baslik"
        className="mb-3 flex items-center gap-2 text-xl font-bold text-[#1e3a5f]"
      >
        <FaHandshake aria-hidden="true" className="text-[#0b5bd3]" />
        {`${ortak.sehir || ''} Çözüm Ortağımız`.trim()}
      </h2>

      {ortak.aciklama && (
        <p className="mb-4 leading-relaxed text-slate-700">{ortak.aciklama}</p>
      )}

      <a
        href={ortak.url}
        target="_blank"
        rel="noopener"
        className="inline-flex items-center gap-2 rounded-xl bg-[#0561e0] px-5 py-3 font-bold text-white shadow-md transition-colors hover:bg-[#1e3a5f]"
      >
        {ortak.ad}
        <FaExternalLinkAlt aria-hidden="true" className="text-sm" />
        <span className="sr-only">(yeni sekmede açılır)</span>
      </a>
    </section>
  )
}
