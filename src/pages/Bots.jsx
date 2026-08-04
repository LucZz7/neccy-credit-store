import { useState, useMemo } from 'react'
import useFirebase from '../hooks/useFirebase'

export default function Bots() {
  const { data, loading } = useFirebase(3000)
  const [expanded, setExpanded] = useState(null)
  const devices = useMemo(() => {
    const raw = data.devices || {}
    return Object.entries(raw).map(([id, d]) => ({ id, ...d }))
  }, [data])

  const consoleLines = useMemo(() => {
    const users = data.users || {}
    return Object.entries(users)
      .filter(([, u]) => u.lastBin && u.lastActive)
      .sort((a, b) => (b[1].lastActive || 0) - (a[1].lastActive || 0))
      .slice(0, 10)
      .map(([, u]) => ({ time: u.lastActive ? new Date(u.lastActive).toLocaleTimeString() : '--:--:--', user: u.tgUsername || 'unknown', bin: u.lastBin, exp: u.lastExp }))
  }, [data])

  if (loading) return <div><div className="page-header"><div className="page-title">Bots & Hits</div></div><div className="spinner"><div className="spinner-ring" /></div></div>

  const totalHits = devices.reduce((sum, d) => sum + (d.total_hits || 0), 0)

  return (
    <div>
      <div className="page-header">
        <div className="page-header-top"><div className="page-title">Bots & Hits</div><div className="live-badge"><span className="live-dot" />LIVE</div></div>
        <div className="page-subtitle">{devices.length} devices · {totalHits.toLocaleString()} total hits</div>
      </div>
      <div style={{ textAlign: 'center', padding: '0 20px 16px' }}>
        <div style={{ fontSize: 12, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>Total Hits</div>
        <div style={{ fontSize: 42, fontWeight: 900, color: 'var(--brand)', fontFamily: 'var(--mono)' }}>{totalHits.toLocaleString()}</div>
      </div>
      {devices.map(device => {
        const hits = device.hits || []
        const successRate = hits.length > 0 ? Math.round((hits.filter(h => h.status === 'success').length / hits.length) * 100) : 0
        return (
          <div key={device.id} className="device-card" onClick={() => setExpanded(expanded === device.id ? null : device.id)}>
            <div className="device-header"><div className="device-name">{device.device_name || device.id}</div><span className={`device-status ${device.status||'offline'}`}>{device.status||'offline'}</span></div>
            <div className="device-stats">
              <div className="device-stat"><div className="val">{device.hit_rate||'--'}</div><div className="lbl">Hit Rate</div></div>
              <div className="device-stat"><div className="val">{device.total_hits?.toLocaleString()||'0'}</div><div className="lbl">Total Hits</div></div>
              <div className="device-stat"><div className="val">{successRate}%</div><div className="lbl">Success</div></div>
            </div>
            <div className="progress-bar"><div className="progress-fill" style={{ width: `${Math.min(100, (device.total_hits || 0) / 50)}%` }} /></div>
            {expanded === device.id && hits.length > 0 && (
              <div className="hit-logs">
                {hits.map((hit, i) => (
                  <div key={i} className={`hit-log-entry ${hit.status==='success'?'success':'failed'}`}>
                    <span>{hit.status==='success'?'OK':'FAIL'}</span>
                    <span style={{flex:1,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{hit.url}</span>
                    <span>{hit.response_time_ms}ms</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )
      })}
      <div className="section-header" style={{paddingLeft:20,paddingRight:20}}><div className="section-title"><span className="live-dot" /> Live Console</div></div>
      <div className="live-console">
        {consoleLines.map((line, i) => (
          <div key={i} className="console-line"><span className="time">[{line.time}]</span> {line.user} BIN {line.bin} EXP {line.exp}</div>
        ))}
        {consoleLines.length===0 && <div className="console-line" style={{color:'var(--text-tertiary)'}}>Waiting for hit data...</div>}
      </div>
    </div>
  )
}