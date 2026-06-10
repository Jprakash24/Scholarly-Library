import { matchPath, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { navBtn, P } from '../../routes/appPaths'

const btnSpacious = (active) =>
  [
    `${navBtn} flex w-full items-center px-6 py-3 transition-all duration-300`,
    active
      ? 'bg-secondary-container text-on-secondary-container font-bold rounded-r-full'
      : 'text-on-surface-variant hover:bg-surface-container-high',
  ].join(' ')

const btnCompact = (active) =>
  [
    `${navBtn} flex w-full items-center gap-3 px-4 py-3 rounded-r-full transition-all`,
    active
      ? 'bg-secondary-container text-on-secondary-container font-bold'
      : 'text-on-surface-variant hover:bg-surface-container-high group',
  ].join(' ')

export function LibrarianSidebarNav({ onItemClick, variant = 'spacious', className }) {
  const navigate = useNavigate()
  const location = useLocation()
  const { role } = useAuth()
  const btnClass = variant === 'spacious' ? btnSpacious : btnCompact
  const isSuperAdmin = role === 'superadmin'

  const go = (to) => {
    navigate(to)
    onItemClick?.()
  }

  const active = (path, end) =>
    matchPath({ path, end: end ?? false }, location.pathname) != null

  const iconWrap = variant === 'spacious' ? 'material-symbols-outlined mr-4' : 'material-symbols-outlined'

  return (
    <nav className={className ?? (variant === 'spacious' ? 'flex-1 space-y-1 pr-4' : 'flex-1 px-4 space-y-1')}>
      {isSuperAdmin && (
        <div className="mx-4 mb-3 px-3 py-1.5 rounded-lg bg-secondary-container flex items-center gap-2">
          <span className="material-symbols-outlined text-[16px] text-on-secondary-container">shield</span>
          <span className="font-label-sm text-label-sm text-on-secondary-container font-bold uppercase tracking-wider">Super Admin</span>
        </div>
      )}

      {/* Patron — user-facing pages (top) */}
      <p className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider px-4 pt-1 pb-1 opacity-60">Patron</p>
      <button type="button" className={btnClass(active(P.userDashboard, true))} onClick={() => go(P.userDashboard)}>
        <span className={iconWrap}>home</span>
        <span className="font-body-md text-body-md">Dashboard</span>
      </button>
      <button type="button" className={btnClass(active(P.userCatalog, false))} onClick={() => go(P.userCatalog)}>
        <span className={iconWrap}>search</span>
        <span className="font-body-md text-body-md">Browse Catalog</span>
      </button>
      <button type="button" className={btnClass(active(P.userSaveHistory, true))} onClick={() => go(P.userSaveHistory)}>
        <span className={iconWrap}>bookmarks</span>
        <span className="font-body-md text-body-md">My Saved</span>
      </button>
      <button type="button" className={btnClass(active(P.userProfile, true))} onClick={() => go(P.userProfile)}>
        <span className={iconWrap}>manage_accounts</span>
        <span className="font-body-md text-body-md">My Profile</span>
      </button>

      {/* Admin — librarian pages */}
      <div className="mt-3 pt-3 border-t border-outline-variant/40">
        <p className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider px-4 pb-1 opacity-60">Admin</p>
        <button type="button" className={btnClass(active(P.adminAnalytics, true))} onClick={() => go(P.adminAnalytics)}>
          <span className={iconWrap}>analytics</span>
          <span className="font-body-md text-body-md">Overview</span>
        </button>
      </div>

      {/* Materials group */}
      <p className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider px-4 pt-3 pb-1 opacity-60">Materials</p>
      <button type="button" className={btnClass(active(P.adminMaterials, true))} onClick={() => go(P.adminMaterials)}>
        <span className={iconWrap}>library_books</span>
        <span className="font-body-md text-body-md">Collections</span>
      </button>
      <button type="button" className={btnClass(active(P.adminMaterialsAdd, true))} onClick={() => go(P.adminMaterialsAdd)}>
        <span className={iconWrap}>add_circle</span>
        <span className="font-body-md text-body-md">Add Material</span>
      </button>
      <button type="button" className={btnClass(active(P.adminMaterialsFiles, true))} onClick={() => go(P.adminMaterialsFiles)}>
        <span className={iconWrap}>folder_open</span>
        <span className="font-body-md text-body-md">Material Files</span>
      </button>

      {/* Borrows group */}
      <p className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider px-4 pt-3 pb-1 opacity-60">Borrows</p>
      <button type="button" className={btnClass(active(P.adminBorrows, true))} onClick={() => go(P.adminBorrows)}>
        <span className={iconWrap}>local_library</span>
        <span className="font-body-md text-body-md">Borrow Requests</span>
      </button>
      <button type="button" className={btnClass(active(P.adminBorrowHistory, true))} onClick={() => go(P.adminBorrowHistory)}>
        <span className={iconWrap}>history</span>
        <span className="font-body-md text-body-md">Borrow History</span>
      </button>

      {/* Users group */}
      <p className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider px-4 pt-3 pb-1 opacity-60">Users</p>
      <button type="button" className={btnClass(active(P.adminUsers, false))} onClick={() => go(P.adminUsers)}>
        <span className={iconWrap}>group</span>
        <span className="font-body-md text-body-md">Members</span>
      </button>
      <button type="button" className={btnClass(active(P.adminSavedHistory, true))} onClick={() => go(P.adminSavedHistory)}>
        <span className={iconWrap}>bookmarks</span>
        <span className="font-body-md text-body-md">Saved History</span>
      </button>

      {/* Activity */}
      <p className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider px-4 pt-3 pb-1 opacity-60">Activity</p>
      <button type="button" className={btnClass(active(P.userActivity, true))} onClick={() => go(P.userActivity)}>
        <span className={iconWrap}>monitoring</span>
        <span className="font-body-md text-body-md">Logs</span>
      </button>

      {isSuperAdmin && (
        <div className="mt-4 pt-4 border-t border-outline-variant/40">
          <p className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider px-4 mb-2">Superadmin</p>
          <button type="button" className={btnClass(active(P.adminUserNew, true))} onClick={() => go(P.adminUserNew)}>
            <span className={iconWrap}>admin_panel_settings</span>
            <span className="font-body-md text-body-md">Manage Staff</span>
          </button>
        </div>
      )}
    </nav>
  )
}

export function LibrarianMobileDrawer({ open, onClose, children }) {
  if (!open) return null

  return (
    <>
      <button
        type="button"
        className="fixed inset-0 z-[110] bg-black/40 md:hidden"
        aria-label="Close menu"
        onClick={onClose}
      />
      <aside className="fixed left-0 top-0 z-[120] flex h-full w-[min(100%,18rem)] flex-col overflow-y-auto border-r border-outline-variant bg-surface-container-low py-base shadow-xl md:hidden">
        <div className="flex items-center justify-end border-b border-outline-variant/80 px-3 py-2">
          <button
            type="button"
            className={`${navBtn} rounded-full p-2 text-on-surface-variant hover:bg-surface-container-high`}
            onClick={onClose}
            aria-label="Close menu"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        {children}
      </aside>
    </>
  )
}
