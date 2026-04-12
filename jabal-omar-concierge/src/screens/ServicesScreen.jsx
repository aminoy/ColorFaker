import React from 'react'
import { ArrowLeft, CreditCard, Stethoscope, Car, Wifi, PhoneCall, ShieldCheck, Baby, MapPin, Phone, ChevronRight } from 'lucide-react'

const SERVICE_SECTIONS = [
  {
    title: 'Banking & Finance',
    titleAr: 'البنوك والمال',
    items: [
      {
        icon: CreditCard, color: '#10b981',
        title: 'Al Rajhi ATMs',    titleAr: 'صرافات الراجحي',
        desc:  'Available in all Jabal Omar hotels and shopping centres',
        descAr:'متوفرة في جميع فنادق وأسواق جبل عمر',
        badge: '24/7', badgeColor: '#10b981',
      },
      {
        icon: ShieldCheck, color: '#0ea5e9',
        title: 'Currency Exchange', titleAr: 'صرف العملات',
        desc:  'Multiple exchange booths throughout the complex',
        descAr:'أكشاك صرف متعددة في جميع أنحاء المجمع',
      },
    ],
  },
  {
    title: 'Medical & Health',
    titleAr: 'الطب والصحة',
    items: [
      {
        icon: Stethoscope, color: '#ef4444',
        title: 'Jabal Omar Hospital', titleAr: 'مستشفى جبل عمر',
        desc:  'Full-service hospital with multiple specialties & 24/7 emergency',
        descAr:'مستشفى متكامل بتخصصات متعددة وطوارئ ٢٤ ساعة',
        badge: 'Emergency', badgeColor: '#ef4444',
        phone: '+966 12 571 5050',
      },
      {
        icon: PhoneCall, color: '#f59e0b',
        title: 'First Aid Stations', titleAr: 'نقاط الإسعافات الأولية',
        desc:  'Located throughout the complex for immediate medical assistance',
        descAr:'منتشرة في جميع أنحاء المجمع للمساعدة الطبية الفورية',
        badge: '20+ Locations', badgeColor: '#f59e0b',
      },
    ],
  },
  {
    title: 'Connectivity',
    titleAr: 'الاتصالات',
    items: [
      {
        icon: Wifi, color: '#6366f1',
        title: 'Free Wi-Fi',        titleAr: 'واي فاي مجاني',
        desc:  'High-speed internet throughout hotels and shopping areas',
        descAr:'إنترنت عالي السرعة في الفنادق ومناطق التسوق',
        badge: 'Free',  badgeColor: '#6366f1',
      },
    ],
  },
  {
    title: 'Family & Accessibility',
    titleAr: 'العائلة وذوو الاحتياجات',
    items: [
      {
        icon: Baby, color: '#ec4899',
        title: 'Family Lounges',    titleAr: 'صالات العائلات',
        desc:  'Dedicated nursing rooms and family rest areas',
        descAr:'غرف رضاعة وأماكن راحة مخصصة للعائلات',
      },
      {
        icon: Car, color: '#8b5cf6',
        title: 'Accessibility Services', titleAr: 'خدمات ذوي الاحتياجات',
        desc:  'Wheelchair rental, electric carriage and priority access',
        descAr:'تأجير كراسي متحركة وعربة كهربائية وأولوية الوصول',
      },
    ],
  },
]

export default function ServicesScreen({ lang, navigate }) {
  return (
    <div className="min-h-full pb-6" style={{ background: '#0f0c07' }}>
      <div className="px-4 pt-12 pb-4">
        <button onClick={() => navigate('home')} className="flex items-center gap-2 mb-4">
          <ArrowLeft size={16} className="text-gold-400" />
          <span className="text-white/50 text-sm">{lang === 'ar' ? 'الرئيسية' : 'Home'}</span>
        </button>
        <h1 className="text-white text-2xl font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>
          {lang === 'ar' ? 'الخدمات' : 'Services'}
        </h1>
        <p className="text-white/40 text-sm mt-1">
          {lang === 'ar' ? 'كل ما تحتاجه في مكان واحد' : 'Everything you need, all in one place'}
        </p>
      </div>

      <div className="px-4 space-y-5">
        {SERVICE_SECTIONS.map(section => (
          <div key={section.title}>
            <p className="text-white/40 text-xs font-semibold uppercase tracking-widest mb-3">
              {lang === 'ar' ? section.titleAr : section.title}
            </p>
            <div className="space-y-2">
              {section.items.map(item => (
                <div
                  key={item.title}
                  className="rounded-2xl p-4 card-glass card-gold-border"
                >
                  <div className="flex items-start gap-3">
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: `${item.color}18` }}
                    >
                      <item.icon size={20} style={{ color: item.color }} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="text-white font-semibold text-sm">
                          {lang === 'ar' ? item.titleAr : item.title}
                        </h3>
                        {item.badge && (
                          <span
                            className="text-[9px] font-bold px-2 py-0.5 rounded-full"
                            style={{ background: `${item.badgeColor}20`, color: item.badgeColor }}
                          >
                            {item.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-white/40 text-xs mt-0.5 leading-relaxed">
                        {lang === 'ar' ? item.descAr : item.desc}
                      </p>
                      {item.phone && (
                        <a
                          href={`tel:${item.phone}`}
                          className="flex items-center gap-1.5 mt-2"
                        >
                          <Phone size={11} style={{ color: item.color }} />
                          <span className="text-xs" style={{ color: item.color }}>{item.phone}</span>
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Emergency strip */}
        <button
          onClick={() => navigate('emergency')}
          className="w-full rounded-2xl p-4 flex items-center justify-between active:scale-95 transition-all"
          style={{
            background: 'linear-gradient(135deg,rgba(239,68,68,0.12),rgba(239,68,68,0.06))',
            border: '1px solid rgba(239,68,68,0.3)',
          }}
        >
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-red-500/20 flex items-center justify-center">
              <PhoneCall size={20} className="text-red-400" />
            </div>
            <div className="text-left">
              <p className="text-white font-semibold text-sm">
                {lang === 'ar' ? 'الطوارئ والمساعدة' : 'Emergency & Assistance'}
              </p>
              <p className="text-white/40 text-xs">
                {lang === 'ar' ? 'أرقام الطوارئ وخطوط المساعدة' : 'Emergency numbers & helplines'}
              </p>
            </div>
          </div>
          <ChevronRight size={16} className="text-red-400" />
        </button>
      </div>
    </div>
  )
}
