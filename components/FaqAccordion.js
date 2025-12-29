'use client'

import { useState } from 'react'
import { FaChevronDown, FaQuestionCircle } from 'react-icons/fa'

export default function FaqAccordion({ items }) {
  const [openIndex, setOpenIndex] = useState(0)

  const toggleItem = (index) => {
    setOpenIndex(openIndex === index ? -1 : index)
  }

  return (
    <div className="space-y-4">
      {items.map((item, index) => (
        <div
          key={item.id || index}
          className={`bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 ${
            openIndex === index ? 'ring-2 ring-primary-500' : ''
          }`}
        >
          <button
            onClick={() => toggleItem(index)}
            className="w-full flex items-center justify-between p-6 text-left hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors ${
                openIndex === index ? 'bg-primary-500 text-white' : 'bg-primary-100 text-primary-500'
              }`}>
                <FaQuestionCircle />
              </div>
              <span className={`font-semibold transition-colors ${
                openIndex === index ? 'text-primary-500' : 'text-secondary-800'
              }`}>
                {item.soru}
              </span>
            </div>
            <FaChevronDown
              className={`text-gray-400 transition-transform duration-300 flex-shrink-0 ml-4 ${
                openIndex === index ? 'rotate-180 text-primary-500' : ''
              }`}
            />
          </button>
          <div
            className={`overflow-hidden transition-all duration-300 ${
              openIndex === index ? 'max-h-96' : 'max-h-0'
            }`}
          >
            <div className="px-6 pb-6 pt-0">
              <div className="pl-14 text-gray-600 leading-relaxed">
                {item.cevap}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
