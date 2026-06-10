import { useState, useEffect, useCallback } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useMaterial } from '../../hooks/useMaterials'
import { useAuth } from '../../contexts/AuthContext'
import { P } from '../../routes/appPaths'

const KIND_ICON = { book: 'book', notes: 'description', pyq: 'history_edu' }
const MIN_ZOOM = 25
const MAX_ZOOM = 300
const STEP = 25

function isPdf(url) {
  return url && url.toLowerCase().endsWith('.pdf')
}

export default function MaterialViewerPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { role } = useAuth()
  const canDownload = role === 'admin' || role === 'superadmin'
  const [zoom, setZoom] = useState(100)

  const { material, loading, error } = useMaterial(id)

  const zoomIn  = useCallback(() => setZoom((z) => Math.min(MAX_ZOOM, z + STEP)), [])
  const zoomOut = useCallback(() => setZoom((z) => Math.max(MIN_ZOOM, z - STEP)), [])
  const resetZoom = useCallback(() => setZoom(100), [])

  useEffect(() => {
    const handler = (e) => {
      if (!e.ctrlKey && !e.metaKey) return
      if (e.key === '+' || e.key === '=') { e.preventDefault(); zoomIn() }
      if (e.key === '-')                   { e.preventDefault(); zoomOut() }
      if (e.key === '0')                   { e.preventDefault(); resetZoom() }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [zoomIn, zoomOut, resetZoom])

  if (loading) {
    return (
      <div className="h-screen bg-[#1a1a2e] flex flex-col items-center justify-center gap-4 text-white">
        <span className="material-symbols-outlined text-[64px] opacity-40 animate-pulse">book</span>
        <p className="opacity-60">Loading material…</p>
      </div>
    )
  }

  if (error || !material) {
    return (
      <div className="h-screen bg-[#1a1a2e] flex flex-col items-center justify-center gap-4 text-white">
        <span className="material-symbols-outlined text-[64px] opacity-40">search_off</span>
        <p className="text-xl font-bold opacity-60">Material not found</p>
        <button
          type="button"
          className="px-6 py-3 rounded-full bg-white/10 hover:bg-white/20 font-bold transition-colors"
          onClick={() => navigate(P.userCatalog)}
        >
          Back to Catalog
        </button>
      </div>
    )
  }

  const fileUrl = material.fileUrl
  const hasFile = Boolean(fileUrl)
  const filePdf = isPdf(fileUrl)
  const kindIcon = KIND_ICON[material.kind] ?? 'insert_drive_file'

  return (
    <div className="fixed inset-0 z-[200] bg-[#1a1a2e] flex flex-col overflow-hidden">

      {/* ── Top toolbar ── */}
      <header className="flex items-center gap-4 px-4 py-3 bg-[#12121e] border-b border-white/10 shrink-0">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <button
            type="button"
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white font-bold text-sm shrink-0 active:scale-95 transition-all"
            onClick={() => navigate(P.userMaterialDetail(id))}
          >
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            <span className="hidden sm:inline">Back</span>
          </button>
          <div className="min-w-0">
            <p className="text-white font-bold text-sm line-clamp-1">{material.title}</p>
            <p className="text-white/50 text-xs">{material.author}</p>
          </div>
        </div>

        {/* Zoom controls — only relevant when no embedded PDF */}
        {!filePdf && (
          <div className="flex items-center gap-1 bg-white/10 rounded-xl px-2 py-1 shrink-0">
            <button type="button" className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/20 text-white disabled:opacity-30 transition-colors active:scale-90" onClick={zoomOut} disabled={zoom <= MIN_ZOOM} aria-label="Zoom out">
              <span className="material-symbols-outlined text-[20px]">zoom_out</span>
            </button>
            <button type="button" className="min-w-[58px] px-2 py-1 rounded-lg text-white text-sm font-mono font-bold text-center hover:bg-white/20 transition-colors" onClick={resetZoom} title="Click to reset to 100%">
              {zoom}%
            </button>
            <button type="button" className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/20 text-white disabled:opacity-30 transition-colors active:scale-90" onClick={zoomIn} disabled={zoom >= MAX_ZOOM} aria-label="Zoom in">
              <span className="material-symbols-outlined text-[20px]">zoom_in</span>
            </button>
          </div>
        )}

        {/* Download */}
        {hasFile && (canDownload || true) && (
          <a
            href={fileUrl}
            download
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary text-on-secondary font-bold text-sm hover:opacity-90 active:scale-95 transition-all shrink-0"
          >
            <span className="material-symbols-outlined text-[18px]">download</span>
            <span className="hidden sm:inline">Download</span>
          </a>
        )}
      </header>

      {/* ── Viewer area ── */}
      <div className="flex-1 overflow-auto">
        {hasFile && filePdf ? (
          /* Embedded PDF viewer */
          <iframe
            src={fileUrl}
            title={material.title}
            className="w-full h-full border-0"
            style={{ minHeight: '100%' }}
          />
        ) : hasFile ? (
          /* Non-PDF file: show download card */
          <div className="flex flex-col items-center justify-center h-full gap-6 text-white p-8">
            <span className="material-symbols-outlined text-[80px] opacity-50">{kindIcon}</span>
            <div className="text-center">
              <p className="text-2xl font-bold mb-2">{material.title}</p>
              <p className="text-white/60 mb-6">{material.author}</p>
              <a
                href={fileUrl}
                download
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-3 px-8 py-4 rounded-full bg-secondary text-on-secondary font-bold text-lg hover:opacity-90 active:scale-95 transition-all shadow-lg"
              >
                <span className="material-symbols-outlined">download</span>
                Download File
              </a>
            </div>
            <p className="text-white/30 text-sm">This file type cannot be previewed in the browser — download to open it.</p>
          </div>
        ) : (
          /* No file uploaded — show placeholder document */
          <div className="min-h-full flex justify-center p-6 md:p-10">
            <div style={{ zoom: `${zoom}%`, transition: 'zoom 0.15s ease' }}>
              <div className="bg-white rounded-xl shadow-2xl overflow-hidden" style={{ width: '794px', minHeight: '1123px' }}>
                <div className="flex items-center gap-3 px-6 py-3 bg-gray-100 border-b border-gray-200">
                  <span className="material-symbols-outlined text-gray-400 text-[20px]">{kindIcon}</span>
                  <span className="text-gray-600 text-sm font-medium">{material.title}.pdf</span>
                  <span className="ml-auto text-gray-400 text-xs">No file uploaded</span>
                </div>
                <div className="px-16 py-14">
                  <div className="text-center mb-12 pb-10 border-b border-gray-100">
                    <div className="w-16 h-16 rounded-2xl bg-gray-50 border border-gray-200 flex items-center justify-center mx-auto mb-6">
                      <span className="material-symbols-outlined text-[32px] text-gray-400">{kindIcon}</span>
                    </div>
                    <h1 className="text-4xl font-bold text-gray-900 mb-3 leading-tight">{material.title}</h1>
                    <p className="text-xl text-gray-400 mb-5">{material.author}</p>
                    <span className="inline-block px-4 py-1.5 bg-gray-100 text-gray-500 rounded-full text-sm font-medium">{material.categoryLabel}</span>
                  </div>
                  {material.description && (
                    <div className="mb-10">
                      <h2 className="text-base font-bold text-gray-700 uppercase tracking-widest mb-4">About this material</h2>
                      <p className="text-gray-600 leading-relaxed text-[15px]">{material.description}</p>
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-6 pt-8 border-t border-gray-100">
                    {[
                      { label: 'Type',     value: material.kind },
                      { label: 'Category', value: material.categoryLabel },
                      { label: 'Rating',   value: material.rating ? `${Number(material.rating).toFixed(1)} / 5.0` : '—' },
                    ].map(({ label, value }) => (
                      <div key={label}>
                        <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">{label}</p>
                        <p className="text-gray-700 font-medium capitalize">{value || '—'}</p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-12 p-6 bg-amber-50 rounded-xl border border-amber-200 text-center">
                    <span className="material-symbols-outlined text-amber-500 text-[32px] mb-2 block">upload_file</span>
                    <p className="text-amber-800 font-medium">No file has been uploaded for this material yet.</p>
                    <p className="text-amber-600 text-sm mt-1">An admin can upload the file via the Edit Material page.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Bottom zoom bar — only when showing placeholder ── */}
      {!hasFile && (
        <div className="shrink-0 flex items-center justify-center gap-4 px-6 py-3 bg-[#12121e] border-t border-white/10">
          <button type="button" className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm disabled:opacity-30 active:scale-95 transition-all" onClick={zoomOut} disabled={zoom <= MIN_ZOOM}>
            <span className="material-symbols-outlined text-[20px]">zoom_out</span>
            Zoom Out
          </button>
          <input type="range" min={MIN_ZOOM} max={MAX_ZOOM} step={STEP} value={zoom} onChange={(e) => setZoom(Number(e.target.value))} className="w-36 md:w-48 accent-secondary cursor-pointer" aria-label="Zoom level" />
          <button type="button" className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm disabled:opacity-30 active:scale-95 transition-all" onClick={zoomIn} disabled={zoom >= MAX_ZOOM}>
            <span className="material-symbols-outlined text-[20px]">zoom_in</span>
            Zoom In
          </button>
          <span className="hidden md:block text-white/25 text-xs">Ctrl+/Ctrl− to zoom · Ctrl+0 to reset</span>
        </div>
      )}
    </div>
  )
}
