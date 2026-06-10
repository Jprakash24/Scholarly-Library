import { useEffect, useId, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { api } from '../../services/api'
import { navBtn, P } from '../../routes/appPaths'


function postLoginPath(role) {
  return role === 'admin' || role === 'superadmin' ? P.adminAnalytics : P.userDashboard
}

export default function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { isAuthenticated, role, login } = useAuth()
  const formId = useId()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState(null)
  const [info, setInfo] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!isAuthenticated || !role) return
    if (location.pathname !== P.login) return
    navigate(postLoginPath(role), { replace: true })
  }, [isAuthenticated, role, navigate, location.pathname])

  async function handleLogin() {
    setInfo(null)
    setError(null)
    const trimmed = email.trim()
    if (!trimmed || !password) { setError('Please enter your email and password.'); return }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) { setError('Please enter a valid email address.'); return }
    setLoading(true)
    try {
      const data = await api.post('/auth/login', { email: trimmed, password })
      login({ id: data.user._id, email: data.user.email, role: data.user.role, token: data.token })
      navigate(postLoginPath(data.user.role), { replace: true })
    } catch (err) {
      setError(err.message || 'Invalid email or password.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={"bg-surface text-on-surface font-body-md min-h-screen flex items-center justify-center p-gutter relative overflow-hidden"}>
      <div className="absolute inset-0 z-0 bg-surface-container-low opacity-50"></div>
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-secondary-container rounded-full blur-3xl opacity-20"></div>
      <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-primary-container rounded-full blur-3xl opacity-10"></div>
      <main className="relative z-10 w-full max-w-[1000px] bg-surface-container-lowest grid grid-cols-1 md:grid-cols-2 shadow-xl rounded-xl overflow-hidden min-h-[600px]">
      <div className="hidden md:flex flex-col justify-between p-margin-desktop bg-login-hero text-white">
      <div className="flex items-center gap-2">
      <span className="material-symbols-outlined text-[32px]">local_library</span>
      <span className="font-title-md text-title-md font-bold tracking-tight">Scholarly Library</span>
      </div>
      <div>
      <h2 className="font-headline-lg text-headline-lg mb-4">Empowering research through accessible knowledge.</h2>
      <p className="font-body-lg text-body-lg opacity-90">Join our community of scholars and librarians to manage, discover, and preserve historical and modern literature.</p>
      </div>
      <div className="font-label-sm text-label-sm opacity-70">
                      &copy; My Library System v0.0.1
                  </div>
      </div>
      <div className="flex flex-col justify-center p-gutter md:p-margin-desktop bg-surface-container-lowest">
      <div className="md:hidden flex items-center gap-2 mb-gutter justify-center">
      <span className="material-symbols-outlined text-secondary text-[28px]">local_library</span>
      <span className="font-title-md text-title-md font-bold text-secondary">Scholarly Library</span>
      </div>
      <header className="mb-gutter text-center md:text-left">
      <h1 className="text-yellow-700 font-headline-lg text-headline-lg text-on-surface mb-2">Welcome Back</h1>
      <p className="font-body-md text-body-md text-on-surface-variant">Please enter your credentials to access the library portal.</p>
      </header>
      {error ? (
      <p className="mb-3 rounded-lg bg-error-container px-3 py-2 font-label-sm text-on-error-container" role="alert">
                      {error}
                  </p>
      ) : null}
      {info ? (
      <p className="mb-3 rounded-lg bg-secondary-container px-3 py-2 font-label-sm text-on-secondary-container">
                      {info}
                  </p>
      ) : null}
      <form
                      id={formId}
                      className="space-y-gutter"
                      onSubmit={(e) => {
                        e.preventDefault()
                        handleLogin()
                      }}
                  >
      <div className="space-y-1">
      <label className="font-label-sm text-label-sm text-on-surface-variant block" htmlFor={`${formId}-email`}>Institutional Email</label>
      <div className="relative group">
      <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-secondary transition-colors">mail</span>
      <input
                          className="w-full pl-10 pr-4 py-3 bg-surface-container border border-outline-variant rounded-lg font-body-md focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary transition-all"
                          id={`${formId}-email`}
                          name="email"
                          autoComplete="email"
                          placeholder="name@university.edu"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                      />
      </div>
      </div>
      <div className="space-y-1">
      <div className="flex justify-between items-center">
      <label className="font-label-sm text-label-sm text-on-surface-variant" htmlFor={`${formId}-password`}>Password</label>
      <button
                          type="button"
                          className={`${navBtn} font-label-sm text-label-sm text-secondary font-semibold hover:underline`}
                          onClick={() => {
                            setInfo(
                              'If this were a live system, a reset link would be sent to your email.',
                            )
                            setError(null)
                          }}
                      >
                          Forgot Password?
                      </button>
      </div>
      <div className="relative group">
      <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-secondary transition-colors">lock</span>
      <input
                          className="w-full pl-10 pr-12 py-3 bg-surface-container border border-outline-variant rounded-lg font-body-md focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary transition-all"
                          id={`${formId}-password`}
                          name="password"
                          autoComplete="current-password"
                          placeholder="••••••••"
                          type={showPassword ? 'text' : 'password'}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                      />
      <button
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface"
                          type="button"
                          onClick={() => setShowPassword((v) => !v)}
                          aria-label={showPassword ? 'Hide password' : 'Show password'}
                      >
      <span className="material-symbols-outlined">{showPassword ? 'visibility_off' : 'visibility'}</span>
      </button>
      </div>
      </div>
      <button
                          type="submit"
                          disabled={loading}
                          className={`${navBtn} w-full py-4 bg-secondary text-on-secondary
                           font-title-md text-title-md rounded-lg shadow-lg hover:opacity-90 active:scale-[0.98]
                            transition-all flex justify-center items-center gap-2 disabled:opacity-60`}
                      >
      <span>{loading ? 'Signing in…' : 'Login'}</span>
      <span className="material-symbols-outlined">arrow_forward</span>
      </button>
      </form>
      <footer className="mt-margin-desktop text-center">
      <p className="font-body-md text-body-md text-on-surface-variant">
                          New to the Scholarly Library?{' '}
                          <button
                          type="button"
                          className={`${navBtn} text-secondary font-bold hover:underline ml-1`}
                          onClick={() => navigate(P.signup)}
                      >
                              Sign Up
                          </button>
      </p>
      </footer>
      <div className="mt-gutter pt-gutter border-t border-outline-variant/30 flex items-center justify-center gap-4 text-outline">
      <button type="button" className={`${navBtn} flex items-center gap-1 hover:text-on-surface`} onClick={() => setInfo('Support: support@scholarly-library.edu')}>
      <span className="material-symbols-outlined text-[18px]">help</span>
      <span className="font-label-sm text-label-sm">Support</span>
      </button>
      <button type="button" className={`${navBtn} flex items-center gap-1 hover:text-on-surface`} onClick={() => setInfo('Language preference saved for this session.')}>
      <span className="material-symbols-outlined text-[18px]">language</span>
      <span className="font-label-sm text-label-sm">English (US)</span>
      </button>
      </div>
      </div>
      </main>
      <div className="fixed bottom-gutter right-gutter hidden lg:block opacity-20 pointer-events-none">
      <span className="material-symbols-outlined text-[120px] text-secondary">menu_book</span>
      </div>
    </div>
  )
}
