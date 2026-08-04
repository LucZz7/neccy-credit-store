import { Routes, Route, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'
import BottomNav from './components/BottomNav'
import SplashScreen from './components/SplashScreen'
import Dashboard from './pages/Dashboard'
import Users from './pages/Users'
import UserDetail from './pages/UserDetail'
import Bots from './pages/Bots'
import IgAccounts from './pages/IgAccounts'
import Settings from './pages/Settings'

const FIREBASE_BASE = 'https://primeautohitter-default-rtdb.firebaseio.com'

const ENDPOINTS = {
  users:      `${FIREBASE_BASE}/users.json`,
  devices:    `${FIREBASE_BASE}/devices.json`,
  igFactory:  `${FIREBASE_BASE}/PRIME_IG_FACTORY.json`,
  primeUsers: `${FIREBASE_BASE}/PRIME_USERS.json`,
  igAccounts: `${FIREBASE_BASE}/ig_accounts.json`,
  licenses:   `${FIREBASE_BASE}/licenses.json`,
  adminConfig:`${FIREBASE_BASE}/admin/config.json`,
  config:     `${FIREBASE_BASE}/config.json`,
  settings:   `${FIREBASE_BASE}/_settings.json`,
  masterSettings: `${FIREBASE_BASE}/settings.json`,
  security:   `${FIREBASE_BASE}/security_verify.json`,
  botSettings:`${FIREBASE_BASE}/botSettings.json`,
  notifications: `${FIREBASE_BASE}/notifications.json`,
  deviceChanges: `${FIREBASE_BASE}/deviceChangeRequests.json`,
}

export { FIREBASE_BASE, ENDPOINTS }

export default function App() {
  const [showSplash, setShowSplash] = useState(true)
  const location = useLocation()
  const hideNav = location.pathname.startsWith('/user/')

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 2300)
    return () => clearTimeout(timer)
  }, [])

  if (showSplash) return <SplashScreen />

  return (
    <div className="app-shell">
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/users" element={<Users />} />
          <Route path="/user/:deviceId" element={<UserDetail />} />
          <Route path="/bots" element={<Bots />} />
          <Route path="/accounts" element={<IgAccounts />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </main>
      {!hideNav && <BottomNav />}
    </div>
  )
}