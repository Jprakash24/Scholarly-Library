import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../../services/api'
import { P } from '../../routes/appPaths'
import AdminPageHeader, { ViewToggle } from '../../components/navigation/AdminPageHeader'

const STATUS_BADGE = {
  pending:  'bg-secondary-container text-on-secondary-container',
  approved: 'bg-tertiary-container text-on-tertiary-container',
  rejected: 'bg-error-container text-on-error-container',
  returned: 'bg-surface-container-high text-on-surface-variant',
  cancelled:'bg-surface-container text-on-surface-variant',
}
const STATUS_FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'pending', label: 'Pending' },
  { key: 'approved', label: 'Approved' },
  { key: 'rejected', label: 'Rejected' },
  { key: 'returned', label: 'Returned' },
  { key: 'cancelled', label: 'Cancelled' },
]

function fmt(dateStr) {
  if (!dateStr) return 'â€"'
  return new Date(dateStr).toLocaleString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

function fmtDate(dateStr) {
  if (!dateStr) return 'â€"'
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
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

function elapsedStr(createdAt, now) {
  const diffMs = now - new Date(createdAt).getTime()
  if (diffMs < 0) return '0s'
  const totalSec = Math.floor(diffMs / 1000)
  const d = Math.floor(totalSec / 86400)
  const h = Math.floor((totalSec % 86400) / 3600)
  const m = Math.floor((totalSec % 3600) / 60)
  const s = totalSec % 60
  if (d > 0) return `${d}d ${h}h ${m}m`
  if (h > 0) return `${h}h ${m}m ${s}s`
  if (m > 0) return `${m}m ${s}s`
  return `${s}s`
}

function useLiveNow() {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [])
  return now
}

export default function AdminBorrowHistoryPage() {
  const navigate = useNavigate()


  const [requests, setRequests] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('all')
  const [query, setQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')

  const LIMIT = 50
  const totalPages = Math.max(1, Math.ceil(total / LIMIT))
  const now = useLiveNow()

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query), 350)
    return () => clearTimeout(t)
  }, [query])

  useEffect(() => { setPage(1) }, [statusFilter])

  const fetchRequests = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page, limit: LIMIT })
      if (statusFilter !== 'all') params.set('status', statusFilter)
      const data = await api.get(`/borrow?${params}`)
      setRequests(data.requests)
      setTotal(data.total)
    } catch {
      setRequests([])
      setTotal(0)
    } finally {
      setLoading(false)
    }
  }, [page, statusFilter])

  useEffect(() => { fetchRequests() }, [fetchRequests])

  const filtered = debouncedQuery
    ? requests.filter((r) => {
        const q = debouncedQuery.toLowerCase()
        return (
          r.user?.name?.toLowerCase().includes(q) ||
          r.user?.email?.toLowerCase().includes(q) ||
          r.material?.title?.toLowerCase().includes(q) ||
          r.processedBy?.name?.toLowerCase().includes(q)
        )
      })
    : requests

  const groups = groupByDate(filtered)

  return (
    <>
      <main className="min-h-screen pb-8">
        <AdminPageHeader
          icon="assignment_return"
          title="Borrow History"
          subtitle="Complete borrowing records"
          actions={<ViewToggle patronTo={P.userDashboard} librarianTo={P.adminAnalytics} />}
        />

        <div className="max-w-[1280px] mx-auto p-gutter">
          {/* Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-base mb-margin-desktop">
            <div className="md:col-span-2 p-8 rounded-xl flex flex-col justify-between min-h-[140px] shadow-sm relative overflow-hidden border border-secondary/20"
              style={{ background: 'linear-gradient(135deg, #12100a 0%, #221a00 50%, #14100a 100%)' }}>
              <div className="pointer-events-none absolute -right-8 -top-8 w-44 h-44 rounded-full blur-3xl" style={{ background: 'rgba(233,193,118,0.08)' }} />
              <h2 className="font-headline-lg text-headline-lg text-white relative z-10">Borrow History</h2>
              <p className="font-body-md text-body-md text-on-surface-variant opacity-90 relative z-10">
                Full audit trail: every request, approval, rejection, and return with the librarian who acted.
              </p>
            </div>
            <div className="p-8 bg-secondary-container text-on-secondary-container rounded-xl shadow-sm flex flex-col justify-center items-center text-center">
              <span className="font-display-lg text-display-lg">{loading ? '' : total}</span>
              <span className="font-label-sm text-label-sm uppercase tracking-wider">Total Requests</span>
            </div>
          </div>

          {/* Status filters + search */}
          <div className="flex flex-col sm:flex-row gap-4 mb-gutter">
            <div className="flex gap-2 flex-wrap">
              {STATUS_FILTERS.map(({ key, label }) => (
                <button
                  key={key}
                  type="button"
                  className={`px-4 py-1.5 rounded-full font-label-sm text-label-sm transition-all ${
                    statusFilter === key
                      ? 'bg-secondary text-on-secondary font-bold shadow-sm'
                      : 'bg-surface-container border border-outline-variant text-on-surface-variant hover:bg-surface-container-high'
                  }`}
                  onClick={() => setStatusFilter(key)}
                >
                  {label}
                </button>
              ))}
            </div>
            <div className="relative sm:ml-auto w-full sm:w-80 group">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-secondary transition-colors">search</span>
              <input
                className="w-full pl-12 pr-4 py-3 bg-surface-container-lowest border border-outline-variant focus:border-secondary rounded-xl font-body-md text-body-md outline-none transition-all"
                placeholder="Search member, book, or librarian"
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Diary groups */}
          {loading ? (
            <div className="bg-surface-container-lowest rounded-xl shadow-md border border-outline-variant px-6 py-10 text-center font-body-md text-on-surface-variant animate-pulse">
              Loading
            </div>
          ) : groups.length === 0 ? (
            <div className="bg-surface-container-lowest rounded-xl shadow-md border border-outline-variant px-6 py-16 text-center">
              <span className="material-symbols-outlined text-[48px] text-outline opacity-40 block mb-3">local_library</span>
              <p className="font-body-md text-on-surface-variant">
                {debouncedQuery ? 'No results match your search.' : 'No borrow requests recorded yet.'}
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
                      {group.items.length} {group.items.length === 1 ? 'request' : 'requests'}
                    </span>
                    <div className="flex-1 h-px bg-outline-variant" />
                  </div>

                  <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-surface-container-low border-b border-outline-variant">
                            <th className="px-6 py-3 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wide">Member</th>
                            <th className="px-6 py-3 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wide">Book</th>
                            <th className="px-6 py-3 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wide">Status</th>
                            <th className="px-6 py-3 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wide">Requested At</th>
                            <th className="px-6 py-3 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wide">Due / Returned</th>
                            <th className="px-6 py-3 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wide">Processed By</th>
                            <th className="px-6 py-3 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wide">Time Since Request</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-outline-variant">
                          {group.items.map((req) => (
                            <tr key={req._id} className="hover:bg-surface-container transition-colors">
                              <td className="px-6 py-4">
                                <p className="font-body-md font-bold text-on-surface">{req.user?.name ?? 'â€"'}</p>
                                <p className="font-body-sm text-on-surface-variant">{req.user?.email ?? ''}</p>
                              </td>
                              <td className="px-6 py-4">
                                <p className="font-body-md text-secondary font-semibold leading-tight">{req.material?.title ?? ''}</p>
                                <p className="font-body-sm text-on-surface-variant">{req.material?.author ?? ''}</p>
                              </td>
                              <td className="px-6 py-4">
                                <span className={`px-3 py-1 rounded-full text-label-sm font-label-sm font-bold capitalize ${STATUS_BADGE[req.status] ?? 'bg-surface-container text-on-surface-variant'}`}>
                                  {req.status}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-on-surface-variant font-body-md whitespace-nowrap">
                                {fmt(req.createdAt)}
                              </td>
                              <td className="px-6 py-4 text-on-surface-variant font-body-md whitespace-nowrap">
                                {req.returnedAt ? (
                                  <span className="text-green-700 font-medium">{fmtDate(req.returnedAt)}</span>
                                ) : req.dueDate ? (
                                  fmtDate(req.dueDate)
                                ) : 'â€"'}
                              </td>
                              <td className="px-6 py-4">
                                {req.processedBy ? (
                                  <div>
                                    <p className="font-body-md font-bold text-on-surface">{req.processedBy.name}</p>
                                    <p className="font-body-sm text-on-surface-variant capitalize">{req.processedBy.role}</p>
                                    {req.processedAt && (
                                      <p className="font-body-sm text-outline text-[11px]">{fmt(req.processedAt)}</p>
                                    )}
                                  </div>
                                ) : (
                                  <span className="text-on-surface-variant font-body-sm">â€"</span>
                                )}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-surface-container rounded-lg font-mono text-label-sm text-secondary font-bold tabular-nums">
                                  <span className="material-symbols-outlined text-[13px]">timer</span>
                                  {elapsedStr(req.createdAt, now)}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {!loading && totalPages > 1 && (
            <div className="mt-8 px-6 py-4 flex items-center justify-between border border-outline-variant rounded-xl bg-surface-container-low">
              <p className="text-label-sm font-label-sm text-on-surface-variant">
                Page {page} of {totalPages} â€" {total} total
              </p>
              <div className="flex gap-2">
                <button type="button" className="p-2 hover:bg-surface-container-high rounded transition-colors disabled:opacity-30" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                  <span className="material-symbols-outlined">chevron_left</span>
                </button>
                <span className="px-3 py-1 bg-secondary text-on-secondary rounded font-label-sm text-label-sm flex items-center">{page}</span>
                <button type="button" className="p-2 hover:bg-surface-container-high rounded transition-colors disabled:opacity-30" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
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
