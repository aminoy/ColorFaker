import React, { useState, useRef, useEffect } from 'react'
import { ArrowLeft, Send, MessageSquare, Mic, Paperclip } from 'lucide-react'

const QUICK_REQUESTS = [
  { icon: '🛎️', label: 'Room Service',         labelAr: 'خدمة الغرف'    },
  { icon: '🧹', label: 'Housekeeping',          labelAr: 'التدبير المنزلي' },
  { icon: '🚗', label: 'Airport Transfer',      labelAr: 'نقل المطار'     },
  { icon: '🏥', label: 'Medical Assistance',    labelAr: 'مساعدة طبية'   },
  { icon: '🌹', label: 'Special Arrangement',   labelAr: 'ترتيب خاص'     },
  { icon: '🍽️', label: 'Restaurant Booking',   labelAr: 'حجز مطعم'      },
  { icon: '♿', label: 'Accessibility Aid',     labelAr: 'دعم الاحتياجات' },
  { icon: '💼', label: 'Luggage Assistance',   labelAr: 'مساعدة أمتعة'  },
]

const INITIAL_MESSAGES = [
  {
    id: 1, from: 'bot',
    text: 'Assalamu Alaikum! Welcome to Jabal Omar Concierge+. How may I assist you today?',
    textAr: 'السلام عليكم! مرحباً بكم في كونسيرج جبل عمر+. كيف يمكنني مساعدتكم اليوم؟',
    time: '10:00 AM',
  },
]

export default function ConciergeScreen({ lang, navigate }) {
  const [messages, setMessages] = useState(INITIAL_MESSAGES)
  const [input, setInput]       = useState('')
  const [typing, setTyping]     = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, typing])

  const sendMessage = (text) => {
    if (!text.trim()) return
    const now = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    setMessages(prev => [...prev, { id: Date.now(), from: 'user', text, time: now }])
    setInput('')
    setTyping(true)

    setTimeout(() => {
      setTyping(false)
      const responses = [
        { text: 'Thank you for your request. A concierge team member will be with you shortly. Is there anything else I can help with?',
          textAr: 'شكراً لطلبكم. سيتواصل معكم أحد أعضاء فريق الكونسيرج قريباً. هل هناك شيء آخر يمكنني مساعدتكم به؟' },
        { text: 'I have noted your request and will ensure it is handled with the utmost care. Your satisfaction is our priority.',
          textAr: 'لقد تلقيت طلبكم وسأتأكد من معالجته بأعلى مستوى من العناية. رضاكم هو أولويتنا.' },
        { text: 'Your request has been forwarded to our team. Expected response time is 5-10 minutes. Thank you for your patience.',
          textAr: 'تم إرسال طلبكم إلى فريقنا. وقت الاستجابة المتوقع ٥-١٠ دقائق. شكراً لصبركم.' },
      ]
      const r = responses[Math.floor(Math.random() * responses.length)]
      setMessages(prev => [...prev, {
        id: Date.now() + 1, from: 'bot',
        text: lang === 'ar' ? r.textAr : r.text,
        time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      }])
    }, 1500)
  }

  return (
    <div className="min-h-full flex flex-col screen-bg">
      {/* Header */}
      <div
        className="px-4 pt-12 pb-4 flex items-center gap-3 flex-shrink-0"
        style={{ borderBottom: '1px solid rgba(212,160,23,0.12)' }}
      >
        <button onClick={() => navigate('home')} className="w-9 h-9 rounded-xl card-glass flex items-center justify-center">
          <ArrowLeft size={18} className="text-gold-400" />
        </button>
        <div className="w-10 h-10 rounded-full bg-gold-500/20 flex items-center justify-center border border-gold-500/30">
          <MessageSquare size={18} className="text-gold-400" />
        </div>
        <div>
          <p className="text-white font-semibold text-sm">
            {lang === 'ar' ? 'كونسيرج جبل عمر' : 'Jabal Omar Concierge'}
          </p>
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span className="text-emerald-400 text-[10px]">{lang === 'ar' ? 'متاح ٢٤/٧' : 'Available 24/7'}</span>
          </div>
        </div>
      </div>

      {/* Quick requests */}
      <div className="flex gap-2 overflow-x-auto px-4 py-3 flex-shrink-0 no-scrollbar">
        {QUICK_REQUESTS.map(r => (
          <button
            key={r.label}
            onClick={() => sendMessage(lang === 'ar' ? r.labelAr : r.label)}
            className="flex-shrink-0 flex items-center gap-2 px-3 py-2 rounded-full text-xs font-medium active:scale-90 transition-all"
            style={{ background: 'rgba(212,160,23,0.1)', border: '1px solid rgba(212,160,23,0.2)', color: '#d4a017' }}
          >
            <span>{r.icon}</span>
            <span className="text-white/60">{lang === 'ar' ? r.labelAr : r.label}</span>
          </button>
        ))}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-2 space-y-3">
        {messages.map(msg => (
          <div key={msg.id} className={`flex ${msg.from === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.from === 'bot' && (
              <div className="w-7 h-7 rounded-full bg-gold-500/20 flex items-center justify-center mr-2 flex-shrink-0 mt-auto">
                <span className="text-sm">🎩</span>
              </div>
            )}
            <div className="max-w-[78%]">
              <div
                className="rounded-2xl px-4 py-2.5 text-sm leading-relaxed"
                style={msg.from === 'user'
                  ? { background: 'rgba(212,160,23,0.2)', border: '1px solid rgba(212,160,23,0.3)', color: '#fff' }
                  : { background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.85)' }
                }
              >
                {msg.text}
              </div>
              <p className="text-white/20 text-[10px] mt-1 px-1">{msg.time}</p>
            </div>
          </div>
        ))}
        {typing && (
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-gold-500/20 flex items-center justify-center">
              <span className="text-sm">🎩</span>
            </div>
            <div className="rounded-2xl px-4 py-3 card-glass flex items-center gap-1">
              {[0,1,2].map(i => (
                <div
                  key={i}
                  className="w-1.5 h-1.5 rounded-full bg-gold-400"
                  style={{ animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite` }}
                />
              ))}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div
        className="px-4 py-3 flex-shrink-0 flex items-center gap-2"
        style={{ borderTop: '1px solid rgba(212,160,23,0.12)', paddingBottom: 'calc(12px + env(safe-area-inset-bottom,0px))' }}
      >
        <div className="flex-1 flex items-center rounded-2xl overflow-hidden"
          style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(212,160,23,0.2)' }}>
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && sendMessage(input)}
            placeholder={lang === 'ar' ? 'اكتب رسالتك...' : 'Type your request...'}
            className="flex-1 bg-transparent px-4 py-3 text-white text-sm placeholder-white/25 outline-none"
          />
          <button className="px-3">
            <Paperclip size={16} className="text-white/30" />
          </button>
        </div>
        <button
          onClick={() => sendMessage(input)}
          className="w-11 h-11 rounded-2xl flex items-center justify-center active:scale-90 transition-all"
          style={{ background: input.trim() ? '#d4a017' : 'rgba(212,160,23,0.15)' }}
        >
          <Send size={16} style={{ color: input.trim() ? '#0f0c07' : 'rgba(212,160,23,0.4)' }} />
        </button>
      </div>

      <style>{`
        @keyframes bounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-4px)} }
        .no-scrollbar::-webkit-scrollbar{display:none}
        .no-scrollbar{-ms-overflow-style:none;scrollbar-width:none}
      `}</style>
    </div>
  )
}
