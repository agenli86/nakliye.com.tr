'use client'

import Image from 'next/image'
import Link from 'next/link'
import { FaArrowRight } from 'react-icons/fa'

export default function ServiceCard({ hizmet }) {
  return (
    <div className="card card-hover group">
      <div className="relative h-56 overflow-hidden">
        <Image
          src={hizmet.resim || '/resimler/default-service.jpg'}
          alt={hizmet.baslik}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-secondary-900/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>
      <div className="p-6">
        <h3 className="text-xl font-bold text-secondary-800 mb-3 group-hover:text-primary-500 transition-colors">
          {hizmet.baslik}
        </h3>
        <p className="text-gray-600 mb-4 line-clamp-3">
          {hizmet.kisa_aciklama}
        </p>
        <Link
          href={`/hizmet/${hizmet.slug}`}
          className="inline-flex items-center gap-2 text-primary-500 font-semibold hover:gap-3 transition-all"
        >
          İnceleyin
          <FaArrowRight className="text-sm" />
        </Link>
      </div>
    </div>
  )
}
