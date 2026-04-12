import React, { useState } from 'react'
import {
  User, Globe, Bell, Shield, Phone, Star, ChevronRight,
  Moon, Wifi, MessageSquare, LogOut, Building2, Heart
} from 'lucide-react'

const MENU_ITEMS = [
  {
    section: 'Account',      sectionAr: 'الحساب',
    items: [
      { icon: User,          label: 'Guest Profile',     labelAr: 'ملف الضيف',         color: '#d4a017' },
      { icon: Building2,     label: 'My Hotel',          labelAr: 'فندقي',              color: '#6366f1' },
      { icon: Heart,         label: 'Saved Places',      labelAr: 'الأماكن المحفوظة',    color: '#ef4444' },
    ],
  },
  {
    section: 'Preferences',  sectionAr: 'التفضيلات',
    items: [
      { icon: Globe,         label: 'Language',          labelAr: 'اللغة',              color: '#0ea5e9', toggle: true },
      { icon: Bell,          label: 'Notifications',     labelAr: 'الإشعارات',           color: '#f59e0b', toggle: true },
      { icon: Moon,          label: 'Dark Mode',         labelAr: 'الوضع الليلي',        color: '#818cf8', toggle: true },
    ],
  },
  {
    section: 'Support',      sectionAr: 'الدعم',
    items: [
      { icon: MessageSquare, label: 'Concierge Chat',    labelAr: 'دردشة الكونسيرج',    color: '#10b981' },
      { icon: Phone,         label: 'Call Front Desk',   labelAr: 'الاتصال بالاستقبال', color: '#d4a017' },
      { icon: Shield,        label: 'Privacy Policy',    labelAr: 'سياسة الخصوصية',    color: '#6b7280' },
    ],
  },
]

export default function ProfileScreen({ lang, setLang, navigate }) {
  const [toggles, setToggles] = useState({ Notifications: true, 'Dark Mode': true })

  const flip = (label) => setToggles(t => ({ ...t, [label]: !t[label] }))

  return (
    <div className="min-h-full pb-6" style={{ background: '#0f0c07' }}>
      <div className="px-4 pt-12 pb-6">
        <h1 className="text-white text-2xl font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>
          {lang === 'ar' ? 'الملف الشخصي' : 'Profile & Settings'}
        </h1>
      </div>

      {/* Guest card */}
      <div
        className="mx-4 mb-6 rounded-2xl p-5"
        style={{ background: 'linear-gradient(135deg,rgba(212,160,23,0.12),rgba(212,160,23,0.04))', border: '1px solid rgba(212,160,23,0.25)' }}
      >
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-gold-500/20 border-2 border-gold-500/40 flex items-center justify-center">
            <User size={24} className="text-gold-400" />
          </div>
          <div>
            <p className="text-white font-semibold">{lang === 'ar' ? 'ضيف مميز' : 'Valued Guest'}</p>
            <p className="text-white/40 text-xs mt-0.5">Jabal Omar Concierge+</p>
            <div className="flex items-center gap-1 mt-1.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} size={10} className="text-gold-400 fill-gold-400" />
              ))}
              <span className="text-gold-400 text-[10px] ml-1">VIP Guest</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick stats */}
      <div className="flex gap-2 px-4 mb-6">
        {[
          { label: 'Requests',  labelAr: 'طلبات',    value: '3' },
          { label: 'Bookings',  labelAr: 'حجوزات',   value: '1' },
          { label: 'Points',    labelAr: 'نقاط',      value: '240' },
        ].map(s => (
          <div key={s.label} className="flex-1 rounded-2xl p-3 card-glass card-gold-border text-center">
            <p className="text-gold-400 font-bold text-lg">{s.value}</p>
            <p className="text-white/30 text-[10px]">{lang === 'ar' ? s.labelAr : s.label}</p>
          </div>
        ))}
      </div>

      {/* Menu sections */}
      <div className="px-4 space-y-5">
        {MENU_ITEMS.map(section => (
          <div key={section.section}>
            <p className="text-white/40 text-xs font-semibold uppercase tracking-widest mb-3">
              {lang === 'ar' ? section.sectionAr : section.section}
            </p>
            <div className="space-y-1.5">
              {section.items.map(item => (
                <button
                  key={item.label}
                  onClick={() => {
                    if (item.label === 'Language') { setLang(l => l === 'en' ? 'ar' : 'en'); return }
                    if (item.label === 'Concierge Chat') { navigate('concierge'); return }
                    if (item.toggle) flip(item.label)
                  }}
                  className="w-full flex items-center gap-3 rounded-2xl p-3.5 active:scale-98 transition-all card-glass card-gold-border"
                >
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: `${item.color}18` }}
                  >
                    <item.icon size={17} style={{ color: item.color }} />
                  </div>
                  <span className="flex-1 text-white text-sm text-left">
                    {lang === 'ar' ? item.labelAr : item.label}
                    {item.label === 'Language' && (
                      <span className="ml-2 text-white/30 text-xs">({lang === 'en' ? 'English' : 'العربية'})</span>
                    )}
                  </span>
                  {item.toggle && item.label !== 'Language'
                    ? (
                      <div
                        className="w-10 h-5.5 rounded-full transition-all flex items-center px-0.5"
                        style={{
                          background: toggles[item.label] ? item.color : 'rgba(255,255,255,0.1)',
                          width: 40, height: 22,
                        }}
                      >
                        <div
                          className="w-4 h-4 rounded-full bg-white shadow transition-all"
                          style={{ transform: `translateX(${toggles[item.label] ? 18 : 0}px)` }}
                        />
                      </div>
                    )
                    : <ChevronRight size={14} className="text-white/20" />
                  }
                </button>
              ))}
            </div>
          </div>
        ))}

        {/* App info */}
        <div className="text-center pt-2">
          <p
            className="text-2xl font-bold"
            style={{ fontFamily: "'Playfair Display', serif", color: 'rgba(212,160,23,0.4)' }}
          >
            JABAL OMAR
          </p>
          <p className="text-white/20 text-xs tracking-widest">CONCIERGE+ v1.0.0</p>
          <p className="text-white/10 text-[10px] mt-1">© 2024 Jabal Omar Development Company</p>
        </div>
      </div>
    </div>
  )
}
