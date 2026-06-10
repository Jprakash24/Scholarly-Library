import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useMaterial } from '../../hooks/useMaterials'
import { api } from '../../services/api'
import { P } from '../../routes/appPaths'
import AdminPageHeader, { ViewToggle } from '../../components/navigation/AdminPageHeader'

export default function UpdateMaterialPage() {
  const navigate = useNavigate()

  const { id } = useParams()

  const { material, loading: matLoading, error: matError } = useMaterial(id)

  const [title, setTitle] = useState('')
  const [author, setAuthor] = useState('')
  const [isbn, setIsbn] = useState('')
  const [description, setDescription] = useState('')
  const [totalCopies, setTotalCopies] = useState('')
  const [categories, setCategories] = useState([])
  const [showCatInput, setShowCatInput] = useState(false)
  const [newCat, setNewCat] = useState('')
  const [coverUrl, setCoverUrl] = useState('')
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState(null)

  useEffect(() => {
    if (!material) return
    setTitle(material.title ?? '')
    setAuthor(material.author ?? '')
    setIsbn(material.isbn ?? '')
    setDescription(material.description ?? '')
    setTotalCopies(material.totalCopies ?? '')
    setCategories(material.categoryLabel ? [material.categoryLabel] : [])
    setCoverUrl(material.coverUrl ?? '')
  }, [material])

  const removeCategory = (cat) => setCategories(prev => prev.filter(c => c !== cat))

  const commitCategory = () => {
    const trimmed = newCat.trim()
    if (trimmed && !categories.includes(trimmed)) {
      setCategories(prev => [...prev, trimmed])
    }
    setNewCat('')
    setShowCatInput(false)
  }

  const handleSave = async () => {
    setSaving(true)
    setSaveError(null)
    try {
      await api.patch(`/materials/${id}`, {
        title,
        author,
        ...(isbn ? { isbn } : {}),
        description,
        ...(totalCopies !== '' ? { totalCopies: Number(totalCopies) } : {}),
        categoryLabel: categories[0] ?? '',
        coverUrl: coverUrl.trim(),
      })
      navigate(P.adminMaterials)
    } catch (err) {
      setSaveError(err.message || 'Failed to save changes.')
      setSaving(false)
    }
  }

  if (matLoading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center text-on-surface-variant font-body-md">
        Loading material
      </div>
    )
  }

  if (matError || !material) {
    return (
      <div className="min-h-screen bg-surface flex flex-col items-center justify-center gap-4">
        <p className="text-error font-body-md">{matError ?? 'Material not found.'}</p>
        <button type="button" className="px-4 py-2 bg-secondary text-on-secondary rounded-lg font-label-sm" onClick={() => navigate(P.adminMaterials)}>
          Back to Collections
        </button>
      </div>
    )
  }

  return (
    <>
      <main className="min-h-screen font-body-md selection:bg-secondary-container selection:text-on-secondary-container">
        <header>
        {/* <AdminPageHeader
          icon="edit"
          title="Edit Material"
          backTo={P.adminMaterials}
          actions={
            <>
              <ViewToggle patronTo={P.userDashboard} librarianTo={P.adminMaterialsEdit(id)} />
              <button type="button" className="hidden sm:block px-4 py-2 text-on-surface-variant border border-outline-variant font-label-sm text-label-sm rounded-full hover:bg-white/5 transition-colors active:scale-95" onClick={() => navigate(P.adminMaterials)}>
                Discard
              </button>
              <button type="button" disabled={saving} className="px-5 py-2 bg-secondary text-on-secondary font-label-sm text-label-sm rounded-full shadow-sm hover:opacity-90 transition-all active:scale-95 disabled:opacity-60" onClick={handleSave}>
                {saving ? 'Saving…' : 'Save'}
              </button>
            </>
          }
        /> */}
        </header>

        <div className="max-w-[1000px] mx-auto px-gutter py-12">
          {saveError && (
            <div className="mb-6 px-4 py-3 bg-error-container text-on-error-container rounded-lg font-body-md">
              {saveError}
            </div>
          )}
          <div className="grid grid-cols-12 gap-8">
            {/* Left column: cover + status */}
            <div className="col-span-12 lg:col-span-4 space-y-8">
              <div className="bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden border border-outline-variant">
                <div className="aspect-[3/4] relative">
                  {coverUrl ? (
                    <img alt="Material Cover" className="w-full h-full object-contain" src={coverUrl} />
                  ) : (
                    <div className="w-full h-full bg-surface-container-high flex items-center justify-center">
                      <span className="material-symbols-outlined text-outline text-5xl">image</span>
                    </div>
                  )}
                </div>
                {/* Cover URL input */}
                <div className="p-4 border-t border-outline-variant bg-surface-container-low space-y-2">
                  <label className="block text-label-sm font-label-sm text-on-surface-variant">Cover Image URL</label>
                  <input
                    type="url"
                    placeholder="https://example.com/cover.jpg"
                    className="w-full bg-surface border border-outline-variant rounded-lg px-3 py-2 focus:border-secondary focus:ring-1 focus:ring-secondary outline-none transition-all font-body-md text-on-surface text-sm"
                    value={coverUrl}
                    onChange={(e) => setCoverUrl(e.target.value)}
                  />
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-label-sm font-label-sm text-on-surface-variant">CURRENT STATUS</span>
                    <span className={`px-3 py-1 rounded-full text-label-sm font-label-sm ${material.checkedOut ? 'bg-secondary-container text-on-secondary-container' : 'bg-green-100 text-green-800'}`}>
                      {material.checkedOut ? 'Checked Out' : 'Available'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-surface-container rounded-xl p-6 border border-outline-variant">
                <h3 className="font-title-md text-title-md text-secondary mb-4">Material History</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center pb-3 border-b border-outline-variant">
                    <span className="text-body-md text-on-surface-variant">Kind</span>
                    <span className="text-body-md font-bold text-on-surface capitalize">{material.kind}</span>
                  </div>
                  <div className="flex justify-between items-center pb-3 border-b border-outline-variant">
                    <span className="text-body-md text-on-surface-variant">Added By</span>
                    <span className="text-body-md font-bold text-on-surface">{material.addedBy?.name || 'Librarian'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-body-md text-on-surface-variant">Total Copies</span>
                    <span className="text-body-md font-bold text-on-surface">{material.totalCopies ?? 'â€"'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right column: form */}
            <div className="col-span-12 lg:col-span-8">
              <div className="bg-surface-container-lowest rounded-xl p-8 border border-outline-variant shadow-sm space-y-8">
                <section>
                  <div className="flex items-center gap-2 mb-6 text-secondary">
                    <span className="material-symbols-outlined">info</span>
                    <h2 className="font-title-md text-title-md font-bold">General Information</h2>
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="col-span-2">
                      <label className="block text-label-sm font-label-sm text-on-surface-variant mb-2 px-1">Material Title</label>
                      <input className="w-full bg-surface border border-outline-variant rounded-lg px-4 py-3 focus:border-secondary focus:ring-1 focus:ring-secondary outline-none transition-all font-body-md text-on-surface" type="text" value={title} onChange={e => setTitle(e.target.value)} />
                    </div>
                    <div className="col-span-2 md:col-span-1">
                      <label className="block text-label-sm font-label-sm text-on-surface-variant mb-2 px-1">Author Name</label>
                      <input className="w-full bg-surface border border-outline-variant rounded-lg px-4 py-3 focus:border-secondary focus:ring-1 focus:ring-secondary outline-none transition-all font-body-md text-on-surface" type="text" value={author} onChange={e => setAuthor(e.target.value)} />
                    </div>
                    <div className="col-span-2 md:col-span-1">
                      <label className="block text-label-sm font-label-sm text-on-surface-variant mb-2 px-1">ISBN / Catalog ID</label>
                      <input className="w-full bg-surface border border-outline-variant rounded-lg px-4 py-3 focus:border-secondary focus:ring-1 focus:ring-secondary outline-none transition-all font-body-md text-on-surface" type="text" value={isbn} onChange={e => setIsbn(e.target.value)} />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-label-sm font-label-sm text-on-surface-variant mb-2 px-1">Description</label>
                      <textarea className="w-full bg-surface border border-outline-variant rounded-lg px-4 py-3 focus:border-secondary focus:ring-1 focus:ring-secondary outline-none transition-all font-body-md text-on-surface resize-none" rows={4} value={description} onChange={e => setDescription(e.target.value)} />
                    </div>
                  </div>
                </section>

                <section className="pt-8 border-t border-outline-variant">
                  <div className="flex items-center gap-2 mb-6 text-secondary">
                    <span className="material-symbols-outlined">sell</span>
                    <h2 className="font-title-md text-title-md font-bold">Metadata &amp; Tags</h2>
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="col-span-2">
                      <label className="block text-label-sm font-label-sm text-on-surface-variant mb-3 px-1">Active Categories</label>
                      <div className="flex flex-wrap gap-2">
                        {categories.map(cat => (
                          <span key={cat} className="flex items-center gap-1.5 px-3 py-1.5 bg-tertiary-fixed text-on-tertiary-fixed rounded-lg text-label-sm font-label-sm">
                            {cat}
                            <button type="button" className="material-symbols-outlined text-base leading-none hover:opacity-70" onClick={() => removeCategory(cat)} aria-label={`Remove ${cat}`}>close</button>
                          </span>
                        ))}
                        {showCatInput ? (
                          <span className="flex items-center gap-1.5">
                            <input
                              autoFocus
                              type="text"
                              value={newCat}
                              onChange={e => setNewCat(e.target.value)}
                              onKeyDown={e => { if (e.key === 'Enter') commitCategory(); if (e.key === 'Escape') { setNewCat(''); setShowCatInput(false) } }}
                              placeholder="Category name"
                              className="px-3 py-1.5 bg-surface border border-secondary rounded-lg text-label-sm font-label-sm outline-none w-36"
                            />
                            <button type="button" onClick={commitCategory} className="px-2 py-1.5 bg-secondary text-on-secondary rounded-lg text-label-sm font-label-sm">Add</button>
                            <button type="button" onClick={() => { setNewCat(''); setShowCatInput(false) }} className="px-2 py-1.5 text-on-surface-variant rounded-lg text-label-sm font-label-sm hover:bg-surface-container">Cancel</button>
                          </span>
                        ) : (
                          <button type="button" className="flex items-center gap-1.5 px-3 py-1.5 border border-dashed border-outline-variant text-on-surface-variant rounded-lg text-label-sm font-label-sm hover:bg-surface-container transition-colors" onClick={() => setShowCatInput(true)}>
                            <span className="material-symbols-outlined text-base">add</span>
                            Add Category
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </section>

                <section className="pt-8 border-t border-outline-variant">
                  <div className="flex items-center gap-2 mb-6 text-secondary">
                    <span className="material-symbols-outlined">inventory_2</span>
                    <h2 className="font-title-md text-title-md font-bold">Inventory</h2>
                  </div>
                  <div className="grid grid-cols-3 gap-6">
                    <div>
                      <label className="block text-label-sm font-label-sm text-on-surface-variant mb-2 px-1">Total Copies</label>
                      <input className="w-full bg-surface border border-outline-variant rounded-lg px-4 py-3 focus:border-secondary focus:ring-1 focus:ring-secondary outline-none transition-all font-body-md text-on-surface text-center" type="number" min="1" value={totalCopies} onChange={e => setTotalCopies(e.target.value)} />
                    </div>
                  </div>
                </section>
              </div>

              <div className="mt-8 flex justify-end gap-4">
                <button type="button" className="px-8 py-3 border border-outline-variant text-on-surface-variant font-title-md font-bold rounded-xl hover:bg-surface-container-high transition-all duration-200 active:scale-95" onClick={() => navigate(P.adminMaterials)}>
                  Discard Changes
                </button>
                <button type="button" disabled={saving} className="px-10 py-3 bg-secondary text-on-secondary font-title-md font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95 disabled:opacity-60" onClick={handleSave}>
                  {saving ? 'Saving' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
