import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMaterials } from '../../hooks/useMaterials'
import { api } from '../../services/api'
import { useAuth } from '../../contexts/AuthContext'
import { P } from '../../routes/appPaths'
import AdminPageHeader, { ViewToggle } from '../../components/navigation/AdminPageHeader'

function categoryBadge(row) {
  if (row.kind === 'book') {
    return (
      <span className="px-3 py-1 bg-tertiary-fixed text-on-tertiary-fixed-variant rounded-full text-label-sm font-label-sm">
        {row.categoryLabel}
      </span>
    )
  }
  return (
    <span className="px-3 py-1 bg-surface-container-high text-on-surface-variant rounded-full text-label-sm font-label-sm">
      {row.categoryLabel}
    </span>
  )
}

function Thumbnail({ row }) {
  if (row.coverUrl) {
    return (
      <div className="w-10 h-14 bg-surface-container-high rounded flex-shrink-0 flex items-center justify-center border border-outline-variant overflow-hidden">
        <img className="w-full h-full object-cover" alt={row.title} src={row.coverUrl} />
      </div>
    )
  }
  if (row.kind === 'notes') {
    return (
      <div className="w-10 h-14 bg-surface-container-high rounded flex-shrink-0 flex items-center justify-center border border-outline-variant overflow-hidden">
        <span className="material-symbols-outlined text-outline">description</span>
      </div>
    )
  }
  return (
    <div className="w-10 h-14 bg-secondary-container rounded flex-shrink-0 flex items-center justify-center border border-secondary">
      <span className="material-symbols-outlined text-on-secondary-container">quiz</span>
    </div>
  )
}

export default function MaterialsPage() {
  const navigate = useNavigate()

  const { role } = useAuth()
  const isSuperAdmin = role === 'superadmin'
  const [query, setQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [activeFilter, setActiveFilter] = useState('all')

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query), 400)
    return () => clearTimeout(t)
  }, [query])

  const { materials, total, loading, refetch } = useMaterials({ kind: activeFilter, q: debouncedQuery, limit: 100 })
  const checkedOutCount = materials.filter((m) => m.checkedOut).length

  async function removeRow(id) {
    if (!window.confirm('Remove this material from the catalog?')) return
    try {
      await api.del(`/materials/${id}`)
      refetch()
    } catch (err) {
      alert(err.message || 'Failed to delete material.')
    }
  }

  const filterBtn = (key, label) => {
    const active = activeFilter === key
    return (
      <button
        type="button"
        className={
          active
            ? 'whitespace-nowrap px-4 py-2 bg-secondary-container text-on-secondary-container rounded-full font-label-sm text-label-sm font-bold'
            : 'whitespace-nowrap px-4 py-2 bg-surface-container text-on-surface-variant hover:bg-surface-container-highest rounded-full font-label-sm text-label-sm transition-colors'
        }
        onClick={() => setActiveFilter(key)}
      >
        {label}
      </button>
    )
  }

  return (
    <>
      <main className="min-h-screen pb-24 md:pb-8">
        <AdminPageHeader
          icon="library_books"
          title="Materials"
          subtitle="Manage your library collection"
          actions={
            <>
              <ViewToggle patronTo={P.userDashboard} librarianTo={P.adminMaterials} />
              <button type="button" className="flex items-center gap-1.5 bg-secondary text-on-secondary px-5 py-2 rounded-full font-label-sm text-label-sm hover:opacity-90 active:scale-95 transition-all shadow-md" onClick={() => navigate(P.adminMaterialsAdd)}>
                <span className="material-symbols-outlined text-[16px]">add</span>
                <span className="hidden sm:inline">Add Material</span>
              </button>
            </>
          }
        />

        <div className="max-w-[1280px] mx-auto p-gutter">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-base mb-margin-desktop">
            <div className="md:col-span-2 p-8 rounded-xl flex flex-col justify-between min-h-[160px] shadow-sm relative overflow-hidden border border-secondary/20"
              style={{ background: 'linear-gradient(135deg, #12100a 0%, #221a00 50%, #14100a 100%)' }}>
              <div className="pointer-events-none absolute -right-8 -top-8 w-44 h-44 rounded-full blur-3xl" style={{ background: 'rgba(233,193,118,0.08)' }} />
              <h2 className="font-headline-lg text-headline-lg text-white relative z-10">Material Inventory</h2>
              <p className="font-body-md text-body-md text-on-surface-variant opacity-90 relative z-10">
                Catalog and manage academic resources, including textbooks, digital notes, and previous year questions.
              </p>
            </div>
            <div className="p-8 bg-secondary-container text-on-secondary-container rounded-xl shadow-sm flex flex-col justify-center items-center text-center">
              <span className="font-display-lg text-display-lg">{loading ? '' : total}</span>
              <span className="font-label-sm text-label-sm uppercase tracking-wider">Total Items</span>
            </div>
            <div className="p-8 bg-surface-container-high text-on-surface rounded-xl shadow-sm flex flex-col justify-center items-center text-center border border-outline-variant">
              <span className="font-display-lg text-display-lg text-secondary">{loading ? '' : checkedOutCount}</span>
              <span className="font-label-sm text-label-sm uppercase tracking-wider">Checked Out</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 mb-gutter items-center">
            <div className="relative w-full sm:w-96 group">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-secondary transition-colors">search</span>
              <input
                className="w-full pl-12 pr-4 py-3 bg-surface-container-lowest border border-outline-variant focus:border-secondary focus:ring-0 rounded-xl font-body-md text-body-md transition-all outline-none"
                placeholder="Search title, author, or ISBN..."
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-2 w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0">
              {filterBtn('all', 'All Materials')}
              {filterBtn('book', 'Books')}
              {filterBtn('notes', 'Notes')}
              {filterBtn('pyq', 'PYQs')}
            </div>
          </div>

          <div className="bg-surface-container-lowest rounded-xl shadow-md border border-outline-variant overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-container-low border-b border-outline-variant">
                    <th className="px-6 py-4 font-label-sm text-label-sm text-on-surface-variant uppercase">Material</th>
                    <th className="px-6 py-4 font-label-sm text-label-sm text-on-surface-variant uppercase">Category</th>
                    <th className="px-6 py-4 font-label-sm text-label-sm text-on-surface-variant uppercase">Status</th>
                    <th className="px-6 py-4 font-label-sm text-label-sm text-on-surface-variant uppercase">Added By</th>
                    <th className="px-6 py-4 font-label-sm text-label-sm text-on-surface-variant uppercase text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant">
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-10 text-center font-body-md text-on-surface-variant">
                        Loading materials
                      </td>
                    </tr>
                  ) : materials.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-10 text-center font-body-md text-on-surface-variant">
                        No materials match your search or filters.
                      </td>
                    </tr>
                  ) : (
                    materials.map((row) => (
                      <tr key={row._id} className="hover:bg-surface-container transition-colors group">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-4">
                            <Thumbnail row={row} />
                            <div>
                              <p className="font-title-md text-[16px] leading-tight text-secondary">{row.title}</p>
                              <p className="font-body-md text-on-surface-variant">{row.author}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">{categoryBadge(row)}</td>
                        <td className="px-6 py-4">
                          {row.checkedOut ? (
                            <span className="flex items-center gap-1.5 text-secondary">
                              <span className="w-2 h-2 rounded-full bg-secondary"></span>
                              <span className="text-label-sm font-label-sm">Checked Out</span>
                            </span>
                          ) : (
                            <span className="flex items-center gap-1.5 text-green-700">
                              <span className="w-2 h-2 rounded-full bg-green-700"></span>
                              <span className="text-label-sm font-label-sm">Available</span>
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-on-surface-variant font-body-md">{row.addedBy?.name ?? 'â€"'}</td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                            <button
                              type="button"
                              className="p-2 hover:bg-surface-container-highest rounded-lg text-on-surface-variant transition-colors"
                              title="Save History"
                              onClick={() => navigate(P.adminMaterialSavedHistory(row._id))}
                            >
                              <span className="material-symbols-outlined">history</span>
                            </button>
                            <button
                              type="button"
                              className="p-2 hover:bg-secondary-container rounded-lg text-secondary transition-colors"
                              title="Edit"
                              onClick={() => navigate(P.adminMaterialsEdit(row._id))}
                            >
                              <span className="material-symbols-outlined">edit</span>
                            </button>
                            {isSuperAdmin && (
                              <button
                                type="button"
                                className="p-2 hover:bg-error-container rounded-lg text-error transition-colors"
                                title="Delete"
                                onClick={() => removeRow(row._id)}
                              >
                                <span className="material-symbols-outlined">delete</span>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <div className="px-6 py-4 flex items-center justify-between border-t border-outline-variant bg-surface-container-low">
              <p className="text-label-sm font-label-sm text-on-surface-variant">
                Showing 1 to {materials.length} of {total} entries
              </p>
              <div className="flex gap-2">
                <button type="button" className="p-2 hover:bg-surface-container-high rounded transition-colors disabled:opacity-30" disabled>
                  <span className="material-symbols-outlined">chevron_left</span>
                </button>
                <button type="button" className="px-3 py-1 bg-secondary text-on-secondary rounded font-label-sm text-label-sm">
                  1
                </button>
                <button type="button" className="p-2 hover:bg-surface-container-high rounded transition-colors" disabled>
                  <span className="material-symbols-outlined">chevron_right</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <button
        type="button"
        className="fixed bottom-margin-mobile right-margin-mobile md:bottom-10 md:right-10 flex items-center gap-3 bg-secondary-container text-on-secondary-container px-6 py-4 rounded-xl shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all z-50"
        onClick={() => navigate(P.adminMaterialsAdd)}
      >
        <span className="material-symbols-outlined">add</span>
        <span className="font-title-md text-[16px] font-bold">New Material</span>
      </button>
    </>
  )
}
