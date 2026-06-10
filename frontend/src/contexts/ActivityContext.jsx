import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import { useAuth } from './AuthContext'

function activityKey(userId) {
  return userId ? `scholarly-activities-${userId}` : null
}

function loadActivities(key) {
  if (!key) return []
  try {
    const parsed = JSON.parse(localStorage.getItem(key))
    if (Array.isArray(parsed)) return parsed
  } catch { /* empty */ }
  return []
}

function persist(key, list) {
  if (!key) return
  localStorage.setItem(key, JSON.stringify(list))
}

const ActivityContext = createContext(null)

export function ActivityProvider({ children }) {
  const { session } = useAuth()
  const userId = session?.id ?? null
  const key = activityKey(userId)

  const [activities, setActivities] = useState(() => loadActivities(key))
  const [toast, setToast] = useState(null)
  const timerRef = useRef(null)

  // When the logged-in user changes, reload their own activity list
  useEffect(() => {
    setActivities(loadActivities(key))
  }, [key])

  const showToast = useCallback((config) => {
    if (timerRef.current) clearTimeout(timerRef.current)
    setToast(config)
    timerRef.current = setTimeout(() => setToast(null), 4000)
  }, [])

  const dismissToast = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    setToast(null)
  }, [])

  const addActivity = useCallback((entry, toastConfig) => {
    setActivities((prev) => {
      const next = [entry, ...prev]
      persist(key, next)
      return next
    })
    if (toastConfig) showToast(toastConfig)
  }, [key, showToast])

  const dismissActivity = useCallback((id) => {
    setActivities((prev) => {
      const next = prev.filter((a) => a.id !== id)
      persist(key, next)
      return next
    })
  }, [key])

  const clearAllActivities = useCallback(() => {
    setActivities([])
    persist(key, [])
  }, [key])

  return (
    <ActivityContext.Provider value={{ activities, addActivity, dismissActivity, clearAllActivities, toast, dismissToast }}>
      {children}
    </ActivityContext.Provider>
  )
}

export function useActivity() {
  const ctx = useContext(ActivityContext)
  if (!ctx) throw new Error('useActivity must be used within ActivityProvider')
  return ctx
}
