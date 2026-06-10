import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
} from 'react'

/* eslint-disable react-refresh/only-export-components -- context module exports Provider and useAuth */

const STORAGE_KEY = 'scholarly-library-session'

function readSession() {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const data = JSON.parse(raw)
    if (!data?.email || !['user', 'admin', 'superadmin'].includes(data.role)) return null
    return data
  } catch {
    return null
  }
}

/** Raw storage string last seen by getSnapshot — stable snapshot for useSyncExternalStore */
let snapshotRaw
let snapshotSession

const listeners = new Set()

function getSnapshot() {
  const raw = sessionStorage.getItem(STORAGE_KEY) ?? ''
  if (raw === snapshotRaw && snapshotSession !== undefined) {
    return snapshotSession
  }
  snapshotRaw = raw
  snapshotSession = raw ? readSession() : null
  return snapshotSession
}

function writeSession(s) {
  if (s) sessionStorage.setItem(STORAGE_KEY, JSON.stringify(s))
  else sessionStorage.removeItem(STORAGE_KEY)
  snapshotRaw = undefined
  snapshotSession = undefined
  listeners.forEach((fn) => fn())
}

function subscribe(fn) {
  listeners.add(fn)
  return () => listeners.delete(fn)
}

function getServerSnapshot() {
  return null
}

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const session = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

  const login = useCallback((s) => {
    writeSession(s)
  }, [])

  const logout = useCallback(() => {
    writeSession(null)
  }, [])

  const value = useMemo(
    () => ({
      session,
      isAuthenticated: session != null,
      role: session?.role ?? null,
      login,
      logout,
    }),
    [session, login, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
