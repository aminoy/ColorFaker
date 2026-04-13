import React, { useState } from 'react'
import { ArrowLeft, Star, Clock, MapPin, Phone, ChevronRight } from 'lucide-react'

const CATEGORIES = [
  { id: 'all',         label: 'All',          labelAr: 'الكل'         },
  { id: 'restaurants', label: 'Restaurants',  labelAr: 'مطاعم'        },
  { id: 'cafes',       label: 'Cafés',        labelAr: 'مقاهي'        },
  { id: 'fast-food',   label: 'Fast Food',    labelAr: 'وجبات سريعة'  },
  { id: 'bakery',      label: 'Bakery',       labelAr: 'مخابز'        },
]

const VENUES = [
  {
    id: 1, category: 'cafes',
    name: 'Starbucks', nameAr: 'ستاربكس',
    desc: 'Premium coffee, teas, and seasonal beverages',
    descAr: 'قهوة ممتازة وشاي ومشروبات موسمية',
    location: 'Souk Al-Khalil 1 & 2', locationAr: 'سوق الخليل ١ و ٢',
    hours: '6:00 AM – 2:00 AM', rating: 4.4, icon: '☕', color: '#00704a',
  },
  {
    id: 2, category: 'cafes',
    name: "Dunkin' Donuts", nameAr: 'دانكن',
    desc: "Donuts, bagels, sandwiches and fresh-brewed coffee",
    descAr: 'دونات وبيغل وسندويشات وقهوة طازجة',
    location: 'Souk Makkah Gate 1', locationAr: 'سوق بوابة مكة ١',
    hours: '7:00 AM – 12:00 AM', rating: 4.2, icon: '🍩', color: '#ff671f',
  },
  {
    id: 3, category: 'restaurants',
    name: 'MADO', nameAr: 'مادو',
    desc: 'Turkish ice cream, desserts, and Mediterranean cuisine',
    descAr: 'آيس كريم تركي وحلويات ومأكولات متوسطية',
    location: 'Al-Khalil Boulevard', locationAr: 'بوليفارد الخليل',
    hours: '10:00 AM – 1:00 AM', rating: 4.5, icon: '🍦', color: '#e91e8c',
  },
  {
    id: 4, category: 'restaurants',
    name: 'Hyatt Regency Restaurant', nameAr: 'مطعم هيات ريجنسي',
    desc: 'International buffet with Haram views. Halal certified.',
    descAr: 'بوفيه دولي مع إطلالات على الحرام. شهادة حلال.',
    location: 'Hyatt Regency Hotel', locationAr: 'فندق هيات ريجنسي',
    hours: '6:00 AM – 11:00 PM', rating: 4.7, icon: '🍽️', color: '#d4a017',
  },
  {
    id: 5, category: 'restaurants',
    name: 'Marriott Dining', nameAr: 'ماريوت للطعام',
    desc: 'Two restaurants with panoramic Haram views. Authentic Saudi & International.',
    descAr: 'مطعمان مع إطلالات بانورامية على الحرام. سعودي وعالمي.',
    location: 'Marriott Hotel', locationAr: 'فندق ماريوت',
    hours: '24 Hours', rating: 4.6, icon: '🥘', color: '#ef4444',
  },
  {
    id: 6, category: 'restaurants',
    name: 'Jumeirah Fine Dining', nameAr: 'جميرا للمأكولات الراقية',
    desc: '6 signature restaurants with diverse international menus',
    descAr: '٦ مطاعم مميزة بقوائم طعام دولية متنوعة',
    location: 'Jumeirah Hotel', locationAr: 'فندق جميرا',
    hours: '7:00 AM – 12:00 AM', rating: 4.8, icon: '🍱', color: '#10b981',
  },
  {
    id: 7, category: 'fast-food',
    name: 'Jabal Omar Food Court', nameAr: 'فود كورت جبل عمر',
    desc: 'Multiple fast casual and regional cuisines in one location',
    descAr: 'مطاعم سريعة ومأكولات إقليمية متعددة في مكان واحد',
    location: 'Souk Al-Khalil 3', locationAr: 'سوق الخليل ٣',
    hours: '8:00 AM – 2:00 AM', rating: 4.1, icon: '🏪', color: '#f59e0b',
  },
  {
    id: 8, category: 'bakery',
    name: 'Makkah Bakery & Sweets', nameAr: 'مخبز ومحلات الحلويات',
    desc: 'Traditional Arabic sweets, dates, and fresh bread',
    descAr: 'حلويات عربية تقليدية وتمور وخبز طازج',
    location: 'Souk Al-Khalil 2', locationAr: 'سوق الخليل ٢',
    hours: '5:00 AM – 11:00 PM', rating: 4.3, icon: '🥐', color: '#92400e',
  },
]

export default function DiningScreen({ lang, navigate }) {
  const [cat, setCat] = useState('all')

  const filtered = cat === 'all' ? VENUES : VENUES.filter(v => v.category === cat)

  return (
    <div className="min-h-full pb-6 screen-bg">
      {/* Header */}
      <div className="px-4 pt-12 pb-4">
        <button onClick={() => navigate('home')} className="flex items-center gap-2 mb-4">
          <ArrowLeft size={16} className="text-gold-400" />
          <span className="text-white/50 text-sm">{lang === 'ar' ? 'الرئيسية' : 'Home'}</span>
        </button>
        <h1 className="text-white text-2xl font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>
          {lang === 'ar' ? 'المطاعم والمقاهي' : 'Dining & Cafés'}
        </h1>
        <p className="text-white/40 text-sm mt-1">
          {lang === 'ar' ? 'اكتشف أفضل تجارب الطعام في جبل عمر' : 'Discover the finest dining experiences at Jabal Omar'}
        </p>
      </div>

      {/* Category filter */}
      <div className="flex gap-2 overflow-x-auto pb-2 px-4 mb-4 no-scrollbar">
        {CATEGORIES.map(c => (
          <button
            key={c.id}
            onClick={() => setCat(c.id)}
            className="flex-shrink-0 px-4 py-2 rounded-full text-xs font-semibold transition-all active:scale-90"
            style={cat === c.id
              ? { background: '#d4a017', color: '#0f0c07' }
              : { background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.1)' }
            }
          >
            {lang === 'ar' ? c.labelAr : c.label}
          </button>
        ))}
      </div>

      {/* Venue list */}
      <div className="px-4 space-y-3">
        {filtered.map(v => (
          <div
            key={v.id}
            className="rounded-2xl overflow-hidden"
            style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${v.color}20` }}
          >
            <div className="flex">
              <div
                className="w-24 flex-shrink-0 flex items-center justify-center text-4xl"
                style={{ background: `${v.color}15`, minHeight: 90 }}
              >
                {v.icon}
              </div>
              <div className="flex-1 p-3">
                <div className="flex items-start justify-between">
                  <h3 className="text-white font-semibold text-sm">
                    {lang === 'ar' ? v.nameAr : v.name}
                  </h3>
                  <div className="flex items-center gap-1 flex-shrink-0 ml-2">
                    <Star size={10} className="text-gold-400 fill-gold-400" />
                    <span className="text-gold-400 text-xs">{v.rating}</span>
                  </div>
                </div>
                <p className="text-white/40 text-[11px] mt-0.5 leading-snug">
                  {lang === 'ar' ? v.descAr : v.desc}
                </p>
                <div className="flex items-center gap-3 mt-2">
                  <div className="flex items-center gap-1">
                    <MapPin size={9} style={{ color: v.color }} />
                    <span className="text-white/30 text-[10px]">{lang === 'ar' ? v.locationAr : v.location}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock size={9} style={{ color: v.color }} />
                    <span className="text-white/30 text-[10px]">{v.hours}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <style>{`.no-scrollbar::-webkit-scrollbar{display:none}.no-scrollbar{-ms-overflow-style:none;scrollbar-width:none}`}</style>
    </div>
  )
}
