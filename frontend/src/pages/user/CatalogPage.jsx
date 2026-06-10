import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { useMaterials } from '../../hooks/useMaterials'
import { useUserLibrary } from '../../contexts/UserLibraryContext'
import { navBtn, P } from '../../routes/appPaths'

/* ─── Static constants ─────────────────────────────────────── */

const FILTERS = [
  { key: 'all',   label: 'All',   icon: 'auto_stories' },
  { key: 'book',  label: 'Books', icon: 'book'         },
  { key: 'notes', label: 'Notes', icon: 'description'  },
  { key: 'pyq',   label: 'PYQs',  icon: 'history_edu'  },
]

const SORT_OPTIONS = [
  { key: 'default', label: 'Default'     },
  { key: 'title',   label: 'Title (A–Z)' },
  { key: 'rating',  label: 'Top Rated'  },
]

// Per-kind colour theming used on cards
const KIND_THEME = {
  book: {
    label:    'Textbook',
    icon:     'book',
    badge:    'bg-primary text-on-primary',
    emptyBg:  'from-surface-container-high to-surface-container-highest dark:from-surface-container dark:to-surface-container-highest',
    border:   'group-hover:border-primary/40',
  },
  notes: {
    label:    'Notes',
    icon:     'description',
    badge:    'bg-secondary-container text-on-secondary-container dark:bg-surface-container-highest dark:text-secondary',
    emptyBg:  'from-surface-container-high to-surface-container-highest dark:from-surface-container dark:to-surface-container-highest',
    border:   'group-hover:border-secondary',
  },
  pyq: {
    label:    'PYQs',
    icon:     'history_edu',
    badge:    'bg-tertiary-fixed text-on-tertiary-fixed-variant dark:bg-surface-container-highest dark:text-tertiary-fixed-dim',
    emptyBg:  'from-tertiary-fixed/20 to-surface-container dark:from-surface-container dark:to-surface-container-highest',
    border:   'group-hover:border-tertiary-fixed',
  },
}

const NAV_ITEMS = [
  { icon: 'home',            label: 'Home',    href: P.userDashboard, active: false },
  { icon: 'search',          label: 'Browse',  href: P.userCatalog,   active: true  },
  { icon: 'history',         label: 'History', href: P.userActivity,  active: false },
  { icon: 'manage_accounts', label: 'Account', href: P.userProfile,   active: false },
]

/* ─── Skeleton card ─────────────────────────────────────────── */

function SkeletonCard({ list = false }) {
  if (list) {
    return (
      <div className="flex gap-4 p-4 bg-surface-container-lowest dark:bg-surface-container rounded-2xl animate-pulse border border-outline-variant">
        <div className="w-14 h-20 rounded-xl bg-surface-container flex-shrink-0" />
        <div className="flex-1 space-y-2 py-1">
          <div className="h-4 bg-surface-container rounded-lg w-3/4" />
          <div className="h-3 bg-surface-container rounded-lg w-1/2" />
          <div className="h-3 bg-surface-container rounded-lg w-1/3 mt-3" />
        </div>
      </div>
    )
  }
  return (
    <div className="bg-surface-container-lowest rounded-2xl overflow-hidden animate-pulse border border-outline-variant">
      <div className="aspect-[3/4] bg-surface-container" />
      <div className="p-4 space-y-2">
        <div className="h-4 bg-surface-container rounded-lg w-4/5" />
        <div className="h-3 bg-surface-container rounded-lg w-3/5" />
        <div className="h-3 bg-surface-container rounded-lg w-2/5 mt-1" />
      </div>
    </div>
  )
}

/* ─── Grid card ─────────────────────────────────────────────── */

function GridCard({ m, saved, onSave, onView }) {
  const theme = KIND_THEME[m.kind] ?? KIND_THEME.book
  return (
    <article
      role="button"
      tabIndex={0}
      onClick={onView}
      onKeyDown={(e) => e.key === 'Enter' && onView()}
      aria-label={`View ${m.title}`}
      className={`group bg-surface-container-lowest dark:bg-surface-container rounded-2xl overflow-hidden border border-outline-variant ${theme.border} hover:shadow-lg cursor-pointer transition-all duration-300 hover:-translate-y-0.5`}
    >
      {/* Cover */}
      <div className="aspect-[3/4] relative overflow-hidden">
        {m.coverUrl ? (
          <img
            src={m.coverUrl}
            alt={m.title}
            className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500 bg-surface-container"
          />
        ) : (
          <div className={`w-full h-full flex flex-col items-center justify-center bg-gradient-to-br ${theme.emptyBg} gap-3`}>
            <span className="material-symbols-outlined text-[56px] text-outline-variant">{theme.icon}</span>
            {m.categoryLabel && (
              <span className="text-label-sm font-label-sm text-outline-variant line-clamp-2 text-center px-4">
                {m.categoryLabel}
              </span>
            )}
          </div>
        )}

        {/* Kind badge */}
        <div className="absolute top-3 left-3">
          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider backdrop-blur-md ${theme.badge}`}>
            {theme.label}
          </span>
        </div>

        {/* Save button */}
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onSave() }}
          aria-label={saved ? 'Remove from saved' : 'Save to shelf'}
          className={`${navBtn} absolute top-3 right-3 p-1.5 rounded-full backdrop-blur-sm transition-all active:scale-90 ${
            saved
              ? 'bg-secondary-container text-secondary'
              : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-low dark:bg-surface-container-high dark:hover:bg-surface-container-highest'
          }`}
        >
          <span
            className="material-symbols-outlined text-[20px]"
            style={{ fontVariationSettings: saved ? "'FILL' 1" : "'FILL' 0" }}
          >bookmark</span>
        </button>

        {/* Saved pill */}
        {saved && (
          <div className="absolute bottom-3 left-3">
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-secondary-container/90 text-on-secondary-container text-[10px] font-bold backdrop-blur-sm">
              <span className="material-symbols-outlined text-[11px]" style={{ fontVariationSettings: "'FILL' 1" }}>bookmark</span>
              Saved
            </span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-4">
        <h4 className="font-bold text-[14px] leading-snug line-clamp-2 mb-1 text-on-surface">{m.title}</h4>
        <p className="text-[12px] text-on-surface-variant line-clamp-1 mb-3">{m.author}</p>
        <div className="flex items-center justify-between">
          {m.rating != null ? (
            <div className="flex items-center gap-1 text-secondary">
              <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
              <span className="font-bold text-[13px]">{m.rating.toFixed(1)}</span>
            </div>
          ) : (
            <span className="text-[12px] text-outline">—</span>
          )}
          {m.categoryLabel && (
            <span className="text-[11px] text-outline-variant line-clamp-1 text-right max-w-[60%]">{m.categoryLabel}</span>
          )}
        </div>
      </div>
    </article>
  )
}

/* ─── List card ─────────────────────────────────────────────── */

function ListCard({ m, saved, onSave, onView }) {
  const theme = KIND_THEME[m.kind] ?? KIND_THEME.book
  return (
    <article
      role="button"
      tabIndex={0}
      onClick={onView}
      onKeyDown={(e) => e.key === 'Enter' && onView()}
      aria-label={`View ${m.title}`}
      className={`group flex items-center gap-4 p-4 bg-surface-container-lowest dark:bg-surface-container rounded-2xl border border-outline-variant ${theme.border} hover:shadow-md cursor-pointer transition-all duration-200`}
    >
      {/* Thumbnail */}
      <div className="w-14 h-20 rounded-xl overflow-hidden flex-shrink-0 border border-outline-variant/30">
        {m.coverUrl ? (
          <img
            src={m.coverUrl}
            alt={m.title}
            className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300 bg-surface-container"
          />
        ) : (
          <div className={`w-full h-full flex items-center justify-center bg-gradient-to-br ${theme.emptyBg}`}>
            <span className="material-symbols-outlined text-[24px] text-outline-variant">{theme.icon}</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start gap-2 mb-1">
          <span className={`flex-shrink-0 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${theme.badge}`}>
            {theme.label}
          </span>
          {saved && (
            <span className="flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-container text-[10px] font-bold flex-shrink-0">
              <span className="material-symbols-outlined text-[10px]" style={{ fontVariationSettings: "'FILL' 1" }}>bookmark</span>
              Saved
            </span>
          )}
        </div>
        <h4 className="font-bold text-[14px] leading-snug line-clamp-1 text-on-surface">{m.title}</h4>
        <p className="text-[12px] text-on-surface-variant line-clamp-1">{m.author}</p>
        {m.categoryLabel && (
          <p className="text-[11px] text-outline mt-0.5 line-clamp-1">{m.categoryLabel}</p>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
        {m.rating != null && (
          <div className="hidden sm:flex items-center gap-0.5 text-secondary">
            <span className="material-symbols-outlined text-[13px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
            <span className="font-bold text-[12px]">{m.rating.toFixed(1)}</span>
          </div>
        )}
        <button
          type="button"
          onClick={onSave}
          aria-label={saved ? 'Remove from saved' : 'Save'}
          className={`${navBtn} p-2 rounded-full transition-all active:scale-90 ${
            saved
              ? 'text-secondary bg-secondary-container'
              : 'text-on-surface-variant hover:bg-surface-container-high'
          }`}
        >
          <span
            className="material-symbols-outlined text-[20px]"
            style={{ fontVariationSettings: saved ? "'FILL' 1" : "'FILL' 0" }}
          >bookmark</span>
        </button>
        <button
          type="button"
          onClick={onView}
          className={`${navBtn} hidden sm:block px-4 py-2 bg-on-surface text-surface dark:bg-surface-container-highest dark:text-on-surface rounded-full text-[12px] font-bold hover:opacity-90 active:scale-95`}
        >
          View
        </button>
      </div>
    </article>
  )
}

/* ─── Main page ─────────────────────────────────────────────── */

export default function CatalogPage() {
  const navigate    = useNavigate()
  const { role } = useAuth()
  const isAdmin = role === 'admin' || role === 'superadmin'
  const [searchParams] = useSearchParams()

  const [query,         setQuery]         = useState(() => searchParams.get('q') ?? '')
  const [debouncedQuery,setDebouncedQuery]= useState(() => searchParams.get('q') ?? '')
  const [activeFilter,  setActiveFilter]  = useState(() => {
    const k = searchParams.get('kind')
    return FILTERS.some((f) => f.key === k) ? k : 'all'
  })
  const [viewMode,  setViewMode]  = useState('grid')   // 'grid' | 'list'
  const [sortBy,    setSortBy]    = useState('default')
  const [sortOpen,  setSortOpen]  = useState(false)
  const sortRef = useRef(null)

  const { savedIds, toggleSaved } = useUserLibrary()
  const { materials, total, loading, error } = useMaterials({
    kind: activeFilter,
    q:    debouncedQuery,
    limit: 50,
  })

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query), 400)
    return () => clearTimeout(t)
  }, [query])

  // Close sort dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (sortRef.current && !sortRef.current.contains(e.target)) setSortOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // Client-side sort
  const sortedMaterials = useMemo(() => {
    if (!materials?.length) return materials ?? []
    const copy = [...materials]
    if (sortBy === 'title')  copy.sort((a, b) => a.title.localeCompare(b.title))
    if (sortBy === 'rating') copy.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0))
    return copy
  }, [materials, sortBy])

  const hasFilters = activeFilter !== 'all' || debouncedQuery

  const clearAll = () => {
    setQuery('')
    setDebouncedQuery('')
    setActiveFilter('all')
    setSortBy('default')
  }

  return (
    <div className="min-h-screen bg-surface text-on-surface">

      {/* ═══════════════════════════════════
          STICKY HEADER  (hidden for admin)
      ═══════════════════════════════════ */}
      {!isAdmin && (
      <header className="sticky top-0 md:top-[88px] z-40 bg-surface-container dark:bg-surface-container-low border-b border-outline-variant shadow-sm">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 md:px-8">

          {/* Row 1 — back · title · view toggle · sort */}
          <div className="flex items-center gap-3 pt-4 pb-3">
            <button
              type="button"
              onClick={() => navigate(P.userDashboard)}
              aria-label="Back to dashboard"
              className={`${navBtn} p-2 rounded-full hover:bg-surface-container-high active:scale-95 flex-shrink-0`}
            >
              <span className="material-symbols-outlined text-primary text-[22px]">arrow_back</span>
            </button>

            <div className="flex-1 min-w-0">
              <h1 className="font-bold text-title-md text-on-surface leading-tight">Library Catalog</h1>
              <p className="text-[12px] text-on-surface-variant">
                {loading ? 'Loading…' : `${total} material${total !== 1 ? 's' : ''}`}
                {debouncedQuery ? ` matching "${debouncedQuery}"` : ''}
              </p>
            </div>

            {/* View-mode toggle */}
            <div className="flex items-center bg-surface-container-high rounded-xl p-0.5 gap-0.5">
              {[
                { mode: 'grid', icon: 'grid_view'     },
                { mode: 'list', icon: 'view_agenda' },
              ].map(({ mode, icon }) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setViewMode(mode)}
                  aria-label={`${mode} view`}
                  className={`${navBtn} p-2 rounded-lg transition-all active:scale-90 ${
                    viewMode === mode
                      ? 'bg-surface-container-lowest text-primary shadow-sm'
                      : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  <span className="material-symbols-outlined text-[20px]">{icon}</span>
                </button>
              ))}
            </div>

            {/* Sort dropdown */}
            <div className="relative flex-shrink-0" ref={sortRef}>
              <button
                type="button"
                onClick={() => setSortOpen((v) => !v)}
                aria-label="Sort options"
                className={`${navBtn} flex items-center gap-1.5 px-3 py-2 rounded-xl border transition-all active:scale-95 text-label-sm font-label-sm ${
                  sortBy !== 'default'
                    ? 'bg-secondary-container text-on-secondary-container border-transparent dark:bg-surface-container-high dark:text-on-surface'
                    : 'border-outline-variant text-on-surface-variant hover:border-secondary hover:text-on-surface'
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">sort</span>
                <span className="hidden sm:block">
                  {SORT_OPTIONS.find((s) => s.key === sortBy)?.label ?? 'Sort'}
                </span>
                <span className="material-symbols-outlined text-[16px] transition-transform" style={{ transform: sortOpen ? 'rotate(180deg)' : '' }}>
                  expand_more
                </span>
              </button>

              {/* Dropdown panel */}
              {sortOpen && (
                <div className="absolute right-0 top-full mt-2 w-44 bg-surface-container-lowest dark:bg-surface-container border border-outline-variant rounded-2xl shadow-xl overflow-hidden z-50">
                  {SORT_OPTIONS.map((opt) => (
                    <button
                      key={opt.key}
                      type="button"
                      onClick={() => { setSortBy(opt.key); setSortOpen(false) }}
                      className={`${navBtn} w-full flex items-center justify-between px-4 py-3 text-[14px] transition-colors ${
                        sortBy === opt.key
                          ? 'bg-secondary-container text-on-secondary-container font-bold dark:bg-surface-container-high dark:text-on-surface'
                          : 'text-on-surface hover:bg-surface-container dark:hover:bg-surface-container-high'
                      }`}
                    >
                      {opt.label}
                      {sortBy === opt.key && (
                        <span className="material-symbols-outlined text-[16px]">check</span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Row 2 — search bar */}
          <div className="relative group pb-3">
            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-outline group-focus-within:text-secondary transition-colors text-[20px]">
              search
            </span>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Escape' && setQuery('')}
              placeholder="Search by title, author, or category…"
              className="w-full pl-12 pr-10 py-3 rounded-xl bg-surface-container-lowest dark:bg-surface-container border border-outline-variant focus:border-secondary focus:ring-1 focus:ring-secondary outline-none transition-all text-body-md"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                aria-label="Clear search"
                className={`${navBtn} absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full text-outline hover:text-on-surface hover:bg-surface-container-high active:scale-90`}
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            )}
          </div>

          {/* Row 3 — filter chips + clear */}
          <div className="flex items-center gap-2 pb-3 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
            {FILTERS.map((f) => (
              <button
                key={f.key}
                type="button"
                onClick={() => setActiveFilter(f.key)}
                className={`${navBtn} flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-label-sm font-label-sm transition-all active:scale-95 ${
                  activeFilter === f.key
                    ? 'bg-on-surface text-surface shadow-sm dark:bg-on-surface dark:text-surface'
                    : 'bg-surface-container-high dark:bg-surface-container text-on-surface-variant hover:bg-secondary-container hover:text-on-secondary-container dark:hover:bg-surface-container-high dark:hover:text-on-surface'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">{f.icon}</span>
                {f.label}
              </button>
            ))}

            {/* Clear filters */}
            {hasFilters && (
              <button
                type="button"
                onClick={clearAll}
                className={`${navBtn} flex-shrink-0 flex items-center gap-1 px-3 py-2 rounded-full text-label-sm font-label-sm text-error hover:bg-error-container transition-all active:scale-95 ml-auto`}
              >
                <span className="material-symbols-outlined text-[15px]">filter_alt_off</span>
                Clear
              </button>
            )}
          </div>

        </div>
      </header>
      )}

      {/* ═══════════════════════════════════
          MAIN CONTENT
      ═══════════════════════════════════ */}
      <main className="max-w-[1400px] mx-auto px-4 sm:px-6 md:px-8 py-6 pb-28 md:pb-10">

        {/* ── Error ───────────────────── */}
        {error && (
          <div className="flex flex-col items-center justify-center py-24 text-center gap-4">
            <span className="material-symbols-outlined text-[64px] text-error">error</span>
            <h3 className="font-headline-lg text-headline-lg">Failed to load materials</h3>
            <p className="text-on-surface-variant">{error}</p>
          </div>
        )}

        {/* ── Loading skeletons ────────── */}
        {!error && loading && (
          viewMode === 'grid' ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} list />)}
            </div>
          )
        )}

        {/* ── Empty state ─────────────── */}
        {!error && !loading && sortedMaterials.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center gap-4">
            <div className="w-20 h-20 rounded-full bg-surface-container flex items-center justify-center">
              <span className="material-symbols-outlined text-[40px] text-outline">search_off</span>
            </div>
            <div>
              <h3 className="font-headline-lg text-headline-lg mb-2">No materials found</h3>
              <p className="text-on-surface-variant text-body-md">
                {debouncedQuery
                  ? `No results for "${debouncedQuery}". Try different keywords.`
                  : 'Try selecting a different filter.'}
              </p>
            </div>
            <button
              type="button"
              onClick={clearAll}
              className={`${navBtn} px-6 py-3 bg-on-surface text-surface dark:bg-surface-container-highest dark:text-on-surface rounded-full font-bold hover:opacity-90 active:scale-95`}
            >
              Clear filters
            </button>
          </div>
        )}

        {/* ── Results ─────────────────── */}
        {!error && !loading && sortedMaterials.length > 0 && (
          viewMode === 'grid' ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {sortedMaterials.map((m) => (
                <GridCard
                  key={m._id}
                  m={m}
                  saved={savedIds.has(m._id)}
                  onSave={() => toggleSaved(m._id)}
                  onView={() => navigate(P.userMaterialDetail(m._id))}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {sortedMaterials.map((m) => (
                <ListCard
                  key={m._id}
                  m={m}
                  saved={savedIds.has(m._id)}
                  onSave={() => toggleSaved(m._id)}
                  onView={() => navigate(P.userMaterialDetail(m._id))}
                />
              ))}
            </div>
          )
        )}

      </main>

      {/* ═══════════════════════════════════
          MOBILE BOTTOM NAV
      ═══════════════════════════════════ */}
      <nav
        aria-label="Bottom navigation"
        className="md:hidden fixed bottom-0 inset-x-0 z-50 bg-surface border-t border-outline-variant shadow-lg"
      >
        <div className="flex justify-around items-center px-2 py-1">
          {NAV_ITEMS.map((item) => (
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
