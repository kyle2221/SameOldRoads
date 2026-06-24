import { useEffect, useState } from 'react'

// Debounce a fast-changing value (e.g. text input) for downstream effects.
// Returns a debounced copy that only updates after `delay` ms of quiet.
export function useDebounced(value, delay = 250) {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(id)
  }, [value, delay])
  return debounced
}
