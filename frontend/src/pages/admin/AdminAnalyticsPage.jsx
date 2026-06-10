import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useActivity } from '../../contexts/ActivityContext'
import { timeAgo } from '../../utils/timeAgo'
import { useMaterials } from '../../hooks/useMaterials'
import { useUsers } from '../../hooks/useUsers'
import { api } from '../../services/api'
import { P } from '../../routes/appPaths'
import AdminPageHeader, { ViewToggle } from '../../components/navigation/AdminPageHeader'

function StatCard({ icon, iconBg, iconColor, label, value, loading }) {
  return (
    <div className="col-span-12 md:col-span-4 bg-surface-container-lowest p-6 rounded-xl shadow-sm border border-outline-variant flex flex-col gap-4">
      <div className={`${iconBg} p-3 rounded-lg w-fit`}>
        <span className={`material-symbols-outlined ${iconColor}`}>{icon}</span>
      </div>
      <div>
        <p className="text-on-surface-variant font-label-sm text-label-sm">{label}</p>
        <h3 className="text-display-lg font-display-lg text-on-surface">
          {loading ? <span className="opacity-30 animate-pulse"></span> : value}
        </h3>
      </div>
    </div>
  )
}

function BorrowBar({ label, count, total, color }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0
  return (
    <div className="space-y-1">
      <div className="flex justify-between items-center text-label-sm font-label-sm">
        <span className="text-on-surface-variant">{label}</span>
        <span className="text-on-surface font-bold">
          {count} <span className="text-outline font-normal">({pct}%)</span>
        </span>
      </div>
      <div className="h-2 bg-surface-container-high rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-700 ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

export default function AdminAnalyticsPage() {
  const navigate = useNavigate()

  const { activities } = useActivity()

  const { total: totalUsers, loading: usersLoading } = useUsers({ limit: 1 })
  const { total: totalMaterials, loading: matLoading } = useMaterials({ limit: 1 })

  const [borrowStats, setBorrowStats] = useState({ total: 0, approved: 0, pending: 0, returned: 0 })
  const [borrowLoading, setBorrowLoading] = useState(true)
  const [totalSaved, setTotalSaved] = useState(0)
  const [savedLoading, setSavedLoading] = useState(true)

  useEffect(() => {
    setBorrowLoading(true)
    Promise.all([
      api.get('/borrow?limit=1'),
      api.get('/borrow?status=approved&limit=1'),
      api.get('/borrow?status=pending&limit=1'),
      api.get('/borrow?status=returned&limit=1'),
    ])
      .then(([all, approved, pending, returned]) => {
        setBorrowStats({
          total: all.total ?? 0,
          approved: approved.total ?? 0,
          pending: pending.total ?? 0,
          returned: returned.total ?? 0,
        })
      })
      .catch(() => {})
      .finally(() => setBorrowLoading(false))
  }, [])

  useEffect(() => {
    api.get('/saved?limit=1')
      .then((data) => setTotalSaved(data.total ?? 0))
      .catch(() => {})
      .finally(() => setSavedLoading(false))
  }, [])

  const recentActivities = activities.slice(0, 5)

  return (
    <>
      <main className="min-h-screen">
        <AdminPageHeader
          icon="analytics"
          title="Overview"
          subtitle="Library analytics & insights"
          actions={
            <button type="button" className="hidden sm:flex items-center gap-2 bg-secondary text-on-secondary px-5 py-2 rounded-full font-label-sm text-label-sm hover:opacity-90 active:scale-95 transition-all" onClick={() => navigate(P.adminMaterials)}>
              <span className="material-symbols-outlined text-[16px]">library_books</span>
              Materials
            </button>
          }
        />

        <section className="p-gutter max-w-container-max-width mx-auto">
          <div className="mb-8">
            <h2 className="font-headline-lg text-headline-lg text-on-surface mb-2">Library Overview</h2>
            <p className="font-body-lg text-body-lg text-on-surface-variant">Real-time performance metrics and system activity tracking.</p>
          </div>

          <div className="bento-grid">
            <StatCard
              icon="group"
              iconBg="bg-primary-container"
              iconColor="text-on-primary-container"
              label="Total Users"
              value={totalUsers}
              loading={usersLoading}
            />
            <div
              className="col-span-12 md:col-span-4 bg-surface-container-lowest p-6 rounded-xl shadow-sm border border-outline-variant flex flex-col gap-4 cursor-pointer hover:border-secondary transition-colors group"
              onClick={() => navigate(P.adminSavedHistory)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && navigate(P.adminSavedHistory)}
            >
              <div className="bg-secondary-container p-3 rounded-lg w-fit">
                <span className="material-symbols-outlined text-on-secondary-container">bookmarks</span>
              </div>
              <div>
                <p className="text-on-surface-variant font-label-sm text-label-sm">Saved Items</p>
                <h3 className="text-display-lg font-display-lg text-on-surface">
                  {savedLoading ? <span className="opacity-30 animate-pulse"></span> : totalSaved}
                </h3>
              </div>
              <p className="text-label-sm font-label-sm text-secondary group-hover:underline mt-auto">View full history â†'</p>
            </div>
            <StatCard
              icon="new_releases"
              iconBg="bg-tertiary-fixed"
              iconColor="text-on-tertiary-fixed-variant"
              label="Total Materials"
              value={totalMaterials}
              loading={matLoading}
            />

            {/* Borrow Activity Breakdown */}
            <div className="col-span-12 md:col-span-8 bg-surface-container-lowest p-8 rounded-xl shadow-sm border border-outline-variant flex flex-col">
              <div className="mb-6">
                <h4 className="font-title-md text-title-md text-on-surface">Borrow Activity Breakdown</h4>
                <p className="font-body-md text-body-md text-on-surface-variant">Distribution of borrow requests by status</p>
              </div>
              {borrowLoading ? (
                <div className="flex items-center justify-center h-40 text-on-surface-variant opacity-40 font-body-md animate-pulse">
                  Loading
                </div>
              ) : borrowStats.total === 0 ? (
                <div className="flex flex-col items-center justify-center h-40 text-on-surface-variant gap-3">
                  <span className="material-symbols-outlined text-[48px] opacity-30">bar_chart</span>
                  <p className="font-body-md opacity-50">No borrow data yet</p>
                </div>
              ) : (
                <div className="space-y-5 mt-2">
                  <BorrowBar label="Approved (Active)" count={borrowStats.approved} total={borrowStats.total} color="bg-secondary" />
                  <BorrowBar label="Pending Review" count={borrowStats.pending} total={borrowStats.total} color="bg-tertiary" />
                  <BorrowBar label="Returned" count={borrowStats.returned} total={borrowStats.total} color="bg-outline" />
                  <div className="pt-4 border-t border-outline-variant flex justify-between text-label-sm font-label-sm text-on-surface-variant">
                    <span>Total requests</span>
                    <span className="font-bold text-on-surface">{borrowStats.total}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Recent Activities */}
            <div className="col-span-12 md:col-span-4 bg-surface-container-lowest p-8 rounded-xl shadow-sm border border-outline-variant">
              <div className="flex justify-between items-center mb-6">
                <h4 className="font-title-md text-title-md text-on-surface">Recent Activities</h4>
                <button type="button" className="text-secondary font-bold text-label-sm hover:underline" onClick={() => navigate(P.userActivity)}>View all</button>
              </div>
              {recentActivities.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-on-surface-variant gap-3">
                  <span className="material-symbols-outlined text-[48px] opacity-30">inbox</span>
                  <p className="font-body-md opacity-50 text-center">No recent activity</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentActivities.map((item) => (
                    <div key={item.id} className="flex items-start gap-3">
                      <div className={`w-8 h-8 rounded-full ${item.iconBg} flex items-center justify-center flex-shrink-0`}>
                        <span className={`material-symbols-outlined text-[16px] ${item.iconColor}`}>{item.icon}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-body-md text-body-md text-on-surface leading-tight truncate">{item.title}</p>
                        <p className="text-label-sm font-label-sm text-outline mt-0.5">{item.timestamp ? timeAgo(item.timestamp) : item.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Banner */}
            <div className="col-span-12 md:col-span-12 bg-primary-container text-on-primary-container p-8 rounded-xl shadow-md flex flex-col md:flex-row items-center justify-between gap-8 overflow-hidden relative">
              <div className="z-10 relative">
                <h4 className="font-headline-lg text-headline-lg mb-2">Audit Season is Approaching</h4>
                <p className="font-body-lg text-body-lg opacity-80 max-w-xl">Prepare your materials for the annual stock audit. Automate inventory reports or manually verify high-value collections before December 1st.</p>
                <div className="flex gap-4 mt-6">
                  <button type="button" className="bg-secondary text-on-secondary px-8 py-3 rounded-full font-title-md text-title-md hover:opacity-90 transition-opacity active:scale-95 duration-200" onClick={() => navigate(P.adminMaterials)}>Start Audit</button>
                  <button type="button" className="border border-secondary/40 text-secondary px-8 py-3 rounded-full font-title-md text-title-md hover:bg-secondary/10 transition-colors active:scale-95 duration-200" onClick={() => navigate(P.adminMaterials)}>Review Policies</button>
                </div>
              </div>
              <div className="relative w-full md:w-1/3 aspect-video rounded-lg overflow-hidden border border-on-primary-container/20">
                <img alt="Audit Interface" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAhyfMXk7SzLndsyZIF1v4iMTvg7hbE2SSIg4PuhxogqJFqOARrY1xbKp2LtHlXGv5K-aeXD49Hzjd42pBWBhA46TyJF14-TOTOiwQcElaStit05Hqbb0ER_P67ulX15Hg45p7t6NsgoN4-AO73IgKnKWd5JYF0irrerkzU6uLXGCK-vgrsDq0d26CMhp2Iu67-KWOZsgZc7CtMP1Arl9CeZwopauZE3O3QGuEnVZEoUmdmI_t62rNXs2TdDks8H57tRepZY1jQkjyt" />
              </div>
              <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-secondary/10 rounded-full blur-3xl"></div>
            </div>
          </div>
        </section>
      </main>

      <div className="fixed bottom-margin-desktop right-margin-desktop z-50">
        <button type="button" className="w-16 h-16 bg-secondary text-on-secondary rounded-2xl shadow-lg flex items-center justify-center hover:shadow-xl transition-all active:scale-90 duration-200 hover:brightness-110" onClick={() => navigate(P.adminMaterialsAdd)} aria-label="Add material">
          <span className="material-symbols-outlined text-[32px]">add</span>
        </button>
      </div>
    </>
  )
}
