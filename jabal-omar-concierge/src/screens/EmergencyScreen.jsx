import React from 'react'
import { ArrowLeft, Phone, AlertTriangle, Heart, Shield, Stethoscope, Flame, MapPin } from 'lucide-react'

const EMERGENCY_NUMBERS = [
  {
    icon: Stethoscope, color: '#ef4444',
    label: 'Medical Emergency',  labelAr: 'طوارئ طبية',
    number: '911',
    desc: 'Saudi Emergency Services', descAr: 'خدمات الطوارئ السعودية',
    urgent: true,
  },
  {
    icon: Flame, color: '#f97316',
    label: 'Fire Department',    labelAr: 'المطافئ',
    number: '998',
    desc: 'Saudi Civil Defense',     descAr: 'الدفاع المدني السعودي',
  },
  {
    icon: Shield, color: '#6366f1',
    label: 'Police',             labelAr: 'الشرطة',
    number: '999',
    desc: 'Saudi Police',            descAr: 'شرطة المملكة',
  },
  {
    icon: Heart, color: '#d4a017',
    label: 'Jabal Omar Security',labelAr: 'أمن جبل عمر',
    number: '+966 12 571 5000',
    desc: '24/7 On-site Security',   descAr: 'أمن داخلي ٢٤/٧',
  },
  {
    icon: Stethoscope, color: '#10b981',
    label: 'Jabal Omar Hospital', labelAr: 'مستشفى جبل عمر',
    number: '+966 12 571 5050',
    desc: 'Full medical services',   descAr: 'خدمات طبية متكاملة',
  },
  {
    icon: Phone, color: '#0ea5e9',
    label: 'Guest Services',     labelAr: 'خدمة الضيوف',
    number: '+966 12 571 5100',
    desc: 'Round-the-clock assistance', descAr: 'مساعدة على مدار الساعة',
  },
]

const FIRST_AID_STATIONS = [
  { loc: 'Souk Al-Khalil 1, Ground Floor',     locAr: 'سوق الخليل ١، الطابق الأرضي'     },
  { loc: 'Souk Al-Khalil 2, Level 2',          locAr: 'سوق الخليل ٢، الطابق الثاني'     },
  { loc: 'Souk Al-Khalil 3, Food Court Level', locAr: 'سوق الخليل ٣، طابق الفود كورت'  },
  { loc: 'Al-Khalil Boulevard, East Entrance', locAr: 'بوليفارد الخليل، المدخل الشرقي'  },
  { loc: 'Parking B1, Near Elevator',          locAr: 'موقف B1، قرب المصعد'             },
]

export default function EmergencyScreen({ lang, navigate }) {
  return (
    <div className="min-h-full pb-6 screen-bg">
      {/* Header */}
      <div
        className="px-4 pt-12 pb-4"
        style={{ background: 'linear-gradient(180deg,rgba(239,68,68,0.12) 0%,transparent 100%)' }}
      >
        <button onClick={() => navigate('home')} className="flex items-center gap-2 mb-4">
          <ArrowLeft size={16} className="text-red-400" />
          <span className="text-white/50 text-sm">{lang === 'ar' ? 'الرئيسية' : 'Home'}</span>
        </button>
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-red-500/20 flex items-center justify-center">
            <AlertTriangle size={22} className="text-red-400" />
          </div>
          <div>
            <h1 className="text-white text-2xl font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>
              {lang === 'ar' ? 'الطوارئ' : 'Emergency'}
            </h1>
            <p className="text-red-400 text-xs">{lang === 'ar' ? 'اتصل فوراً في حالات الخطر' : 'Call immediately in danger'}</p>
          </div>
        </div>
      </div>

      <div className="px-4 space-y-5">
        {/* Saudi National Emergency 911 — big CTA */}
        <a
          href="tel:911"
          className="w-full rounded-2xl p-5 flex items-center gap-4 active:scale-95 transition-all"
          style={{
            background: 'linear-gradient(135deg,rgba(239,68,68,0.2),rgba(239,68,68,0.08))',
            border: '2px solid rgba(239,68,68,0.5)',
          }}
        >
          <div className="w-14 h-14 rounded-2xl bg-red-500/20 flex items-center justify-center flex-shrink-0">
            <Phone size={28} className="text-red-400" />
          </div>
          <div>
            <p className="text-red-300 text-xs font-semibold uppercase tracking-widest">
              {lang === 'ar' ? 'الطوارئ الوطنية' : 'National Emergency'}
            </p>
            <p className="text-white text-4xl font-black">911</p>
            <p className="text-white/40 text-xs">
              {lang === 'ar' ? 'اضغط للاتصال' : 'Tap to call'}
            </p>
          </div>
        </a>

        {/* Contact list */}
        <div>
          <p className="text-white/40 text-xs font-semibold uppercase tracking-widest mb-3">
            {lang === 'ar' ? 'أرقام الطوارئ' : 'Emergency Contacts'}
          </p>
          <div className="space-y-2">
            {EMERGENCY_NUMBERS.map(e => (
              <a
                key={e.label}
                href={`tel:${e.number}`}
                className="flex items-center gap-3 rounded-2xl p-4 active:scale-98 transition-all"
                style={{
                  background: `${e.color}0a`,
                  border: `1px solid ${e.color}${e.urgent ? '50' : '20'}`,
                }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: `${e.color}20` }}
                >
                  <e.icon size={18} style={{ color: e.color }} />
                </div>
                <div className="flex-1">
                  <p className="text-white font-semibold text-sm">{lang === 'ar' ? e.labelAr : e.label}</p>
                  <p className="text-white/30 text-xs">{lang === 'ar' ? e.descAr : e.desc}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-sm" style={{ color: e.color }}>{e.number}</p>
                  <Phone size={12} style={{ color: e.color, marginLeft: 'auto', marginTop: 4 }} />
                </div>
              </a>
            ))}
          </div>
        </div>

        {/* First Aid Stations */}
        <div>
          <p className="text-white/40 text-xs font-semibold uppercase tracking-widest mb-3">
            {lang === 'ar' ? 'نقاط الإسعافات الأولية' : 'First Aid Stations'}
          </p>
          <div className="space-y-2">
            {FIRST_AID_STATIONS.map((s, i) => (
              <div key={i} className="flex items-center gap-3 rounded-xl p-3 card-glass card-gold-border">
                <div className="w-6 h-6 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-red-400 text-xs font-bold">+</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <MapPin size={10} className="text-red-400" />
                  <span className="text-white/60 text-xs">{lang === 'ar' ? s.locAr : s.loc}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Safety tips */}
        <div
          className="rounded-2xl p-4"
          style={{ background: 'rgba(212,160,23,0.06)', border: '1px solid rgba(212,160,23,0.15)' }}
        >
          <p className="text-gold-400 font-semibold text-sm mb-2">
            {lang === 'ar' ? 'نصائح السلامة' : 'Safety Tips'}
          </p>
          {[
            { en: 'Stay hydrated — drink water regularly', ar: 'حافظ على ترطيب جسمك — اشرب الماء بانتظام' },
            { en: 'Wear comfortable, breathable clothing',  ar: 'ارتدِ ملابس مريحة وقابلة للتنفس'          },
            { en: 'Keep your hotel key card accessible',    ar: 'احتفظ ببطاقة الفندق في متناول يدك'       },
            { en: 'Know your hotel address and floor',      ar: 'احفظ عنوان فندقك وطابقك'                 },
          ].map((t, i) => (
            <div key={i} className="flex items-start gap-2 mt-2">
              <div className="w-1.5 h-1.5 rounded-full bg-gold-500 flex-shrink-0 mt-1.5" />
              <p className="text-white/50 text-xs leading-relaxed">{lang === 'ar' ? t.ar : t.en}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
