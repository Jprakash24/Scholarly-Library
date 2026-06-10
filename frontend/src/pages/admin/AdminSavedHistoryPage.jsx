import { useCallback, useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { api } from '../../services/api'
import { P } from '../../routes/appPaths'
import AdminPageHeader, { ViewToggle } from '../../components/navigation/AdminPageHeader'

const KIND_BADGE = {
  book: 'bg-tertiary-fixed text-on-tertiary-fixed-variant',
  notes: 'bg-surface-container-high text-on-surface-variant',
  pyq: 'bg-secondary-container text-on-secondary-container',
}

const EVENT_STYLE = {
  saved: { icon: 'bookmark_added', bg: 'bg-secondary-container', text: 'text-on-secondary-container', label: 'Saved' },
  unsaved: { icon: 'bookmark_remove', bg: 'bg-surface-container-high', text: 'text-on-surface-variant', label: 'Unsaved' },
}

const BORROW_STATUS_STYLE = {
  pending:   { icon: 'local_library',    bg: 'bg-tertiary-container',    text: 'text-on-tertiary-container',    label: 'Borrow Requested' },
  approved:  { icon: 'check_circle',     bg: 'bg-tertiary-fixed',         text: 'text-on-tertiary-fixed-variant', label: 'Borrow Approved' },
  rejected:  { icon: 'cancel',           bg: 'bg-error-container',        text: 'text-on-error-container',        label: 'Borrow Rejected' },
  returned:  { icon: 'assignment_return',bg: 'bg-surface-container-high', text: 'text-on-surface-variant',        label: 'Returned' },
  cancelled: { icon: 'cancel',           bg: 'bg-surface-container-high', text: 'text-on-surface-variant',        label: 'Cancelled' },
}

function fmt(dateStr) {
  if (!dateStr) return 'â€"'
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
      map[key] = { label, date: d, items: [] }
      groups.push(map[key])
    }
    map[key].items.push(item)
  }
  return groups
}

export default function AdminSavedHistoryPage() {
  const navigate = useNavigate()

  const [searchParams] = useSearchParams()
  const materialId = searchParams.get('material')

  const [saveItems, setSaveItems] = useState([])
  const [saveTotal, setSaveTotal] = useState(0)
  const [borrowItems, setBorrowItems] = useState([])
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [materialInfo, setMaterialInfo] = useState(null)

  const LIMIT = 50
  const totalPages = Math.max(1, Math.ceil(saveTotal / LIMIT))

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query), 350)
    return () => clearTimeout(t)
  }, [query])

  useEffect(() => { setPage(1) }, [materialId])

  const fetchItems = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page, limit: LIMIT })
      if (materialId) params.set('materialId', materialId)

      const [saveData, borrowData] = await Promise.all([
        api.get(`/saved?${params}`),
        api.get(`/borrow${materialId ? `?materialId=${materialId}&limit=200` : '?limit=200'}`),
      ])

      setSaveItems(saveData.items ?? [])
      setSaveTotal(saveData.total ?? 0)
      setBorrowItems(borrowData.requests ?? [])

      const allItems = [...(saveData.items ?? []), ...(borrowData.requests ?? [])]
      if (materialId && allItems.length > 0) {
        setMaterialInfo(allItems[0].material ?? null)
      } else if (!materialId) {
        setMaterialInfo(null)
      }
    } catch {
      setSaveItems([])
      setSaveTotal(0)
      setBorrowItems([])
    } finally {
      setLoading(false)
    }
  }, [page, materialId])

  useEffect(() => { fetchItems() }, [fetchItems])

  const allItems = [
    ...saveItems.map(i => ({ ...i, _type: 'save' })),
    ...borrowItems.map(i => ({ ...i, _type: 'borrow' })),
  ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

  const filtered = debouncedQuery
    ? allItems.filter((i) => {
        const q = debouncedQuery.toLowerCase()
        return (
          i.user?.name?.toLowerCase().includes(q) ||
          i.user?.email?.toLowerCase().includes(q) ||
          i.material?.title?.toLowerCase().includes(q) ||
          i.material?.author?.toLowerCase().includes(q)
        )
      })
    : allItems

  const groups = groupByDate(filtered)
  const totalEvents = saveTotal + borrowItems.length

  return (
    <>
      <main className="min-h-screen pb-8">
        <AdminPageHeader
          icon={materialId ? 'history' : 'bookmarks'}
          title={materialId ? 'Material Activity' : 'Activity History'}
          subtitle={materialId && materialInfo ? materialInfo.title : 'Save & borrow activity'}
          backTo={materialId ? P.adminSavedHistory : undefined}
          actions={<ViewToggle patronTo={P.userDashboard} librarianTo={P.adminAnalytics} />}
        />

        <div className="max-w-[1280px] mx-auto p-gutter">
          {/* Summary cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-base mb-margin-desktop">
            <div className="md:col-span-2 p-8 bg-surface-container-high text-on-surface rounded-xl flex flex-col justify-between min-h-[140px] shadow-sm border border-outline-variant">
              <h2 className="font-headline-lg text-headline-lg">
                {materialId && materialInfo ? materialInfo.title : 'Activity History'}
              </h2>
              <p className="font-body-md text-body-md text-on-surface-variant opacity-80">
                {materialId
                  ? 'All member saves, unsaves, and borrow activity for this material.'
                  : 'Full audit trail: saves, unsaves, and borrow requests across all members.'}
              </p>
            </div>
            <div className="p-8 bg-secondary-container text-on-secondary-container rounded-xl shadow-sm flex flex-col justify-center items-center text-center">
              <span className="font-display-lg text-display-lg">{loading ? '__' : totalEvents}</span>
              <span className="font-label-sm text-label-sm uppercase tracking-wider">Total Events</span>
            </div>
          </div>

          {/* Search */}
          <div className="mb-gutter">
            <div className="relative w-full sm:w-96 group">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-secondary transition-colors">search</span>
              <input
                className="w-full pl-12 pr-4 py-3 bg-surface-container-lowest border border-outline-variant focus:border-secondary rounded-xl font-body-md text-body-md outline-none transition-all"
                placeholder="Search member or material"
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Diary-style date groups */}
          {loading ? (
            <div className="bg-surface-container-lowest rounded-xl shadow-md border border-outline-variant px-6 py-10 text-center font-body-md text-on-surface-variant animate-pulse">
              Loading
            </div>
          ) : groups.length === 0 ? (
            <div className="bg-surface-container-lowest rounded-xl shadow-md border border-outline-variant px-6 py-16 text-center">
              <span className="material-symbols-outlined text-[48px] text-outline opacity-40 block mb-3">bookmarks</span>
              <p className="font-body-md text-on-surface-variant">
                {debouncedQuery ? 'No results match your search.' : 'No activity recorded yet.'}
              </p>
            </div>
          ) : (
            <div className="space-y-10">
              {groups.map((group) => (
                <div key={group.label}>
                  <div className="flex items-center gap-3 mb-4">
                    <span className="material-symbols-outlined text-secondary text-[20px]">calendar_today</span>
                    <h3 className="font-title-md text-title-md font-bold text-on-surface">{group.label}</h3>
                    <span className="px-2.5 py-0.5 bg-secondary-container text-on-secondary-container rounded-full text-label-sm font-label-sm">
                      {group.items.length} {group.items.length === 1 ? 'event' : 'events'}
                    </span>
                    <div className="flex-1 h-px bg-outline-variant" />
                  </div>

                  <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-surface-container-low border-b border-outline-variant">
                            <th className="px-6 py-3 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wide">Member</th>
                            {!materialId && (
                              <th className="px-6 py-3 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wide">Material</th>
                            )}
                            <th className="px-6 py-3 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wide">Kind</th>
                            <th className="px-6 py-3 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wide">Activity</th>
                            <th className="px-6 py-3 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wide">Date & Time</th>
                            {!materialId && (
                              <th className="px-6 py-3 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wide text-right">History</th>
                            )}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-outline-variant">
                          {group.items.map((item) => {
                            const isBorrow = item._type === 'borrow'
                            const eventStyle = isBorrow
                              ? (BORROW_STATUS_STYLE[item.status] ?? BORROW_STATUS_STYLE.pending)
                              : (EVENT_STYLE[item.event] ?? EVENT_STYLE.saved)
                            return (
                              <tr key={item._id} className={`hover:bg-surface-container transition-colors ${item.event === 'unsaved' ? 'opacity-70' : ''}`}>
                                <td className="px-6 py-4">
                                  <p className="font-body-md font-bold text-on-surface">{item.user?.name ?? 'â€"'}</p>
                                  <p className="font-body-sm text-on-surface-variant">{item.user?.email ?? ''}</p>
                                </td>
                                {!materialId && (
                                  <td className="px-6 py-4">
                                    <p className="font-body-md text-secondary font-semibold leading-tight">{item.material?.title ?? 'â€"'}</p>
                                    <p className="font-body-sm text-on-surface-variant">{item.material?.author ?? ''}</p>
                                  </td>
                                )}
                                <td className="px-6 py-4">
                                  <span className={`px-3 py-1 rounded-full text-label-sm font-label-sm capitalize ${KIND_BADGE[item.material?.kind] ?? 'bg-surface-container text-on-surface-variant'}`}>
                                    {item.material?.kind ?? 'â€"'}
                                  </span>
                                </td>
                                <td className="px-6 py-4">
                                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-label-sm font-label-sm ${eventStyle.bg} ${eventStyle.text}`}>
                                    <span className="material-symbols-outlined text-[14px]">{eventStyle.icon}</span>
                                    {eventStyle.label}
                                  </span>
                                  {isBorrow && item.dueDate && item.status === 'approved' && (
                                    <p className="font-body-sm text-on-surface-variant mt-1">
                                      Due {fmt(item.dueDate)}
                                    </p>
                                  )}
                                </td>
                                <td className="px-6 py-4 text-on-surface-variant font-body-md whitespace-nowrap">
                                  {fmt(item.createdAt)}
                                </td>
                                {!materialId && (
                                  <td className="px-6 py-4 text-right">
                                    <button
                                      type="button"
                                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-secondary-container text-on-secondary-container rounded-lg text-label-sm font-label-sm hover:opacity-80 transition-opacity border-0 cursor-pointer"
                                      onClick={() => navigate(P.adminMaterialSavedHistory(item.material?._id))}
                                    >
                                      <span className="material-symbols-outlined text-[14px]">history</span>
                                      View
                                    </button>
                                  </td>
                                )}
                              </tr>
                            )
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination (save events only) */}
          {!loading && totalPages > 1 && (
            <div className="mt-8 px-6 py-4 flex items-center justify-between border border-outline-variant rounded-xl bg-surface-container-low">
              <p className="text-label-sm font-label-sm text-on-surface-variant">
                Page {page} of {totalPages} â€" {saveTotal} save events
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  className="p-2 hover:bg-surface-container-high rounded transition-colors disabled:opacity-30"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  <span className="material-symbols-outlined">chevron_left</span>
                </button>
                <span className="px-3 py-1 bg-secondary text-on-secondary rounded font-label-sm text-label-sm flex items-center">
                  {page}
                </span>
                <button
                  type="button"
                  className="p-2 hover:bg-surface-container-high rounded transition-colors disabled:opacity-30"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  <span className="material-symbols-outlined">chevron_right</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  )
}
