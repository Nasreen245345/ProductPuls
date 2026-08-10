import { Loader2 } from 'lucide-react'
import { cn } from '../../utils/cn'

const SIZES = { sm: 14, md: 18, lg: 24 }

/** @param {'sm'|'md'|'lg'} size */
export function Spinner({ size = 'md', className = '' }) {
  return <Loader2 size={SIZES[size]} className={cn('animate-spin', className)} />
}
