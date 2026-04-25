import React, { useEffect, useState } from 'react'

/* ── Jabal Omar brand colors ── */
const C = {
  midnight: '#354d62',
  emerald:  '#4ab893',
  violet:   '#6b4877',
  herbal:   '#8c9d6a',
}

/* ── Official Jabal Omar Logo Mark (SVG) ── */
const JabalOmarLogoMark = ({ size = 96, phase }) => (
  <svg viewBox="0 0 120 120" width={size} height={size} fill="none">
    {/* Outer ring — Midnight Blue */}
    <circle cx="60" cy="60" r="58" stroke={C.midnight} strokeWidth="2" opacity={phase >= 1 ? 0.8 : 0}
      style={{ transition: 'opacity 0.8s ease' }} />
    {/* Mid ring — Emerald Green */}
    <circle cx="60" cy="60" r="48" stroke={C.emerald} strokeWidth="1.5" strokeDasharray="6 4"
      opacity={phase >= 1 ? 0.6 : 0} style={{ transition: 'opacity 0.8s ease 0.2s', transformOrigin: '60px 60px', animation: phase >= 1 ? 'spinSlow 18s linear infinite' : 'none' }} />
    {/* Inner ring — Herbal Green */}
    <circle cx="60" cy="60" r="36" stroke={C.herbal} strokeWidth="1" opacity={phase >= 1 ? 0.4 : 0}
      style={{ transition: 'opacity 0.8s ease 0.4s', transformOrigin: '60px 60px', animation: phase >= 1 ? 'spinSlow 12s linear infinite reverse' : 'none' }} />
    {/* Dome arch — Emerald */}
    <path d="M30 60 Q30 30 60 28 Q90 30 90 60"
      stroke={C.emerald} strokeWidth="2.5" strokeLinecap="round"
      opacity={phase >= 2 ? 1 : 0} style={{ transition: 'opacity 0.6s ease' }} />
    {/* Minaret left */}
    <line x1="38" y1="60" x2="38" y2="45" stroke={C.herbal} strokeWidth="1.5" strokeLinecap="round"
      opacity={phase >= 2 ? 0.7 : 0} style={{ transition: 'opacity 0.6s ease 0.1s' }} />
    {/* Minaret right */}
    <line x1="82" y1="60" x2="82" y2="45" stroke={C.herbal} strokeWidth="1.5" strokeLinecap="round"
      opacity={phase >= 2 ? 0.7 : 0} style={{ transition: 'opacity 0.6s ease 0.1s' }} />
    {/* Base line */}
    <line x1="26" y1="60" x2="94" y2="60" stroke={C.midnight} strokeWidth="1.5"
      opacity={phase >= 2 ? 0.6 : 0} style={{ transition: 'opacity 0.6s ease 0.2s' }} />
    {/* Centre star */}
    <circle cx="60" cy="28" r="3" fill={C.emerald}
      opacity={phase >= 2 ? 1 : 0} style={{ transition: 'opacity 0.6s ease 0.3s' }} />
    {/* Arabic letters ج ع — stylised */}
    <text x="60" y="84" textAnchor="middle"
      fontFamily="'Noto Naskh Arabic', serif" fontSize="18" fontWeight="700"
      fill={C.emerald} opacity={phase >= 2 ? 1 : 0}
      style={{ transition: 'opacity 0.6s ease 0.4s' }}>
      جع
    </text>
  </svg>
)

export default function SplashScreen() {
  const [phase, setPhase] = useState(0)

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 150)
    const t2 = setTimeout(() => setPhase(2), 800)
    const t3 = setTimeout(() => setPhase(3), 1700)
    return () => [t1, t2, t3].forEach(clearTimeout)
  }, [])

  return (
    <div
      className="fixed inset-0 flex flex-col items-center justify-center overflow-hidden"
      style={{ background: `linear-gradient(160deg,#1c2d3a 0%,#0f1e2a 55%,#1c2d3a 100%)` }}
    >
      {/* Radial emerald glow */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: 'radial-gradient(ellipse 55% 40% at 50% 50%, rgba(74,184,147,0.09) 0%, transparent 70%)',
      }} />

      {/* Herbal Green glow bottom */}
      <div className="absolute bottom-0 left-0 right-0 pointer-events-none" style={{
        background: 'radial-gradient(ellipse 80% 30% at 50% 100%, rgba(140,157,106,0.07) 0%, transparent 70%)',
      }} />

      {/* Top dome ornament */}
      <div className="absolute top-0 left-0 right-0 flex justify-center"
        style={{ opacity: 0.08, transform: `translateY(${phase >= 1 ? '0' : '-40px'})`, transition: 'all 0.9s ease-out' }}>
        <svg viewBox="0 0 400 180" width="400" fill="none">
          <path d="M200 8 Q285 8 325 75 L400 75 L400 180 L0 180 L0 75 L75 75 Q115 8 200 8Z"
            fill={C.emerald} opacity="0.6" />
          <path d="M200 28 Q268 28 305 75 L375 75" stroke={C.herbal} strokeWidth="1" opacity="0.5" />
          <circle cx="200" cy="0" r="5" fill={C.emerald} opacity="0.8" />
          <line x1="90" y1="75" x2="90" y2="45" stroke={C.midnight} strokeWidth="2" opacity="0.7" />
          <line x1="310" y1="75" x2="310" y2="45" stroke={C.midnight} strokeWidth="2" opacity="0.7" />
        </svg>
      </div>

      {/* Logo block */}
      <div style={{
        opacity: phase >= 1 ? 1 : 0,
        transform: `translateY(${phase >= 1 ? '0' : '24px'})`,
        transition: 'all 0.8s ease-out',
      }} className="flex flex-col items-center gap-3">

        <JabalOmarLogoMark size={100} phase={phase} />

        <div className="text-center">
          {/* English brand name */}
          <h1 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 26,
            fontWeight: 700,
            color: '#f0f4f2',
            letterSpacing: '0.08em',
            lineHeight: 1.1,
          }}>
            JABAL OMAR
          </h1>

          {/* Divider + CONCIERGE+ */}
          <div className="flex items-center gap-2 justify-center mt-1.5"
            style={{ opacity: phase >= 2 ? 1 : 0, transform: `translateY(${phase >= 2 ? '0' : '8px'})`, transition: 'all 0.6s ease-out' }}>
            <div className="h-px w-10" style={{ background: `linear-gradient(to right, transparent, ${C.emerald})` }} />
            <span style={{ fontSize: 11, letterSpacing: '0.28em', color: C.emerald, fontWeight: 600 }}>
              CONCIERGE+
            </span>
            <div className="h-px w-10" style={{ background: `linear-gradient(to left, transparent, ${C.emerald})` }} />
          </div>

          {/* Arabic name */}
          <p style={{
            fontFamily: "'Noto Naskh Arabic', serif",
            fontSize: 17,
            color: C.herbal,
            marginTop: 8,
            opacity: phase >= 2 ? 1 : 0,
            transition: 'opacity 0.6s ease-out 0.2s',
          }}>
            جبل عمر — خدمة الكونسيرج
          </p>
        </div>
      </div>

      {/* Brand colour dots */}
      <div className="flex items-center gap-2 mt-6"
        style={{ opacity: phase >= 2 ? 0.5 : 0, transition: 'opacity 0.6s ease-out 0.4s' }}>
        {[C.midnight, C.emerald, C.violet, C.herbal].map((c, i) => (
          <div key={i} className="w-1.5 h-1.5 rounded-full" style={{ background: c }} />
        ))}
      </div>

      {/* Bottom tagline */}
      <div className="absolute bottom-20 text-center px-8"
        style={{ opacity: phase >= 3 ? 1 : 0, transform: `translateY(${phase >= 3 ? '0' : '12px'})`, transition: 'all 0.6s ease-out' }}>
        <p style={{ color: 'rgba(240,244,242,0.45)', fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase' }}>
          Where Authenticity Meets Modernity
        </p>
        <p style={{ fontFamily: "'Noto Naskh Arabic', serif", color: C.herbal, fontSize: 12, marginTop: 4, opacity: 0.7 }}>
          حيث تلتقي الأصالة بروح الحداثة
        </p>
      </div>

      {/* Loading bar — Midnight Blue → Emerald */}
      <div className="absolute bottom-9 left-1/2 -translate-x-1/2 w-24 h-0.5 rounded-full overflow-hidden"
        style={{ background: 'rgba(255,255,255,0.08)' }}>
        <div className="h-full rounded-full transition-all ease-out"
          style={{
            width: phase >= 3 ? '100%' : phase >= 2 ? '66%' : phase >= 1 ? '33%' : '0%',
            background: `linear-gradient(to right, ${C.midnight}, ${C.emerald})`,
            transitionDuration: '0.6s',
          }} />
      </div>

      <style>{`
        @keyframes spinSlow { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }
      `}</style>
    </div>
  )
}
