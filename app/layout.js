import './globals.css'
import dynamic from 'next/dynamic'

// VisitorTracker'ı dynamic import ile yükle (Suspense yerine)
const VisitorTracker = dynamic(() => import('@/components/VisitorTracker'), {
  ssr: false, // Client-side only
  loading: () => null
})

export const metadata = {
  title: 'Adana Nakliye - Evden Eve Nakliyat',
  description: 'Adana nakliyat ve taşımacılık hizmetleri',
}

export default function RootLayout({ children }) {
  return (
    <html lang="tr">
      <body>
        {/* ZİYARETÇİ TAKİP SİSTEMİ - Dynamic Import ile */}
        <VisitorTracker />
        {children}
      </body>
    </html>
  )
}
