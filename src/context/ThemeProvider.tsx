import { type ReactNode, useState } from "react"
import { ThemeContext, darkColors, lightColors } from "./ThemeContext"

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [isDark, setIsDark] = useState(true)

  return (
    <ThemeContext.Provider value={{
      colors: isDark ? darkColors : lightColors,
      isDark,
      toggleTheme: () => setIsDark(d => !d),
    }}>
      {children}
    </ThemeContext.Provider>
  )
}