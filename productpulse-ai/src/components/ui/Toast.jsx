import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from 'lucide-react'
import { cn } from '../../utils/cn'

const ToastContext = createContext(null)

const VARIANTS = {
  info: { classes: 'bg-surface-card border-default text-primary', Icon: Info, iconClass: 'text-brand-600' },
  success: {
    classes: 'bg-surface-card border-default text-primary',
    Icon: CheckCircle2,
    iconClass: 'text-success-600',
  },
  warning: {
    classes: 'bg-surface-card border-default text-primary',
    Icon: AlertTriangle,
    iconClass: 'text-warning-600',
  },
  danger: { classes: 'bg-surface-card border-default text-primary', Icon: XCircle, iconClass: 'text-danger-600' },
}

let toastIdCounter = 0

/**
 * Mount once near the root (see App.jsx). Any descendant can then call
 * useToast().toast({ variant, title, message }) to surface a notification.
 */
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const toast = useCallback(
    ({ variant = 'info', title, message, duration = 4000 }) => {
      toastIdCounter += 1
      const id = toastIdCounter
      setToasts((prev) => [...prev, { id, variant, title, message }])
      if (duration > 0) {
        setTimeout(() => dismiss(id), duration)
      }
      return id
    },
    [dismiss],
  )

  const value = useMemo(() => ({ toast, dismiss }), [toast, dismiss])

  return (
    <ToastContext.Provider value={value}>
      {children}
      {createPortal(
        <div className="fixed bottom-4 right-4 z-[200] flex w-full max-w-sm flex-col gap-2">
          {toasts.map((t) => {
            const { classes, Icon, iconClass } = VARIANTS[t.variant]
            return (
              <div
                key={t.id}
                role="status"
                className={cn('flex gap-3 rounded-xl border px-4 py-3 shadow-lg', classes)}
              >
                <Icon size={18} className={cn('mt-0.5 shrink-0', iconClass)} />
                <div className="flex-1">
                  {t.title && <p className="text-small font-semibold">{t.title}</p>}
                  {t.message && <p className="text-small text-secondary">{t.message}</p>}
                </div>
                <button
                  type="button"
                  onClick={() => dismiss(t.id)}
                  className="shrink-0 text-tertiary hover:text-secondary"
                  aria-label="Dismiss"
                >
                  <X size={16} />
                </button>
              </div>
            )
          })}
        </div>,
        document.body,
      )}
    </ToastContext.Provider>
  )
}

/** Returns { toast, dismiss }. Must be used within <ToastProvider>. */
export function useToast() {
  const context = useContext(ToastContext)

  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }

  return context
}
