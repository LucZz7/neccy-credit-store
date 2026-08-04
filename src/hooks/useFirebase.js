import { useState, useEffect, useRef, useCallback } from 'react'

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

async function fetchJson(url) {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}

function hashObj(obj) {
  return JSON.stringify(obj).length.toString()
}

export default function useFirebase(pollInterval = 3000) {
  const [data, setData] = useState({})
  const [loading, setLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState(null)
  const [isLive, setIsLive] = useState(false)
  const cacheRef = useRef({})

  const fetchAll = useCallback(async () => {
    try {
      const keys = Object.keys(ENDPOINTS)
      const results = await Promise.allSettled(
        keys.map(k => fetchJson(ENDPOINTS[k]))
      )
      const newData = {}
      let hasChanges = false
      keys.forEach((k, i) => {
        if (results[i].status === 'fulfilled') {
          newData[k] = results[i].value
          const newHash = hashObj(results[i].value)
          if (cacheRef.current[k] !== newHash) {
            hasChanges = true
            cacheRef.current[k] = newHash
          }
        } else {
          newData[k] = null
        }
      })
      if (hasChanges) {
        setData(newData)
        setLastUpdate(Date.now())
        setIsLive(true)
      }
    } catch (e) {
      setIsLive(false)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }
  }, [])

  useEffect(() => {
    fetchAll()
    const interval = setInterval(fetchAll, pollInterval)
    return () => clearInterval(interval)
  }, [fetchAll, pollInterval])

  return { data, loading, lastUpdate, isLive, refetch: fetchAll }
}

export { FIREBASE_BASE, ENDPOINTS }