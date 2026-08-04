import { useState, useMemo } from 'react'
import useFirebase from '../hooks/useFirebase'

export default function Settings() {
  const { data, loading } = useFirebase(4000)
  const [expanded, setExpanded] = useState({})
  const toggleSection = (key) => { setExpanded(prev => ({ ...prev, [key]: !prev[key] })) }
  const settings = useMemo(() => ({
    appConfig: data.config || {},
    updateSettings: data.settings || {},
    masterSettings: data.masterSettings || {},
    security: data.security || {},
    licenses: data.licenses || {},
    notifications: data.notifications || {},
    deviceChanges: data.deviceChanges || {},
    adminConfig: data.adminConfig || {},
  }), [data])

  if (loading) return <div><div className="page-header"><div className="page-title">Settings</div></div><div className="spinner"><div className="spinner-ring" /></div></div>

  const sections = [
    { key: 'appConfig', title: 'App Configuration',
      content: <>{settings.appConfig.version && <div className="setting-row"><span className="setting-label">Version</span><span className="setting-value">{settings.appConfig.version}</span></div>}
      <div className="setting-row"><span className="setting-label">Maintenance Mode</span><button className={`toggle ${settings.appConfig.maintenance?'on':''}`} /></div>
      <div className="setting-row"><span className="setting-label">License URL</span><span className="setting-value">{settings.appConfig.licenseUrl||'--'}</span></div></>
    },
    { key: 'updateSettings', title: 'Update Settings',
      content: <><div className="setting-row"><span className="setting-label">Current</span><span className="setting-value">{settings.updateSettings.currentVersion}</span></div>
      <div className="setting-row"><span className="setting-label">Latest</span><span className="setting-value" style={{color:settings.updateSettings.forceUpdate?'var(--red)':'var(--brand)'}}>{settings.updateSettings.latestVersion}{settings.updateSettings.forceUpdate?' (FORCE)':''}</span></div>
      <div className="setting-row"><span className="setting-label">Force Update</span><button className={`toggle ${settings.updateSettings.forceUpdate?'on':''}`} /></div>
      <div className="setting-row"><span className="setting-label">Rollout</span><span className="setting-value">{settings.updateSettings.rolloutPercent}%</span></div></>
    },
    { key: 'licenses', title: `License Keys (${Object.keys(settings.licenses).length})`,
      content: <>{Object.entries(settings.licenses).map(([key, lic]) => (
        <div key={key} className="license-card"><div><div className="license-key" onClick={()=>navigator.clipboard.writeText(key)}>{key}</div><div style={{fontSize:10,color:'var(--text-tertiary)',marginTop:2}}>{lic.created} · {lic.expires}</div></div><span className={`pill ${lic.status==='active'?'green':'red'}`}>{lic.status}</span></div>
      ))}</>
    },
    { key: 'security', title: 'Security',
      content: <><div className="setting-row"><span className="setting-label">V-Key</span><span className="setting-value" style={{color:'var(--green)'}}>{settings.security.v_key}</span></div>
      <div className="setting-row"><span className="setting-label">S-Code</span><span className="setting-value" style={{color:'var(--green)'}}>{settings.security.s_code}</span></div>
      <div className="setting-row"><span className="setting-label">H-Hash</span><span className="setting-value" style={{color:'var(--green)'}}>{settings.security.h_hash}</span></div>
      <div className="setting-row"><span className="setting-label">Global Free Access</span><button className={`toggle ${settings.security.globalFreeAccess?'on':''}`} /></div></>
    },
    { key: 'deviceChanges', title: `Device Changes (${Object.keys(settings.deviceChanges).length})`,
      content: <>{Object.entries(settings.deviceChanges).map(([id, req]) => (
        <div key={id} style={{background:'var(--bg-secondary)',borderRadius:'var(--r-sm)',padding:10,marginBottom:6}}>
          <div style={{display:'flex',justifyContent:'space-between',marginBottom:4}}><span style={{fontSize:13,fontWeight:600,color:'var(--text)'}}>{req.requesterUsername||'unknown'}</span><span className={`pill ${req.status==='approved'?'green':req.status==='pending'?'amber':'red'}`}>{req.status}</span></div>
          <div style={{fontSize:11,color:'var(--text-secondary)'}}>TG: {req.requesterTgUserId} · {req.requesterDeviceId?.slice(0,12)}...</div>
        </div>
      ))}</>
    },
    { key: 'adminConfig', title: 'Admin Config',
      content: <>{settings.adminConfig.config && <>
        <div className="setting-row"><span className="setting-label">App Name</span><span className="setting-value">{settings.adminConfig.config.app_name}</span></div>
        <div className="setting-row"><span className="setting-label">Admin</span><span className="setting-value">{settings.adminConfig.config.admin_user}</span></div>
        <div className="setting-row"><span className="setting-label">Telegram</span><span className="setting-value">{settings.adminConfig.config.telegram}</span></div>
        {settings.adminConfig.config.target_urls && <div style={{marginTop:8}}><div className="setting-label" style={{marginBottom:4}}>Target URLs</div>{settings.adminConfig.config.target_urls.map((url,i)=><div key={i} style={{fontSize:10,color:'var(--text-tertiary)',fontFamily:'var(--mono)',marginBottom:2}}>{url}</div>)}</div>}
      </>}</>
    },
    { key: 'master', title: 'Master Settings',
      content: <><div className="setting-row"><span className="setting-label">Global Free Access</span><button className={`toggle ${settings.masterSettings.globalFreeAccess?'on':''}`} /></div>
      {settings.masterSettings.updateMsg && <div className="setting-row"><span className="setting-label">Update Msg</span><span className="setting-value" style={{fontStyle:'italic'}}>{settings.masterSettings.updateMsg}</span></div>}</>
    }
  ]

  return (
    <div>
      <div className="page-header">
        <div className="page-header-top"><div className="page-title">Settings</div><div className="live-badge"><span className="live-dot" />ADMIN</div></div>
        <div className="page-subtitle">Configuration & Security</div>
      </div>
      {sections.map(section => (
        <div key={section.key} className="settings-section">
          <div className="settings-section-header" onClick={() => toggleSection(section.key)}>
            <span className="settings-section-title">{section.title}</span>
            <span style={{color:'var(--text-tertiary)',fontSize:14,transition:'transform 0.2s',transform:expanded[section.key]?'rotate(180deg)':'none'}}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9"/></svg>
            </span>
          </div>
          {expanded[section.key] && <div className="settings-section-content">{section.content}</div>}
        </div>
      ))}
    </div>
  )
}