import React, { useState } from 'react'
import { ArrowLeft, Star, MapPin, Phone, Wifi, Car, UtensilsCrossed, ChevronRight, Check } from 'lucide-react'

const HOTELS = [
  {
    id: 'hyatt',
    name: 'Jabal Omar Hyatt Regency',
    nameAr: 'هيات ريجنسي جبل عمر',
    stars: 5,
    tagline: 'First line, King Fahd Gate',
    taglineAr: 'الصف الأول، باب الملك فهد',
    desc: 'Located directly in front of the King Fahd Gate, offering effortless access to Al Kaaba and Al-Masjid Al-Haram.',
    descAr: 'يقع مباشرةً أمام باب الملك فهد، مع سهولة الوصول إلى الكعبة المشرفة والمسجد الحرام.',
    distance: '0 min walk to Haram',
    distanceAr: 'مباشرة على المسجد الحرام',
    rooms: 674,
    phone: '+966 12 571 1234',
    amenities: ['Free Wi-Fi', 'Parking', 'Restaurant', 'Fitness Centre', 'Prayer Room', 'Business Centre'],
    amenitiesAr: ['واي فاي', 'موقف', 'مطعم', 'مركز لياقة', 'مصلى', 'مركز أعمال'],
    color: '#d4a017',
    gradient: 'from-amber-900/60 to-yellow-900/40',
    icon: '🏨',
  },
  {
    id: 'marriott',
    name: 'Jabal Omar Marriott',
    nameAr: 'ماريوت جبل عمر',
    stars: 5,
    tagline: '3-min walk to Grand Mosque',
    taglineAr: 'دقيقتان مشياً من الحرام',
    desc: 'Premier hotel just a three-minute walk from the Grand Mosque, offering 426 elegant rooms and 52 suites with stunning Haram views.',
    descAr: 'فندق متميز يبعد ثلاث دقائق مشياً عن المسجد الحرام، يضم ٤٢٦ غرفة أنيقة و٥٢ جناحاً.',
    distance: '3 min walk to Haram',
    distanceAr: '٣ دقائق مشياً إلى الحرام',
    rooms: 478,
    phone: '+966 12 571 5000',
    amenities: ['Free Wi-Fi', 'Valet Parking', '2 Restaurants', 'Rooftop Pool', 'Prayer Room', 'Spa'],
    amenitiesAr: ['واي فاي', 'صف سيارات', 'مطعمان', 'مسبح السطح', 'مصلى', 'سبا'],
    color: '#ef4444',
    gradient: 'from-red-900/60 to-rose-900/40',
    icon: '🏩',
  },
  {
    id: 'address',
    name: 'Address Jabal Omar',
    nameAr: 'أدريس جبل عمر',
    stars: 5,
    tagline: 'Sky Mussallah — Kaaba panoramic view',
    taglineAr: 'مصلى السماء — إطلالة بانورامية على الكعبة',
    desc: 'Features the iconic Sky Mussallah, the highest prayer room with a breathtaking panoramic view of the Holy Kaaba. A 7-minute walk from the Haram.',
    descAr: 'يضم مصلى السماء الشهير، أعلى مصلى مع إطلالة بانورامية خلابة على الكعبة المشرفة.',
    distance: '7 min walk to Haram',
    distanceAr: '٧ دقائق مشياً إلى الحرام',
    rooms: 810,
    phone: '+966 12 571 8888',
    amenities: ['Sky Mussallah', 'Free Wi-Fi', 'Multiple Restaurants', 'Infinity Pool', 'Spa', 'Kids Club'],
    amenitiesAr: ['مصلى السماء', 'واي فاي', 'مطاعم متعددة', 'مسبح لانهائي', 'سبا', 'نادي أطفال'],
    color: '#6366f1',
    gradient: 'from-indigo-900/60 to-purple-900/40',
    icon: '🏰',
  },
  {
    id: 'hilton',
    name: 'Hilton Suites Jabal Omar',
    nameAr: 'هيلتون سويتس جبل عمر',
    stars: 5,
    tagline: 'Connected to Jabal Omar Mall',
    taglineAr: 'متصل بمول جبل عمر',
    desc: 'Directly connected to the shopping and dining at Jabal Omar Mall. Features five restaurants and a prayer hall with Grand Mosque views.',
    descAr: 'متصل مباشرة بتسوق ومطاعم مول جبل عمر، يضم خمسة مطاعم ومصلى مع إطلالة على الحرام.',
    distance: '5 min walk to Haram',
    distanceAr: '٥ دقائق مشياً إلى الحرام',
    rooms: 553,
    phone: '+966 12 571 6000',
    amenities: ['Mall Access', 'Free Wi-Fi', '5 Restaurants', 'Prayer Hall', 'Gym', 'Concierge'],
    amenitiesAr: ['وصول مول', 'واي فاي', '٥ مطاعم', 'قاعة صلاة', 'صالة رياضية', 'كونسيرج'],
    color: '#0ea5e9',
    gradient: 'from-sky-900/60 to-blue-900/40',
    icon: '🏙️',
  },
  {
    id: 'jumeirah',
    name: 'Jumeirah Jabal Omar',
    nameAr: 'جميرا جبل عمر',
    stars: 5,
    tagline: 'Luxury panoramic rooms',
    taglineAr: 'غرف فاخرة بإطلالات بانورامية',
    desc: 'Celebrated for its luxurious amenities including spacious rooms, diverse dining options, and excellent prayer facilities with stunning Grand Mosque views.',
    descAr: 'يشتهر بمرافقه الفاخرة، غرفه الواسعة، خيارات الطعام المتنوعة ومرافق الصلاة المتميزة.',
    distance: '8 min walk to Haram',
    distanceAr: '٨ دقائق مشياً إلى الحرام',
    rooms: 1028,
    phone: '+966 12 571 9900',
    amenities: ['Free Wi-Fi', 'Panoramic Pool', '6 Restaurants', 'Luxury Spa', 'Prayer Rooms', 'Butler Service'],
    amenitiesAr: ['واي فاي', 'مسبح بانورامي', '٦ مطاعم', 'سبا فاخر', 'مصليات', 'خدمة بتلر'],
    color: '#10b981',
    gradient: 'from-emerald-900/60 to-teal-900/40',
    icon: '🌟',
  },
]

export default function HotelsScreen({ lang, navigate }) {
  const [selected, setSelected] = useState(null)

  if (selected) {
    const h = selected
    return (
      <div className="min-h-full pb-6" style={{ background: '#0f0c07' }}>
        {/* Hero */}
        <div className={`relative h-52 bg-gradient-to-br ${h.gradient} flex items-center justify-center`}>
          <span className="text-7xl">{h.icon}</span>
          <div className="absolute inset-0" style={{ background: 'linear-gradient(0deg,rgba(15,12,7,1) 0%,transparent 60%)' }} />
          <button
            onClick={() => setSelected(null)}
            className="absolute top-10 left-4 w-9 h-9 rounded-xl card-glass flex items-center justify-center active:scale-90"
          >
            <ArrowLeft size={18} className="text-gold-400" />
          </button>
          <div className="absolute bottom-4 left-4 right-4">
            <div className="flex">
              {Array.from({ length: h.stars }).map((_, i) => (
                <Star key={i} size={10} className="text-gold-400 fill-gold-400" />
              ))}
            </div>
            <h1 className="text-white text-xl font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>
              {lang === 'ar' ? h.nameAr : h.name}
            </h1>
          </div>
        </div>

        <div className="px-4 pt-4 space-y-4">
          {/* Info row */}
          <div className="flex gap-3">
            <div className="flex-1 rounded-2xl p-3 card-glass card-gold-border text-center">
              <p className="text-gold-400 font-bold text-lg">{h.rooms}</p>
              <p className="text-white/40 text-[10px]">{lang === 'ar' ? 'غرفة' : 'Rooms'}</p>
            </div>
            <div className="flex-1 rounded-2xl p-3 card-glass card-gold-border text-center">
              <p className="text-gold-400 font-bold text-lg">{h.stars}★</p>
              <p className="text-white/40 text-[10px]">{lang === 'ar' ? 'نجوم' : 'Stars'}</p>
            </div>
            <div className="flex-1 rounded-2xl p-3 card-glass card-gold-border text-center">
              <MapPin size={14} className="text-gold-400 mx-auto mb-0.5" />
              <p className="text-white/40 text-[10px]">{lang === 'ar' ? h.distanceAr : h.distance}</p>
            </div>
          </div>

          {/* Description */}
          <p className="text-white/60 text-sm leading-relaxed">
            {lang === 'ar' ? h.descAr : h.desc}
          </p>

          {/* Amenities */}
          <div>
            <p className="text-white/40 text-xs font-semibold uppercase tracking-widest mb-3">
              {lang === 'ar' ? 'المرافق' : 'Amenities'}
            </p>
            <div className="grid grid-cols-2 gap-2">
              {(lang === 'ar' ? h.amenitiesAr : h.amenities).map((a, i) => (
                <div key={i} className="flex items-center gap-2 rounded-xl p-2.5 card-glass">
                  <Check size={12} style={{ color: h.color }} />
                  <span className="text-white/70 text-xs">{a}</span>
                </div>
              ))}
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              className="flex-1 py-3 rounded-xl font-semibold text-sm active:scale-95 transition-all"
              style={{ background: h.color, color: '#0f0c07' }}
            >
              {lang === 'ar' ? 'احجز الآن' : 'Book Now'}
            </button>
            <a
              href={`tel:${h.phone}`}
              className="w-12 h-12 rounded-xl flex items-center justify-center card-glass card-gold-border active:scale-95 transition-all"
            >
              <Phone size={18} className="text-gold-400" />
            </a>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-full pb-6" style={{ background: '#0f0c07' }}>
      {/* Header */}
      <div className="px-4 pt-12 pb-4">
        <button onClick={() => navigate('home')} className="flex items-center gap-2 mb-4">
          <ArrowLeft size={16} className="text-gold-400" />
          <span className="text-white/50 text-sm">{lang === 'ar' ? 'الرئيسية' : 'Home'}</span>
        </button>
        <h1 className="text-white text-2xl font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>
          {lang === 'ar' ? 'فنادق جبل عمر' : 'Jabal Omar Hotels'}
        </h1>
        <p className="text-white/40 text-sm mt-1">
          {lang === 'ar' ? '٥ فنادق فاخرة بالقرب من الحرام الشريف' : '5 luxury hotels near Al-Masjid Al-Haram'}
        </p>
      </div>

      {/* Distance banner */}
      <div className="mx-4 mb-4 rounded-2xl p-3 flex items-center gap-3"
        style={{ background: 'rgba(212,160,23,0.08)', border: '1px solid rgba(212,160,23,0.2)' }}>
        <MapPin size={16} className="text-gold-400 flex-shrink-0" />
        <p className="text-white/60 text-xs leading-relaxed">
          {lang === 'ar'
            ? 'جميع الفنادق تقع ضمن ٨ دقائق مشياً من المسجد الحرام'
            : 'All hotels within 8 minutes walking distance from Al-Masjid Al-Haram'}
        </p>
      </div>

      {/* Hotel List */}
      <div className="px-4 space-y-3">
        {HOTELS.map(h => (
          <button
            key={h.id}
            onClick={() => setSelected(h)}
            className="w-full rounded-2xl overflow-hidden active:scale-98 transition-all text-left"
            style={{ border: `1px solid ${h.color}25`, background: 'rgba(255,255,255,0.03)' }}
          >
            <div className={`h-24 bg-gradient-to-br ${h.gradient} flex items-center justify-center relative`}>
              <span className="text-5xl">{h.icon}</span>
              <div className="absolute top-3 right-3 bg-black/40 rounded-full px-2 py-0.5 flex items-center gap-0.5">
                {Array.from({ length: h.stars }).map((_, i) => (
                  <Star key={i} size={8} className="text-gold-400 fill-gold-400" />
                ))}
              </div>
            </div>
            <div className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-white font-semibold text-base">
                    {lang === 'ar' ? h.nameAr : h.name}
                  </h3>
                  <p className="text-white/40 text-xs mt-0.5">{lang === 'ar' ? h.taglineAr : h.tagline}</p>
                </div>
                <div className="flex items-center gap-1 mt-0.5">
                  <MapPin size={10} style={{ color: h.color }} />
                  <span className="text-[10px]" style={{ color: h.color }}>
                    {h.distance.split(' ')[0]} {h.distance.split(' ')[1]}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 mt-3">
                {[Wifi, Car, UtensilsCrossed].map((Icon, i) => (
                  <div key={i} className="flex items-center gap-1 rounded-full px-2 py-1"
                    style={{ background: `${h.color}15` }}>
                    <Icon size={10} style={{ color: h.color }} />
                  </div>
                ))}
                <span className="text-white/30 text-xs ml-1">+{h.amenities.length - 3} more</span>
                <ChevronRight size={14} className="text-white/20 ml-auto" />
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
