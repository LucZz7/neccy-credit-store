import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import useFirebase from '../hooks/useFirebase'

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

export default function Users() {
  const { data, loading } = useFirebase(4000)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const navigate = useNavigate()

  const users = useMemo(() => {
    const raw = data.users || {}
    let arr = Object.entries(raw).map(([id, u]) => ({ id, ...u }))
    if (filter === 'premium') arr = arr.filter(u => u.role === 'premium')
    if (filter === 'free') arr = arr.filter(u => u.role === 'free' || !u.role)
    if (filter === 'admin') arr = arr.filter(u => u.role === 'admin')
    if (search) {
      const s = search.toLowerCase()
      arr = arr.filter(u => (u.tgUsername && u.tgUsername.toLowerCase().includes(s)) || u.id.toLowerCase().includes(s))
    }
    return arr.sort((a, b) => (b.lastActive || 0) - (a.lastActive || 0))
  }, [data, search, filter])

  if (loading) {
    return (
      <div>
        <div className="page-header"><div className="page-title">Users</div></div>
        <div className="spinner"><div className="spinner-ring" /></div>
      </div>
    )
  }

  return (
    <div>
      <div className="page-header">
        <div className="page-header-top"><div className="page-title">Users</div><div className="live-badge"><span className="live-dot" />{users.length}</div></div>
        <div className="page-subtitle">Manage all device users</div>
      </div>
      <div className="search-bar">
        <span className="search-icon-wrap"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg></span>
        <input type="text" placeholder="Search by username or device ID..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>
      <div className="segmented-control">
        {['all', 'premium', 'free', 'admin'].map(f => (
          <button key={f} className={`segment-btn ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>{f.toUpperCase()}</button>
        ))}
      </div>
      <div className="user-list">
        {users.map((user, i) => {
          const status = getStatus(user.lastActive)
          const initials = (user.tgUsername || '?').slice(0, 2).toUpperCase()
          return (
            <div key={user.id} className="user-card" style={{ animationDelay: `${i * 0.04}s` }} onClick={() => navigate(`/user/${user.id}`)}>
              <div className={`user-avatar ${status}`}>{initials}</div>
              <div className="user-info">
                <div className="user-name">{user.tgUsername || 'Unknown'}</div>
                {user.role && <div className={`user-role role-${user.role}`}>{user.role}</div>}
                <div className="user-device">{user.id.slice(0, 12)}...</div>
              </div>
              <div className="user-meta">
                <div className="user-time">{timeAgo(user.lastActive)}</div>
                {user.lastBin && <div className="user-bin">{user.lastBin}</div>}
              </div>
              <div className={`status-dot ${status}`} />
            </div>
          )
        })}
        {users.length === 0 && <div className="activity-empty">No users found</div>}
      </div>
    </div>
  )
}