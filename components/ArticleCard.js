'use client'

import Image from 'next/image'
import Link from 'next/link'
import { FaCalendarAlt, FaArrowRight } from 'react-icons/fa'

export default function ArticleCard({ makale }) {
  const formatDate = (dateString) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  }

  return (
    <div className="card card-hover group">
      <div className="relative h-52 overflow-hidden">
        <Image
          src={makale.resim || '/resimler/default-article.jpg'}
          alt={makale.baslik}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute top-4 left-4">
          <span className="bg-primary-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
            {makale.kategori || 'Blog'}
          </span>
        </div>
      </div>
      <div className="p-6">
        <div className="flex items-center gap-2 text-gray-500 text-sm mb-3">
          <FaCalendarAlt className="text-primary-500" />
          <span>{formatDate(makale.created_at)}</span>
        </div>
        <h3 className="text-xl font-bold text-secondary-800 mb-3 group-hover:text-primary-500 transition-colors line-clamp-2">
          {makale.baslik}
        </h3>
        <p className="text-gray-600 mb-4 line-clamp-2">
          {makale.ozet}
        </p>
        <Link
          href={`/makale/${makale.slug}`}
          className="inline-flex items-center gap-2 text-primary-500 font-semibold hover:gap-3 transition-all"
        >
          Devamını Oku
          <FaArrowRight className="text-sm" />
        </Link>
      </div>
    </div>
  )
}
