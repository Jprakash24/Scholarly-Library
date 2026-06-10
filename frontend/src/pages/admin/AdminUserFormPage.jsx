import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { api } from '../../services/api'
import { P } from '../../routes/appPaths'
import AdminPageHeader, { ViewToggle } from '../../components/navigation/AdminPageHeader'

export default function AdminUserFormPage() {
  const navigate = useNavigate()

  const { id } = useParams()
  const isEdit = Boolean(id)
  const { role: currentRole } = useAuth()
  const isSuperAdmin = currentRole === 'superadmin'

  const [formName, setFormName] = useState('')
  const [formEmail, setFormEmail] = useState('')
  const [formPassword, setFormPassword] = useState('')
  const [formRole, setFormRole] = useState('user')
  const [loading, setLoading] = useState(false)
  const [fetchLoading, setFetchLoading] = useState(isEdit)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!isEdit) return
    setFetchLoading(true)
    api.get(`/users/${id}`)
      .then((data) => {
        setFormName(data.name || '')
        setFormEmail(data.email || '')
        setFormRole(data.role || 'user')
      })
      .catch(() => setError('Failed to load user details.'))
      .finally(() => setFetchLoading(false))
  }, [id, isEdit])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    if (!formName.trim() || !formEmail.trim()) {
      setError('Name and email are required.')
      return
    }
    if (!isEdit && formPassword.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }
    setLoading(true)
    try {
      if (isEdit) {
        await api.patch(`/users/${id}`, { name: formName.trim(), role: formRole })
      } else {
        await api.post('/users', {
          name: formName.trim(),
          email: formEmail.trim(),
          password: formPassword,
          role: formRole,
        })
      }
      navigate(P.adminUsers)
    } catch (err) {
      setError(err.message || `Failed to ${isEdit ? 'update' : 'create'} user.`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <main className="min-h-screen">
        <AdminPageHeader
          icon={isEdit ? 'manage_accounts' : 'person_add'}
          title={isEdit ? 'Edit Member' : 'Add New Member'}
          backTo={P.adminUsers}
          zIndex="z-50"
          actions={<ViewToggle patronTo={P.userDashboard} librarianTo={P.adminUsers} />}
        />

        <div className="max-w-[860px] mx-auto px-gutter py-10">
          <section className="bg-surface-container-low p-8 rounded-2xl border border-outline-variant shadow-lg">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="font-headline-lg text-headline-lg text-on-surface">
                  {isEdit ? 'Update Member Details' : 'Create New Member'}
                </h2>
                <p className="font-body-md text-body-md text-on-surface-variant mt-1">
                  {isEdit
                    ? 'Update the member\'s name or role. Email cannot be changed.'
                    : 'Fill in the details to register a new member. They can log in immediately.'}
                </p>
              </div>
              <button
                type="button"
                className="p-2 hover:bg-surface-container-high rounded-full transition-colors"
                onClick={() => navigate(P.adminUsers)}
                aria-label="Cancel"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {error && (
              <div className="mb-6 px-4 py-3 rounded-xl bg-error-container text-on-error-container font-label-sm text-label-sm">
                {error}
              </div>
            )}

            {fetchLoading ? (
              <div className="py-12 text-center font-body-md text-on-surface-variant">Loading user details</div>
            ) : (
              <form className="grid grid-cols-1 md:grid-cols-2 gap-6" onSubmit={handleSubmit}>
                <div className="space-y-2">
                  <label className="font-label-sm text-label-sm font-bold text-on-surface-variant ml-1">
                    Full Name <span className="text-error">*</span>
                  </label>
                  <input
                    required
                    className="w-full px-4 py-3 rounded-xl border border-outline-variant bg-surface-container-lowest focus:ring-2 focus:ring-secondary outline-none transition-all"
                    placeholder="e.g. John Doe"
                    type="text"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <label className="font-label-sm text-label-sm font-bold text-on-surface-variant ml-1">
                    Email Address <span className="text-error">*</span>
                  </label>
                  <input
                    required
                    disabled={isEdit}
                    className="w-full px-4 py-3 rounded-xl border border-outline-variant bg-surface-container-lowest focus:ring-2 focus:ring-secondary outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    placeholder="email@university.edu"
                    type="email"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                  />
                </div>

                {!isEdit && (
                  <div className="space-y-2 md:col-span-2">
                    <label className="font-label-sm text-label-sm font-bold text-on-surface-variant ml-1">
                      Temporary Password <span className="text-error">*</span>
                    </label>
                    <input
                      required
                      className="w-full px-4 py-3 rounded-xl border border-outline-variant bg-surface-container-lowest focus:ring-2 focus:ring-secondary outline-none transition-all"
                      placeholder="Min. 6 characters â€” member can change this after login"
                      type="text"
                      value={formPassword}
                      onChange={(e) => setFormPassword(e.target.value)}
                    />
                  </div>
                )}

                <div className="space-y-2 md:col-span-2">
                  <label className="font-label-sm text-label-sm font-bold text-on-surface-variant ml-1">
                    Assigned Role
                  </label>
                  <div className={`grid gap-4 ${isSuperAdmin ? 'grid-cols-3' : 'grid-cols-2'}`}>
                    <label className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-colors ${formRole === 'user' ? 'border-secondary bg-secondary-container/10' : 'border-outline-variant hover:border-secondary'}`}>
                      <input className="text-secondary focus:ring-secondary w-5 h-5" name="user_role" type="radio" value="user" checked={formRole === 'user'} onChange={() => setFormRole('user')} />
                      <div>
                        <span className="font-body-md text-body-md font-bold flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-[16px]">person</span>User
                        </span>
                        <span className="text-[11px] text-on-surface-variant">Patron access</span>
                      </div>
                    </label>
                    <label className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-colors ${formRole === 'admin' ? 'border-secondary bg-secondary-container/30' : 'border-outline-variant hover:border-secondary'}`}>
                      <input className="text-secondary focus:ring-secondary w-5 h-5" name="user_role" type="radio" value="admin" checked={formRole === 'admin'} onChange={() => setFormRole('admin')} />
                      <div>
                        <span className="font-body-md text-body-md font-bold flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-[16px]">manage_accounts</span>Admin
                        </span>
                        <span className="text-[11px] text-on-surface-variant">Manage materials &amp; users</span>
                      </div>
                    </label>
                    {isSuperAdmin && (
                      <label className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-colors ${formRole === 'superadmin' ? 'border-error bg-error-container/20' : 'border-outline-variant hover:border-error'}`}>
                        <input className="text-error focus:ring-error w-5 h-5" name="user_role" type="radio" value="superadmin" checked={formRole === 'superadmin'} onChange={() => setFormRole('superadmin')} />
                        <div>
                          <span className="font-body-md text-body-md font-bold flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-[16px]">shield</span>Super Admin
                          </span>
                          <span className="text-[11px] text-on-surface-variant">Full system control</span>
                        </div>
                      </label>
                    )}
                  </div>
                  {!isSuperAdmin && (
                    <p className="font-label-sm text-label-sm text-on-surface-variant mt-1 ml-1">
                      Only a Super Admin can assign the Super Admin role.
                    </p>
                  )}
                </div>

                <div className="md:col-span-2 pt-4 flex justify-end gap-4">
                  <button
                    className="px-8 py-3 rounded-full font-label-sm text-label-sm text-on-surface-variant hover:bg-surface-container-high transition-all"
                    type="button"
                    onClick={() => navigate(P.adminUsers)}
                  >
                    Cancel
                  </button>
                  <button
                    className="px-8 py-3 rounded-full bg-secondary text-on-secondary font-bold shadow-lg hover:shadow-xl active:scale-95 transition-all flex items-center gap-2 disabled:opacity-60"
                    type="submit"
                    disabled={loading}
                  >
                    <span className="material-symbols-outlined text-sm">{isEdit ? 'save' : 'person_add'}</span>
                    {loading ? (isEdit ? 'Saving' : 'Creating') : (isEdit ? 'Save Changes' : 'Confirm & Create Account')}
                  </button>
                </div>
              </form>
            )}
          </section>
        </div>
      </main>
    </>
  )
}
