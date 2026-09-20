/**
 * Rota ve il sayfalarının SSS bölümü.
 *
 * FaqAccordion istemci bileşeni; burada cevapların arama motoru tarafından
 * ilk HTML'de görülmesi önemli olduğu için yerel <details> kullanıyoruz.
 * Böylece JavaScript çalışmadan da açılıp kapanıyor ve ek paket yüklenmiyor.
 */
export default function RotaSSS({ sorular, baslik = 'Sık Sorulan Sorular' }) {
  if (!sorular || sorular.length === 0) return null

  return (
    <section aria-labelledby="sss-baslik" className="mt-12">
      <h2 id="sss-baslik" className="text-2xl md:text-3xl font-bold mb-6 text-[#1e3a5f]">{baslik}</h2>
      <div className="space-y-3">
        {sorular.map((item, i) => (
          <details
            key={i}
            className="group rounded-xl border border-slate-200 bg-white p-4 open:shadow-sm"
            open={i === 0}
          >
            <summary className="cursor-pointer list-none font-semibold text-[#1e3a5f] marker:hidden flex items-start justify-between gap-4 min-h-[44px] items-center">
              <span>{item.soru}</span>
              <span aria-hidden="true" className="shrink-0 text-[#0b5bd3] transition-transform group-open:rotate-45 text-xl leading-none">+</span>
            </summary>
            <p className="mt-3 text-slate-700 leading-relaxed">{item.cevap}</p>
          </details>
        ))}
      </div>
    </section>
  )
}
