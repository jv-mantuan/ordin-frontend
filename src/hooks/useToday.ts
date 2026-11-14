import { useEffect, useState } from 'react'
import { todayISO } from '../lib/date'

/**
 * Today's local date ("YYYY-MM-DD") that updates by itself when the day changes,
 * so a page left open overnight never treats yesterday as today.
 */
export function useToday(): string {
  const [today, setToday] = useState(todayISO)

  useEffect(() => {
    const refresh = () => setToday(todayISO())
    const timer = window.setInterval(refresh, 30_000)
    document.addEventListener('visibilitychange', refresh)
    return () => {
      window.clearInterval(timer)
      document.removeEventListener('visibilitychange', refresh)
    }
  }, [])

  return today
}
