import React, { useState, useEffect } from 'react'
import SplashScreen   from './screens/SplashScreen'
import HomeScreen     from './screens/HomeScreen'
import HotelsScreen   from './screens/HotelsScreen'
import DiningScreen   from './screens/DiningScreen'
import ShoppingScreen from './screens/ShoppingScreen'
import ExperiencesScreen from './screens/ExperiencesScreen'
import ServicesScreen from './screens/ServicesScreen'
import PrayerScreen   from './screens/PrayerScreen'
import TransportScreen from './screens/TransportScreen'
import ConciergeScreen from './screens/ConciergeScreen'
import EmergencyScreen from './screens/EmergencyScreen'
import ProfileScreen  from './screens/ProfileScreen'
import BottomNav      from './components/BottomNav'
import HotelDetailScreen from './screens/HotelDetailScreen'
import NotificationsScreen from './screens/NotificationsScreen'

export default function App() {
  const [splash, setSplash]     = useState(true)
  const [screen, setScreen]     = useState('home')
  const [lang, setLang]         = useState('en')   // 'en' | 'ar'
  const [detail, setDetail]     = useState(null)   // detail payload for sub-screens

  useEffect(() => {
    const t = setTimeout(() => setSplash(false), 3200)
    return () => clearTimeout(t)
  }, [])

  const navigate = (to, payload = null) => {
    setDetail(payload)
    setScreen(to)
    window.scrollTo?.(0, 0)
  }

  const ctx = { lang, setLang, navigate, detail }

  if (splash) return <SplashScreen />

  const noNav = ['emergency', 'hotel-detail', 'notifications']
  const showNav = !noNav.includes(screen)

  return (
    <div className="app-shell">
      <div className="screen-content">
        {screen === 'home'          && <HomeScreen       {...ctx} />}
        {screen === 'hotels'        && <HotelsScreen     {...ctx} />}
        {screen === 'hotel-detail'  && <HotelDetailScreen {...ctx} />}
        {screen === 'dining'        && <DiningScreen     {...ctx} />}
        {screen === 'shopping'      && <ShoppingScreen   {...ctx} />}
        {screen === 'experiences'   && <ExperiencesScreen {...ctx} />}
        {screen === 'services'      && <ServicesScreen   {...ctx} />}
        {screen === 'prayer'        && <PrayerScreen     {...ctx} />}
        {screen === 'transport'     && <TransportScreen  {...ctx} />}
        {screen === 'concierge'     && <ConciergeScreen  {...ctx} />}
        {screen === 'emergency'     && <EmergencyScreen  {...ctx} />}
        {screen === 'profile'       && <ProfileScreen    {...ctx} />}
        {screen === 'notifications' && <NotificationsScreen {...ctx} />}
      </div>
      {showNav && (
        <BottomNav current={screen} navigate={navigate} lang={lang} />
      )}
    </div>
  )
}
