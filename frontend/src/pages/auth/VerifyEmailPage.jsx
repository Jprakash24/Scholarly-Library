import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { useProfile } from '../../contexts/ProfileContext'
import { api } from '../../services/api'
import { navBtn, P } from '../../routes/appPaths'

export default function VerifyEmailPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { login } = useAuth()
  const { updateProfile } = useProfile()

  const [status, setStatus] = useState('verifying') // 'verifying' | 'success' | 'error'
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    const token = searchParams.get('token')
    if (!token) {
      setErrorMsg('No verification token found in the link.')
      setStatus('error')
      return
    }

    api.get(`/auth/verify-email?token=${token}`)
      .then((data) => {
        updateProfile({ name: data.user.name })
        login({ id: data.user._id, email: data.user.email, role: data.user.role, token: data.token })
        setStatus('success')
        setTimeout(() => {
          const isAdmin = data.user.role === 'admin' || data.user.role === 'superadmin'
          navigate(isAdmin ? P.adminAnalytics : P.userDashboard, { replace: true })
        }, 1500)
      })
      .catch((err) => {
        setErrorMsg(err.message || 'Verification failed. The link may be invalid or expired.')
        setStatus('error')
      })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="bg-surface text-on-surface font-body-md min-h-screen flex items-center justify-center p-gutter relative overflow-hidden">
      <div className="absolute inset-0 z-0 bg-surface-container-low opacity-50" />
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-secondary-container rounded-full blur-3xl opacity-20" />
      <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-primary-container rounded-full blur-3xl opacity-10" />

      <main className="relative z-10 w-full max-w-md bg-surface-container-lowest shadow-xl rounded-xl p-margin-desktop text-center space-y-6">
        <div className="flex items-center gap-2 justify-center mb-2">
          <span className="material-symbols-outlined text-secondary text-[32px]">local_library</span>
          <span className="font-title-md text-title-md font-bold text-secondary">Scholarly Library</span>
        </div>

        {status === 'verifying' && (
          <>
            <span className="material-symbols-outlined text-secondary text-[56px] animate-pulse">hourglass_top</span>
            <div>
              <h1 className="font-headline-md text-headline-md text-on-surface mb-2">Verifying your email…</h1>
              <p className="font-body-md text-body-md text-on-surface-variant">Please wait a moment.</p>
            </div>
          </>
        )}

        {status === 'success' && (
          <>
            <span className="material-symbols-outlined text-[56px]" style={{ color: '#4ade80' }}>verified</span>
            <div>
              <h1 className="font-headline-md text-headline-md text-on-surface mb-2">Email verified!</h1>
              <p className="font-body-md text-body-md text-on-surface-variant">Redirecting you to the dashboard…</p>
            </div>
          </>
        )}

        {status === 'error' && (
          <>
            <span className="material-symbols-outlined text-error text-[56px]">error</span>
            <div>
              <h1 className="font-headline-md text-headline-md text-on-surface mb-2">Verification failed</h1>
              <p className="font-body-md text-body-md text-on-surface-variant">{errorMsg}</p>
            </div>
            <div className="flex flex-col gap-3">
              <button
                type="button"
                className={`${navBtn} py-3 bg-secondary text-on-secondary font-title-sm text-title-sm rounded-lg hover:opacity-90 transition-all`}
                onClick={() => navigate(P.signup)}
              >
                Back to sign up
              </button>
              <button
                type="button"
                className={`${navBtn} font-label-sm text-label-sm text-secondary hover:underline`}
                onClick={() => navigate(P.login)}
              >
                Already verified? Log in
              </button>
            </div>
          </>
        )}
      </main>
    </div>
  )
}
