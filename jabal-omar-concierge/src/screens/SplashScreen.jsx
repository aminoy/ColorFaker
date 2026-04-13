import React, { useEffect, useState } from 'react'

export default function SplashScreen() {
  const [phase, setPhase] = useState(0)

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 200)
    const t2 = setTimeout(() => setPhase(2), 900)
    const t3 = setTimeout(() => setPhase(3), 1800)
    return () => [t1,t2,t3].forEach(clearTimeout)
  }, [])

  return (
    <div
      className="fixed inset-0 flex flex-col items-center justify-center overflow-hidden"
      style={{ background: 'linear-gradient(160deg,#1a1208 0%,#0a0804 60%,#1a1208 100%)' }}
    >
      {/* Radial glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 60% 40% at 50% 50%, rgba(212,160,23,0.08) 0%, transparent 70%)',
        }}
      />

      {/* Dome SVG ornament */}
      <div
        className="absolute top-0 left-0 right-0 flex justify-center opacity-10"
        style={{ transform: `translateY(${phase >= 1 ? '0' : '-40px'})`, transition: 'all 0.8s ease-out' }}
      >
        <svg viewBox="0 0 400 200" width="400" fill="none">
          <path d="M200 10 Q280 10 320 80 L400 80 L400 200 L0 200 L0 80 L80 80 Q120 10 200 10Z" fill="#d4a017" opacity="0.3"/>
          <path d="M200 30 Q265 30 300 80 L380 80" stroke="#d4a017" strokeWidth="1" opacity="0.5"/>
          <circle cx="200" cy="0" r="6" fill="#d4a017" opacity="0.6"/>
        </svg>
      </div>

      {/* Logo block */}
      <div
        style={{
          opacity: phase >= 1 ? 1 : 0,
          transform: `translateY(${phase >= 1 ? '0' : '20px'})`,
          transition: 'all 0.8s ease-out',
        }}
        className="flex flex-col items-center gap-4"
      >
        {/* Geometric arabesque */}
        <div className="relative w-24 h-24">
          <div
            className="absolute inset-0 rounded-full"
            style={{ border: '2px solid rgba(212,160,23,0.4)', animation: 'spin 20s linear infinite' }}
          />
          <div
            className="absolute inset-2 rounded-full"
            style={{ border: '1px solid rgba(212,160,23,0.25)', animation: 'spin 15s linear infinite reverse' }}
          />
          <div
            className="absolute inset-0 flex items-center justify-center"
          >
            <span style={{ fontSize: 40, lineHeight: 1, color: '#d4a017', fontFamily: "'Noto Naskh Arabic', serif" }}>
              جب
            </span>
          </div>
        </div>

        <div className="text-center">
          <h1
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 28,
              fontWeight: 700,
              color: '#ffffff',
              letterSpacing: '0.02em',
              lineHeight: 1.1,
            }}
          >
            JABAL OMAR
          </h1>
          <div
            className="flex items-center gap-2 justify-center mt-1"
            style={{
              opacity: phase >= 2 ? 1 : 0,
              transform: `translateY(${phase >= 2 ? '0' : '8px'})`,
              transition: 'all 0.6s ease-out',
            }}
          >
            <div className="h-px flex-1 bg-gradient-to-r from-transparent to-gold-500 w-12" />
            <span
              style={{
                fontSize: 12,
                letterSpacing: '0.3em',
                color: '#d4a017',
                fontWeight: 500,
                textTransform: 'uppercase',
              }}
            >
              CONCIERGE+
            </span>
            <div className="h-px flex-1 bg-gradient-to-l from-transparent to-gold-500 w-12" />
          </div>
          <p
            style={{
              fontFamily: "'Noto Naskh Arabic', serif",
              fontSize: 16,
              color: 'rgba(212,160,23,0.7)',
              marginTop: 6,
              opacity: phase >= 2 ? 1 : 0,
              transition: 'opacity 0.6s ease-out 0.2s',
            }}
          >
            جبل عمر — خدمة الكونسيرج
          </p>
        </div>
      </div>

      {/* Tagline */}
      <div
        className="absolute bottom-20 text-center px-8"
        style={{
          opacity: phase >= 3 ? 1 : 0,
          transform: `translateY(${phase >= 3 ? '0' : '12px'})`,
          transition: 'all 0.6s ease-out',
        }}
      >
        <p className="text-white/50 text-xs tracking-widest uppercase">
          Where Authenticity Meets Modernity
        </p>
        <p style={{ fontFamily: "'Noto Naskh Arabic', serif" }} className="text-white/25 text-xs mt-1">
          حيث تلتقي الأصالة بروح الحداثة
        </p>
      </div>

      {/* Loading bar */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-24 h-0.5 bg-white/10 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-gold-600 to-gold-400 rounded-full transition-all ease-out"
          style={{ width: phase >= 3 ? '100%' : phase >= 2 ? '66%' : phase >= 1 ? '33%' : '0%', transitionDuration: '0.6s' }}
        />
      </div>

      <style>{`@keyframes spin { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }`}</style>
    </div>
  )
}
