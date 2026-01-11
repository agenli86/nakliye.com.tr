import './globals.css'
import { Suspense } from 'react'
import VisitorTracker from '@/components/VisitorTracker'

export const metadata = {
  title: 'Adana Nakliye - Evden Eve Nakliyat',
  description: 'Adana nakliyat ve taşımacılık hizmetleri',
}

export default function RootLayout({ children }) {
  return (
    <html lang="tr">
      <body>
        {/* ZİYARETÇİ TAKİP SİSTEMİ */}
        <Suspense fallback={null}>
          <VisitorTracker />
        </Suspense>
        
        {children}
      </body>
    </html>
  )
}
