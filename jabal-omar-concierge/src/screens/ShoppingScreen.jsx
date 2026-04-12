import React, { useState } from 'react'
import { ArrowLeft, MapPin, Clock, ChevronRight, Search } from 'lucide-react'

const MALLS = [
  {
    id: 'sk1',
    name: 'Souk Al-Khalil 1',
    nameAr: 'سوق الخليل ١',
    desc: 'Fashion, perfumes, accessories and prayer items',
    descAr: 'أزياء وعطور وإكسسوارات ومستلزمات الصلاة',
    floors: 4, stores: 65,
    hours: '9:00 AM – 2:00 AM',
    icon: '🛍️', color: '#d4a017',
    gradient: 'from-amber-900/50 to-yellow-900/30',
  },
  {
    id: 'sk2',
    name: 'Souk Al-Khalil 2',
    nameAr: 'سوق الخليل ٢',
    desc: 'Luxury brands, jewelry, gold, and fine dining',
    descAr: 'ماركات فاخرة ومجوهرات وذهب ومطاعم راقية',
    floors: 5, stores: 80,
    hours: '9:00 AM – 2:00 AM',
    icon: '💎', color: '#a855f7',
    gradient: 'from-purple-900/50 to-violet-900/30',
  },
  {
    id: 'sk3',
    name: 'Souk Al-Khalil 3',
    nameAr: 'سوق الخليل ٣',
    desc: 'Electronics, souvenirs, food court & hypermarket',
    descAr: 'إلكترونيات وتذكارات وفود كورت وهايبر ماركت',
    floors: 6, stores: 90,
    hours: '8:00 AM – 2:00 AM',
    icon: '🏪', color: '#0ea5e9',
    gradient: 'from-sky-900/50 to-blue-900/30',
  },
  {
    id: 'smg1',
    name: 'Souk Makkah Gate 1',
    nameAr: 'سوق بوابة مكة ١',
    desc: 'Perfumes, oud, abayas and traditional Saudi goods',
    descAr: 'عطور وعود وعباءات وبضائع سعودية تقليدية',
    floors: 3, stores: 45,
    hours: '9:00 AM – 12:00 AM',
    icon: '🕌', color: '#10b981',
    gradient: 'from-emerald-900/50 to-teal-900/30',
  },
]

const BRANDS = [
  { name: 'Starbucks',      icon: '☕', cat: 'F&B',           color: '#00704a' },
  { name: "Dunkin'",        icon: '🍩', cat: 'F&B',           color: '#ff671f' },
  { name: 'Arabian Aoud',   icon: '🌹', cat: 'Perfumes',      color: '#9f1239' },
  { name: 'Al Majed',       icon: '✨', cat: 'Perfumes',      color: '#d97706' },
  { name: 'Bin Dawood',     icon: '🛒', cat: 'Hypermarket',   color: '#1d4ed8' },
  { name: 'Al Nahdi',       icon: '💊', cat: 'Pharmacy',      color: '#065f46' },
  { name: 'MADO',           icon: '🍦', cat: 'Desserts',      color: '#e91e8c' },
  { name: 'Al-Jazeera',     icon: '🏅', cat: 'Jewelry',       color: '#92400e' },
  { name: 'Zara',           icon: '👗', cat: 'Fashion',       color: '#1e293b' },
  { name: 'H&M',            icon: '🧥', cat: 'Fashion',       color: '#e11d48' },
  { name: 'Apple',          icon: '📱', cat: 'Electronics',   color: '#374151' },
  { name: 'Footlocker',     icon: '👟', cat: 'Sports',        color: '#dc2626' },
]

export default function ShoppingScreen({ lang, navigate }) {
  const [query, setQuery] = useState('')

  const filtered = query
    ? BRANDS.filter(b => b.name.toLowerCase().includes(query.toLowerCase()))
    : BRANDS

  return (
    <div className="min-h-full pb-6" style={{ background: '#0f0c07' }}>
      {/* Header */}
      <div className="px-4 pt-12 pb-4">
        <button onClick={() => navigate('home')} className="flex items-center gap-2 mb-4">
          <ArrowLeft size={16} className="text-gold-400" />
          <span className="text-white/50 text-sm">{lang === 'ar' ? 'الرئيسية' : 'Home'}</span>
        </button>
        <h1 className="text-white text-2xl font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>
          {lang === 'ar' ? 'أسواق جبل عمر' : 'ASWAQ Jabal Omar'}
        </h1>
        <p className="text-white/40 text-sm mt-1">
          {lang === 'ar' ? 'أكثر من ٢٨٠ متجر في ٤ أسواق متصلة' : '280+ stores across 4 connected malls'}
        </p>
      </div>

      {/* Malls */}
      <div className="px-4 space-y-3 mb-6">
        <p className="text-white/40 text-xs font-semibold uppercase tracking-widest">
          {lang === 'ar' ? 'مراكز التسوق' : 'Shopping Centres'}
        </p>
        {MALLS.map(m => (
          <div
            key={m.id}
            className={`rounded-2xl overflow-hidden bg-gradient-to-br ${m.gradient}`}
            style={{ border: `1px solid ${m.color}30` }}
          >
            <div className="p-4 flex items-center gap-4">
              <div
                className="w-14 h-14 rounded-xl flex items-center justify-center text-3xl flex-shrink-0"
                style={{ background: `${m.color}20` }}
              >
                {m.icon}
              </div>
              <div className="flex-1">
                <h3 className="text-white font-semibold text-sm">
                  {lang === 'ar' ? m.nameAr : m.name}
                </h3>
                <p className="text-white/40 text-[11px] mt-0.5">{lang === 'ar' ? m.descAr : m.desc}</p>
                <div className="flex items-center gap-3 mt-2">
                  <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: `${m.color}20`, color: m.color }}>
                    {m.stores} {lang === 'ar' ? 'متجر' : 'stores'}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: `${m.color}20`, color: m.color }}>
                    {m.floors} {lang === 'ar' ? 'طوابق' : 'floors'}
                  </span>
                  <div className="flex items-center gap-1 ml-auto">
                    <Clock size={9} style={{ color: m.color }} />
                    <span className="text-white/30 text-[10px]">{m.hours}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Brand directory */}
      <div className="px-4">
        <p className="text-white/40 text-xs font-semibold uppercase tracking-widest mb-3">
          {lang === 'ar' ? 'دليل المتاجر' : 'Store Directory'}
        </p>

        {/* Search */}
        <div className="relative mb-4">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
          <input
            type="text"
            placeholder={lang === 'ar' ? 'ابحث عن متجر...' : 'Search stores...'}
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm text-white placeholder-white/30 outline-none"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
          />
        </div>

        <div className="grid grid-cols-3 gap-2">
          {filtered.map(b => (
            <div
              key={b.name}
              className="rounded-xl p-3 flex flex-col items-center gap-1.5 active:scale-95 transition-all"
              style={{ background: `${b.color}10`, border: `1px solid ${b.color}20` }}
            >
              <span className="text-2xl">{b.icon}</span>
              <span className="text-white text-[10px] font-semibold text-center leading-tight">{b.name}</span>
              <span className="text-[9px] px-1.5 py-0.5 rounded-full" style={{ background: `${b.color}20`, color: b.color }}>
                {b.cat}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
