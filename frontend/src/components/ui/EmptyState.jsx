import { Button } from './Button'

/**
 * @param {React.ComponentType} icon - a lucide-react icon component
 * @param {{ label: string, onClick: () => void }} action
 */
export function EmptyState({ icon: Icon, title, description, action = null }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-default px-6 py-16 text-center">
      {Icon && (
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-surface-sunken text-tertiary">
          <Icon size={22} />
        </div>
      )}
      <p className="text-section-heading text-primary">{title}</p>
      {description && <p className="text-body mt-1.5 max-w-sm text-secondary">{description}</p>}
      {action && (
        <Button className="mt-5" onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  )
}
