import { useState, useEffect } from 'react'

interface Breakpoint {
  isMobile: boolean  // < 768px
  isTablet: boolean  // 768px – 1023px
}

const MOBILE_QUERY = '(max-width: 767px)'
const TABLET_QUERY = '(min-width: 768px) and (max-width: 1023px)'

function getBreakpoint(): Breakpoint {
  return {
    isMobile: window.matchMedia(MOBILE_QUERY).matches,
    isTablet: window.matchMedia(TABLET_QUERY).matches,
  }
}

export function useBreakpoint(): Breakpoint {
  const [bp, setBp] = useState<Breakpoint>(getBreakpoint)

  useEffect(() => {
    const mobileMedia = window.matchMedia(MOBILE_QUERY)
    const tabletMedia = window.matchMedia(TABLET_QUERY)

    const update = () => setBp(getBreakpoint())

    mobileMedia.addEventListener('change', update)
    tabletMedia.addEventListener('change', update)

    return () => {
      mobileMedia.removeEventListener('change', update)
      tabletMedia.removeEventListener('change', update)
    }
  }, [])

  return bp
}
