import React from 'react'
import { ArrowLeft, Bell, Star, Clock, ShoppingBag, AlertTriangle, Megaphone } from 'lucide-react'

const NOTIFICATIONS = [
  {
    id: 1,
    icon: Clock, color: '#10b981', urgent: false,
    title: 'Asr Prayer in 30 minutes',
    titleAr: 'صلاة العصر بعد ٣٠ دقيقة',
    body: 'Asr prayer at 3:47 PM. Nearest prayer area: Sky Mussallah, Address Hotel.',
    bodyAr: 'صلاة العصر الساعة ٣:٤٧ م. أقرب مصلى: مصلى السماء، فندق أدريس.',
    time: '2 min ago', timeAr: 'منذ دقيقتين', read: false,
  },
  {
    id: 2,
    icon: Star, color: '#d4a017', urgent: false,
    title: 'Exclusive VIP Offer',
    titleAr: 'عرض VIP حصري',
    body: '20% off dining at Hyatt Regency Restaurant today only. Show this notification to redeem.',
    bodyAr: 'خصم ٢٠٪ على الطعام في مطعم هيات ريجنسي اليوم فقط. أرِ هذا الإشعار للاستفادة.',
    time: '15 min ago', timeAr: 'منذ ١٥ دقيقة', read: false,
  },
  {
    id: 3,
    icon: Megaphone, color: '#6366f1', urgent: false,
    title: 'New Exhibition at Museum',
    titleAr: 'معرض جديد في المتحف',
    body: '"Journey Through Time" — A new interactive exhibition celebrating Makkah\'s heritage opens today.',
    bodyAr: '"رحلة عبر الزمن" — معرض تفاعلي جديد يحتفي بتراث مكة يفتح أبوابه اليوم.',
    time: '1 hr ago', timeAr: 'منذ ساعة', read: true,
  },
  {
    id: 4,
    icon: ShoppingBag, color: '#a855f7', urgent: false,
    title: 'Souk Al-Khalil Sale',
    titleAr: 'تخفيضات سوق الخليل',
    body: 'Weekend Sale: Up to 50% off selected stores in Souk Al-Khalil 1 & 2.',
    bodyAr: 'تخفيضات نهاية الأسبوع: حتى ٥٠٪ في متاجر مختارة بسوق الخليل ١ و ٢.',
    time: '3 hr ago', timeAr: 'منذ ٣ ساعات', read: true,
  },
  {
    id: 5,
    icon: AlertTriangle, color: '#f59e0b', urgent: true,
    title: 'Parking Level B3 Full',
    titleAr: 'موقف B3 ممتلئ',
    body: 'Parking level B3 is currently full. Please use levels B1, B2, or B4.',
    bodyAr: 'موقف B3 ممتلئ حالياً. يرجى استخدام المستويات B1 أو B2 أو B4.',
    time: '5 hr ago', timeAr: 'منذ ٥ ساعات', read: true,
  },
  {
    id: 6,
    icon: Clock, color: '#0ea5e9', urgent: false,
    title: 'Electric Carriage Booking Confirmed',
    titleAr: 'تأكيد حجز العربة الكهربائية',
    body: 'Your Sa\'i route electric carriage is confirmed for tomorrow at 9:00 AM.',
    bodyAr: 'تم تأكيد حجز عربة مسار السعي الكهربائية غداً الساعة ٩:٠٠ ص.',
    time: '1 day ago', timeAr: 'منذ يوم', read: true,
  },
]

export default function NotificationsScreen({ lang, navigate }) {
  const unread = NOTIFICATIONS.filter(n => !n.read).length

  return (
    <div className="min-h-full pb-6" style={{ background: '#0f0c07' }}>
      <div className="px-4 pt-12 pb-4">
        <button onClick={() => navigate('home')} className="flex items-center gap-2 mb-4">
          <ArrowLeft size={16} className="text-gold-400" />
          <span className="text-white/50 text-sm">{lang === 'ar' ? 'الرئيسية' : 'Home'}</span>
        </button>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-white text-2xl font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>
              {lang === 'ar' ? 'الإشعارات' : 'Notifications'}
            </h1>
            {unread > 0 && (
              <p className="text-gold-400 text-xs mt-0.5">
                {unread} {lang === 'ar' ? 'إشعارات غير مقروءة' : 'unread'}
              </p>
            )}
          </div>
          <Bell size={20} className="text-gold-400" />
        </div>
      </div>

      <div className="px-4 space-y-2">
        {NOTIFICATIONS.map(n => (
          <div
            key={n.id}
            className="rounded-2xl p-4 transition-all"
            style={{
              background: n.read ? 'rgba(255,255,255,0.02)' : `${n.color}0a`,
              border: `1px solid ${n.read ? 'rgba(255,255,255,0.06)' : `${n.color}30`}`,
            }}
          >
            <div className="flex items-start gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: `${n.color}18` }}
              >
                <n.icon size={18} style={{ color: n.color }} />
              </div>
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <p className={`text-sm font-semibold ${n.read ? 'text-white/60' : 'text-white'}`}>
                    {lang === 'ar' ? n.titleAr : n.title}
                  </p>
                  <div className="flex items-center gap-1.5 flex-shrink-0 ml-2">
                    {!n.read && (
                      <div className="w-2 h-2 rounded-full" style={{ background: n.color }} />
                    )}
                    <span className="text-white/25 text-[10px]">{lang === 'ar' ? n.timeAr : n.time}</span>
                  </div>
                </div>
                <p className={`text-xs mt-1 leading-relaxed ${n.read ? 'text-white/30' : 'text-white/50'}`}>
                  {lang === 'ar' ? n.bodyAr : n.body}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
