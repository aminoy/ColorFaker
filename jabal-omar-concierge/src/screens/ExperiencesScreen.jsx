import React, { useState } from 'react'
import { ArrowLeft, Clock, Users, Calendar, ChevronRight, Star, MapPin, X } from 'lucide-react'

const EXPERIENCES = [
  {
    id: 'sky',
    title: 'Sky Mussallah',
    titleAr: 'مصلى السماء',
    tagline: 'Pray above the clouds',
    taglineAr: 'صلِّ فوق السحاب',
    desc: 'The highest prayer room in Jabal Omar, offering a breathtaking panoramic view of the Holy Kaaba and Al-Masjid Al-Haram. Accessible via dedicated high-speed elevators from Address Hotel.',
    descAr: 'أعلى مصلى في جبل عمر، يوفر إطلالة بانورامية خلابة على الكعبة المشرفة والمسجد الحرام. يمكن الوصول إليه عبر مصاعد سريعة من فندق أدريس.',
    location: 'Address Jabal Omar Hotel, Top Floor',
    locationAr: 'فندق أدريس جبل عمر، الطابق الأعلى',
    hours: 'All prayer times',
    hoursAr: 'جميع أوقات الصلاة',
    capacity: 500,
    icon: '🕌',
    gradient: 'from-indigo-900 via-purple-900 to-violet-900',
    color: '#818cf8',
    features: ['Panoramic Kaaba View', 'Air-Conditioned', 'Wudu Facilities', 'Separate Sections'],
    featuresAr: ['إطلالة بانورامية على الكعبة', 'مكيف', 'دورات مياه للوضوء', 'أقسام مستقلة'],
    booking: true,
  },
  {
    id: 'museum',
    title: 'Jabal Omar Museum',
    titleAr: 'متحف جبل عمر',
    tagline: 'Explore Makkah\'s sacred heritage',
    taglineAr: 'استكشف التراث المقدس لمكة',
    desc: 'An immersive journey through Makkah\'s history, showcasing the development of the Grand Mosque, Islamic architecture, and the spiritual significance of the holy city.',
    descAr: 'رحلة استكشافية في تاريخ مكة المكرمة، تعرض تطور المسجد الحرام والعمارة الإسلامية والأهمية الروحية للمدينة المقدسة.',
    location: 'Souk Al-Khalil 2, Level 3',
    locationAr: 'سوق الخليل ٢، الطابق الثالث',
    hours: '10:00 AM – 10:00 PM',
    hoursAr: '١٠ صباحاً – ١٠ مساءً',
    capacity: 200,
    icon: '🏛️',
    gradient: 'from-teal-900 via-cyan-900 to-blue-900',
    color: '#22d3ee',
    features: ['Interactive Exhibits', 'Multilingual Audio', 'Photo Gallery', 'Gift Shop'],
    featuresAr: ['معارض تفاعلية', 'صوت متعدد اللغات', 'معرض صور', 'متجر هدايا'],
    booking: false,
  },
  {
    id: 'boulevard',
    title: 'Al-Khalil Boulevard',
    titleAr: 'بوليفارد الخليل',
    tagline: 'Luxury shopping & fine dining promenade',
    taglineAr: 'تسوق فاخر ومطاعم راقية',
    desc: 'An open-air luxury promenade featuring high-end boutiques, signature restaurants, and live entertainment. The heart of social and retail life at Jabal Omar destination.',
    descAr: 'ممشى فاخر مفتوح يضم محلات راقية ومطاعم مميزة وترفيه حي. قلب الحياة الاجتماعية والتجارية في جبل عمر.',
    location: 'Connecting all Jabal Omar Souks',
    locationAr: 'يربط جميع أسواق جبل عمر',
    hours: '9:00 AM – 2:00 AM',
    hoursAr: '٩ صباحاً – ٢ فجراً',
    capacity: 5000,
    icon: '🛍️',
    gradient: 'from-amber-900 via-orange-900 to-yellow-900',
    color: '#fbbf24',
    features: ['Open Air Promenade', 'Luxury Boutiques', 'Fine Dining', 'Entertainment'],
    featuresAr: ['ممشى مفتوح', 'بوتيكات فاخرة', 'مطاعم راقية', 'ترفيه'],
    booking: false,
  },
  {
    id: 'convention',
    title: 'Convention Centre',
    titleAr: 'مركز المؤتمرات',
    tagline: 'World-class events & conferences',
    taglineAr: 'فعاليات ومؤتمرات عالمية المستوى',
    desc: 'State-of-the-art convention facility hosting international conferences, exhibitions, and large-scale events. Equipped with the latest audiovisual technology.',
    descAr: 'مرفق مؤتمرات متطور يستضيف مؤتمرات ومعارض دولية وفعاليات كبرى. مجهز بأحدث التقنيات السمعية والبصرية.',
    location: 'Jabal Omar Tower, Floors 5–10',
    locationAr: 'برج جبل عمر، الطوابق ٥–١٠',
    hours: 'By Booking',
    hoursAr: 'بالحجز المسبق',
    capacity: 2000,
    icon: '🎭',
    gradient: 'from-rose-900 via-pink-900 to-fuchsia-900',
    color: '#f472b6',
    features: ['2000-seat Auditorium', 'Exhibition Halls', 'Breakout Rooms', 'Catering'],
    featuresAr: ['قاعة ٢٠٠٠ مقعد', 'قاعات معارض', 'غرف مساعدة', 'تقديم طعام'],
    booking: true,
  },
]

export default function ExperiencesScreen({ lang, navigate }) {
  const [selected, setSelected] = useState(null)

  if (selected) {
    const e = selected
    return (
      <div className="min-h-full pb-6" style={{ background: '#0f0c07' }}>
        <div className={`relative h-56 bg-gradient-to-br ${e.gradient} flex flex-col items-center justify-center`}>
          <span className="text-6xl mb-2">{e.icon}</span>
          <div className="absolute inset-0" style={{ background: 'linear-gradient(0deg,rgba(15,12,7,1) 0%,transparent 50%)' }} />
          <button
            onClick={() => setSelected(null)}
            className="absolute top-10 left-4 w-9 h-9 rounded-xl card-glass flex items-center justify-center active:scale-90"
          >
            <ArrowLeft size={18} className="text-gold-400" />
          </button>
        </div>
        <div className="px-4 pt-4 space-y-4 pb-6">
          <div>
            <h1 className="text-white text-xl font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>
              {lang === 'ar' ? e.titleAr : e.title}
            </h1>
            <p style={{ color: e.color }} className="text-sm mt-0.5">{lang === 'ar' ? e.taglineAr : e.tagline}</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-xl p-3 card-glass card-gold-border text-center">
              <Clock size={14} style={{ color: e.color }} className="mx-auto mb-1" />
              <p className="text-white/40 text-[10px]">{lang === 'ar' ? 'المواعيد' : 'Hours'}</p>
              <p className="text-white text-[11px] font-medium mt-0.5">{lang === 'ar' ? e.hoursAr : e.hours}</p>
            </div>
            <div className="rounded-xl p-3 card-glass card-gold-border text-center">
              <Users size={14} style={{ color: e.color }} className="mx-auto mb-1" />
              <p className="text-white/40 text-[10px]">{lang === 'ar' ? 'السعة' : 'Capacity'}</p>
              <p className="text-white text-[11px] font-medium mt-0.5">{e.capacity.toLocaleString()}</p>
            </div>
            <div className="rounded-xl p-3 card-glass card-gold-border text-center">
              <MapPin size={14} style={{ color: e.color }} className="mx-auto mb-1" />
              <p className="text-white/40 text-[10px]">{lang === 'ar' ? 'الموقع' : 'Location'}</p>
              <p className="text-white text-[11px] font-medium mt-0.5 leading-tight">{lang === 'ar' ? e.locationAr : e.location}</p>
            </div>
          </div>

          <p className="text-white/60 text-sm leading-relaxed">{lang === 'ar' ? e.descAr : e.desc}</p>

          <div>
            <p className="text-white/40 text-xs font-semibold uppercase tracking-widest mb-2">
              {lang === 'ar' ? 'المميزات' : 'Features'}
            </p>
            <div className="grid grid-cols-2 gap-2">
              {(lang === 'ar' ? e.featuresAr : e.features).map((f, i) => (
                <div key={i} className="flex items-center gap-2 rounded-xl p-2.5 card-glass">
                  <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: e.color }} />
                  <span className="text-white/60 text-xs">{f}</span>
                </div>
              ))}
            </div>
          </div>

          {e.booking && (
            <button
              className="w-full py-3.5 rounded-xl font-semibold text-sm active:scale-95 transition-all"
              style={{ background: e.color, color: '#0f0c07' }}
            >
              {lang === 'ar' ? 'احجز تجربتك الآن' : 'Book Your Experience'}
            </button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-full pb-6" style={{ background: '#0f0c07' }}>
      <div className="px-4 pt-12 pb-4">
        <button onClick={() => navigate('home')} className="flex items-center gap-2 mb-4">
          <ArrowLeft size={16} className="text-gold-400" />
          <span className="text-white/50 text-sm">{lang === 'ar' ? 'الرئيسية' : 'Home'}</span>
        </button>
        <h1 className="text-white text-2xl font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>
          {lang === 'ar' ? 'التجارب والمعالم' : 'Experiences & Attractions'}
        </h1>
        <p className="text-white/40 text-sm mt-1">
          {lang === 'ar' ? 'اكتشف ما يميز جبل عمر' : 'Discover what makes Jabal Omar unique'}
        </p>
      </div>

      <div className="px-4 space-y-4">
        {EXPERIENCES.map(e => (
          <button
            key={e.id}
            onClick={() => setSelected(e)}
            className="w-full rounded-2xl overflow-hidden text-left active:scale-98 transition-all"
            style={{ border: `1px solid ${e.color}25` }}
          >
            <div className={`h-36 bg-gradient-to-br ${e.gradient} flex items-center justify-center relative`}>
              <span className="text-6xl">{e.icon}</span>
              {e.booking && (
                <div
                  className="absolute top-3 right-3 text-[10px] font-bold px-2 py-1 rounded-full text-black"
                  style={{ background: e.color }}
                >
                  {lang === 'ar' ? 'يتطلب حجز' : 'Bookable'}
                </div>
              )}
            </div>
            <div className="p-4" style={{ background: 'rgba(255,255,255,0.03)' }}>
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-white font-semibold text-base">
                    {lang === 'ar' ? e.titleAr : e.title}
                  </h3>
                  <p className="text-xs mt-0.5" style={{ color: e.color }}>{lang === 'ar' ? e.taglineAr : e.tagline}</p>
                </div>
                <ChevronRight size={16} className="text-white/20 mt-1" />
              </div>
              <div className="flex items-center gap-3 mt-3">
                <div className="flex items-center gap-1">
                  <Clock size={10} style={{ color: e.color }} />
                  <span className="text-white/30 text-[10px]">{lang === 'ar' ? e.hoursAr : e.hours}</span>
                </div>
                <div className="flex items-center gap-1">
                  <MapPin size={10} style={{ color: e.color }} />
                  <span className="text-white/30 text-[10px]">
                    {(lang === 'ar' ? e.locationAr : e.location).split(',')[0]}
                  </span>
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
