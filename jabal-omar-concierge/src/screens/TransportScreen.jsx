import React, { useState } from 'react'
import { ArrowLeft, Car, Zap, MapPin, Clock, CheckCircle, ChevronRight, Phone } from 'lucide-react'

const PARKING_LEVELS = [
  { level: 'B1', capacity: 300, available: 187, color: '#10b981' },
  { level: 'B2', capacity: 350, available: 42,  color: '#f59e0b' },
  { level: 'B3', capacity: 400, available: 0,   color: '#ef4444' },
  { level: 'B4', capacity: 450, available: 210, color: '#10b981' },
]

const CARRIAGE_ROUTES = [
  {
    id: 1,
    name: 'Tawaf Circuit',           nameAr: 'دائرة الطواف',
    desc: 'Around Al-Masjid Al-Haram', descAr: 'حول المسجد الحرام',
    duration: '~20 min',             durationAr: '~٢٠ دقيقة',
    icon: '🕋', color: '#d4a017',
  },
  {
    id: 2,
    name: "Sa'i Route",              nameAr: 'مسار السعي',
    desc: 'Al-Safa to Al-Marwa',     descAr: 'الصفا إلى المروة',
    duration: '~15 min',             durationAr: '~١٥ دقيقة',
    icon: '🚶', color: '#6366f1',
  },
  {
    id: 3,
    name: 'Jabal Omar Internal',     nameAr: 'التنقل الداخلي',
    desc: 'Between hotels & souks',  descAr: 'بين الفنادق والأسواق',
    duration: 'On demand',           durationAr: 'عند الطلب',
    icon: '🏨', color: '#0ea5e9',
  },
]

export default function TransportScreen({ lang, navigate }) {
  const [tab, setTab]     = useState('parking')
  const [booked, setBooked] = useState(null)

  return (
    <div className="min-h-full pb-6" style={{ background: '#0f0c07' }}>
      <div className="px-4 pt-12 pb-4">
        <button onClick={() => navigate('home')} className="flex items-center gap-2 mb-4">
          <ArrowLeft size={16} className="text-gold-400" />
          <span className="text-white/50 text-sm">{lang === 'ar' ? 'الرئيسية' : 'Home'}</span>
        </button>
        <h1 className="text-white text-2xl font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>
          {lang === 'ar' ? 'المواصلات' : 'Transport'}
        </h1>
        <p className="text-white/40 text-sm mt-1">
          {lang === 'ar' ? 'مواقف السيارات والعربات الكهربائية' : 'Parking & electric carriage services'}
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mx-4 mb-5 p-1 rounded-2xl" style={{ background: 'rgba(255,255,255,0.05)' }}>
        {[
          { id: 'parking',  label: 'Parking',           labelAr: 'مواقف'      },
          { id: 'carriage', label: 'Electric Carriage',  labelAr: 'عربة كهربائية' },
          { id: 'airport',  label: 'Airport Transfer',   labelAr: 'نقل مطار'   },
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className="flex-1 py-2 rounded-xl text-xs font-semibold transition-all"
            style={tab === t.id
              ? { background: '#d4a017', color: '#0f0c07' }
              : { color: 'rgba(255,255,255,0.4)' }
            }
          >
            {lang === 'ar' ? t.labelAr : t.label}
          </button>
        ))}
      </div>

      {tab === 'parking' && (
        <div className="px-4 space-y-4">
          {/* Summary */}
          <div
            className="rounded-2xl p-4"
            style={{ background: 'rgba(212,160,23,0.08)', border: '1px solid rgba(212,160,23,0.2)' }}
          >
            <div className="flex items-center justify-between mb-3">
              <p className="text-white font-semibold">{lang === 'ar' ? 'المجموع' : 'Overview'}</p>
              <span className="text-green-400 text-xs font-semibold">
                {lang === 'ar' ? 'مجاني للضيوف' : 'Free for Guests'}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div>
                <p className="text-gold-400 text-xl font-bold">1,500</p>
                <p className="text-white/30 text-[10px]">{lang === 'ar' ? 'إجمالي' : 'Total'}</p>
              </div>
              <div>
                <p className="text-emerald-400 text-xl font-bold">
                  {PARKING_LEVELS.reduce((a, l) => a + l.available, 0)}
                </p>
                <p className="text-white/30 text-[10px]">{lang === 'ar' ? 'متاح' : 'Available'}</p>
              </div>
              <div>
                <p className="text-white/60 text-xl font-bold">
                  {PARKING_LEVELS.reduce((a, l) => a + (l.capacity - l.available), 0)}
                </p>
                <p className="text-white/30 text-[10px]">{lang === 'ar' ? 'ممتلئ' : 'Occupied'}</p>
              </div>
            </div>
          </div>

          {/* Levels */}
          <p className="text-white/40 text-xs font-semibold uppercase tracking-widest">
            {lang === 'ar' ? 'مستويات المواقف' : 'Parking Levels'}
          </p>
          {PARKING_LEVELS.map(lv => {
            const pct = Math.round((lv.available / lv.capacity) * 100)
            return (
              <div key={lv.level} className="rounded-2xl p-4 card-glass card-gold-border">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                      style={{ background: `${lv.color}20` }}>
                      <Car size={14} style={{ color: lv.color }} />
                    </div>
                    <p className="text-white font-semibold text-sm">
                      {lang === 'ar' ? `الطابق ${lv.level}` : `Level ${lv.level}`}
                    </p>
                  </div>
                  <span
                    className="text-xs font-semibold px-2 py-0.5 rounded-full"
                    style={{ background: `${lv.color}20`, color: lv.color }}
                  >
                    {lv.available === 0
                      ? (lang === 'ar' ? 'ممتلئ' : 'Full')
                      : `${lv.available} ${lang === 'ar' ? 'متاح' : 'free'}`
                    }
                  </span>
                </div>
                <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${pct}%`, background: lv.color }}
                  />
                </div>
                <p className="text-white/20 text-[10px] mt-1">{pct}% available</p>
              </div>
            )
          })}
        </div>
      )}

      {tab === 'carriage' && (
        <div className="px-4 space-y-4">
          <div
            className="rounded-2xl p-4"
            style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)' }}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center">
                <Zap size={18} className="text-indigo-400" />
              </div>
              <div>
                <p className="text-white font-semibold text-sm">
                  {lang === 'ar' ? 'خدمة العربات الكهربائية' : 'Electric Carriage Service'}
                </p>
                <p className="text-white/40 text-xs">
                  {lang === 'ar' ? 'للمسنين وذوي الاحتياجات الخاصة' : 'For elderly & people with special needs'}
                </p>
              </div>
            </div>
          </div>

          <p className="text-white/40 text-xs font-semibold uppercase tracking-widest">
            {lang === 'ar' ? 'المسارات المتاحة' : 'Available Routes'}
          </p>

          {CARRIAGE_ROUTES.map(r => (
            <div
              key={r.id}
              className="rounded-2xl p-4"
              style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${r.color}25` }}
            >
              <div className="flex items-center gap-3 mb-3">
                <span className="text-2xl">{r.icon}</span>
                <div className="flex-1">
                  <p className="text-white font-semibold text-sm">{lang === 'ar' ? r.nameAr : r.name}</p>
                  <p className="text-white/40 text-xs">{lang === 'ar' ? r.descAr : r.desc}</p>
                </div>
                <div className="flex items-center gap-1">
                  <Clock size={10} style={{ color: r.color }} />
                  <span className="text-xs" style={{ color: r.color }}>
                    {lang === 'ar' ? r.durationAr : r.duration}
                  </span>
                </div>
              </div>
              {booked === r.id ? (
                <div className="flex items-center gap-2 justify-center py-2">
                  <CheckCircle size={16} className="text-emerald-400" />
                  <span className="text-emerald-400 text-sm font-semibold">
                    {lang === 'ar' ? 'تم الحجز بنجاح!' : 'Booking Confirmed!'}
                  </span>
                </div>
              ) : (
                <button
                  onClick={() => setBooked(r.id)}
                  className="w-full py-2.5 rounded-xl text-sm font-semibold active:scale-95 transition-all"
                  style={{ background: `${r.color}20`, color: r.color, border: `1px solid ${r.color}40` }}
                >
                  {lang === 'ar' ? 'احجز الآن' : 'Book Now'}
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {tab === 'airport' && (
        <div className="px-4 space-y-4">
          <div
            className="rounded-2xl p-5 text-center"
            style={{ background: 'rgba(212,160,23,0.08)', border: '1px solid rgba(212,160,23,0.2)' }}
          >
            <span className="text-5xl mb-3 block">✈️</span>
            <h3 className="text-white font-semibold text-base" style={{ fontFamily: "'Playfair Display', serif" }}>
              {lang === 'ar' ? 'خدمة نقل المطار' : 'Airport Transfer Service'}
            </h3>
            <p className="text-white/40 text-sm mt-2 leading-relaxed">
              {lang === 'ar'
                ? 'نوفر خدمة نقل مريحة من وإلى مطار الملك عبدالعزيز الدولي بجدة'
                : 'Comfortable transfers to/from King Abdulaziz International Airport, Jeddah'
              }
            </p>
          </div>

          {[
            { title: 'Standard Sedan',  titleAr: 'سيدان قياسي',    price: 'SAR 150',  seats: 3, icon: '🚗' },
            { title: 'Premium SUV',     titleAr: 'SUV مميز',         price: 'SAR 250',  seats: 6, icon: '🚙' },
            { title: 'Luxury Van',      titleAr: 'فان فاخر',         price: 'SAR 400',  seats: 7, icon: '🚐' },
          ].map(v => (
            <div key={v.title} className="rounded-2xl p-4 card-glass card-gold-border flex items-center gap-4">
              <span className="text-3xl">{v.icon}</span>
              <div className="flex-1">
                <p className="text-white font-semibold text-sm">{lang === 'ar' ? v.titleAr : v.title}</p>
                <p className="text-white/40 text-xs">Up to {v.seats} passengers</p>
              </div>
              <div className="text-right">
                <p className="text-gold-400 font-bold text-sm">{v.price}</p>
                <button
                  className="mt-1 text-[10px] px-2 py-1 rounded-full active:scale-90 transition-all"
                  style={{ background: 'rgba(212,160,23,0.15)', color: '#d4a017' }}
                >
                  {lang === 'ar' ? 'احجز' : 'Book'}
                </button>
              </div>
            </div>
          ))}

          <div className="flex items-center gap-3 rounded-2xl p-4 card-glass card-gold-border">
            <Phone size={18} className="text-gold-400" />
            <div>
              <p className="text-white text-sm font-semibold">
                {lang === 'ar' ? 'احجز عبر الهاتف' : 'Book by Phone'}
              </p>
              <a href="tel:+966125717000" className="text-gold-400 text-xs">+966 12 571 7000</a>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
