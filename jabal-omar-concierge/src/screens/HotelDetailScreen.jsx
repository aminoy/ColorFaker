import React from 'react'
import { ArrowLeft } from 'lucide-react'

// Lightweight pass-through — detail is injected via navigate('hotel-detail', hotelObj)
export default function HotelDetailScreen({ lang, navigate, detail }) {
  if (!detail) {
    navigate('hotels')
    return null
  }
  return (
    <div className="min-h-full screen-bg">
      <div className="px-4 pt-12">
        <button onClick={() => navigate('hotels')} className="flex items-center gap-2">
          <ArrowLeft size={16} className="text-gold-400" />
          <span className="text-white/50 text-sm">{lang === 'ar' ? 'الفنادق' : 'Hotels'}</span>
        </button>
      </div>
      <div className="px-4 pt-4">
        <h1 className="text-white text-2xl font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>
          {lang === 'ar' ? detail.nameAr : detail.name}
        </h1>
        <p className="text-white/50 text-sm mt-2">{lang === 'ar' ? detail.descAr : detail.desc}</p>
      </div>
    </div>
  )
}
