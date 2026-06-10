import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { P } from '../../routes/appPaths'
import AdminPageHeader, { ViewToggle } from '../../components/navigation/AdminPageHeader'

export default function MaterialsFilesPage() {
  const navigate = useNavigate()

  const [kindFilter, setKindFilter] = useState('all')
  const [tablePage, setTablePage] = useState(1)

  const chip = (key, label) => {
    const active = kindFilter === key
    return (
      <button
        type="button"
        className={
          active
            ? 'whitespace-nowrap px-4 py-2 bg-secondary-container text-on-secondary-container rounded-full font-label-sm text-label-sm font-bold'
            : 'whitespace-nowrap px-4 py-2 bg-surface-container text-on-surface-variant hover:bg-surface-container-highest rounded-full font-label-sm text-label-sm transition-colors'
        }
        onClick={() => setKindFilter(key)}
      >
        {label}
      </button>
    )
  }

  return (
    <>
      <main className="min-h-screen pb-24 md:pb-8">
        <AdminPageHeader
          icon="folder_open"
          title="Material Files"
          subtitle="Uploaded files & attachments"
          actions={<ViewToggle patronTo={P.userDashboard} librarianTo={P.adminMaterialsFiles} />}
        />

        <div className="max-w-[1280px] mx-auto p-gutter">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-base mb-margin-desktop">
            <div className="md:col-span-2 p-8 bg-secondary text-on-secondary rounded-xl flex flex-col justify-between min-h-[160px] shadow-sm">
              <h2 className="font-headline-lg text-headline-lg">Material Inventory</h2>
              <p className="font-body-md text-body-md opacity-80">Catalog and manage academic resources, including textbooks, digital notes, and previous year questions.</p>
            </div>
            <div className="p-8 bg-secondary-container text-on-secondary-container rounded-xl shadow-sm flex flex-col justify-center items-center text-center">
              <span className="font-display-lg text-display-lg">1,248</span>
              <span className="font-label-sm text-label-sm uppercase tracking-wider">Total Items</span>
            </div>
            <div className="p-8 bg-surface-container-high text-on-surface rounded-xl shadow-sm flex flex-col justify-center items-center text-center border border-outline-variant">
              <span className="font-display-lg text-display-lg text-secondary">42</span>
              <span className="font-label-sm text-label-sm uppercase tracking-wider">Pending Audit</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 mb-gutter items-center">
            <div className="relative w-full sm:w-96 group">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-secondary transition-colors">search</span>
              <input className="w-full pl-12 pr-4 py-3 bg-surface-container-lowest border border-outline-variant focus:border-secondary focus:ring-0 rounded-xl font-body-md text-body-md transition-all outline-none" placeholder="Search title, author, or ISBN..." type="text" />
            </div>
            <div className="flex gap-2 w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0">
              {chip('all', '')}
              {chip('book', 'Books')}
              {chip('notes', 'Notes')}
              {chip('pyq', 'PYQs')}
            </div>
          </div>

          <button type="button" className="hidden sm:flex items-center gap-2 bg-secondary text-on-secondary px-6 py-3 rounded-xl font-bold hover:bg-opacity-90 transition-all shadow-sm mb-gutter" onClick={() => navigate(P.adminMaterialsAdd)}>
            <span className="material-symbols-outlined">add</span>
            <span className="font-body-md">Add Material</span>
          </button>

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
                  <tr className="hover:bg-surface-container transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-14 bg-surface-container-high rounded flex-shrink-0 flex items-center justify-center border border-outline-variant overflow-hidden">
                          <img className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuB1_A7lyd7y5q3MygPVicIlr5f7dRI1hQYH3_wFqT_mgVYDKg-LlRF9AE0NaAc2jObmOt9YYBVW-jVndz34Khnlv195Fqpc6SJ63xKIcTSktncrcLxwMg6O8gaBDKOm-s6R_JZZpxDIWF0A-m3zaN-nhzLoUAEoi192xGNw4f-e-NK79cM5DR0mYH8FF7RVhY_omSD2QEJhnWrKAPAu6G5jEWTYU6DpiveeBDvfgcMAjKBEANr8z_LqrR4ubZxeafq-5PxfH8TAncxT" alt="Advanced Algorithms" />
                        </div>
                        <div>
                          <p className="font-title-md text-[16px] leading-tight text-secondary">Advanced Algorithms</p>
                          <p className="font-body-md text-on-surface-variant">T. Cormen Â· 2023</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4"><span className="px-3 py-1 bg-tertiary-fixed text-on-tertiary-fixed-variant rounded-full text-label-sm font-label-sm">Computer Science</span></td>
                    <td className="px-6 py-4"><span className="flex items-center gap-1.5 text-secondary"><span className="w-2 h-2 rounded-full bg-secondary"></span><span className="text-label-sm font-label-sm">Checked Out</span></span></td>
                    <td className="px-6 py-4 text-on-surface-variant font-body-md">Sarah Jenkins</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button type="button" className="p-2 hover:bg-secondary-container rounded-lg text-secondary transition-colors" title="Edit" onClick={() => navigate(P.adminMaterials)}>
                          <span className="material-symbols-outlined">edit</span>
                        </button>
                        <button type="button" className="p-2 hover:bg-error-container rounded-lg text-error transition-colors" title="Delete" onClick={() => { if (window.confirm('Remove this material from the catalog?')) navigate(P.adminMaterials) }}>
                          <span className="material-symbols-outlined">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                  <tr className="hover:bg-surface-container transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-14 bg-error-container rounded flex-shrink-0 flex items-center justify-center border border-error/20 overflow-hidden text-error">
                          <span className="material-symbols-outlined">picture_as_pdf</span>
                        </div>
                        <div>
                          <p className="font-title-md text-[16px] leading-tight text-secondary">Quantum Physics Notes</p>
                          <p className="font-body-md text-on-surface-variant">Prof. Heisenberg Â· Sem IV</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4"><span className="px-3 py-1 bg-surface-container-high text-on-surface-variant rounded-full text-label-sm font-label-sm">Handwritten Notes</span></td>
                    <td className="px-6 py-4"><span className="flex items-center gap-1.5 text-green-700"><span className="w-2 h-2 rounded-full bg-green-700"></span><span className="text-label-sm font-label-sm">Available</span></span></td>
                    <td className="px-6 py-4 text-on-surface-variant font-body-md">Admin Panel</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button type="button" className="p-2 hover:bg-secondary-container rounded-lg text-secondary transition-colors" title="Edit" onClick={() => navigate(P.adminMaterials)}>
                          <span className="material-symbols-outlined">edit</span>
                        </button>
                        <button type="button" className="p-2 hover:bg-error-container rounded-lg text-error transition-colors" title="Delete" onClick={() => { if (window.confirm('Remove this material from the catalog?')) navigate(P.adminMaterials) }}>
                          <span className="material-symbols-outlined">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                  <tr className="hover:bg-surface-container transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-14 bg-secondary-container rounded flex-shrink-0 flex items-center justify-center border border-secondary overflow-hidden text-on-secondary-container">
                          <span className="material-symbols-outlined">present_to_all</span>
                        </div>
                        <div>
                          <p className="font-title-md text-[16px] leading-tight text-secondary">Microeconomics PYQ 2022</p>
                          <p className="font-body-md text-on-surface-variant">Entrance Exam Series</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4"><span className="px-3 py-1 bg-surface-container-high text-on-surface-variant rounded-full text-label-sm font-label-sm">PYQs</span></td>
                    <td className="px-6 py-4"><span className="flex items-center gap-1.5 text-green-700"><span className="w-2 h-2 rounded-full bg-green-700"></span><span className="text-label-sm font-label-sm">Available</span></span></td>
                    <td className="px-6 py-4 text-on-surface-variant font-body-md">Librarian J.</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button type="button" className="p-2 hover:bg-secondary-container rounded-lg text-secondary transition-colors" title="Edit" onClick={() => navigate(P.adminMaterials)}>
                          <span className="material-symbols-outlined">edit</span>
                        </button>
                        <button type="button" className="p-2 hover:bg-error-container rounded-lg text-error transition-colors" title="Delete" onClick={() => { if (window.confirm('Remove this material from the catalog?')) navigate(P.adminMaterials) }}>
                          <span className="material-symbols-outlined">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="px-6 py-4 flex items-center justify-between border-t border-outline-variant bg-surface-container-low">
              <p className="text-label-sm font-label-sm text-on-surface-variant">Showing {tablePage === 1 ? '1 to 3' : '4 to 6'} of 1,248 entries</p>
              <div className="flex gap-2">
                <button type="button" className="p-2 hover:bg-surface-container-high rounded transition-colors disabled:opacity-30" disabled={tablePage <= 1} onClick={() => setTablePage((p) => Math.max(1, p - 1))}>
                  <span className="material-symbols-outlined">chevron_left</span>
                </button>
                <button type="button" className={`px-3 py-1 rounded font-label-sm text-label-sm ${tablePage === 1 ? 'bg-secondary text-on-secondary' : 'hover:bg-surface-container-high'}`} onClick={() => setTablePage(1)}>1</button>
                <button type="button" className={`px-3 py-1 rounded font-label-sm text-label-sm ${tablePage === 2 ? 'bg-secondary text-on-secondary' : 'hover:bg-surface-container-high'}`} onClick={() => setTablePage(2)}>2</button>
                <button type="button" className={`px-3 py-1 rounded font-label-sm text-label-sm ${tablePage === 3 ? 'bg-secondary text-on-secondary' : 'hover:bg-surface-container-high'}`} onClick={() => setTablePage(3)}>3</button>
                <button type="button" className="p-2 hover:bg-surface-container-high rounded transition-colors" disabled={tablePage >= 3} onClick={() => setTablePage((p) => Math.min(3, p + 1))}>
                  <span className="material-symbols-outlined">chevron_right</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <button type="button" className="fixed bottom-margin-mobile right-margin-mobile md:bottom-10 md:right-10 flex items-center gap-3 bg-secondary-container text-on-secondary-container px-6 py-4 rounded-xl shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all z-50" onClick={() => navigate(P.adminMaterialsAdd)}>
        <span className="material-symbols-outlined">add</span>
        <span className="font-title-md text-[16px] font-bold">Add Material</span>
      </button>
    </>
  )
}
