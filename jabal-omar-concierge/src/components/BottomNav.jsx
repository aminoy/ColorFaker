import React from 'react'
import { Home, Building2, UtensilsCrossed, ShoppingBag, Star, Settings } from 'lucide-react'

const tabs = [
  { id: 'home',        icon: Home,            label: 'Home',     labelAr: 'الرئيسية' },
  { id: 'hotels',      icon: Building2,        label: 'Hotels',   labelAr: 'الفنادق'  },
  { id: 'dining',      icon: UtensilsCrossed,  label: 'Dining',   labelAr: 'مطاعم'    },
  { id: 'shopping',    icon: ShoppingBag,      label: 'Shopping', labelAr: 'تسوق'     },
  { id: 'experiences', icon: Star,             label: 'Explore',  labelAr: 'استكشف'   },
  { id: 'profile',     icon: Settings,         label: 'More',     labelAr: 'المزيد'   },
]

export default function BottomNav({ current, navigate, lang }) {
  return (
    <nav
      className="flex-shrink-0 border-t transition-colors duration-300"
      style={{
        background: 'var(--bg-nav)',
        borderColor: 'var(--border-card)',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}
    >
      <div className="flex items-stretch">
        {tabs.map(({ id, icon: Icon, label, labelAr }) => {
          const active = current === id
          return (
            <button
              key={id}
              onClick={() => navigate(id)}
              className="flex-1 flex flex-col items-center justify-center py-2 transition-all duration-200 active:scale-90"
            >
              <div
                className="flex items-center justify-center w-9 h-9 rounded-xl transition-all duration-200"
                style={active ? {
                  background: 'rgba(212,160,23,0.15)',
                  boxShadow: '0 0 12px rgba(212,160,23,0.2)',
                } : {}}
              >
                <Icon
                  size={20}
                  style={{ color: active ? 'var(--gold)' : 'var(--text-3)' }}
                  strokeWidth={active ? 2.5 : 1.8}
                />
              </div>
              <span
                className="nav-icon-label transition-colors duration-300"
                style={{ color: active ? 'var(--gold)' : 'var(--text-3)' }}
              >
                {lang === 'ar' ? labelAr : label}
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
