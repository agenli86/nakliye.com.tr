'use client'

export default function ContactLink({ href, value }: { href: string, value: string }) {
  return (
    
      href={href}
      className="text-gray-600 hover:text-blue-600"
      onClick={() => {
        if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
          window.gtag('event', 'conversion', {
            'send_to': 'AW-10842738572/28z6CO6-69sbEIyfnLIo'
          });
        }
      }}
    >
      {value}
    </a>
  )
}
