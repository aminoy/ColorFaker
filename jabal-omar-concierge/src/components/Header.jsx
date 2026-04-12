import React from 'react'
import { ArrowLeft, Bell } from 'lucide-react'

export default function Header({ title, subtitle, onBack, onNotifications, lang }) {
  return (
    <div
      className="flex-shrink-0 flex items-center justify-between px-4 py-4"
      style={{
        background: 'linear-gradient(180deg,rgba(26,18,8,0.95) 0%,rgba(15,12,7,0.0) 100%)',
        paddingTop: `calc(env(safe-area-inset-top, 0px) + 1rem)`,
      }}
    >
      <div className="flex items-center gap-3">
        {onBack && (
          <button
            onClick={onBack}
            className="w-9 h-9 flex items-center justify-center rounded-xl card-glass active:scale-90 transition-all"
          >
            <ArrowLeft size={18} className="text-gold-400" style={{ transform: lang === 'ar' ? 'scaleX(-1)' : 'none' }} />
          </button>
        )}
        <div>
          <h1
            className="text-white font-semibold text-base leading-tight"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            {title}
          </h1>
          {subtitle && (
            <p className="text-gold-500 text-xs mt-0.5">{subtitle}</p>
          )}
        </div>
      </div>

      {onNotifications && (
        <button
          onClick={onNotifications}
          className="w-9 h-9 flex items-center justify-center rounded-xl card-glass active:scale-90 transition-all relative"
        >
          <Bell size={18} className="text-gold-400" />
          <span
            className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-gold-500 pulse-gold"
          />
        </button>
      )}
    </div>
  )
}
