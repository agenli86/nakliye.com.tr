'use client'

export default function TruckAnimation() {
  return (
    <div className="relative overflow-hidden py-6" style={{ backgroundColor: '#0f2744' }}>
      {/* Road */}
      <div className="absolute bottom-0 left-0 right-0 h-2 bg-gray-700">
        <div className="road-lines flex">
          {[...Array(30)].map((_, i) => (
            <span key={i} className="inline-block w-16 h-1 bg-yellow-400 mx-6" />
          ))}
        </div>
      </div>
      
      {/* Trucks Container */}
      <div className="relative h-12">
        {/* Truck 1 */}
        <div className="truck truck-1 absolute">
          <svg viewBox="0 0 100 40" className="w-20 h-10">
            <rect x="5" y="15" width="40" height="20" rx="2" fill="#d4ed31"/>
            <rect x="45" y="20" width="25" height="15" rx="2" fill="#1e3a5f"/>
            <rect x="48" y="22" width="8" height="8" rx="1" fill="#87CEEB"/>
            <circle cx="20" cy="37" r="5" fill="#333"/>
            <circle cx="20" cy="37" r="2" fill="#666"/>
            <circle cx="60" cy="37" r="5" fill="#333"/>
            <circle cx="60" cy="37" r="2" fill="#666"/>
            <text x="12" y="28" fontSize="6" fill="#1e3a5f" fontWeight="bold">NAKLİYE</text>
          </svg>
        </div>
        
        {/* Truck 2 */}
        <div className="truck truck-2 absolute">
          <svg viewBox="0 0 100 40" className="w-16 h-8">
            <rect x="5" y="18" width="35" height="17" rx="2" fill="#046ffb"/>
            <rect x="40" y="22" width="22" height="13" rx="2" fill="#1e3a5f"/>
            <rect x="43" y="24" width="7" height="6" rx="1" fill="#87CEEB"/>
            <circle cx="18" cy="37" r="4" fill="#333"/>
            <circle cx="52" cy="37" r="4" fill="#333"/>
          </svg>
        </div>
        
        {/* Truck 3 */}
        <div className="truck truck-3 absolute">
          <svg viewBox="0 0 100 40" className="w-24 h-12">
            <rect x="5" y="12" width="50" height="23" rx="2" fill="#d4ed31"/>
            <rect x="55" y="18" width="28" height="17" rx="2" fill="#1e3a5f"/>
            <rect x="58" y="20" width="10" height="8" rx="1" fill="#87CEEB"/>
            <circle cx="22" cy="37" r="5" fill="#333"/>
            <circle cx="22" cy="37" r="2" fill="#666"/>
            <circle cx="42" cy="37" r="5" fill="#333"/>
            <circle cx="42" cy="37" r="2" fill="#666"/>
            <circle cx="70" cy="37" r="5" fill="#333"/>
            <circle cx="70" cy="37" r="2" fill="#666"/>
            <text x="10" y="27" fontSize="7" fill="#1e3a5f" fontWeight="bold">ADANA</text>
          </svg>
        </div>
      </div>

      <style jsx>{`
        .road-lines {
          animation: roadMove 2s linear infinite;
        }
        @keyframes roadMove {
          0% { transform: translateX(0); }
          100% { transform: translateX(-88px); }
        }
        .truck-1 {
          animation: truckMove1 12s linear infinite;
        }
        .truck-2 {
          animation: truckMove2 10s linear infinite;
          animation-delay: -4s;
        }
        .truck-3 {
          animation: truckMove3 14s linear infinite;
          animation-delay: -7s;
        }
        @keyframes truckMove1 {
          0% { left: -100px; }
          100% { left: 100%; }
        }
        @keyframes truckMove2 {
          0% { left: -80px; }
          100% { left: 100%; }
        }
        @keyframes truckMove3 {
          0% { left: -120px; }
          100% { left: 100%; }
        }
      `}</style>
    </div>
  )
}
