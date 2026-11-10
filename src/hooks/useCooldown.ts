import { useCallback, useEffect, useState } from 'react'

/** Seconds-left countdown, e.g. to throttle "Reenviar código". `start()` restarts it. */
export function useCooldown(seconds: number, startActive = false) {
  const [left, setLeft] = useState(startActive ? seconds : 0)

  useEffect(() => {
    if (left <= 0) return
    const id = window.setTimeout(() => setLeft((l) => l - 1), 1000)
    return () => window.clearTimeout(id)
  }, [left])

  const start = useCallback(() => setLeft(seconds), [seconds])
  return { left, active: left > 0, start }
}
