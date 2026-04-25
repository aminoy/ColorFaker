import React from 'react'

export default function ServiceCard({ icon: Icon, title, subtitle, onClick, badge, color = '#d4a017' }) {
  return (
    <button
      onClick={onClick}
      className="relative flex flex-col items-center justify-center gap-2 p-4 rounded-2xl card-glass card-gold-border
                 active:scale-95 transition-all duration-150 text-center w-full"
    >
      {badge && (
        <span
          className="absolute top-2 right-2 text-[9px] font-bold px-1.5 py-0.5 rounded-full text-haram-dark"
          style={{ background: color }}
        >
          {badge}
        </span>
      )}
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center"
        style={{ background: `${color}1a`, border: `1px solid ${color}40` }}
      >
        <Icon size={22} style={{ color }} />
      </div>
      <div>
        <p className="text-white text-xs font-semibold leading-tight">{title}</p>
        {subtitle && <p className="text-white/40 text-[10px] mt-0.5">{subtitle}</p>}
      </div>
    </button>
  )
}
