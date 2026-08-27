import { useEffect, useState } from 'react'

/** Returns `value`, updated only after it stops changing for `delayMs`. */
export function useDebounce(value, delayMs = 400) {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    const timeout = setTimeout(() => setDebounced(value), delayMs)
    return () => clearTimeout(timeout)
  }, [value, delayMs])

  return debounced
}
