import { createContext, useCallback, useContext, useLayoutEffect, useState } from 'react'
import { useAuth } from './AuthContext'

function themeKey(userId) {
  return userId ? `scholarly-theme-${userId}` : 'scholarly-theme'
}

function readDark(key) {
  const stored = localStorage.getItem(key)
  if (stored) return stored === 'dark'
  return true   // dark by default — the app's designed identity
}

const ThemeContext = createContext(null)

export function ThemeProvider({ children }) {
  const { session } = useAuth()
  const userId = session?.id ?? null
  const key = themeKey(userId)

  const [isDark, setIsDark] = useState(() => {
    const dark = readDark(key)
    document.documentElement.classList.toggle('dark', dark)
    return dark
  })

  // Runs synchronously before paint — no flash, no race with a second effect
  useLayoutEffect(() => {
    const dark = readDark(key)
    document.documentElement.classList.toggle('dark', dark)
    setIsDark(dark)
  }, [key])

  // Toggle: apply + persist in one place, no separate effect needed
  const toggle = useCallback(() => {
    setIsDark((prev) => {
      const next = !prev
      document.documentElement.classList.toggle('dark', next)
      localStorage.setItem(key, next ? 'dark' : 'light')
      return next
    })
  }, [key])

  return <ThemeContext.Provider value={{ isDark, toggle }}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider')
  return ctx
}
