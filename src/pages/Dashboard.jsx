import { useState, useMemo } from 'react'
import useFirebase from '../hooks/useFirebase'
import { Icons } from '../components/Icons'

function timeAgo(ts) {
  if (!ts) return '--'
  const ms = Date.now() - ts
  const s = Math.floor(ms / 1000)
  if (s < 60) return 'Just now'
  const m = Math.floor(s / 60)
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

function getStatus(ts) {
  if (!ts) return 'offline'
  const hr = (Date.now() - ts) / 3600000
  if (hr < 1) return 'online'
  if (hr < 24) return 'recent'
  return 'offline'
}

function getBadge(user) {
  const status = getStatus(user.lastActive)
  if (status === 'online' && user.lastBin) return { text: 'HIT', cls: 'badge-hit' }
  if (status === 'online') return { text: 'ONLINE', cls: 'badge-online' }
  if (user.lastBin) return { text: 'HIT', cls: 'badge-hit' }
  return { text: 'IDLE', cls: 'badge-new' }
}

export default function Dashboard() {
  const { data, loading, lastUpdate, isLive } = useFirebase(3000)
  const [selectedUser, setSelectedUser] = useState(null)

  const stats = useMemo(() => {
    const users = data.users || {}
    const userArr = Object.entries(users).map(([id, u]) => ({ id, ...u }))
    const now = Date.now()
    const activeToday = userArr.filter(u => u.lastActive && (now - u.lastActive) < 86400000).length
    let totalBinHits = 0
    userArr.forEach(u => { if (u.binStats) Object.values(u.binStats).forEach(c => totalBinHits += c) })
    const devices = data.devices || {}
    const devArr = Object.values(devices)
    const activeBots = devArr.filter(d => d.status === 'active').length
    const licenses = data.licenses || {}
    const activeLicenses = Object.values(licenses).filter(l => l.status === 'active').length
    let igCount = 0
    const igFactory = data.igFactory || {}
    Object.values(igFactory).forEach(batches => { Object.values(batches).forEach(accts => { igCount += Object.keys(accts).length }) })
    const activity = userArr.filter(u => u.lastActive).sort((a, b) => (b.lastActive || 0) - (a.lastActive || 0)).slice(0, 20)
    return { totalUsers: userArr.length, activeToday, totalBinHits, activeBots, activeLicenses, igCount, activity }
  }, [data])

  if (loading) {
    return (
      <div>
        <div className="page-header"><div className="page-title">NECXY</div></div>
        <div className="spinner"><div className="spinner-ring" /></div>
      </div>
    )
  }

  return (
    <div>
      <div className="page-header">
        <div className="page-header-top">
          <div className="page-title">NECXY</div>
          <div className="live-badge">
            <span className={`live-dot ${!isLive ? 'offline' : ''}`} />
            {isLive ? 'LIVE' : 'OFFLINE'}
          </div>
        </div>
        <div className="page-subtitle">
          Credit Store · {lastUpdate ? new Date(lastUpdate).toLocaleTimeString() : '--'}
        </div>
      </div>

      <div className="stats-scroll">
        {[
          { icon: Icons.users, label: 'Total Users', value: stats.totalUsers },
          { icon: Icons.activity, label: 'Active Today', value: stats.activeToday, clr: 'var(--blue)' },
          { icon: Icons.zap, label: 'Total BIN Hits', value: stats.totalBinHits },
          { icon: Icons.bot, label: 'Bot Devices', value: stats.activeBots },
          { icon: Icons.key, label: 'Licenses', value: stats.activeLicenses },
          { icon: Icons.globe, label: 'IG Accounts', value: stats.igCount },
        ].map((s, i) => (
          <div key={i} className="stat-card" style={{ animationDelay: `${i * 0.06}s` }}>
            <div className="stat-card-icon" style={s.clr ? { color: s.clr } : {}}>{s.icon}</div>
            <div className="stat-card-label">{s.label}</div>
            <div className="stat-card-value">{s.value}</div>
          </div>
        ))}
      </div>

      <div className="section">
        <div className="section-header">
          <div className="section-title"><span className="live-dot" /> Live Activity</div>
        </div>
        {stats.activity.length === 0 ? (
          <div className="activity-empty">Waiting for activity...</div>
        ) : (
          <div className="activity-feed">
            {stats.activity.map((user, i) => {
              const badge = getBadge(user)
              return (
                <div key={user.id} className="activity-item" style={{ animationDelay: `${i * 0.03}s` }}
                  onClick={() => setSelectedUser(selectedUser?.id === user.id ? null : user)}>
                  <span className={`activity-badge ${badge.cls}`}>{badge.text}</span>
                  <div className="activity-info">
                    <div className="activity-user">{user.tgUsername || 'Unknown'}</div>
                    <div className="activity-detail">
                      {user.lastBin ? `BIN: ${user.lastBin}` : ''}{user.lastExp ? ` · Exp: ${user.lastExp}` : ''}
                    </div>
                  </div>
                  <div className="activity-time">{timeAgo(user.lastActive)}</div>
                  <div className="activity-chevron">{Icons.arrowRight}</div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {selectedUser && (
        <div className="section">
          <div className="section-header"><div className="section-title">User Details</div></div>
          <div style={{ background: 'var(--glass-bg)', backdropFilter: 'blur(16px)', border: '1px solid var(--glass-border)', borderRadius: 'var(--r)', padding: 16, marginBottom: 20 }}>
            <div className="info-row"><span className="info-label">Device ID</span><span className="info-value" style={{fontSize:11}}>{selectedUser.id}</span></div>
            <div className="info-row"><span className="info-label">Role</span><span className={`pill ${selectedUser.role==='premium'?'green':selectedUser.role==='admin'?'amber':'blue'}`}>{selectedUser.role||'free'}</span></div>
            <div className="info-row"><span className="info-label">Last BIN</span><span className="info-value">{selectedUser.lastBin||'--'}</span></div>
            <div className="info-row"><span className="info-label">Last Exp</span><span className="info-value">{selectedUser.lastExp||'--'}</span></div>
          </div>
        </div>
      )}
    </div>
  )
}