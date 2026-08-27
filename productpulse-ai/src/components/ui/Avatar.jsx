import { useState } from 'react'
import { cn } from '../../utils/cn'

const SIZE_CLASSES = {
  sm: 'h-7 w-7 text-caption',
  md: 'h-8 w-8 text-caption',
  lg: 'h-10 w-10 text-small',
}

function getInitials(name = '') {
  const parts = name.trim().split(/\s+/)
  if (parts.length === 0 || !parts[0]) return '?'
  return (parts[0][0] + (parts[1]?.[0] || '')).toUpperCase()
}

/**
 * @param {string} name - used to generate initials and the accessible label
 * @param {string} src - optional image URL; falls back to initials if it fails to load
 * @param {'sm'|'md'|'lg'} size
 */
export function Avatar({ name = '', src, size = 'md', className = '' }) {
  const [imageFailed, setImageFailed] = useState(false)

  if (src && !imageFailed) {
    return (
      <img
        src={src}
        alt={name}
        onError={() => setImageFailed(true)}
        className={cn('shrink-0 rounded-full object-cover', SIZE_CLASSES[size], className)}
      />
    )
  }

  return (
    <span
      role="img"
      aria-label={name}
      className={cn(
        'flex shrink-0 items-center justify-center rounded-full bg-ai-100 font-semibold text-ai-700 dark:bg-ai-500/20 dark:text-ai-400',
        SIZE_CLASSES[size],
        className,
      )}
    >
      {getInitials(name)}
    </span>
  )
}
