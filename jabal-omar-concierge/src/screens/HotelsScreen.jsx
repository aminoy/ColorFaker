import React, { useState } from 'react'
import {
  ArrowLeft, Star, MapPin, Phone, Wifi, Car, UtensilsCrossed,
  ChevronRight, Check, Clock, Users, Building2, Coffee,
  Dumbbell, BriefcaseBusiness, Award, Sparkles
} from 'lucide-react'

/* ─── SVG brand logos ─── */
const HyattLogo = () => (
  <svg viewBox="0 0 120 40" width="90" height="30" fill="none">
    <rect width="120" height="40" rx="4" fill="#1a3a5c"/>
    <text x="8" y="27" fontFamily="serif" fontSize="18" fontWeight="bold" fill="#ffffff" letterSpacing="1">HYATT</text>
    <text x="68" y="27" fontFamily="serif" fontSize="9" fill="#d4a017" letterSpacing="0.5">REGENCY</text>
  </svg>
)
const MarriottLogo = () => (
  <svg viewBox="0 0 120 40" width="90" height="30" fill="none">
    <rect width="120" height="40" rx="4" fill="#8b0000"/>
    <text x="8" y="27" fontFamily="serif" fontSize="15" fontWeight="bold" fill="#ffffff" letterSpacing="0.5">MARRIOTT</text>
  </svg>
)
const AddressLogo = () => (
  <svg viewBox="0 0 120 40" width="90" height="30" fill="none">
    <rect width="120" height="40" rx="4" fill="#1a1a1a"/>
    <text x="8" y="27" fontFamily="serif" fontSize="15" fontWeight="bold" fill="#d4a017" letterSpacing="2">ADDRESS</text>
  </svg>
)
const HiltonLogo = () => (
  <svg viewBox="0 0 120 40" width="90" height="30" fill="none">
    <rect width="120" height="40" rx="4" fill="#003580"/>
    <text x="8" y="27" fontFamily="serif" fontSize="18" fontWeight="bold" fill="#ffffff" letterSpacing="1">HILTON</text>
    <text x="72" y="20" fontFamily="sans-serif" fontSize="7" fill="#7ab3e0" letterSpacing="0.5">SUITES</text>
  </svg>
)
const JumeirahLogo = () => (
  <svg viewBox="0 0 120 40" width="90" height="30" fill="none">
    <rect width="120" height="40" rx="4" fill="#0d3349"/>
    <text x="8" y="27" fontFamily="serif" fontSize="14" fontWeight="bold" fill="#ffffff" letterSpacing="1">JUMEIRAH</text>
  </svg>
)

/* ─── Hotel image placeholders (styled SVG banners) ─── */
const HotelBanner = ({ hotel }) => {
  const configs = {
    hyatt:    { bg: 'from-[#1a3a5c] to-[#0d2238]', accent: '#d4a017', text: 'HYATT REGENCY',      sub: 'JABAL OMAR MAKKAH',    emoji: '🏙️' },
    marriott: { bg: 'from-[#6b0000] to-[#3d0000]', accent: '#f59e0b', text: 'MARRIOTT',            sub: 'JABAL OMAR MAKKAH',    emoji: '🏩' },
    address:  { bg: 'from-[#111111] to-[#2a2a2a]', accent: '#d4a017', text: 'ADDRESS',             sub: 'JABAL OMAR MAKKAH',    emoji: '🌟' },
    hilton:   { bg: 'from-[#003580] to-[#001f4d]', accent: '#7ab3e0', text: 'HILTON SUITES',       sub: 'JABAL OMAR MAKKAH',    emoji: '🏨' },
    jumeirah: { bg: 'from-[#0d3349] to-[#071e2e]', accent: '#34d399', text: 'JUMEIRAH',            sub: 'JABAL OMAR MAKKAH',    emoji: '🏰' },
  }
  const c = configs[hotel.id]
  return (
    <div className={`relative h-52 bg-gradient-to-br ${c.bg} flex flex-col items-center justify-center gap-2 overflow-hidden`}>
      {/* decorative circles */}
      <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full opacity-10" style={{ border: `2px solid ${c.accent}` }} />
      <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full opacity-10" style={{ border: `2px solid ${c.accent}` }} />
      <span className="text-5xl z-10">{c.emoji}</span>
      <div className="z-10 text-center">
        <p className="text-white font-black text-xl tracking-widest" style={{ fontFamily: "'Playfair Display', serif" }}>{c.text}</p>
        <p className="text-xs tracking-widest mt-0.5" style={{ color: c.accent }}>{c.sub}</p>
      </div>
      {/* star row */}
      <div className="flex gap-1 z-10">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star key={i} size={10} style={{ color: c.accent, fill: c.accent }} />
        ))}
      </div>
    </div>
  )
}

/* ─── Full factsheet data ─── */
const HOTELS = [
  {
    id: 'hyatt',
    name: 'Jabal Omar Hyatt Regency',
    nameAr: 'هيات ريجنسي جبل عمر',
    brand: 'Hyatt Regency',        brandAr: 'هيات ريجنسي',
    stars: 5,
    tagline: 'Directly on King Fahd Gate — 1 min to Haram',
    taglineAr: 'مباشرة على باب الملك فهد — دقيقة واحدة من الحرام',
    desc: '19-floor luxury tower directly in front of the King Fahd Gate. Effortless access to Al Kaaba and Al-Masjid Al-Haram. Features palatial suites, panoramic prayer areas, and four acclaimed restaurants.',
    descAr: 'برج فاخر من ١٩ طابقاً مقابل باب الملك فهد مباشرة. وصول سهل إلى الكعبة والمسجد الحرام. يضم أجنحة فخمة ومصليات بانورامية وأربعة مطاعم مميزة.',
    distance: '1 min walk',        distanceAr: 'دقيقة مشياً',
    distanceFt: '~300 ft',
    checkin: '4:00 PM',            checkout: '12:00 PM',
    floors: 19,
    rooms: 656,                    suites: 25,
    villas: 18,                    penthouses: 2,
    phone: '+966 12 571 1234',
    roomSizeMin: 38,               roomSizeMax: 410,
    restaurants: [
      { name: 'The Oasis',   type: 'All-Day Dining' },
      { name: 'Al Forno',    type: 'Italian' },
      { name: 'Tea Lounge',  type: 'Lobby Lounge' },
      { name: 'Al Tekkeya',  type: 'Grab & Go' },
    ],
    amenities: [
      'Free Wi-Fi', 'Fitness Centre (M/F)', 'Prayer Areas', 'Valet Parking',
      'Business Centre', '24h Room Service', 'Concierge', 'Haram View Rooms',
    ],
    amenitiesAr: [
      'واي فاي', 'مركز لياقة (رجال/نساء)', 'مصليات', 'صف سيارات',
      'مركز أعمال', 'خدمة غرف ٢٤ س', 'كونسيرج', 'غرف بإطلالة الحرام',
    ],
    highlights: ['King Fahd Gate access', 'Panoramic Kaaba suites', '4 signature restaurants', '24h concierge'],
    highlightsAr: ['وصول باب الملك فهد', 'أجنحة بانورامية للكعبة', '٤ مطاعم مميزة', 'كونسيرج ٢٤ ساعة'],
    color: '#d4a017',
    Logo: HyattLogo,
  },
  {
    id: 'marriott',
    name: 'Jabal Omar Marriott',
    nameAr: 'ماريوت جبل عمر',
    brand: 'Marriott',             brandAr: 'ماريوت',
    stars: 5,
    tagline: '3-min walk to Grand Mosque — Haram views',
    taglineAr: '٣ دقائق من الحرام — إطلالات على المسجد الحرام',
    desc: '426 elegantly appointed rooms and 52 suites with marble bathrooms and optional Haram views. Two signature restaurants overlooking the Grand Mosque and a dedicated prayer hall.',
    descAr: '٤٢٦ غرفة أنيقة و٥٢ جناحاً مع حمامات رخامية وإطلالات اختيارية على الحرام. مطعمان مميزان مطلان على المسجد الحرام ومصلى خاص.',
    distance: '3 min walk',        distanceAr: '٣ دقائق مشياً',
    distanceFt: '~0.2 mi',
    checkin: '4:00 PM',            checkout: '12:00 PM',
    floors: 26,
    rooms: 426,                    suites: 52,
    villas: 0,                     penthouses: 0,
    phone: '+966 12-529-6666',
    roomSizeMin: 34,               roomSizeMax: 96,
    restaurants: [
      { name: 'Haram View Restaurant 1', type: 'International Buffet' },
      { name: 'Haram View Restaurant 2', type: 'À la carte' },
    ],
    amenities: [
      'Free Wi-Fi (lobby)', 'Prayer Hall', 'Valet Parking (50 SAR)',
      '24h Business Centre', 'Gift Shop', 'Executive Lounge',
      '24h Room Service', 'Laundry & Dry Cleaning',
    ],
    amenitiesAr: [
      'واي فاي (لوبي)', 'مصلى', 'صف سيارات (٥٠ ريال)',
      'مركز أعمال ٢٤ س', 'متجر هدايا', 'لاونج تنفيذي',
      'خدمة غرف ٢٤ س', 'غسيل وتنظيف جاف',
    ],
    highlights: ['2 Haram-view restaurants', 'Marble bathroom suites', 'Executive Lounge', 'Mall connectivity'],
    highlightsAr: ['مطعمان بإطلالة الحرام', 'أجنحة حمام رخامي', 'لاونج تنفيذي', 'اتصال بالمول'],
    color: '#dc2626',
    Logo: MarriottLogo,
  },
  {
    id: 'address',
    name: 'Address Jabal Omar',
    nameAr: 'أدريس جبل عمر',
    brand: 'Address Hotels',       brandAr: 'أدريس هوتيلز',
    stars: 5,
    tagline: 'Sky Mussallah — Guinness Record • 7 min to Haram',
    taglineAr: 'مصلى السماء — موسوعة غينيس • ٧ دقائق من الحرام',
    desc: 'Two landmark towers with 1,268 rooms, 212 suites and 4 penthouses. Home to the world-record Sky Mussallah — the highest prayer room in a skybridge with panoramic Kaaba views. Shuttle service to the Haram.',
    descAr: 'برجان شاهقان يضمان ١٢٦٨ غرفة و٢١٢ جناحاً و٤ بنتهاوس. موطن مصلى السماء القياسي عالمياً — أعلى مصلى في جسر سماوي مع إطلالات بانورامية على الكعبة. خدمة مكوك إلى الحرام.',
    distance: '7 min walk',        distanceAr: '٧ دقائق مشياً',
    distanceFt: '~0.4 mi',
    checkin: '3:00 PM',            checkout: '12:00 PM',
    floors: 45,
    rooms: 1268,                   suites: 212,
    villas: 0,                     penthouses: 4,
    phone: '+966 12 553 1444',
    roomSizeMin: 45,               roomSizeMax: 500,
    restaurants: [
      { name: 'Address Kitchen',  type: 'All-Day Dining' },
      { name: 'Shimmers',        type: 'Fine Dining' },
      { name: 'The Lounge',      type: 'Lobby Bar & Café' },
      { name: 'In-Room Dining',  type: '24h' },
    ],
    amenities: [
      'Sky Mussallah (Guinness Record)', 'Free Wi-Fi', 'Shuttle to Haram',
      '2 Ballrooms', '4 Meeting Rooms', '2 Business Centres',
      'Infinity Pool', 'Luxury Spa', 'Kids Club', 'Concierge',
    ],
    amenitiesAr: [
      'مصلى السماء (غينيس)', 'واي فاي', 'مكوك للحرام',
      'قاعتا احتفالات', '٤ غرف اجتماعات', 'مركزا أعمال',
      'مسبح لانهائي', 'سبا فاخر', 'نادي أطفال', 'كونسيرج',
    ],
    highlights: ['Sky Mussallah — world record', '1,480+ keys', 'Haram shuttle service', 'Infinity pool & spa'],
    highlightsAr: ['مصلى السماء — رقم قياسي عالمي', '١٤٨٠+ وحدة', 'مكوك للحرام', 'مسبح لانهائي وسبا'],
    color: '#d4a017',
    Logo: AddressLogo,
  },
  {
    id: 'hilton',
    name: 'Hilton Suites Jabal Omar',
    nameAr: 'هيلتون سويتس جبل عمر',
    brand: 'Hilton Suites',        brandAr: 'هيلتون سويتس',
    stars: 5,
    tagline: 'Across from King Fahad Gate • 5 restaurants',
    taglineAr: 'مقابل باب الملك فهد • ٥ مطاعم',
    desc: 'All-suite hotel directly across from the King Fahad & King Abdullah Haram gates, 300m from the mosque. Five themed restaurants, a prayer hall with Grand Mosque views, EV charging, and direct mall access.',
    descAr: 'فندق الأجنحة مقابل بوابتي الملك فهد والملك عبدالله، ٣٠٠ متر من المسجد الحرام. خمسة مطاعم متنوعة ومصلى بإطلالة على الحرام ومول متصل.',
    distance: '5 min walk',        distanceAr: '٥ دقائق مشياً',
    distanceFt: '~0.3 km',
    checkin: '4:00 PM',            checkout: '12:00 PM',
    floors: 30,
    rooms: 448,                    suites: 228,
    villas: 0,                     penthouses: 0,
    phone: '+966 12 556 7000',
    roomSizeMin: 40,               roomSizeMax: 130,
    restaurants: [
      { name: 'Alqandeel',      type: 'All-Day Dining / Buffet' },
      { name: 'Alorchid',       type: 'Pan-Asian (Japanese, Malay)' },
      { name: 'Alfalak Café',   type: 'Light Snacks' },
      { name: 'Alkawkab Café',  type: 'Premium Coffee' },
      { name: 'Alkhalil Café',  type: 'Street-Level Casual' },
    ],
    amenities: [
      'Free Wi-Fi', 'Prayer Hall (Haram views)', 'Mall Access',
      'EV Charging', 'Fitness Centre', '2 Meeting Rooms',
      'Business Centre', 'Kids Menu', 'Concierge', 'Room Service',
    ],
    amenitiesAr: [
      'واي فاي', 'مصلى (إطلالة الحرام)', 'وصول للمول',
      'شحن السيارات الكهربائية', 'مركز لياقة', 'غرفتا اجتماعات',
      'مركز أعمال', 'قائمة أطفال', 'كونسيرج', 'خدمة غرف',
    ],
    highlights: ['5 signature restaurants', 'Prayer hall with Haram views', 'EV charging stations', 'Children stay free U12'],
    highlightsAr: ['٥ مطاعم مميزة', 'مصلى بإطلالة الحرام', 'شحن السيارات الكهربائية', 'إقامة مجانية للأطفال دون ١٢'],
    rating: 4.8,
    ratingCount: '3,787',
    color: '#3b82f6',
    Logo: HiltonLogo,
  },
  {
    id: 'jumeirah',
    name: 'Jumeirah Jabal Omar',
    nameAr: 'جميرا جبل عمر',
    brand: 'Jumeirah',             brandAr: 'جميرا',
    stars: 5,
    tagline: '4 towers by Foster+Partners • 820 ft from Haram',
    taglineAr: '٤ أبراج تصميم فوستر آند بارتنرز • ٢٥٠م من الحرام',
    desc: 'Designed by Pritzker-winning Foster and Partners — four towers with 752 rooms, 281 suites, 88 luxury residences and eight dining destinations. Spacious terraces with direct sight lines to Al-Masjid Al-Haram.',
    descAr: 'تصميم مكتب فوستر آند بارتنرز — أربعة أبراج تضم ٧٥٢ غرفة و٢٨١ جناحاً و٨٨ شقة فاخرة وثمانية وجهات طعام. شرفات واسعة بإطلالات مباشرة على المسجد الحرام.',
    distance: '820 ft / ~3 min',   distanceAr: '٢٥٠م / ~٣ دقائق',
    distanceFt: '820 ft',
    checkin: '3:00 PM',            checkout: '12:00 PM',
    floors: 50,
    rooms: 752,                    suites: 281,
    villas: 0,                     penthouses: 0,
    residences: 88,
    phone: '+966 12 571 9900',
    roomSizeMin: 45,               roomSizeMax: 600,
    restaurants: [
      { name: 'Patras',           type: 'Mediterranean' },
      { name: 'Arabesque',        type: 'Regional Arabic' },
      { name: 'Indo-Pakistani',   type: 'South Asian' },
      { name: 'Pan-Asian',        type: 'South-East Asian' },
      { name: 'Lobby Lounge',     type: 'Café & Lounge' },
      { name: '+ 3 more opening', type: 'Coming Soon' },
    ],
    amenities: [
      'Free Wi-Fi', 'Terrace Haram Views', '8 Restaurants',
      '3 Meeting Rooms & Event Spaces', 'Fitness Centre',
      'Luxury Spa', 'Butler Service', 'Concierge', '88 Residences',
    ],
    amenitiesAr: [
      'واي فاي', 'شرفات بإطلالة الحرام', '٨ مطاعم',
      '٣ قاعات اجتماعات وفعاليات', 'مركز لياقة',
      'سبا فاخر', 'خدمة بتلر', 'كونسيرج', '٨٨ شقة سكنية',
    ],
    highlights: ['Foster+Partners architecture', '8 dining destinations', 'Private Haram-view terraces', 'Butler service'],
    highlightsAr: ['معمار فوستر آند بارتنرز', '٨ وجهات طعام', 'شرفات خاصة بإطلالة الحرام', 'خدمة بتلر'],
    color: '#10b981',
    Logo: JumeirahLogo,
  },
]

/* ─── Detail view ─── */
function HotelDetail({ h, lang, onBack }) {
  return (
    <div className="min-h-full pb-8" style={{ background: '#0f0c07' }}>
      {/* Hero banner */}
      <div className="relative">
        <HotelBanner hotel={h} />
        <button
          onClick={onBack}
          className="absolute top-10 left-4 w-9 h-9 rounded-xl card-glass flex items-center justify-center active:scale-90"
        >
          <ArrowLeft size={18} className="text-gold-400" />
        </button>
        {/* Logo badge */}
        <div className="absolute bottom-4 right-4 rounded-xl overflow-hidden shadow-lg">
          <h.Logo />
        </div>
      </div>

      <div className="px-4 pt-5 space-y-5">
        {/* Name + tagline */}
        <div>
          <div className="flex items-center gap-1.5">
            {Array.from({ length: h.stars }).map((_, i) => (
              <Star key={i} size={12} style={{ color: h.color, fill: h.color }} />
            ))}
            {h.rating && (
              <span className="ml-1 text-xs font-semibold" style={{ color: h.color }}>
                {h.rating}/5 ({h.ratingCount} reviews)
              </span>
            )}
          </div>
          <h1 className="text-white text-xl font-bold mt-1" style={{ fontFamily: "'Playfair Display', serif" }}>
            {lang === 'ar' ? h.nameAr : h.name}
          </h1>
          <p className="text-xs mt-1" style={{ color: h.color }}>{lang === 'ar' ? h.taglineAr : h.tagline}</p>
        </div>

        {/* Key stats grid */}
        <div className="grid grid-cols-4 gap-2">
          {[
            { icon: Building2, label: lang === 'ar' ? 'طوابق' : 'Floors',   value: h.floors },
            { icon: Users,     label: lang === 'ar' ? 'غرف' : 'Rooms',      value: h.rooms.toLocaleString() },
            { icon: Sparkles,  label: lang === 'ar' ? 'أجنحة' : 'Suites',   value: h.suites },
            { icon: MapPin,    label: lang === 'ar' ? 'المسافة' : 'Distance', value: h.distanceFt },
          ].map((s, i) => (
            <div key={i} className="rounded-2xl p-2.5 card-glass card-gold-border text-center">
              <s.icon size={14} style={{ color: h.color }} className="mx-auto mb-1" />
              <p className="text-white font-bold text-sm leading-tight">{s.value}</p>
              <p className="text-white/30 text-[9px] mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Check-in / Check-out */}
        <div className="flex gap-2">
          {[
            { label: lang === 'ar' ? 'تسجيل دخول' : 'Check-in',  value: h.checkin  },
            { label: lang === 'ar' ? 'تسجيل خروج' : 'Check-out', value: h.checkout },
          ].map((t, i) => (
            <div key={i} className="flex-1 flex items-center gap-2 rounded-xl p-3 card-glass card-gold-border">
              <Clock size={14} style={{ color: h.color }} />
              <div>
                <p className="text-white/40 text-[10px]">{t.label}</p>
                <p className="text-white font-semibold text-sm">{t.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Room size */}
        <div className="rounded-xl p-3 card-glass card-gold-border flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${h.color}18` }}>
            <BriefcaseBusiness size={16} style={{ color: h.color }} />
          </div>
          <div>
            <p className="text-white/40 text-[10px]">{lang === 'ar' ? 'مساحة الغرف' : 'Room Size Range'}</p>
            <p className="text-white font-semibold text-sm">{h.roomSizeMin}–{h.roomSizeMax} m²</p>
          </div>
        </div>

        {/* Description */}
        <p className="text-white/60 text-sm leading-relaxed">
          {lang === 'ar' ? h.descAr : h.desc}
        </p>

        {/* Highlights */}
        <div>
          <p className="text-white/40 text-xs font-semibold uppercase tracking-widest mb-2">
            {lang === 'ar' ? 'أبرز المميزات' : 'Highlights'}
          </p>
          <div className="grid grid-cols-2 gap-2">
            {(lang === 'ar' ? h.highlightsAr : h.highlights).map((hl, i) => (
              <div key={i} className="flex items-center gap-2 rounded-xl p-2.5 card-glass">
                <Award size={11} style={{ color: h.color }} className="flex-shrink-0" />
                <span className="text-white/70 text-xs leading-tight">{hl}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Restaurants */}
        <div>
          <p className="text-white/40 text-xs font-semibold uppercase tracking-widest mb-2">
            {lang === 'ar' ? 'المطاعم والمقاهي' : 'Restaurants & Cafés'}
          </p>
          <div className="space-y-1.5">
            {h.restaurants.map((r, i) => (
              <div key={i} className="flex items-center justify-between rounded-xl p-3 card-glass card-gold-border">
                <div className="flex items-center gap-2">
                  <UtensilsCrossed size={12} style={{ color: h.color }} />
                  <span className="text-white font-medium text-xs">{r.name}</span>
                </div>
                <span className="text-white/30 text-[10px]">{r.type}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Amenities */}
        <div>
          <p className="text-white/40 text-xs font-semibold uppercase tracking-widest mb-2">
            {lang === 'ar' ? 'المرافق والخدمات' : 'Amenities & Facilities'}
          </p>
          <div className="grid grid-cols-2 gap-1.5">
            {(lang === 'ar' ? h.amenitiesAr : h.amenities).map((a, i) => (
              <div key={i} className="flex items-center gap-2 rounded-xl p-2.5 card-glass">
                <Check size={11} style={{ color: h.color }} className="flex-shrink-0" />
                <span className="text-white/60 text-xs leading-tight">{a}</span>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="flex gap-3 pt-2">
          <button
            className="flex-1 py-3.5 rounded-2xl font-bold text-sm active:scale-95 transition-all shadow-lg"
            style={{ background: `linear-gradient(135deg,${h.color},${h.color}cc)`, color: '#0f0c07' }}
          >
            {lang === 'ar' ? 'احجز الآن' : 'Book Now'}
          </button>
          <a
            href={`tel:${h.phone}`}
            className="w-14 h-14 rounded-2xl flex items-center justify-center card-glass card-gold-border active:scale-95 transition-all"
          >
            <Phone size={20} className="text-gold-400" />
          </a>
        </div>
        <p className="text-center text-white/20 text-xs">{h.phone}</p>
      </div>
    </div>
  )
}

/* ─── List view ─── */
export default function HotelsScreen({ lang, navigate }) {
  const [selected, setSelected] = useState(null)

  if (selected) {
    return <HotelDetail h={selected} lang={lang} onBack={() => setSelected(null)} />
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
          {lang === 'ar' ? '٥ فنادق فاخرة — ٣,١٢٩+ وحدة بالقرب من الحرام الشريف' : '5 luxury hotels — 3,129+ keys near Al-Masjid Al-Haram'}
        </p>
      </div>

      {/* Distance banner */}
      <div className="mx-4 mb-4 rounded-2xl p-3 flex items-center gap-3"
        style={{ background: 'rgba(212,160,23,0.08)', border: '1px solid rgba(212,160,23,0.2)' }}>
        <MapPin size={16} className="text-gold-400 flex-shrink-0" />
        <p className="text-white/60 text-xs leading-relaxed">
          {lang === 'ar'
            ? 'جميع الفنادق ضمن ٨ دقائق مشياً من المسجد الحرام'
            : 'All hotels within 8 minutes walking distance from Al-Masjid Al-Haram'}
        </p>
      </div>

      {/* Hotel cards */}
      <div className="px-4 space-y-4">
        {HOTELS.map(h => (
          <button
            key={h.id}
            onClick={() => setSelected(h)}
            className="w-full rounded-3xl overflow-hidden active:scale-98 transition-all text-left shadow-lg"
            style={{ border: `1px solid ${h.color}30`, background: '#141008' }}
          >
            {/* Banner */}
            <HotelBanner hotel={h} />

            {/* Info */}
            <div className="p-4">
              {/* Brand logo + stars */}
              <div className="flex items-center justify-between mb-2">
                <h.Logo />
                <div className="flex items-center gap-0.5">
                  {Array.from({ length: h.stars }).map((_, i) => (
                    <Star key={i} size={10} style={{ color: h.color, fill: h.color }} />
                  ))}
                </div>
              </div>

              <h3 className="text-white font-bold text-base" style={{ fontFamily: "'Playfair Display', serif" }}>
                {lang === 'ar' ? h.nameAr : h.name}
              </h3>
              <p className="text-xs mt-0.5" style={{ color: h.color }}>{lang === 'ar' ? h.taglineAr : h.tagline}</p>

              {/* Stats row */}
              <div className="flex items-center gap-3 mt-3">
                <div className="flex items-center gap-1">
                  <Users size={10} className="text-white/30" />
                  <span className="text-white/50 text-xs">{h.rooms.toLocaleString()} {lang === 'ar' ? 'غرفة' : 'rooms'}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Sparkles size={10} className="text-white/30" />
                  <span className="text-white/50 text-xs">{h.suites} {lang === 'ar' ? 'جناح' : 'suites'}</span>
                </div>
                <div className="flex items-center gap-1">
                  <MapPin size={10} style={{ color: h.color }} />
                  <span className="text-xs font-medium" style={{ color: h.color }}>
                    {lang === 'ar' ? h.distanceAr : h.distance}
                  </span>
                </div>
                <ChevronRight size={14} className="text-white/20 ml-auto" />
              </div>

              {/* Highlight chips */}
              <div className="flex gap-1.5 mt-3 flex-wrap">
                {(lang === 'ar' ? h.highlightsAr : h.highlights).slice(0, 2).map((hl, i) => (
                  <span
                    key={i}
                    className="text-[9px] px-2 py-0.5 rounded-full font-medium"
                    style={{ background: `${h.color}18`, color: h.color, border: `1px solid ${h.color}30` }}
                  >
                    {hl}
                  </span>
                ))}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
