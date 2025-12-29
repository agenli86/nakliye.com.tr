'use client'

export default function AnnouncementBar({ duyurular }) {
  if (!duyurular || duyurular.length === 0) return null

  const text = duyurular.map(d => d.metin).join('   •   ')
  
  return (
    <div className="overflow-hidden py-3" style={{ backgroundColor: '#d4ed31' }}>
      <div className="announcement-wrapper">
        <div className="announcement-content">
          {[1, 2, 3].map((_, idx) => (
            <span key={idx} className="inline-block whitespace-nowrap px-8">
              {duyurular.map((d, i) => (
                <span key={i} className="inline-flex items-center">
                  <span className="font-semibold" style={{ color: '#1e3a5f' }}>
                    {d.icon && <span className="mr-2">{d.icon}</span>}
                    {d.metin}
                  </span>
                  {i < duyurular.length - 1 && (
                    <span className="mx-6 text-xl" style={{ color: '#1e3a5f' }}>•</span>
                  )}
                </span>
              ))}
            </span>
          ))}
        </div>
      </div>

      <style jsx>{`
        .announcement-wrapper {
          display: flex;
          width: 100%;
        }
        .announcement-content {
          display: flex;
          animation: scroll 20s linear infinite;
        }
        @keyframes scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-33.33%); }
        }
        .announcement-content:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  )
}
