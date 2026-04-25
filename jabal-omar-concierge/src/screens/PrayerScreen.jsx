import React, { useState, useEffect } from 'react'
import { ArrowLeft, Compass, MapPin } from 'lucide-react'

const PRAYERS = [
  { id: 'fajr',    name: 'Fajr',    nameAr: 'الفجر',   time: '05:12', athan: '05:00', adab: 'Before sunrise — The dawn prayer' },
  { id: 'sunrise', name: 'Sunrise', nameAr: 'الشروق',  time: '06:34', athan: null,    adab: 'Sunrise time — No prayer' },
  { id: 'dhuhr',   name: 'Dhuhr',   nameAr: 'الظهر',   time: '12:19', athan: '12:10', adab: 'After midday — The noon prayer' },
  { id: 'asr',     name: 'Asr',     nameAr: 'العصر',   time: '15:47', athan: '15:37', adab: 'Afternoon — The afternoon prayer' },
  { id: 'maghrib', name: 'Maghrib', nameAr: 'المغرب',  time: '18:38', athan: '18:35', adab: 'After sunset — The sunset prayer' },
  { id: 'isha',    name: 'Isha',    nameAr: 'العشاء',  time: '20:05', athan: '19:55', adab: 'Night — The night prayer' },
]

const NEARBY_MOSQUES = [
  { name: 'Al-Masjid Al-Haram',     nameAr: 'المسجد الحرام',     dist: '2 min walk',   distAr: 'دقيقتان مشياً',    icon: '🕋' },
  { name: 'Sky Mussallah (Address)',  nameAr: 'مصلى السماء (أدريس)', dist: 'In complex',   distAr: 'داخل المجمع',     icon: '🕌' },
  { name: 'Hilton Prayer Hall',       nameAr: 'مصلى هيلتون',        dist: 'In complex',   distAr: 'داخل المجمع',     icon: '🙏' },
  { name: 'Marriott Prayer Room',     nameAr: 'مصلى ماريوت',        dist: 'In complex',   distAr: 'داخل المجمع',     icon: '🙏' },
]

function QiblaCompass({ angle = 0 }) {
  return (
    <div className="relative w-48 h-48 mx-auto">
      {/* Outer ring */}
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background: 'conic-gradient(from 0deg, rgba(212,160,23,0.1), rgba(212,160,23,0.3), rgba(212,160,23,0.1))',
          border: '2px solid rgba(212,160,23,0.3)',
        }}
      />
      {/* Cardinal points */}
      {['N','E','S','W'].map((d, i) => (
        <div
          key={d}
          className="absolute text-[10px] font-bold text-white/30"
          style={{
            top: i === 0 ? 4 : i === 2 ? 'auto' : '50%',
            bottom: i === 2 ? 4 : 'auto',
            left: i === 3 ? 4 : i === 1 ? 'auto' : '50%',
            right: i === 1 ? 4 : 'auto',
            transform: (i === 0 || i === 2) ? 'translateX(-50%)' : 'translateY(-50%)',
          }}
        >
          {d}
        </div>
      ))}
      {/* Needle */}
      <div
        className="absolute inset-0 flex items-center justify-center"
        style={{ transform: `rotate(${angle}deg)`, transition: 'transform 0.5s ease-out' }}
      >
        <div className="relative h-32 flex flex-col items-center">
          <div className="w-0 h-0" style={{
            borderLeft: '5px solid transparent',
            borderRight: '5px solid transparent',
            borderBottom: '50px solid #d4a017',
          }} />
          <div className="w-0 h-0 -mt-0.5" style={{
            borderLeft: '5px solid transparent',
            borderRight: '5px solid transparent',
            borderTop: '50px solid rgba(255,255,255,0.2)',
          }} />
        </div>
      </div>
      {/* Center dot */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-3 h-3 rounded-full bg-gold-500" />
      </div>
      {/* Kaaba icon at top */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2"
        style={{ top: 12 }}
      >
        <span className="text-lg">🕋</span>
      </div>
    </div>
  )
}

export default function PrayerScreen({ lang, navigate }) {
  const [tab, setTab] = useState('times')
  const [now] = useState(new Date())
  const [qiblaAngle] = useState(248) // Approximate Qibla direction from Makkah itself is 0°

  const currentHour = now.getHours()
  const currentMin  = now.getMinutes()
  const currentTime = currentHour * 60 + currentMin

  const getNextPrayer = () => {
    for (const p of PRAYERS) {
      if (!p.athan) continue
      const [h, m] = p.time.split(':').map(Number)
      if (h * 60 + m > currentTime) return p.id
    }
    return 'fajr'
  }
  const nextId = getNextPrayer()

  return (
    <div className="min-h-full pb-6 screen-bg">
      <div className="px-4 pt-12 pb-4">
        <button onClick={() => navigate('home')} className="flex items-center gap-2 mb-4">
          <ArrowLeft size={16} className="text-gold-400" />
          <span className="text-white/50 text-sm">{lang === 'ar' ? 'الرئيسية' : 'Home'}</span>
        </button>
        <h1 className="text-white text-2xl font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>
          {lang === 'ar' ? 'أوقات الصلاة' : 'Prayer Times'}
        </h1>
        <div className="flex items-center gap-1.5 mt-1">
          <MapPin size={11} className="text-gold-400" />
          <span className="text-white/40 text-xs">Makkah Al-Mukarramah</span>
        </div>
      </div>

      {/* Tab switcher */}
      <div className="flex gap-1 mx-4 mb-5 p-1 rounded-2xl" style={{ background: 'rgba(255,255,255,0.05)' }}>
        {[
          { id: 'times', label: 'Prayer Times', labelAr: 'أوقات الصلاة' },
          { id: 'qibla', label: 'Qibla',        labelAr: 'القبلة'        },
          { id: 'nearby',label: 'Nearby Mosques',labelAr: 'المساجد القريبة' },
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className="flex-1 py-2 rounded-xl text-xs font-semibold transition-all"
            style={tab === t.id
              ? { background: '#4ab893', color: '#ffffff' }
              : { color: 'rgba(255,255,255,0.4)' }
            }
          >
            {lang === 'ar' ? t.labelAr : t.label}
          </button>
        ))}
      </div>

      {tab === 'times' && (
        <div className="px-4 space-y-2">
          {/* Date strip */}
          <div
            className="rounded-2xl p-3 mb-4 text-center"
            style={{ background: 'rgba(212,160,23,0.08)', border: '1px solid rgba(212,160,23,0.2)' }}
          >
            <p className="text-gold-400 text-sm font-semibold">
              {now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
            <p className="text-white/30 text-xs mt-0.5">Makkah Al-Mukarramah, Saudi Arabia</p>
          </div>

          {PRAYERS.map(p => {
            const isNext    = p.id === nextId
            const [h, m]    = p.time.split(':').map(Number)
            const isPast    = h * 60 + m < currentTime
            const isSunrise = !p.athan

            return (
              <div
                key={p.id}
                className="rounded-2xl p-4 flex items-center justify-between transition-all"
                style={isNext
                  ? { background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.35)' }
                  : { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }
                }
              >
                <div className="flex items-center gap-3">
                  {isNext && (
                    <div className="w-2 h-2 rounded-full bg-emerald-400 pulse-gold flex-shrink-0" />
                  )}
                  {!isNext && (
                    <div
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ background: isPast ? 'rgba(212,160,23,0.6)' : 'rgba(255,255,255,0.15)' }}
                    />
                  )}
                  <div>
                    <p className={`font-semibold text-sm ${isNext ? 'text-emerald-300' : isPast ? 'text-white/40' : 'text-white'}`}>
                      {lang === 'ar' ? p.nameAr : p.name}
                    </p>
                    {!isSunrise && (
                      <p className="text-white/25 text-[10px] mt-0.5">{p.adab}</p>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-lg font-bold ${isNext ? 'text-emerald-300' : isPast ? 'text-white/30' : 'text-gold-400'}`}>
                    {p.time}
                  </p>
                  {p.athan && (
                    <p className="text-white/25 text-[10px]">
                      {lang === 'ar' ? 'أذان' : 'Athan'} {p.athan}
                    </p>
                  )}
                  {isNext && (
                    <p className="text-emerald-400 text-[10px] font-semibold">
                      {lang === 'ar' ? 'الصلاة القادمة' : 'Up next'}
                    </p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {tab === 'qibla' && (
        <div className="px-4">
          <div
            className="rounded-2xl p-6"
            style={{ background: 'rgba(212,160,23,0.05)', border: '1px solid rgba(212,160,23,0.15)' }}
          >
            <p className="text-center text-white/40 text-xs mb-6 uppercase tracking-widest">
              {lang === 'ar' ? 'اتجاه القبلة' : 'Qibla Direction'}
            </p>
            <QiblaCompass angle={qiblaAngle} />
            <div className="text-center mt-6">
              <p className="text-gold-400 text-2xl font-bold">{qiblaAngle}°</p>
              <p className="text-white/40 text-xs mt-1">
                {lang === 'ar' ? 'من الشمال (في مكة المكرمة = ٠°)' : 'From North (in Makkah itself ≈ 0°)'}
              </p>
            </div>
            <div className="mt-4 flex items-center gap-2 justify-center">
              <div className="w-2 h-2 rounded-full bg-gold-400" />
              <p className="text-white/50 text-xs">
                {lang === 'ar' ? 'القبلة تشير نحو الكعبة المشرفة مباشرة' : 'Qibla faces the Holy Kaaba directly'}
              </p>
            </div>
          </div>
          <p className="text-white/20 text-[10px] text-center mt-4">
            {lang === 'ar'
              ? 'ملاحظة: في مكة المكرمة، تتجه مباشرة نحو الكعبة'
              : 'Note: Within Makkah, face directly toward the Kaaba'
            }
          </p>
        </div>
      )}

      {tab === 'nearby' && (
        <div className="px-4 space-y-3">
          {NEARBY_MOSQUES.map(m => (
            <div
              key={m.name}
              className="rounded-2xl p-4 card-glass card-gold-border flex items-center gap-4"
            >
              <span className="text-3xl">{m.icon}</span>
              <div className="flex-1">
                <p className="text-white font-semibold text-sm">{lang === 'ar' ? m.nameAr : m.name}</p>
                <div className="flex items-center gap-1 mt-1">
                  <MapPin size={10} className="text-gold-400" />
                  <span className="text-white/40 text-xs">{lang === 'ar' ? m.distAr : m.dist}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
