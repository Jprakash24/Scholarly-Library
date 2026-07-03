import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { useActivity } from '../../contexts/ActivityContext'
import { useUserLibrary } from '../../contexts/UserLibraryContext'
import { timeAgo } from '../../utils/timeAgo'
import { navBtn, P } from '../../routes/appPaths'

export default function ActivityLogPage() {
  const navigate = useNavigate()
  const { role } = useAuth()
  const isAdmin = role === 'admin' || role === 'superadmin'
  const { activities, dismissActivity, clearAllActivities } = useActivity()
  const { savedIds } = useUserLibrary()
  const [filter, setFilter] = useState('all')

  const filtered = filter === 'all' ? activities : activities.filter((a) => a.kind === filter)

  const dismiss = (id) => dismissActivity(id)
  const clearAll = () => clearAllActivities()

  const alertCount = activities.filter((a) => a.kind === 'alert').length
  const savedCount = savedIds.size

  const filterBtn = (key, label) => (
    <button
      key={key}
      type="button"
      className={`${navBtn} whitespace-nowrap px-4 py-2 rounded-full font-label-sm text-label-sm transition-all active:scale-95 ${
        filter === key
          ? 'bg-secondary text-on-secondary font-bold shadow-sm'
          : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
      }`}
      onClick={() => setFilter(key)}
    >
      {label}
    </button>
  )

  return (
    <div className="min-h-screen bg-surface text-on-surface">
      {!isAdmin && (
        <header className="flex justify-between items-center px-gutter py-base w-full sticky top-0 md:top-[88px] z-40 bg-surface-container border-b border-outline-variant shadow-sm">
          <div className="flex items-center gap-4">
            <button type="button" className="p-2 hover:bg-surface-container-highest rounded-full transition-colors active:scale-95" onClick={() => navigate(P.userDashboard)} aria-label="Back to dashboard">
              <span className="material-symbols-outlined text-primary">arrow_back</span>
            </button>
            <h1 className="font-title-md text-title-md font-bold text-primary">Activity & Notifications</h1>
          </div>
        </header>
      )}

      <main className="max-w-[860px] mx-auto px-4 sm:px-6 md:px-gutter pb-24 py-8 md:mt-[68px]">
        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          {[
            { icon: 'notifications_active', label: 'Alerts',     value: alertCount,        iconColor: 'text-error'      },
            { icon: 'bookmarks',            label: 'Saved',      value: savedCount,         iconColor: 'text-secondary'  },
            { icon: 'history',              label: 'Total',      value: activities.length,  iconColor: 'text-primary'    },
          ].map((s) => (
            <div key={s.label} className="bg-surface-container rounded-2xl p-4 md:p-5 flex flex-col items-center text-center border border-outline-variant">
              <span className={`material-symbols-outlined text-[28px] md:text-[36px] mb-1 ${s.iconColor}`}>{s.icon}</span>
              <span className="font-bold text-[24px] md:text-[28px] text-on-surface tabular-nums">{s.value}</span>
              <span className="text-label-sm font-label-sm text-on-surface-variant uppercase tracking-wide">{s.label}</span>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
          <div className="flex gap-2 flex-wrap">
            {filterBtn('all', 'All')}
            {filterBtn('alert', 'Alerts')}
            {filterBtn('borrow', 'Saved')}
            {filterBtn('cancel', 'Removed')}
            {filterBtn('news', 'News')}
          </div>
          {activities.length > 0 && (
            <button type="button" className="text-error font-label-sm text-label-sm hover:bg-error-container/10 px-3 py-2 rounded-lg transition-colors whitespace-nowrap" onClick={clearAll}>
              Clear all
            </button>
          )}
        </div>

        <div className="space-y-3">
          {filtered.length === 0 ? (
            <div className="text-center py-20 text-on-surface-variant">
              <span className="material-symbols-outlined text-[64px] mb-4 block opacity-40">inbox</span>
              <p className="font-body-lg text-body-lg">No activity to show</p>
              {filter !== 'all' && (
                <button type="button" className={`${navBtn} mt-4 text-secondary font-label-sm text-label-sm hover:underline`} onClick={() => setFilter('all')}>
                  Show all activity
                </button>
              )}
            </div>
          ) : (
            filtered.map((item) => (
              <div key={item.id} className="flex items-start gap-4 p-4 bg-surface-container rounded-2xl border border-outline-variant hover:border-secondary hover:bg-surface-container-high transition-all duration-200">
                <div className={`w-10 h-10 rounded-full ${item.iconBg} flex items-center justify-center flex-shrink-0`}>
                  <span className={`material-symbols-outlined ${item.iconColor}`}>{item.icon}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-body-md text-body-md font-bold text-on-surface">{item.title}</p>
                  <p className="font-body-md text-on-surface-variant text-sm mt-0.5">{item.detail}</p>
                  <p className="text-label-sm font-label-sm text-outline mt-1">{item.timestamp ? timeAgo(item.timestamp) : item.time}</p>
                </div>
                <button type="button" className="p-1.5 text-on-surface-variant hover:text-error hover:bg-error-container/30 rounded-lg transition-colors flex-shrink-0" onClick={() => dismiss(item.id)} aria-label="Dismiss">
                  <span className="material-symbols-outlined text-[20px]">close</span>
                </button>
              </div>
            ))
          )}
        </div>
      </main>

      <nav
        aria-label="Bottom navigation"
        className="md:hidden fixed bottom-0 inset-x-0 z-50 bg-surface border-t border-outline-variant shadow-lg"
      >
        <div className="flex justify-around items-center px-2 py-1">
          {[
            { icon: 'home',            label: 'Home',    href: P.userDashboard, active: false },
            { icon: 'search',          label: 'Browse',  href: P.userCatalog,   active: false },
            { icon: 'history',         label: 'History', href: P.userActivity,  active: true  },
            { icon: 'manage_accounts', label: 'Account', href: P.userProfile,   active: false },
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
    </div>
  )
}
