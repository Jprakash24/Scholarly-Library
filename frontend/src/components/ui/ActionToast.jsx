import { useActivity } from '../../contexts/ActivityContext'
import { navBtn } from '../../routes/appPaths'

export default function ActionToast() {
  const { toast, dismissToast } = useActivity()

  if (!toast) return null

  return (
    <div className="fixed bottom-24 md:bottom-8 left-1/2 z-[500] w-[min(92vw,420px)]" style={{ transform: 'translateX(-50%)' }}>
      <div className="action-toast flex items-start gap-3 px-4 py-4 rounded-2xl shadow-2xl bg-on-surface text-inverse-on-surface">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${toast.iconBg ?? 'bg-secondary-container'}`}>
          <span className={`material-symbols-outlined text-[20px] ${toast.iconColor ?? 'text-on-secondary-container'}`} style={{ fontVariationSettings: "'FILL' 1" }}>
            {toast.icon}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-body-md font-bold leading-tight">{toast.title}</p>
          <p className="font-label-sm text-label-sm opacity-75 mt-1 leading-snug">{toast.message}</p>
        </div>
        <button
          type="button"
          className={`${navBtn} p-1 opacity-60 hover:opacity-100 transition-opacity shrink-0 mt-0.5`}
          onClick={dismissToast}
          aria-label="Dismiss"
        >
          <span className="material-symbols-outlined text-[20px]">close</span>
        </button>
      </div>
    </div>
  )
}
