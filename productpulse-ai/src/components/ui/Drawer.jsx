import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import { cn } from '../../utils/cn'

/**
 * @param {boolean} isOpen
 * @param {() => void} onClose
 * @param {string} title
 * @param {'left'|'right'} side
 */
export function Drawer({ isOpen, onClose, title, side = 'right', children }) {
  useEffect(() => {
    if (!isOpen) return undefined

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose()
    }

    document.addEventListener('keydown', handleKeyDown)
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = previousOverflow
    }
  }, [isOpen, onClose])

  return createPortal(
    <div className={cn('fixed inset-0 z-[100]', !isOpen && 'pointer-events-none')}>
      <div
        className={cn(
          'absolute inset-0 bg-zinc-950/50 transition-opacity duration-200',
          isOpen ? 'opacity-100' : 'opacity-0',
        )}
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'drawer-title' : undefined}
        className={cn(
          'absolute inset-y-0 flex w-full max-w-md flex-col bg-surface-card shadow-lg transition-transform duration-200 ease-out',
          side === 'right' ? 'right-0' : 'left-0',
          isOpen ? 'translate-x-0' : side === 'right' ? 'translate-x-full' : '-translate-x-full',
        )}
      >
        <div className="flex items-center justify-between border-b border-default px-5 py-4">
          <h2 id="drawer-title" className="text-section-heading text-primary">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-secondary hover:bg-surface-sunken hover:text-primary"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">{children}</div>
      </div>
    </div>,
    document.body,
  )
}
