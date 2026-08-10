/**
 * Combines class name fragments, skipping falsy values.
 *
 * A tiny dependency-free stand-in for clsx — keeps the approved stack
 * lean. Usage: cn('base-class', isActive && 'active-class', className)
 */
export function cn(...classes) {
  return classes.filter(Boolean).join(' ')
}
