'use client'
import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'

const MapContainer = dynamic(() => import('react-leaflet').then(m => m.MapContainer), { ssr: false })
const TileLayer = dynamic(() => import('react-leaflet').then(m => m.TileLayer), { ssr: false })
const Marker = dynamic(() => import('react-leaflet').then(m => m.Marker), { ssr: false })

export default function VisitorMap({ lat, lng, isAds, className = '' }) {
  const [L, setL] = useState(null)
  
  useEffect(() => {
    import('leaflet').then(leaf => {
      // Reklamdan gelene KIRMIZI, normale MAVİ ikon
      const iconUrl = isAds 
        ? 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png'
        : 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png'
      
      const customIcon = leaf.icon({
        iconUrl,
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
        iconSize: [25, 41], iconAnchor: [12, 41]
      })
      leaf.Marker.prototype.options.icon = customIcon
      setL(leaf)
    })
  }, [isAds])

  if (!lat || !lng || !L) return <div className="bg-gray-100 h-full flex items-center justify-center">Harita Yükleniyor...</div>

  return (
    <div className={className}>
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      <MapContainer center={[lat, lng]} zoom={13} style={{ height: '100%', width: '100%' }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <Marker position={[lat, lng]} />
      </MapContainer>
    </div>
  )
}
