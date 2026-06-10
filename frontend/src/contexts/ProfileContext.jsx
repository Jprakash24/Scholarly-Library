import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { useAuth } from './AuthContext'
import { api } from '../services/api'

export const DEFAULT_PROFILE_NAME = 'Guest User'
export const DEFAULT_PROFILE_PICTURE =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuADIqsqAAmqgSeglVPcl6xOxa1zvvCWLl7UMd54XHL9wjMpeKA_yHdkBkTQXdZl78moO3X_vyEDbzAGindyREFXNLT9NGKhs2MLNKTp5hsxLTX2sv8apC4mOefuTf240g65bRWTbw6hf3IHyElWpekwAMKKXZHY7AGG-kTO11a1c3uyhwuqvUYVjobiJpCW5AkoLpyFixJfZZOQdaoWZRyeKYnyRyrLv4aRB-44mcFHfGBjzaLWz4bQrpEFVrSwr0GdjL0ycD6pnfAp'

const PROFILE_FIELDS = ['name', 'picture', 'phone', 'department', 'course', 'year', 'bio']

function storageKey(email) {
  return email ? `scholarly-profile-${email}` : null
}

function loadLocalProfile(email) {
  const key = storageKey(email)
  if (!key) return {}
  try { return JSON.parse(localStorage.getItem(key)) ?? {} }
  catch { return {} }
}

const ProfileContext = createContext(null)

export function ProfileProvider({ children }) {
  const { session } = useAuth()
  const email = session?.email ?? null

  const [profile, setProfile] = useState(() => loadLocalProfile(email))

  useEffect(() => {
    const local = loadLocalProfile(email)
    setProfile(local)
    if (!email) return

    // Sync any missing fields from backend on first load
    const missingAny = PROFILE_FIELDS.some((f) => !local[f])
    if (missingAny) {
      api.get('/auth/me')
        .then((user) => {
          const patch = {}
          PROFILE_FIELDS.forEach((f) => { if (user[f]) patch[f] = user[f] })
          if (Object.keys(patch).length === 0) return
          const key = storageKey(email)
          const merged = { ...local, ...patch }
          if (key) localStorage.setItem(key, JSON.stringify(merged))
          setProfile(merged)
        })
        .catch(() => {})
    }
  }, [email]) // eslint-disable-line react-hooks/exhaustive-deps

  const updateProfile = useCallback((updates) => {
    const key = storageKey(email)
    setProfile((prev) => {
      const next = { ...prev, ...updates }
      if (key) localStorage.setItem(key, JSON.stringify(next))
      return next
    })
    // Persist to backend (fire-and-forget)
    api.patch('/auth/profile', updates).catch(() => {})
  }, [email])

  return (
    <ProfileContext.Provider value={{
      profileName:    profile.name      || DEFAULT_PROFILE_NAME,
      profilePicture: profile.picture   || DEFAULT_PROFILE_PICTURE,
      phone:          profile.phone     || '',
      department:     profile.department|| '',
      course:         profile.course    || '',
      year:           profile.year      || '',
      bio:            profile.bio       || '',
      updateProfile,
    }}>
      {children}
    </ProfileContext.Provider>
  )
}

export function useProfile() {
  const ctx = useContext(ProfileContext)
  if (!ctx) throw new Error('useProfile must be used within ProfileProvider')
  return ctx
}
