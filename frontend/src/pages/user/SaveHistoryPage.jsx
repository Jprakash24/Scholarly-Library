import { useCallback, useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { api } from '../../services/api'
import { navBtn, P } from '../../routes/appPaths'

const KIND_BADGE = {
  book:  'bg-secondary-container text-on-secondary-container',
  notes: 'bg-surface-container-high text-on-surface-variant',
  pyq:   'bg-surface-container-highest text-on-surface-variant',
}
const KIND_ICON = { book: 'book', notes: 'description', pyq: 'history_edu' }

const EVENT_STYLE = {
  saved:   { icon: 'bookmark_added',  bg: 'bg-secondary-container', text: 'text-on-secondary-container', label: 'Saved'    },
  unsaved: { icon: 'bookmark_remove', bg: 'bg-surface-container',   text: 'text-on-surface-variant',     label: 'Unsaved'  },
}

const BORROW_STATUS_STYLE = {
  pending:   { icon: 'local_library',     bg: 'bg-surface-container',           text: 'text-secondary',          label: 'Borrow Requested' },
  approved:  { icon: 'check_circle',      bg: 'bg-secondary-container',         text: 'text-on-secondary-container', label: 'Borrow Approved' },
  rejected:  { icon: 'cancel',            bg: 'bg-surface-container',           text: 'text-error',              label: 'Borrow Rejected'  },
  returned:  { icon: 'assignment_return', bg: 'bg-surface-container-high',      text: 'text-on-surface-variant', label: 'Returned'         },
  cancelled: { icon: 'cancel',            bg: 'bg-surface-container-high',      text: 'text-on-surface-variant', label: 'Cancelled'        },
}

function fmt(dateStr) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

function groupByDate(items) {
  const groups = []
  const map = {}
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(today.getDate() - 1)

  for (const item of items) {
    const d = new Date(item.createdAt)
    const key = d.toDateString()
    if (!map[key]) {
      let label
      if (key === today.toDateString()) label = 'Today'
      else if (key === yesterday.toDateString()) label = 'Yesterday'
      else label = d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
      map[key] = { label, items: [] }
      groups.push(map[key])
    }
    map[key].items.push(item)
  }
  return groups
}

export default function SaveHistoryPage() {
  const navigate = useNavigate()
  const { role } = useAuth()
  const isAdmin = role === 'admin' || role === 'superadmin'
  const [searchParams] = useSearchParams()
  const materialId = searchParams.get('material')

  const [items, setItems] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [materialInfo, setMaterialInfo] = useState(null)

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query), 350)
    return () => clearTimeout(t)
  }, [query])

  const fetchItems = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page: 1, limit: 200 })
      if (materialId) params.set('materialId', materialId)

      const [saveData, borrowList] = await Promise.all([
        api.get(`/saved/mine/history?${params}`),
        api.get(`/borrow/my${materialId ? `?materialId=${materialId}` : ''}`),
      ])

      const saveItems = (saveData.items ?? []).map(i => ({ ...i, _type: 'save' }))
      const borrowItems = (borrowList ?? []).map(i => ({ ...i, _type: 'borrow' }))

      const merged = [...saveItems, ...borrowItems].sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      )

      setItems(merged)
      setTotal(merged.length)

      if (materialId) {
        const first = merged.find(i => i.material)
        if (first) setMaterialInfo(first.material)
      } else {
        setMaterialInfo(null)
      }
    } catch {
      setItems([])
      setTotal(0)
    } finally {
      setLoading(false)
    }
  }, [materialId])

  useEffect(() => { fetchItems() }, [fetchItems])

  const filtered = debouncedQuery
    ? items.filter((i) => {
        const q = debouncedQuery.toLowerCase()
        return (
          i.material?.title?.toLowerCase().includes(q) ||
          i.material?.author?.toLowerCase().includes(q)
        )
      })
    : items

  const groups = groupByDate(filtered)

  return (
    <div className="min-h-screen bg-surface text-on-surface font-body-md">
      {!isAdmin && (
      <header className="flex items-center justify-between gap-3 px-gutter py-base w-full sticky top-0 md:top-[88px] z-40 bg-surface-container border-b border-outline-variant shadow-sm">
        <div className="flex items-center gap-3">
          <button
            type="button"
            className={`${navBtn} p-2 hover:bg-surface-container-highest rounded-full transition-colors active:scale-95`}
            onClick={() => materialId ? navigate(P.userSaveHistory) : navigate(-1)}
            aria-label="Back"
          >
            <span className="material-symbols-outlined text-primary">arrow_back</span>
          </button>
          <div>
            <h1 className="font-title-md text-title-md font-bold text-primary leading-tight">
              {materialId && materialInfo ? materialInfo.title : 'My History'}
            </h1>
            {materialId && materialInfo && (
              <p className="text-label-sm font-label-sm text-on-surface-variant">Activity for this material</p>
            )}
          </div>
        </div>
        <span className="px-3 py-1 bg-secondary-container text-on-secondary-container rounded-full text-label-sm font-label-sm font-bold tabular-nums">
          {loading ? '…' : total} {total === 1 ? 'event' : 'events'}
        </span>
      </header>
      )}

      <main className="max-w-[860px] mx-auto px-margin-mobile md:px-gutter pb-24 py-8">
        {/* Search */}
        {!materialId && (
          <div className="mb-6">
            <div className="relative w-full group">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-secondary transition-colors">search</span>
              <input
                className="w-full pl-12 pr-4 py-3 bg-surface-container-lowest border border-outline-variant focus:border-secondary rounded-xl font-body-md text-body-md outline-none transition-all"
                placeholder="Search title or author…"
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
          </div>
        )}

        {/* Diary groups */}
        {loading ? (
          <div className="py-16 text-center font-body-md text-on-surface-variant animate-pulse">Loading…</div>
        ) : groups.length === 0 ? (
          <div className="py-20 text-center">
            <span className="material-symbols-outlined text-[64px] text-outline opacity-40 block mb-3">bookmarks</span>
            <p className="font-body-lg text-on-surface-variant">
              {debouncedQuery ? 'No results match your search.' : 'No activity yet.'}
            </p>
            {!debouncedQuery && (
              <button
                type="button"
                className={`${navBtn} mt-6 px-6 py-3 bg-primary text-on-primary rounded-full font-bold hover:opacity-90 active:scale-95 transition-all`}
                onClick={() => navigate(P.userCatalog)}
              >
                Browse Catalog
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-10">
            {groups.map((group) => (
              <div key={group.label}>
                {/* Date header */}
                <div className="flex items-center gap-3 mb-4">
                  <span className="material-symbols-outlined text-secondary text-[18px]">calendar_today</span>
                  <h2 className="font-bold text-[14px] text-secondary uppercase tracking-widest">{group.label}</h2>
                  <span className="px-2.5 py-0.5 bg-secondary-container text-on-secondary-container rounded-full text-label-sm font-label-sm tabular-nums">
                    {group.items.length}
                  </span>
                  <div className="flex-1 h-px bg-outline-variant" />
                </div>

                {/* Cards for this day */}
                <div className="space-y-3">
                  {group.items.map((item) => {
                    const isBorrow = item._type === 'borrow'
                    const eventStyle = isBorrow
                      ? (BORROW_STATUS_STYLE[item.status] ?? BORROW_STATUS_STYLE.pending)
                      : (EVENT_STYLE[item.event] ?? EVENT_STYLE.saved)
                    const isUnsaved = !isBorrow && item.event === 'unsaved'

                    return (
                      <div
                        key={item._id}
                        className={`flex items-start gap-4 p-4 rounded-2xl border transition-all duration-200
                          ${isUnsaved
                            ? 'bg-surface-container border-outline-variant opacity-50'
                            : 'bg-surface-container border-outline-variant hover:border-secondary hover:bg-surface-container-high cursor-pointer'}`}
                        onClick={() => !isUnsaved && navigate(P.userMaterialDetail(item.material?._id))}
                        role={isUnsaved ? undefined : 'button'}
                        tabIndex={isUnsaved ? undefined : 0}
                        onKeyDown={(e) => !isUnsaved && e.key === 'Enter' && navigate(P.userMaterialDetail(item.material?._id))}
                      >
                        {/* Kind icon */}
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${KIND_BADGE[item.material?.kind] ?? 'bg-surface-container text-on-surface-variant'}`}>
                          <span className="material-symbols-outlined text-[20px]">
                            {isBorrow ? 'local_library' : (KIND_ICON[item.material?.kind] ?? 'book')}
                          </span>
                        </div>

                        <div className="flex-1 min-w-0">
                          <p className={`font-body-md font-bold leading-tight ${isUnsaved ? 'text-on-surface-variant line-through' : 'text-primary'}`}>
                            {item.material?.title ?? '—'}
                          </p>
                          <p className="font-body-sm text-on-surface-variant mt-0.5">{item.material?.author ?? ''}</p>

                          {/* Extra borrow info */}
                          {isBorrow && item.dueDate && item.status === 'approved' && (
                            <p className="font-body-sm text-secondary mt-0.5">Due {fmt(item.dueDate)}</p>
                          )}

                          <div className="flex flex-wrap items-center gap-2 mt-2">
                            {/* Activity badge */}
                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-label-sm font-label-sm ${eventStyle.bg} ${eventStyle.text}`}>
                              <span className="material-symbols-outlined text-[13px]">{eventStyle.icon}</span>
                              {eventStyle.label}
                            </span>
                            {/* Date */}
                            <span className="text-label-sm font-label-sm text-outline">
                              {fmt(item.createdAt)}
                            </span>
                          </div>
                        </div>

                        <span className={`mt-1 px-2.5 py-1 rounded-full text-label-sm font-label-sm capitalize flex-shrink-0 ${KIND_BADGE[item.material?.kind] ?? 'bg-surface-container text-on-surface-variant'}`}>
                          {item.material?.kind ?? '—'}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <nav
        aria-label="Bottom navigation"
        className="md:hidden fixed bottom-0 inset-x-0 z-50 bg-surface border-t border-outline-variant shadow-lg"
      >
        <div className="flex justify-around items-center px-2 py-1">
          {[
            { icon: 'home',            label: 'Home',    href: P.userDashboard,  active: false },
            { icon: 'search',          label: 'Browse',  href: P.userCatalog,    active: false },
            { icon: 'history',         label: 'History', href: P.userActivity,   active: true  },
            { icon: 'manage_accounts', label: 'Account', href: P.userProfile,    active: false },
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
