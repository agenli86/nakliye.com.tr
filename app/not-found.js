import Link from 'next/link'

// Bulunamayan sayfalar için 404 döndüren, dizine eklenmeyen basit bir sayfa.
export const metadata = {
  title: 'Sayfa Bulunamadı | Adana Nakliye',
  robots: { index: false, follow: true },
}

export default function NotFound() {
  return (
    <main className="min-h-[60vh] flex items-center justify-center px-4 py-20">
      <div className="text-center max-w-lg">
        <p className="text-6xl font-bold mb-4" style={{ color: '#046ffb' }}>404</p>
        <h1 className="text-2xl md:text-3xl font-bold mb-4">Aradığınız sayfa bulunamadı</h1>
        <p className="text-gray-600 mb-8">
          Sayfa taşınmış veya adresi değişmiş olabilir. Aşağıdaki bağlantılardan devam edebilirsiniz.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/" className="btn-primary">Anasayfa</Link>
          <Link href="/hizmetler" className="btn-outline">Hizmetlerimiz</Link>
          <a href="tel:05057805551" className="btn-secondary">Hemen Arayın</a>
        </div>
      </div>
    </main>
  )
}
