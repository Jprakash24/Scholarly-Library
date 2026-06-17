const BASE = import.meta.env.VITE_API_URL || 'https://scholarly-library-zgjw.onrender.com/api'

const SESSION_KEY = 'scholarly-library-session'

function getToken() {
  try {
    const data = JSON.parse(sessionStorage.getItem(SESSION_KEY))
    return data?.token ?? null
  } catch { return null }
}

function wait(ms) {
  return new Promise(r => setTimeout(r, ms))
}

export async function apiFetch(path, opts = {}) {
  const token = getToken()
  const options = {
    ...opts,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...opts.headers,
    },
  }

  // Retry up to 3 times on network failure (Render cold start takes 30-60s)
  const delays = [5000, 10000, 15000]
  let lastErr
  for (let i = 0; i <= delays.length; i++) {
    try {
      const res = await fetch(`${BASE}${path}`, options)
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.message || `Error ${res.status}`)
      return data
    } catch (err) {
      lastErr = err
      // Only retry on network errors (cold start), not on HTTP errors like 401/403
      const isNetworkError = err.message === 'Failed to fetch' || err.message === 'Load failed'
      if (!isNetworkError || i === delays.length) break
      await wait(delays[i])
    }
  }
  throw lastErr
}

export const api = {
  get: (path) => apiFetch(path),
  post: (path, body) => apiFetch(path, { method: 'POST', body: JSON.stringify(body) }),
  patch: (path, body) => apiFetch(path, { method: 'PATCH', body: JSON.stringify(body) }),
  del: (path) => apiFetch(path, { method: 'DELETE' }),
}
