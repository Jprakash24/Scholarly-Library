import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { apiFetch } from '../services/api'
import { useAuth } from './AuthContext'

function shelfKey(userId) {
  return userId ? `scholarly-saved-shelf-${userId}` : null
}

function loadSet(key) {
  if (!key) return new Set()
  try {
    const raw = localStorage.getItem(key)
    return raw ? new Set(JSON.parse(raw)) : new Set()
  } catch {
    return new Set()
  }
}

function persistSet(key, set) {
  if (!key) return
  localStorage.setItem(key, JSON.stringify([...set]))
}

const UserLibraryContext = createContext(null)

export function UserLibraryProvider({ children }) {
  const { session } = useAuth()
  const userId = session?.id ?? null
  const key = shelfKey(userId)

  const [savedIds, setSavedIds] = useState(() => loadSet(key))

  // When the logged-in user changes, reload from that user's own localStorage slot
  useEffect(() => {
    setSavedIds(loadSet(key))
  }, [key])

  // Sync from backend — replace local with authoritative backend list
  useEffect(() => {
    if (!userId || !key) return
    apiFetch('/saved/mine')
      .then((data) => {
        setSavedIds((prev) => {
          // Merge: keep any unsynced local saves + backend truth
          const merged = new Set([...data.savedIds, ...prev])
          persistSet(key, merged)
          return merged
        })
      })
      .catch(() => {})
  }, [userId, key])

  const toggleSaved = useCallback((id) => {
    setSavedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      persistSet(key, next)
      return next
    })
    apiFetch(`/saved/${id}`, { method: 'POST' }).catch(() => {})
  }, [key])

  const value = useMemo(() => ({ savedIds, toggleSaved }), [savedIds, toggleSaved])

  return <UserLibraryContext.Provider value={value}>{children}</UserLibraryContext.Provider>
}

export function useUserLibrary() {
  const ctx = useContext(UserLibraryContext)
  if (!ctx) throw new Error('useUserLibrary must be used within UserLibraryProvider')
  return ctx
}
