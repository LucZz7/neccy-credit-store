import { NavLink, useLocation } from 'react-router-dom'
import { Icons } from './Icons'

const TABS = [
  { path: '/', icon: Icons.dashboard, label: 'Dashboard' },
  { path: '/users', icon: Icons.users, label: 'Users' },
  { path: '/bots', icon: Icons.bot, label: 'Bots' },
  { path: '/accounts', icon: Icons.key, label: 'Accounts' },
  { path: '/settings', icon: Icons.settings, label: 'Settings' },
]

export default function BottomNav() {
  const location = useLocation()
  const activeIndex = TABS.findIndex(t =>
    t.path === '/' ? location.pathname === '/' : location.pathname.startsWith(t.path)
  )

  return (
    <nav className="bottom-nav">
      {TABS.map((tab, i) => {
        const isActive = activeIndex === i
        return (
          <NavLink
            key={tab.path}
            to={tab.path}
            className={`nav-item ${isActive ? 'active' : ''}`}
            style={{ textDecoration: 'none' }}
          >
            <span className="nav-icon">{tab.icon}</span>
            <span className="nav-label">{tab.label}</span>
          </NavLink>
        )
      })}
    </nav>
  )
}