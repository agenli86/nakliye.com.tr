'use client'
import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'

// Leaflet'i client-side only yükle
const MapContainer = dynamic(
  () => import('react-leaflet').then(mod => mod.MapContainer),
  { ssr: false }
)
const TileLayer = dynamic(
  () => import('react-leaflet').then(mod => mod.TileLayer),
  { ssr: false }
)
const Marker = dynamic(
  () => import('react-leaflet').then(mod => mod.Marker),
  { ssr: false }
)
const Popup = dynamic(
  () => import('react-leaflet').then(mod => mod.Popup),
  { ssr: false }
)

export default function VisitorMap({ lat, lng, il, ilce, className = '' }) {
  const [isClient, setIsClient] = useState(false)
  const [icon, setIcon] = useState(null)

  useEffect(() => {
    setIsClient(true)
    
    // Leaflet icon'u client-side'da oluştur
    if (typeof window !== 'undefined') {
      import('leaflet').then(L => {
        const customIcon = L.icon({
          iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
          iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
          shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
          shadowSize: [41, 41]
        })
        setIcon(customIcon)
      })
    }
  }, [])

  if (!isClient || !lat || !lng) {
    return (
      <div className={`bg-gray-100 rounded-lg flex items-center justify-center ${className}`}>
        <span className="text-gray-400 text-sm">Konum bilgisi yok</span>
      </div>
    )
  }

  return (
    <div className={className}>
      <link
        rel="stylesheet"
        href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
        integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
        crossOrigin=""
      />
      <MapContainer
        center={[parseFloat(lat), parseFloat(lng)]}
        zoom={13}
        scrollWheelZoom={false}
        style={{ height: '100%', width: '100%', borderRadius: '0.5rem' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {icon && (
          <Marker position={[parseFloat(lat), parseFloat(lng)]} icon={icon}>
            <Popup>
              <div className="text-center">
                <strong>{il || 'Bilinmeyen'}</strong>
                {ilce && <div className="text-sm text-gray-600">{ilce}</div>}
                <div className="text-xs text-gray-400 mt-1">
                  {parseFloat(lat).toFixed(4)}, {parseFloat(lng).toFixed(4)}
                </div>
              </div>
            </Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  )
}
