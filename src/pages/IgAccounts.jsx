import { useState, useMemo } from 'react'
import useFirebase from '../hooks/useFirebase'

export default function IgAccounts() {
  const { data, loading } = useFirebase(4000)
  const [expandedBatches, setExpandedBatches] = useState({})
  const [visiblePasswords, setVisiblePasswords] = useState({})
  const [toast, setToast] = useState(null)

  const batches = useMemo(() => {
    const factory = data.igFactory || {}
    const result = []
    Object.entries(factory).forEach(([userId, batchesObj]) => {
      Object.entries(batchesObj).forEach(([batchName, accounts]) => {
        const acctList = Object.entries(accounts).map(([username, acct]) => ({
          username, ...acct, hasSession: !!(acct.sessionId && acct.csrfToken)
        }))
        result.push({ userId, batchName, accounts: acctList, total: acctList.length })
      })
    })
    return result
  }, [data])

  const totalAccounts = batches.reduce((sum, b) => sum + b.total, 0)

  const copySession = (account) => {
    const session = { username: account.username, email: account.email, password: account.password, csrfToken: account.csrfToken, sessionId: account.sessionId, mid: account.mid, rur: account.rur, dsUserId: account.dsUserId, fullName: account.fullName }
    navigator.clipboard.writeText(JSON.stringify(session, null, 2)).then(() => {
      setToast(`Session copied for ${account.username}`)
      setTimeout(() => setToast(null), 2500)
    })
  }

  const togglePassword = (key) => { setVisiblePasswords(prev => ({ ...prev, [key]: !prev[key] })) }
  const toggleBatch = (key) => { setExpandedBatches(prev => ({ ...prev, [key]: !prev[key] })) }

  if (loading) return <div><div className="page-header"><div className="page-title">IG Accounts</div></div><div className="spinner"><div className="spinner-ring" /></div></div>

  return (
    <div>
      <div className="page-header">
        <div className="page-header-top"><div className="page-title">IG Accounts</div><div className="live-badge"><span className="live-dot" />{totalAccounts}</div></div>
        <div className="page-subtitle">Instagram Factory · {batches.length} batches</div>
      </div>
      <div className="security-banner">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
        Session tokens are sensitive. Handle with care.
      </div>
      {batches.map((batch) => {
        const batchKey = `${batch.userId}_${batch.batchName}`
        const isOpen = expandedBatches[batchKey]
        return (
          <div key={batchKey} className="batch-card">
            <div className="batch-header" onClick={() => toggleBatch(batchKey)}>
              <div><div className="batch-title">{batch.batchName}</div><div style={{fontSize:11,color:'var(--text-tertiary)',marginTop:2}}>User: {batch.userId.slice(0,12)}...</div></div>
              <div style={{display:'flex',alignItems:'center',gap:8}}>
                <span className="batch-count">{batch.total}</span>
                <span className={`batch-chevron ${isOpen?'open':''}`}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9"/></svg>
                </span>
              </div>
            </div>
            {isOpen && (
              <div className="batch-content">
                {batch.accounts.map(account => {
                  const pwKey = `${batchKey}_${account.username}`
                  return (
                    <div key={account.username} className="ig-account-card">
                      <div className="ig-account-header">
                        <div className="ig-username">@{account.username}</div>
                        <span className={`ig-session-badge ${account.hasSession?'valid':'invalid'}`}>{account.hasSession?'SESSION ACTIVE':'NO SESSION'}</span>
                      </div>
                      <div className="ig-email">{account.email}</div>
                      <div className="ig-password">
                        Pass: {visiblePasswords[pwKey]?account.password:'········'}
                        <span className="password-toggle" onClick={(e)=>{e.stopPropagation();togglePassword(pwKey)}}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            {visiblePasswords[pwKey]?<><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><line x1="1" y1="1" x2="23" y2="23"/></>:<><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>}
                          </svg>
                        </span>
                      </div>
                      <div className="ig-actions"><button className="btn-sm green" onClick={(e)=>{e.stopPropagation();copySession(account)}}>Copy Session</button></div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )
      })}
      {batches.length===0 && <div className="activity-empty">No IG accounts found</div>}
      {toast && <div className="toast">{toast}</div>}
    </div>
  )
}