'use client'

import { useState } from 'react'
import { FaChevronRight, FaTruck } from 'react-icons/fa'

export default function HomeTabs({ tablar }) {
  const [activeTab, setActiveTab] = useState(0)

  if (!tablar || tablar.length === 0) return null

  return (
    <section className="py-16" style={{ backgroundColor: '#1e3a5f' }}>
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">Neden Bizi Tercih Etmelisiniz?</h2>
          <p className="text-white/90">Detaylı bilgi için sekmelere tıklayın</p>
        </div>
        
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          {/* Tab Buttons */}
          <div className="flex flex-wrap">
            {tablar.map((tab, index) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(index)}
                aria-label={`${tab.baslik} sekmesini aç`}
                aria-selected={activeTab === index}
                role="tab"
                className={`flex-1 min-w-[200px] py-5 px-6 text-center font-semibold transition-all duration-300 relative group ${
                  activeTab === index ? 'bg-gradient-to-r from-yellow-400 to-yellow-300' : 'bg-gray-50 hover:bg-gray-100'
                }`}
              >
                <span className={`relative z-10 ${
                  activeTab === index ? 'text-gray-900' : 'text-gray-600'
                }`}>
                  {tab.baslik}
                </span>
                
                {/* Active indicator */}
                {activeTab === index && (
                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 w-4 h-4 rotate-45 bg-yellow-400" />
                )}
              </button>
            ))}
          </div>
          
          {/* Tab Content */}
          <div className="p-8 md:p-12">
            {tablar.map((tab, index) => (
              <div
                key={tab.id}
                className={`transition-all duration-500 ${
                  activeTab === index 
                    ? 'opacity-100 translate-y-0' 
                    : 'opacity-0 translate-y-4 hidden'
                }`}
              >
                <div className="grid md:grid-cols-2 gap-8 items-center">
                  <div>
                    <h3 className="text-2xl md:text-3xl font-bold mb-4" style={{ color: '#1e3a5f' }}>
                      {tab.baslik}
                    </h3>
                    <div 
                      className="prose prose-lg max-w-none text-gray-600"
                      dangerouslySetInnerHTML={{ __html: tab.icerik }}
                    />
                    <a 
                      href="tel:05057805551" 
                      className="inline-flex items-center gap-2 mt-6 font-semibold transition-all hover:gap-3"
                      style={{ color: '#046ffb' }}
                    >
                      Hemen Arayın <FaChevronRight />
                    </a>
                  </div>
                  
                  {tab.resim ? (
                    <div className="relative">
                      <img src={tab.resim} alt={tab.baslik} className="rounded-2xl shadow-lg" />
                    </div>
                  ) : (
                    <div className="hidden md:flex items-center justify-center">
                      <div className="w-48 h-48 rounded-full flex items-center justify-center" style={{ backgroundColor: '#d4ed31' }}>
                        <FaTruck className="text-6xl" style={{ color: '#1e3a5f' }} />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
          
          {/* Tab Navigation Dots */}
          <div className="flex justify-center gap-2 pb-6">
            {tablar.map((_, index) => (
              <button
                key={index}
                onClick={() => setActiveTab(index)}
                aria-label={`Sekme ${index + 1}`}
                className={`w-3 h-3 rounded-full transition-all ${
                  activeTab === index
                    ? 'w-8'
                    : 'bg-gray-300 hover:bg-gray-400'
                }`}
                style={activeTab === index ? { backgroundColor: '#d4ed31' } : {}}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
