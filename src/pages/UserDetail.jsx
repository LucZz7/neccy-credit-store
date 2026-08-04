import { useParams, useNavigate } from 'react-router-dom'
import useFirebase from '../hooks/useFirebase'
import { useMemo } from 'react'

export default function UserDetail() {
  const { deviceId } = useParams()
  const navigate = useNavigate()
  const { data, loading } = useFirebase(4000)
  const user = useMemo(() => {
    const users = data.users || {}
    return { id: deviceId, ...(users[deviceId] || {}) }
  }, [data, deviceId])
  const initials = (user.tgUsername || '?').slice(0, 2).toUpperCase()
  const totalHits = user.binStats ? Object.values(user.binStats).reduce((a, b) => a + b, 0) : 0
  const binCount = user.binStats ? Object.keys(user.binStats).length : 0
  if (loading) return <div><div className="spinner"><div className="spinner-ring" /></div></div>
  return (
    <div>
      <div className="detail-back" onClick={() => navigate('/users')}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6"/></svg>
        Back to Users
      </div>
      <div className="detail-hero">
        <div className="detail-avatar">{initials}</div>
        <div className="detail-username">{user.tgUsername || 'Unknown'}</div>
        <span className={`detail-badge ${user.role==='premium'?'pill green':user.role==='admin'?'pill amber':'pill blue'}`}>{user.role||'FREE'}</span>
      </div>
      <div className="detail-stats">
        <div className="detail-stat"><div className="detail-stat-value">{totalHits}</div><div className="detail-stat-label">Total Hits</div></div>
        <div className="detail-stat"><div className="detail-stat-value">{binCount}</div><div className="detail-stat-label">BINs Used</div></div>
        <div className="detail-stat"><div className="detail-stat-value">{user.isBlocked?'BLOCKED':'ACTIVE'}</div><div className="detail-stat-label">Status</div></div>
      </div>
      <div className="detail-section">
        <h3>Account Info</h3>
        <div className="info-row"><span className="info-label">Device ID</span><span className="info-value" style={{fontSize:11}}>{user.id}</span></div>
        <div className="info-row"><span className="info-label">Last BIN</span><span className="info-value">{user.lastBin||'--'}</span></div>
        <div className="info-row"><span className="info-label">Last Exp</span><span className="info-value">{user.lastExp||'--'}</span></div>
      </div>
      {user.binStats && Object.keys(user.binStats).length > 0 && (
        <div className="detail-section">
          <h3>BIN Statistics (Top 5)</h3>
          {Object.entries(user.binStats).sort((a,b)=>b[1]-a[1]).slice(0,5).map(([bin,count])=>(
            <div key={bin} style={{marginBottom:8}}>
              <div style={{display:'flex',justifyContent:'space-between',marginBottom:4}}>
                <span className="info-label">BIN {bin}</span><span className="info-value">{count}</span>
              </div>
              <div className="progress-bar"><div className="progress-fill" style={{width:`${(count/totalHits)*100}%`}}/></div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}