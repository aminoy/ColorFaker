import React, { useState } from 'react'
import {
  Bell, Globe, Building2, UtensilsCrossed, ShoppingBag,
  Star, Wrench, Clock, Car, MessageSquare, AlertTriangle,
  Navigation, MapPin, ChevronRight, Wifi, Coffee
} from 'lucide-react'

const PRAYER_TIMES = [
  { name: 'Fajr',    nameAr: 'الفجر',   time: '5:12 AM', done: true  },
  { name: 'Dhuhr',   nameAr: 'الظهر',   time: '12:19 PM', done: true  },
  { name: 'Asr',     nameAr: 'العصر',   time: '3:47 PM', done: false, next: true },
  { name: 'Maghrib', nameAr: 'المغرب',  time: '6:38 PM', done: false },
  { name: 'Isha',    nameAr: 'العشاء',  time: '8:05 PM', done: false },
]

const QUICK_ACTIONS = [
  { id: 'concierge',   icon: MessageSquare, label: 'Concierge',  labelAr: 'كونسيرج',   color: '#d4a017' },
  { id: 'transport',   icon: Car,           label: 'Transport',  labelAr: 'مواصلات',   color: '#6366f1' },
  { id: 'prayer',      icon: Clock,         label: 'Prayer',     labelAr: 'أوقات الصلاة', color: '#10b981' },
  { id: 'emergency',   icon: AlertTriangle, label: 'Emergency',  labelAr: 'طوارئ',     color: '#ef4444' },
]

const HIGHLIGHTS = [
  {
    id: 'sky',
    title: 'Sky Mussallah',
    titleAr: 'مصلى السماء',
    desc: 'World-record highest prayer room — panoramic Kaaba views',
    descAr: 'أعلى مصلى قياسياً في العالم — إطلالة بانورامية على الكعبة',
    bg: 'from-indigo-900 to-purple-900',
    icon: '🕌',
  },
  {
    id: 'convention',
    title: 'Fakieh Convention Centre',
    titleAr: 'مركز فقيه للمؤتمرات',
    desc: 'World-class events, exhibitions & conferences',
    descAr: 'فعاليات ومعارض ومؤتمرات عالمية المستوى',
    bg: 'from-rose-900 to-pink-900',
    icon: '🎭',
  },
  {
    id: 'museum',
    title: 'Jabal Omar Museum',
    titleAr: 'متحف جبل عمر',
    desc: 'Explore Makkah\'s sacred heritage & history',
    descAr: 'استكشف التراث المقدس وتاريخ مكة المكرمة',
    bg: 'from-teal-900 to-cyan-900',
    icon: '🏛️',
  },
  {
    id: 'boulevard',
    title: 'Al-Khalil Boulevard',
    titleAr: 'بوليفارد الخليل',
    desc: '280+ stores across 4 connected souks',
    descAr: '٢٨٠+ متجر في ٤ أسواق متصلة',
    bg: 'from-amber-900 to-orange-900',
    icon: '🛍️',
  },
]

export default function HomeScreen({ lang, setLang, navigate }) {
  const [greeting] = useState(() => {
    const h = new Date().getHours()
    if (h < 12) return lang === 'ar' ? 'صباح الخير' : 'Good Morning'
    if (h < 17) return lang === 'ar' ? 'مساء الخير' : 'Good Afternoon'
    return lang === 'ar' ? 'مساء النور' : 'Good Evening'
  })

  const nextPrayer = PRAYER_TIMES.find(p => p.next)

  return (
    <div className="min-h-full screen-bg">
      {/* Hero Header */}
      <div
        className="relative px-4 pt-12 pb-6"
        style={{
          background: 'linear-gradient(180deg,rgba(26,18,8,1) 0%,rgba(15,12,7,0) 100%)',
        }}
      >
        <div className="flex items-start justify-between">
          <div>
            <p className="text-gold-400 text-sm font-medium">{greeting}</p>
            <h1
              className="text-white text-2xl font-bold mt-0.5"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              {lang === 'ar' ? 'جبل عمر' : 'Jabal Omar'}
            </h1>
            <div className="flex items-center gap-1.5 mt-1">
              <MapPin size={11} className="text-gold-500" />
              <span className="text-white/40 text-xs">
                {lang === 'ar' ? 'مكة المكرمة، المملكة العربية السعودية' : 'Makkah Al-Mukarramah, KSA'}
              </span>
            </div>
            <p className="text-white/25 text-[10px] mt-0.5 italic" style={{ fontFamily: "'Playfair Display', serif" }}>
              {lang === 'ar' ? 'حيث تلتقي الأصالة بروح الحداثة' : 'Where authenticity meets modernity'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setLang(l => l === 'en' ? 'ar' : 'en')}
              className="w-9 h-9 rounded-xl card-glass flex items-center justify-center active:scale-90 transition-all"
            >
              <Globe size={16} className="text-gold-400" />
            </button>
            <button
              onClick={() => navigate('notifications')}
              className="w-9 h-9 rounded-xl card-glass flex items-center justify-center active:scale-90 transition-all relative"
            >
              <Bell size={16} className="text-gold-400" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-gold-500 pulse-gold" />
            </button>
          </div>
        </div>
      </div>

      <div className="px-4 pb-6 space-y-5">
        {/* Next Prayer Banner */}
        {nextPrayer && (
          <button
            onClick={() => navigate('prayer')}
            className="w-full rounded-2xl p-4 flex items-center justify-between active:scale-98 transition-all"
            style={{
              background: 'linear-gradient(135deg, rgba(16,185,129,0.15), rgba(16,185,129,0.05))',
              border: '1px solid rgba(16,185,129,0.3)',
            }}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                <Clock size={18} className="text-emerald-400" />
              </div>
              <div className="text-left">
                <p className="text-white/50 text-xs">
                  {lang === 'ar' ? 'الصلاة القادمة' : 'Next Prayer'}
                </p>
                <p className="text-white font-semibold text-sm">
                  {lang === 'ar' ? nextPrayer.nameAr : nextPrayer.name} — {nextPrayer.time}
                </p>
              </div>
            </div>
            <ChevronRight size={16} className="text-emerald-400" />
          </button>
        )}

        {/* Quick Actions */}
        <div>
          <p className="text-white/40 text-xs font-semibold uppercase tracking-widest mb-3">
            {lang === 'ar' ? 'إجراءات سريعة' : 'Quick Actions'}
          </p>
          <div className="grid grid-cols-4 gap-2">
            {QUICK_ACTIONS.map(({ id, icon: Icon, label, labelAr, color }) => (
              <button
                key={id}
                onClick={() => navigate(id)}
                className="flex flex-col items-center gap-2 p-3 rounded-2xl active:scale-90 transition-all"
                style={{ background: `${color}12`, border: `1px solid ${color}25` }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: `${color}20` }}
                >
                  <Icon size={18} style={{ color }} />
                </div>
                <span className="text-white text-[10px] font-medium text-center leading-tight">
                  {lang === 'ar' ? labelAr : label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Highlights Carousel */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-white/40 text-xs font-semibold uppercase tracking-widest">
              {lang === 'ar' ? 'الأماكن المميزة' : 'Featured Highlights'}
            </p>
            <button onClick={() => navigate('experiences')} className="text-gold-400 text-xs">
              {lang === 'ar' ? 'عرض الكل' : 'View all'}
            </button>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 no-scrollbar">
            {HIGHLIGHTS.map(h => (
              <button
                key={h.id}
                onClick={() => navigate('experiences')}
                className={`flex-shrink-0 w-48 rounded-2xl p-4 text-left bg-gradient-to-br ${h.bg} active:scale-95 transition-all`}
                style={{ border: '1px solid rgba(255,255,255,0.08)' }}
              >
                <span className="text-3xl">{h.icon}</span>
                <h3 className="text-white font-semibold text-sm mt-2 leading-tight">
                  {lang === 'ar' ? h.titleAr : h.title}
                </h3>
                <p className="text-white/50 text-xs mt-1 leading-snug">
                  {lang === 'ar' ? h.descAr : h.desc}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Services Grid */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-white/40 text-xs font-semibold uppercase tracking-widest">
              {lang === 'ar' ? 'خدمات المجمع' : 'Complex Services'}
            </p>
            <button onClick={() => navigate('services')} className="text-gold-400 text-xs">
              {lang === 'ar' ? 'عرض الكل' : 'View all'}
            </button>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {[
              { icon: Building2,       label: 'Hotels',   labelAr: 'الفنادق',   id: 'hotels',   color: '#d4a017' },
              { icon: UtensilsCrossed, label: 'Dining',   labelAr: 'مطاعم',     id: 'dining',   color: '#f97316' },
              { icon: ShoppingBag,     label: 'Shopping', labelAr: 'تسوق',      id: 'shopping', color: '#a855f7' },
              { icon: Wrench,          label: 'Services', labelAr: 'خدمات',     id: 'services', color: '#06b6d4' },
              { icon: Navigation,      label: 'Transport',labelAr: 'مواصلات',   id: 'transport',color: '#6366f1' },
              { icon: Wifi,            label: 'Wi-Fi',    labelAr: 'واي فاي',   id: 'services', color: '#10b981' },
            ].map(({ icon: Icon, label, labelAr, id, color }) => (
              <button
                key={label}
                onClick={() => navigate(id)}
                className="flex flex-col items-center gap-2 p-3 rounded-2xl active:scale-90 transition-all card-glass card-gold-border"
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: `${color}18` }}
                >
                  <Icon size={18} style={{ color }} />
                </div>
                <span className="text-white text-[10px] font-medium">
                  {lang === 'ar' ? labelAr : label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Hotels Teaser */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-white/40 text-xs font-semibold uppercase tracking-widest">
              {lang === 'ar' ? 'فنادق جبل عمر' : 'Jabal Omar Hotels'}
            </p>
            <button onClick={() => navigate('hotels')} className="text-gold-400 text-xs">
              {lang === 'ar' ? 'عرض الكل' : 'View all'}
            </button>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 no-scrollbar">
            {[
              { name: 'Hyatt Regency',  stars: 5, desc: 'King Fahd Gate — 1 min',      color: '#d4a017', emoji: '🏙️' },
              { name: 'Address',        stars: 5, desc: 'Sky Mussallah access',          color: '#c8a000', emoji: '🌟' },
              { name: 'Jumeirah',       stars: 5, desc: 'Foster+Partners design',        color: '#10b981', emoji: '🏰' },
              { name: 'Conrad',         stars: 5, desc: 'Facing King Fahad Gate',        color: '#3b82f6', emoji: '🏛️' },
              { name: 'Hilton Suites',  stars: 5, desc: '5 restaurants · mall link',     color: '#0ea5e9', emoji: '🏨' },
              { name: 'Marriott',       stars: 5, desc: '3-min walk to Haram',           color: '#ef4444', emoji: '🏩' },
              { name: 'Hilton H&C',     stars: 5, desc: 'Largest pillar-free ballroom', color: '#0369a1', emoji: '🎪' },
              { name: 'Rotana',         stars: 5, desc: 'Escalator to Haram',           color: '#9333ea', emoji: '🏯' },
              { name: 'DoubleTree',     stars: 5, desc: 'Haj & Umrah services',          color: '#f97316', emoji: '🌳' },
              { name: 'Sofitel',        stars: 5, desc: 'French luxury hospitality',     color: '#be185d', emoji: '🌹' },
            ].map(h => (
              <button
                key={h.name}
                onClick={() => navigate('hotels')}
                className="flex-shrink-0 w-40 rounded-2xl p-3 text-left active:scale-95 transition-all"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: `1px solid ${h.color}30`,
                }}
              >
                <div
                  className="w-full h-20 rounded-xl mb-2 flex items-center justify-center text-3xl"
                  style={{ background: `${h.color}12` }}
                >
                  {h.emoji}
                </div>
                <p className="text-white text-xs font-semibold">{h.name}</p>
                <p className="text-white/40 text-[10px] mt-0.5">{h.desc}</p>
                <div className="flex mt-1.5">
                  {Array.from({ length: h.stars }).map((_, i) => (
                    <Star key={i} size={8} className="text-gold-400 fill-gold-400" />
                  ))}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Project Stats */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { value: '10',       label: 'Hotels',       labelAr: 'فنادق',         color: '#d4a017' },
            { value: '235K m²',  label: 'Project Area', labelAr: 'مساحة المشروع', color: '#9da07c' },
            { value: '4',        label: 'Souks',        labelAr: 'أسواق',         color: '#a855f7' },
          ].map(s => (
            <div key={s.label} className="rounded-2xl p-3 card-glass card-gold-border text-center">
              <p className="font-bold text-base" style={{ color: s.color }}>{s.value}</p>
              <p className="text-white/30 text-[10px] mt-0.5">{lang === 'ar' ? s.labelAr : s.label}</p>
            </div>
          ))}
        </div>

        {/* Amenities strip */}
        <div
          className="rounded-2xl p-4"
          style={{ background: 'rgba(157,160,124,0.08)', border: '1px solid rgba(157,160,124,0.2)' }}
        >
          <p className="text-xs font-semibold mb-3 uppercase tracking-widest" style={{ color: '#9da07c' }}>
            {lang === 'ar' ? 'مرافق المجمع' : 'Complex Amenities'}
          </p>
          <div className="grid grid-cols-2 gap-2">
            {[
              { icon: '🏥', label: 'Medical Centre',       labelAr: 'مركز طبي'        },
              { icon: '🏧', label: 'Al Rajhi ATMs',        labelAr: 'صرافات الراجحي'  },
              { icon: '🚗', label: '1,500 Parking Spots',  labelAr: '١٥٠٠ موقف سيارة' },
              { icon: '♿', label: 'Electric Carriage',    labelAr: 'عربة كهربائية'   },
              { icon: '📶', label: 'Free Wi-Fi',           labelAr: 'واي فاي مجاني'   },
              { icon: '🕌', label: 'Sky Mussallah',        labelAr: 'مصلى السماء'     },
            ].map(a => (
              <div key={a.label} className="flex items-center gap-2">
                <span className="text-base">{a.icon}</span>
                <span className="text-white/60 text-xs">{lang === 'ar' ? a.labelAr : a.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Official Contact */}
        <div
          className="rounded-2xl p-4 flex items-center justify-between"
          style={{ background: 'rgba(212,160,23,0.06)', border: '1px solid rgba(212,160,23,0.15)' }}
        >
          <div>
            <p className="text-white/40 text-xs font-semibold uppercase tracking-widest mb-0.5">
              {lang === 'ar' ? 'تواصل معنا' : 'Contact Us'}
            </p>
            <a href="tel:+966126017180" className="text-gold-400 text-sm font-semibold">+966 12 601 7180</a>
            <p className="text-white/30 text-[10px] mt-0.5">{lang === 'ar' ? 'مكة المكرمة' : 'Makkah, KSA'}</p>
          </div>
          <div className="flex flex-col gap-1.5 text-right">
            <p className="text-white/25 text-[10px]">@jabal_omar</p>
            <p className="text-white/25 text-[10px]">@JabalOmarSa</p>
          </div>
        </div>
      </div>

      <style>{`.no-scrollbar::-webkit-scrollbar{display:none}.no-scrollbar{-ms-overflow-style:none;scrollbar-width:none}`}</style>
    </div>
  )
}
