import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useActivity } from '../../contexts/ActivityContext'
import { useAuth } from '../../contexts/AuthContext'
import { useProfile } from '../../contexts/ProfileContext'
import { useUserLibrary } from '../../contexts/UserLibraryContext'
import { useMaterials } from '../../hooks/useMaterials'
import { api } from '../../services/api'
import { navBtn, P } from '../../routes/appPaths'

/* ── helpers ──────────────────────────────────────── */
function memberSince(createdAt) {
  if (!createdAt) return '—'
  return new Date(createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
}

function studentId(id) {
  if (!id) return 'SL-000000'
  return 'SL-' + String(id).slice(-6).toUpperCase()
}

const YEAR_OPTIONS = ['1st Year', '2nd Year', '3rd Year', '4th Year', 'Postgraduate', 'PhD']

/* ── Editable info row ─────────────────────────────── */
function InfoRow({ icon, label, value, placeholder = 'Not set', className = '' }) {
  return (
    <div className={`flex items-start gap-3 ${className}`}>
      <span className="material-symbols-outlined text-[20px] text-secondary mt-0.5 shrink-0">{icon}</span>
      <div className="min-w-0">
        <p className="text-label-sm font-label-sm text-on-surface-variant mb-0.5">{label}</p>
        <p className={`text-body-md font-body-md ${value ? 'text-on-surface' : 'text-outline italic'}`}>
          {value || placeholder}
        </p>
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════════
   PAGE
══════════════════════════════════════════════════ */
export default function ProfilePage() {
  const navigate = useNavigate()
  const { logout, session, role } = useAuth()
  const isAdmin = role === 'admin' || role === 'superadmin'
  const { profileName, profilePicture, phone, department, course, year, bio, updateProfile } = useProfile()
  const { activities } = useActivity()
  const { savedIds, toggleSaved } = useUserLibrary()

  const [emailAlerts, setEmailAlerts] = useState(true)
  const [newArrivals,  setNewArrivals]  = useState(false)
  const [toast, setToast] = useState('')

  /* ── Edit profile modal ─────────────────────── */
  const picInputRef  = useRef(null)
  const [editOpen,   setEditOpen]   = useState(false)
  const [editAnim,   setEditAnim]   = useState(false)  // drives enter/exit CSS transition
  const [editTab,    setEditTab]    = useState('basic')
  const [editName,       setEditName]       = useState('')
  const [editPicPreview, setEditPicPreview] = useState('')
  const [editPhone,      setEditPhone]      = useState('')
  const [editDept,       setEditDept]       = useState('')
  const [editCourse,     setEditCourse]     = useState('')
  const [editYear,       setEditYear]       = useState('')
  const [editBio,        setEditBio]        = useState('')

  /* ── Change-password modal ──────────────────── */
  const [cpOpen,    setCpOpen]    = useState(false)
  const [cpStep,    setCpStep]    = useState(1)
  const [cpLoading, setCpLoading] = useState(false)
  const [cpOtp,     setCpOtp]     = useState('')
  const [cpDevOtp,  setCpDevOtp]  = useState('')
  const [cpNew,     setCpNew]     = useState('')
  const [cpConfirm, setCpConfirm] = useState('')

  /* ── Deactivate modal ───────────────────────── */
  const [daOpen,    setDaOpen]    = useState(false)
  const [daEmail,   setDaEmail]   = useState('')
  const [daLoading, setDaLoading] = useState(false)

  /* ── Data ───────────────────────────────────── */
  const savedIdArray = useMemo(() => [...savedIds], [savedIds])
  const { materials: savedMaterials } = useMaterials({ ids: savedIdArray.length > 0 ? savedIdArray : [] })

  const [borrowedBooks, setBorrowedBooks] = useState([])
  useEffect(() => {
    api.get('/borrow/my')
      .then((data) => {
        const approved = (Array.isArray(data) ? data : []).filter((r) => r.status === 'approved')
        setBorrowedBooks(approved)
      })
      .catch(() => {})
  }, [])

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000) }

  /* ── Edit profile handlers ──────────────────── */
  const openEditModal = (tab = 'basic') => {
    setEditTab(tab)
    setEditName(profileName)
    setEditPicPreview(profilePicture)
    setEditPhone(phone)
    setEditDept(department)
    setEditCourse(course)
    setEditYear(year)
    setEditBio(bio)
    setEditOpen(true)
    // Next paint: trigger the enter animation
    requestAnimationFrame(() => requestAnimationFrame(() => setEditAnim(true)))
  }

  const closeEditModal = () => {
    setEditAnim(false)
    setTimeout(() => setEditOpen(false), 250)
  }

  const handlePicChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => setEditPicPreview(ev.target.result)
    reader.readAsDataURL(file)
  }

  const saveEditModal = () => {
    if (!editName.trim()) { showToast('Name cannot be empty.'); return }
    updateProfile({
      name:       editName.trim(),
      picture:    editPicPreview,
      phone:      editPhone.trim(),
      department: editDept.trim(),
      course:     editCourse.trim(),
      year:       editYear,
      bio:        editBio.trim(),
    })
    closeEditModal()
    showToast('Profile updated successfully.')
  }

  /* ── Change-password handlers ───────────────── */
  const openChangePwd = () => {
    setCpStep(1); setCpOtp(''); setCpNew(''); setCpConfirm(''); setCpDevOtp(''); setCpOpen(true)
  }

  const requestOtp = async () => {
    setCpLoading(true)
    try {
      const data = await api.post('/auth/otp', {})
      setCpDevOtp(data.devOtp ?? '')
      setCpStep(2)
      showToast('Verification code sent to your email.')
    } catch (err) {
      showToast(err.message || 'Failed to send code.')
      // Stay on step 2 if resend was rate-limited (already past step 1)
      if (cpStep !== 1) setCpStep(2)
    } finally { setCpLoading(false) }
  }

  const verifyOtp = () => {
    if (cpOtp.trim().length !== 6) { showToast('Enter the 6-digit code.'); return }
    setCpStep(3)
  }

  const submitNewPassword = async () => {
    if (cpNew.length < 6)     { showToast('Password must be at least 6 characters.'); return }
    if (cpNew !== cpConfirm)  { showToast('Passwords do not match.'); return }
    setCpLoading(true)
    try {
      await api.patch('/auth/password', { otp: cpOtp.trim(), newPassword: cpNew })
      setCpOpen(false)
      showToast('Password updated successfully.')
    } catch (err) {
      showToast(err.message || 'Failed to update password.')
      setCpStep(2)
    } finally { setCpLoading(false) }
  }

  /* ── Deactivate handler ─────────────────────── */
  const deactivateAccount = async () => {
    setDaLoading(true)
    try {
      await api.patch('/auth/deactivate', { confirmEmail: daEmail })
      showToast('Account deactivated. Logging out…')
      setTimeout(() => { logout(); navigate(P.login, { replace: true }) }, 1500)
    } catch (err) {
      showToast(err.message || 'Deactivation failed.')
    } finally { setDaLoading(false) }
  }

  /* ── Derived ────────────────────────────────── */
  const sId = studentId(session?._id || session?.id)

  /* ════════════════════════════════════════════
     RENDER
  ════════════════════════════════════════════ */
  return (
    <div className="min-h-screen bg-surface text-on-surface">

      {/* ── Top App Bar  (hidden for admin) ──────── */}
      {!isAdmin && (
      <header className="bg-surface-container border-b border-outline-variant shadow-sm flex justify-between items-center px-gutter py-base w-full sticky top-0 md:top-[88px] z-40">
        <div className="flex items-center gap-3">
          <button type="button" className={`${navBtn} p-2 text-primary hover:bg-surface-container-high rounded-full transition-colors active:scale-95`} onClick={() => navigate(P.userDashboard)} aria-label="Back">
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <h1 className="font-bold text-title-md text-on-surface">My Profile</h1>
        </div>
        <div className="flex items-center gap-2">
          {(role === 'admin' || role === 'superadmin') && (
            <button type="button" className={`${navBtn} px-4 py-2 text-label-sm text-on-surface-variant hover:bg-surface-container-high rounded-lg transition-colors active:scale-95`} onClick={() => navigate(P.adminAnalytics)}>
              Librarian View
            </button>
          )}
          <button type="button" className={`${navBtn} flex items-center gap-2 bg-secondary text-on-secondary px-4 py-2 rounded-xl text-label-sm font-bold hover:opacity-90 active:scale-95`} onClick={() => openEditModal('basic')}>
            <span className="material-symbols-outlined text-[18px]">edit</span>
            Edit Profile
          </button>
        </div>
      </header>
      )}

      <main className="max-w-[1400px] mx-auto px-4 sm:px-6 md:px-8 py-8 pb-28 space-y-6 md:mt-[70px]">

        {/* ════════════════════════════════════════
            PROFILE HERO
        ════════════════════════════════════════ */}
        <section className="bg-surface-container-lowest rounded-2xl border border-outline-variant overflow-hidden">

          {/* Cover strip */}
          <div className="h-28 bg-gradient-to-r from-primary-container via-surface-container to-tertiary-container relative" />

          <div className="px-6 pb-6">
            {/* Avatar row */}
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 -mt-12 mb-5">
              <div className="relative w-fit">
                <img
                  src={profilePicture}
                  alt={profileName}
                  className="w-24 h-24 rounded-full object-cover border-4 border-surface-container-lowest shadow-lg"
                />
                <button
                  type="button"
                  onClick={() => openEditModal('basic')}
                  className={`${navBtn} absolute bottom-0 right-0 p-1.5 bg-secondary text-on-secondary rounded-full shadow-md active:scale-90`}
                  aria-label="Change photo"
                >
                  <span className="material-symbols-outlined text-[16px]">photo_camera</span>
                </button>
              </div>

              <div className="flex gap-2 sm:mb-1">
                <button type="button" className={`${navBtn} flex items-center gap-2 bg-secondary text-on-secondary px-5 py-2.5 rounded-xl text-label-sm font-bold hover:opacity-90 active:scale-95`} onClick={() => openEditModal('basic')}>
                  <span className="material-symbols-outlined text-[17px]">edit</span>
                  Edit Profile
                </button>
                <button type="button" className={`${navBtn} flex items-center gap-2 border border-outline-variant text-on-surface-variant px-5 py-2.5 rounded-xl text-label-sm hover:bg-surface-container active:scale-95`} onClick={() => { logout(); navigate(P.login, { replace: true }) }}>
                  <span className="material-symbols-outlined text-[17px]">logout</span>
                  Logout
                </button>
              </div>
            </div>

            {/* Name + email + role */}
            <h2 className="font-bold text-[22px] text-on-surface leading-tight">{profileName}</h2>
            {session?.email && (
              <p className="text-secondary text-label-lg font-label-lg mt-0.5">{session.email}</p>
            )}

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mt-3">
              <span className="flex items-center gap-1 px-3 py-1 bg-secondary-container text-on-secondary-container rounded-full text-label-sm font-label-sm font-bold">
                <span className="material-symbols-outlined text-[14px]">verified</span>
                {role === 'admin' ? 'Librarian' : role === 'superadmin' ? 'Super Admin' : 'Student Member'}
              </span>
              {department && (
                <span className="flex items-center gap-1 px-3 py-1 bg-surface-container text-on-surface-variant rounded-full text-label-sm font-label-sm">
                  <span className="material-symbols-outlined text-[14px]">domain</span>
                  {department}
                </span>
              )}
              {year && (
                <span className="flex items-center gap-1 px-3 py-1 bg-surface-container text-on-surface-variant rounded-full text-label-sm font-label-sm">
                  <span className="material-symbols-outlined text-[14px]">school</span>
                  {year}
                </span>
              )}
              <span className="flex items-center gap-1 px-3 py-1 bg-surface-container text-on-surface-variant rounded-full text-label-sm font-label-sm font-mono">
                <span className="material-symbols-outlined text-[14px]">badge</span>
                {sId}
              </span>
            </div>

            {/* Bio */}
            {bio && (
              <p className="mt-4 text-body-md text-on-surface-variant leading-relaxed max-w-2xl">{bio}</p>
            )}

            {/* Stats row */}
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mt-5 pt-5 border-t border-outline-variant">
              {[
                { label: 'Activities',    value: activities.length,     icon: 'history',       color: 'text-primary' },
                { label: 'Borrowed',      value: borrowedBooks.length,  icon: 'local_library', color: 'text-secondary' },
                { label: 'Saved',         value: savedIds.size,         icon: 'bookmarks',     color: 'text-secondary' },
                { label: 'Member Since',  value: memberSince(session?.createdAt), icon: 'calendar_today', color: 'text-on-surface-variant', small: true },
              ].map((s) => (
                <div key={s.label} className="text-center">
                  <span className={`material-symbols-outlined text-[22px] ${s.color}`}>{s.icon}</span>
                  <p className={`font-bold mt-0.5 ${s.small ? 'text-[13px]' : 'text-[22px]'} text-on-surface leading-tight`}>{s.value}</p>
                  <p className="text-label-sm font-label-sm text-on-surface-variant">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ════════════════════════════════════════
            PERSONAL INFORMATION
        ════════════════════════════════════════ */}
        <section className="bg-surface-container-lowest rounded-2xl border border-outline-variant p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-bold text-title-md text-on-surface flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary">person</span>
              Personal Information
            </h3>
            <button type="button" className={`${navBtn} flex items-center gap-1.5 px-4 py-2 rounded-xl border border-outline-variant text-on-surface-variant text-label-sm hover:bg-surface-container active:scale-95`} onClick={() => openEditModal('academic')}>
              <span className="material-symbols-outlined text-[16px]">edit</span>
              Edit
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <InfoRow icon="badge"         label="Student ID"   value={sId} />
            <InfoRow icon="email"         label="Email Address" value={session?.email} />
            <InfoRow icon="call"          label="Phone Number"  value={phone}      placeholder="Not provided" />
            <InfoRow icon="domain"        label="Department"    value={department} placeholder="Not set" />
            <InfoRow icon="school"        label="Course / Program" value={course}  placeholder="Not set" />
            <InfoRow icon="class"         label="Year of Study" value={year}       placeholder="Not set" />
            <InfoRow icon="calendar_today" label="Member Since" value={memberSince(session?.createdAt)} />
            <InfoRow icon="manage_accounts" label="Account Role" value={role === 'admin' ? 'Librarian' : role === 'superadmin' ? 'Super Admin' : 'Student'} />
          </div>
        </section>

        {/* ════════════════════════════════════════
            CURRENTLY BORROWED
        ════════════════════════════════════════ */}
        <section className="bg-surface-container-lowest rounded-2xl border border-outline-variant p-6">
          <div className="flex justify-between items-center mb-5">
            <h3 className="font-bold text-title-md text-on-surface flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary">local_library</span>
              Currently Borrowed
              {borrowedBooks.length > 0 && (
                <span className="px-2 py-0.5 bg-secondary-container text-on-secondary-container rounded-full text-[12px] font-bold">{borrowedBooks.length}</span>
              )}
            </h3>
            <button type="button" className={`${navBtn} text-secondary text-label-sm hover:underline`} onClick={() => navigate(P.userSaveHistory)}>View History</button>
          </div>
          {borrowedBooks.length === 0 ? (
            <div className="flex flex-col items-center py-8 text-center gap-2">
              <span className="material-symbols-outlined text-[40px] text-outline">menu_book</span>
              <p className="text-body-md text-on-surface-variant">No books currently borrowed.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {borrowedBooks.map((req) => (
                <div key={req._id} className="flex items-center gap-4 p-3 rounded-xl bg-surface-container hover:bg-surface-container-high transition-colors border border-outline-variant cursor-pointer" onClick={() => navigate(P.userMaterialDetail(req.material?._id))}>
                  <div className="w-10 h-14 rounded-lg overflow-hidden bg-surface-container-high shrink-0">
                    {req.material?.coverUrl
                      ? <img className="w-full h-full object-contain" src={req.material.coverUrl} alt={req.material.title} />
                      : <div className="w-full h-full flex items-center justify-center"><span className="material-symbols-outlined text-[20px] text-outline-variant">book</span></div>
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-[14px] text-on-surface line-clamp-1">{req.material?.title ?? '—'}</p>
                    <p className="text-[12px] text-on-surface-variant line-clamp-1">{req.material?.author ?? ''}</p>
                  </div>
                  <div className="shrink-0 text-right">
                    <span className="px-2 py-1  text-on-tertiary-fixed-variant rounded-full text-[11px] font-bold"
                    style={{color:' #e9c176'}}>
                      Borrowed
                    </span>
                    {req.dueDate && <p className="text-[11px] text-on-surface-variant mt-1">Due {new Date(req.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ════════════════════════════════════════
            MY SHELF
        ════════════════════════════════════════ */}
        <section className="bg-surface-container-lowest rounded-2xl border border-outline-variant p-6">
          <div className="flex justify-between items-center mb-5">
            <h3 className="font-bold text-title-md text-on-surface flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary">bookmarks</span>
              My Shelf
              {savedMaterials.length > 0 && (
                <span className="px-2 py-0.5 bg-secondary-container text-on-secondary-container rounded-full text-[12px] font-bold">{savedMaterials.length}</span>
              )}
            </h3>
            <button type="button" className={`${navBtn} text-secondary text-label-sm hover:underline`} onClick={() => navigate(P.userCatalog)}>Browse Catalog</button>
          </div>
          {savedMaterials.length === 0 ? (
            <div className="flex flex-col items-center py-10 text-center gap-3">
              <span className="material-symbols-outlined text-[48px] text-outline">bookmark_border</span>
              <p className="text-body-md text-on-surface-variant">No items saved yet.</p>
              <button type="button" className={`${navBtn} px-5 py-2 bg-on-surface text-surface rounded-full font-bold text-body-md hover:opacity-90 active:scale-95`} onClick={() => navigate(P.userCatalog)}>Explore Catalog</button>
            </div>
          ) : (
            <div className="space-y-3">
              {savedMaterials.map((m) => (
                <div key={m._id} className="flex items-center gap-4 p-3 rounded-xl bg-surface-container hover:bg-surface-container-high transition-colors border border-outline-variant">
                  <div className="w-10 h-14 rounded-lg overflow-hidden bg-surface-container-high shrink-0">
                    {m.coverUrl
                      ? <img className="w-full h-full object-cover" src={m.coverUrl} alt={m.title} />
                      : <div className="w-full h-full flex items-center justify-center"><span className="material-symbols-outlined text-[20px] text-outline-variant">book</span></div>
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-[14px] text-on-surface line-clamp-1">{m.title}</p>
                    <p className="text-[12px] text-on-surface-variant line-clamp-1">{m.author}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button type="button" className={`${navBtn} px-3 py-1.5 border border-outline-variant rounded-full text-label-sm text-on-surface-variant hover:bg-surface-container-high`} onClick={() => navigate(P.userMaterialDetail(m._id))}>View</button>
                    <button type="button" className={`${navBtn} p-1.5 rounded-full hover:bg-error-container text-on-surface-variant hover:text-error`} onClick={() => toggleSaved(m._id)} aria-label="Remove">
                      <span className="material-symbols-outlined text-[20px]">bookmark_remove</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ════════════════════════════════════════
            ACCOUNT SETTINGS
        ════════════════════════════════════════ */}
        <section className="bg-surface-container-lowest rounded-2xl border border-outline-variant p-6">
          <h3 className="font-bold text-title-md text-on-surface flex items-center gap-2 mb-6">
            <span className="material-symbols-outlined text-secondary">settings</span>
            Account Settings
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">

            {/* Notifications */}
            <div>
              <h4 className="font-bold text-[15px] text-on-surface mb-4">Notifications</h4>
              <div className="space-y-4">
                {[
                  { label: 'Email alerts for due dates', value: emailAlerts, set: setEmailAlerts },
                  { label: 'New material arrivals',      value: newArrivals, set: setNewArrivals },
                ].map(({ label, value, set }) => (
                  <div key={label} className="flex items-center justify-between">
                    <span className="text-body-md text-on-surface-variant">{label}</span>
                    <button
                      type="button"
                      aria-pressed={value}
                      onClick={() => set((v) => !v)}
                      className={`${navBtn} w-11 h-6 rounded-full relative transition-colors ${value ? 'bg-secondary' : 'bg-surface-container-high'}`}
                    >
                      <span className={`absolute top-1 w-4 h-4 rounded-full transition-all duration-200 ${value ? 'right-1 bg-on-secondary' : 'left-1 bg-on-surface-variant'}`} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Privacy */}
            <div>
              <h4 className="font-bold text-[15px] text-on-surface mb-4">Privacy & Security</h4>
              <div className="space-y-2">
                <button type="button" className={`${navBtn} w-full text-left p-3 rounded-xl hover:bg-surface-container transition-colors flex items-center justify-between`} onClick={openChangePwd}>
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-[20px] text-on-surface-variant">lock</span>
                    <span className="text-body-md text-on-surface-variant">Change Password</span>
                  </div>
                  <span className="material-symbols-outlined text-on-surface-variant">chevron_right</span>
                </button>
                <button type="button" className={`${navBtn} w-full text-left p-3 rounded-xl hover:bg-error-container transition-colors flex items-center justify-between`} onClick={() => { setDaEmail(''); setDaOpen(true) }}>
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-[20px] text-error">delete_forever</span>
                    <span className="text-body-md text-error">Deactivate Account</span>
                  </div>
                  <span className="material-symbols-outlined text-error">chevron_right</span>
                </button>
              </div>
            </div>

          </div>
        </section>

      </main>

      {/* ── Mobile bottom nav ─────────────────────── */}
      <nav
        aria-label="Bottom navigation"
        className="md:hidden fixed bottom-0 inset-x-0 z-50 bg-surface border-t border-outline-variant shadow-lg"
      >
        <div className="flex justify-around items-center px-2 py-1">
          {[
            { icon: 'home',            label: 'Home',    href: P.userDashboard, active: false },
            { icon: 'search',          label: 'Browse',  href: P.userCatalog,   active: false },
            { icon: 'history',         label: 'History', href: P.userActivity,  active: false },
            { icon: 'manage_accounts', label: 'Account', href: P.userProfile,   active: true  },
          ].map((item) => (
            <button
              key={item.href}
              type="button"
              onClick={() => navigate(item.href)}
              className={`${navBtn} flex flex-col items-center gap-0.5 py-2 px-3 rounded-2xl transition-all active:scale-90 min-w-[64px] ${
                item.active ? 'text-secondary' : 'text-on-surface-variant'
              }`}
            >
              <span
                className={`relative flex items-center justify-center w-12 h-6 rounded-full transition-all ${
                  item.active ? 'bg-secondary-container' : ''
                }`}
              >
                <span
                  className="material-symbols-outlined text-[22px]"
                  style={item.active ? { fontVariationSettings: "'FILL' 1" } : {}}
                >
                  {item.icon}
                </span>
              </span>
              <span className={`text-[10px] font-bold leading-none ${item.active ? 'text-secondary' : ''}`}>
                {item.label}
              </span>
            </button>
          ))}
        </div>
      </nav>

      {/* ════════════════════════════════════════════
          EDIT PROFILE MODAL  (tabbed)
      ════════════════════════════════════════════ */}
      {editOpen && (
        /* ── Backdrop: fades in/out ── */
        <div
          className="fixed inset-0 z-[300] flex items-center justify-center px-4"
          style={{
            background:  `rgba(0,0,0,${editAnim ? '0.65' : '0'})`,
            transition:  'background 0.25s ease',
          }}
          onClick={(e) => { if (e.target === e.currentTarget) closeEditModal() }}
        >
          {/* ── Panel: scales + fades in/out ── */}
          <div
            className="bg-surface border border-outline-variant rounded-2xl shadow-2xl w-full max-w-lg flex flex-col overflow-hidden"
            style={{
              maxHeight:  '90vh',
              opacity:    editAnim ? 1 : 0,
              transform:  editAnim ? 'scale(1) translateY(0)' : 'scale(0.96) translateY(12px)',
              transition: 'opacity 0.25s ease, transform 0.25s cubic-bezier(0.34,1.2,0.64,1)',
            }}
          >
            {/* Header */}
            <div className="flex justify-between items-center px-6 py-4 border-b border-outline-variant shrink-0">
              <div>
                <h3 className="font-bold text-title-md text-on-surface">Edit Profile</h3>
                <p className="text-label-sm text-on-surface-variant mt-0.5">
                  {editTab === 'basic' ? 'Name, photo and bio' : editTab === 'academic' ? 'Department, course and year' : 'Contact details'}
                </p>
              </div>
              <button type="button" className={`${navBtn} p-2 rounded-full hover:bg-surface-container-high active:scale-90`} onClick={closeEditModal}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-outline-variant shrink-0 px-2">
              {[
                { key: 'basic',    label: 'Basic',    icon: 'person'  },
                { key: 'academic', label: 'Academic', icon: 'school'  },
                { key: 'contact',  label: 'Contact',  icon: 'call'    },
              ].map((t) => (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => setEditTab(t.key)}
                  className={`${navBtn} flex items-center gap-1.5 px-4 py-3 text-label-sm font-label-sm border-b-2 transition-all ${
                    editTab === t.key
                      ? 'border-secondary text-secondary font-bold'
                      : 'border-transparent text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  <span className="material-symbols-outlined text-[16px]">{t.icon}</span>
                  {t.label}
                </button>
              ))}
            </div>

            {/* Body — fixed height so tab switch doesn't resize the panel */}
            <div className="overflow-y-auto px-6 py-5 space-y-4" style={{ height: '320px' }}>

              {/* Basic tab */}
              <div
                style={{
                  display:    editTab === 'basic' ? 'block' : 'none',
                  animation:  editTab === 'basic' ? 'fadeSlideUp 0.18s ease both' : 'none',
                }}
              >
                <div className="flex flex-col items-center gap-2 mb-4">
                  <div className="relative">
                    <img src={editPicPreview} alt="Preview" className="w-20 h-20 rounded-full object-cover border-4 border-outline-variant" />
                    <button type="button" className={`${navBtn} absolute bottom-0 right-0 p-1.5 bg-secondary text-on-secondary rounded-full shadow active:scale-90`} onClick={() => picInputRef.current?.click()}>
                      <span className="material-symbols-outlined text-sm">photo_camera</span>
                    </button>
                  </div>
                  <input ref={picInputRef} type="file" accept="image/*" className="hidden" onChange={handlePicChange} />
                  <p className="text-label-sm text-on-surface-variant">Tap icon to change photo</p>
                </div>
                <div className="mb-4">
                  <label className="text-label-sm text-on-surface-variant block mb-1">Display Name *</label>
                  <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-outline-variant bg-surface-container focus:border-secondary focus:outline-none text-body-md"
                    placeholder="Your name" />
                </div>
                <div>
                  <label className="text-label-sm text-on-surface-variant block mb-1">Bio</label>
                  <textarea value={editBio} onChange={(e) => setEditBio(e.target.value)} rows={3}
                    className="w-full px-4 py-3 rounded-xl border border-outline-variant bg-surface-container focus:border-secondary focus:outline-none text-body-md resize-none"
                    placeholder="A short bio about yourself…" />
                </div>
              </div>

              {/* Academic tab */}
              <div
                style={{
                  display:   editTab === 'academic' ? 'block' : 'none',
                  animation: editTab === 'academic' ? 'fadeSlideUp 0.18s ease both' : 'none',
                }}
              >
                <div className="mb-4">
                  <label className="text-label-sm text-on-surface-variant block mb-1">Department / Faculty</label>
                  <input type="text" value={editDept} onChange={(e) => setEditDept(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-outline-variant bg-surface-container focus:border-secondary focus:outline-none text-body-md"
                    placeholder="e.g. Computer Science" />
                </div>
                <div className="mb-4">
                  <label className="text-label-sm text-on-surface-variant block mb-1">Course / Program</label>
                  <input type="text" value={editCourse} onChange={(e) => setEditCourse(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-outline-variant bg-surface-container focus:border-secondary focus:outline-none text-body-md"
                    placeholder="e.g. B.Tech Computer Science" />
                </div>
                <div>
                  <label className="text-label-sm text-on-surface-variant block mb-1">Year of Study</label>
                  <select value={editYear} onChange={(e) => setEditYear(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-outline-variant bg-surface-container focus:border-secondary focus:outline-none text-body-md">
                    <option value="">Select year…</option>
                    {YEAR_OPTIONS.map((y) => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
              </div>

              {/* Contact tab */}
              <div
                style={{
                  display:   editTab === 'contact' ? 'block' : 'none',
                  animation: editTab === 'contact' ? 'fadeSlideUp 0.18s ease both' : 'none',
                }}
              >
                <div className="mb-4">
                  <label className="text-label-sm text-on-surface-variant block mb-1">Phone Number</label>
                  <input type="tel" value={editPhone} onChange={(e) => setEditPhone(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-outline-variant bg-surface-container focus:border-secondary focus:outline-none text-body-md"
                    placeholder="+91 00000 00000" />
                </div>
                <div className="p-4 rounded-xl bg-surface-container border border-outline-variant">
                  <p className="text-label-sm text-on-surface-variant flex items-center gap-2">
                    <span className="material-symbols-outlined text-[16px] text-secondary">info</span>
                    Email address cannot be changed here.
                  </p>
                </div>
              </div>

            </div>

            {/* Footer */}
            <div className="flex gap-3 px-6 py-4 border-t border-outline-variant shrink-0">
              <button type="button" className={`${navBtn} flex-1 py-3 rounded-xl border border-outline-variant text-on-surface-variant font-bold hover:bg-surface-container active:scale-95`} onClick={closeEditModal}>
                Cancel
              </button>
              <button type="button" className={`${navBtn} flex-1 py-3 rounded-xl bg-secondary text-on-secondary font-bold hover:opacity-90 active:scale-95`} onClick={saveEditModal}>
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════
          CHANGE PASSWORD MODAL
      ════════════════════════════════════════════ */}
      {cpOpen && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/50 px-4" onClick={(e) => { if (e.target === e.currentTarget) setCpOpen(false) }}>
          <div className="bg-surface rounded-2xl shadow-2xl w-full max-w-md p-8">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="font-bold text-title-md text-on-surface">Change Password</h3>
                <p className="text-label-sm text-on-surface-variant mt-0.5">
                  {cpStep === 1 && "We'll send a verification code to your email."}
                  {cpStep === 2 && "Enter the 6-digit code we sent to your email."}
                  {cpStep === 3 && "Choose a strong new password."}
                </p>
              </div>
              <button type="button" className={`${navBtn} p-2 rounded-full hover:bg-surface-container-high`} onClick={() => setCpOpen(false)}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="flex items-center gap-2 mb-8">
              {[1, 2, 3].map((s) => (
                <div key={s} className="flex items-center gap-2 flex-1">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[12px] font-bold transition-colors ${s < cpStep ? 'bg-secondary text-on-secondary' : s === cpStep ? 'bg-on-surface text-surface' : 'bg-surface-container-high text-on-surface-variant'}`}>
                    {s < cpStep ? <span className="material-symbols-outlined text-[14px]">check</span> : s}
                  </div>
                  {s < 3 && <div className={`flex-1 h-0.5 ${s < cpStep ? 'bg-secondary' : 'bg-surface-container-high'}`} />}
                </div>
              ))}
            </div>

            {cpStep === 1 && (
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-4 rounded-xl bg-surface-container border border-outline-variant">
                  <span className="material-symbols-outlined text-secondary">email</span>
                  <span className="text-body-md text-on-surface">{session?.email}</span>
                </div>
                <button type="button" disabled={cpLoading} onClick={requestOtp} className={`${navBtn} w-full py-3 rounded-xl bg-on-surface text-surface font-bold hover:opacity-90 active:scale-95 disabled:opacity-50`}>
                  {cpLoading ? 'Sending…' : 'Send Verification Code'}
                </button>
              </div>
            )}

            {cpStep === 2 && (
              <div className="space-y-5">
                {cpDevOtp && (
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-secondary-container text-on-secondary-container text-label-sm font-label-sm">
                    <span className="material-symbols-outlined text-[16px]">developer_mode</span>
                    Dev mode — code: <span className="font-bold tracking-widest ml-1">{cpDevOtp}</span>
                  </div>
                )}
                <div>
                  <label className="text-label-sm text-on-surface-variant block mb-1">Verification Code</label>
                  <input type="text" inputMode="numeric" maxLength={6} value={cpOtp} onChange={(e) => setCpOtp(e.target.value.replace(/\D/g, ''))}
                    placeholder="000000" autoFocus
                    className="w-full px-4 py-3 rounded-xl border border-outline-variant bg-surface-container focus:border-secondary focus:outline-none text-body-lg tracking-[0.35em] text-center" />
                </div>
                <button type="button" onClick={verifyOtp} className={`${navBtn} w-full py-3 rounded-xl bg-on-surface text-surface font-bold hover:opacity-90 active:scale-95`}>Verify Code</button>
                <button type="button" disabled={cpLoading} onClick={requestOtp} className={`${navBtn} w-full py-2 text-secondary text-label-sm hover:underline disabled:opacity-50`}>{cpLoading ? 'Sending…' : 'Resend code'}</button>
              </div>
            )}

            {cpStep === 3 && (
              <div className="space-y-4">
                <div>
                  <label className="text-label-sm text-on-surface-variant block mb-1">New Password</label>
                  <input type="password" value={cpNew} onChange={(e) => setCpNew(e.target.value)} placeholder="At least 6 characters" autoFocus
                    className="w-full px-4 py-3 rounded-xl border border-outline-variant bg-surface-container focus:border-secondary focus:outline-none text-body-md" />
                </div>
                <div>
                  <label className="text-label-sm text-on-surface-variant block mb-1">Confirm New Password</label>
                  <input type="password" value={cpConfirm} onChange={(e) => setCpConfirm(e.target.value)} placeholder="Repeat new password"
                    className={`w-full px-4 py-3 rounded-xl border bg-surface-container focus:outline-none text-body-md ${cpConfirm && cpConfirm !== cpNew ? 'border-error' : 'border-outline-variant focus:border-secondary'}`} />
                  {cpConfirm && cpConfirm !== cpNew && <p className="text-error text-label-sm mt-1">Passwords do not match.</p>}
                </div>
                <button type="button" disabled={cpLoading || !cpNew || cpNew !== cpConfirm} onClick={submitNewPassword}
                  className={`${navBtn} w-full py-3 rounded-xl bg-on-surface text-surface font-bold hover:opacity-90 active:scale-95 disabled:opacity-40`}>
                  {cpLoading ? 'Updating…' : 'Update Password'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════
          DEACTIVATE ACCOUNT MODAL
      ════════════════════════════════════════════ */}
      {daOpen && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/50 px-4" onClick={(e) => { if (e.target === e.currentTarget) setDaOpen(false) }}>
          <div className="bg-surface rounded-2xl shadow-2xl w-full max-w-md p-8">
            <div className="flex flex-col items-center text-center mb-6 gap-3">
              <div className="w-16 h-16 rounded-full bg-error-container flex items-center justify-center">
                <span className="material-symbols-outlined text-[32px] text-error">warning</span>
              </div>
              <h3 className="font-bold text-title-md text-on-surface">Deactivate Account</h3>
              <p className="text-body-md text-on-surface-variant leading-relaxed">
                This will permanently deactivate your account. You will be logged out immediately and will not be able to log back in.
                <br /><br />
                <span className="text-error font-bold">This action cannot be undone.</span>
              </p>
            </div>
            <div className="mb-5">
              <label className="text-label-sm text-on-surface-variant block mb-1">
                Type your email to confirm: <span className="font-bold text-on-surface">{session?.email}</span>
              </label>
              <input type="email" value={daEmail} onChange={(e) => setDaEmail(e.target.value)} placeholder={session?.email} autoFocus
                className="w-full px-4 py-3 rounded-xl border border-outline-variant bg-surface-container focus:border-error focus:outline-none text-body-md" />
            </div>
            <div className="flex gap-3">
              <button type="button" className={`${navBtn} flex-1 py-3 rounded-xl border border-outline-variant text-on-surface-variant font-bold hover:bg-surface-container active:scale-95`} onClick={() => setDaOpen(false)}>Cancel</button>
              <button type="button" disabled={daLoading || daEmail.trim().toLowerCase() !== session?.email?.toLowerCase()} onClick={deactivateAccount}
                className={`${navBtn} flex-1 py-3 rounded-xl bg-error text-on-error font-bold hover:opacity-90 active:scale-95 disabled:opacity-40`}>
                {daLoading ? 'Deactivating…' : 'Deactivate'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-[400] px-5 py-3 bg-on-surface text-inverse-on-surface rounded-xl shadow-lg text-body-md whitespace-nowrap">
          {toast}
        </div>
      )}

    </div>
  )
}
