import { type ReactNode, useEffect, useState } from "react"
import { ThemeContext, darkColors, darkGlassColors, lightColors, lightGlassColors } from "./ThemeContext"

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [isDark, setIsDark] = useState(true)
  const reduceTransparency = usePrefersReducedTransparency()
  const colors = reduceTransparency
    ? isDark ? darkColors : lightColors
    : isDark ? darkGlassColors : lightGlassColors

  return (
    <ThemeContext.Provider value={{
      colors,
      isDark,
      toggleTheme: () => setIsDark(d => !d),
    }}>
      {children}
    </ThemeContext.Provider>
  )
}

/** The OS "reduce transparency" setting: when on, the app uses solid surfaces instead of glass. */
function usePrefersReducedTransparency(): boolean {
  const query = '(prefers-reduced-transparency: reduce)'
  const [reduce, setReduce] = useState(() => typeof window !== 'undefined' && window.matchMedia(query).matches)
  useEffect(() => {
    const media = window.matchMedia(query)
    const onChange = () => setReduce(media.matches)
    media.addEventListener('change', onChange)
    return () => media.removeEventListener('change', onChange)
  }, [])
  return reduce
}
