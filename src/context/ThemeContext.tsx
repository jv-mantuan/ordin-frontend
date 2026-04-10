import { createContext, useContext } from 'react'

export interface ThemeColors {
  bgApp: string
  bgSurface: string
  bgCard: string
  bgCardElevated: string
  bgActive: string
  accentGreen: string
  accentGreenMuted: string
  accentGreenBright: string
  border: string
  borderSubtle: string
  textPrimary: string
  textSecondary: string
  textMuted: string
  income: string
  incomeSubtle: string
  expense: string
  expenseSubtle: string
  chartBar1: string
  chartBar2: string
  chartBar3: string
  white: string
}

export const darkColors: ThemeColors = {
  bgApp: '#0a1410',
  bgSurface: '#0f1a14',
  bgCard: '#142019',
  bgCardElevated: '#1c2d21',
  bgActive: '#1e3527',
  accentGreen: '#3d7a52',
  accentGreenMuted: '#2a5438',
  accentGreenBright: '#5aab72',
  border: 'rgba(255, 255, 255, 0.07)',
  borderSubtle: 'rgba(255, 255, 255, 0.04)',
  textPrimary: '#e2ede4',
  textSecondary: '#7a9882',
  textMuted: '#4d6654',
  income: '#5aab72',
  incomeSubtle: 'rgba(90, 171, 114, 0.15)',
  expense: '#e05c5c',
  expenseSubtle: 'rgba(224, 92, 92, 0.12)',
  chartBar1: '#3d7a52',
  chartBar2: '#2d5c3e',
  chartBar3: '#4a8f64',
  white: '#ffffff',
}

export const lightColors: ThemeColors = {
  bgApp: '#eef4f0',
  bgSurface: '#ffffff',
  bgCard: '#f7faf8',
  bgCardElevated: '#edf5ef',
  bgActive: '#d8eddf',
  accentGreen: '#3d7a52',
  accentGreenMuted: '#5aab72',
  accentGreenBright: '#2a5438',
  border: 'rgba(0, 0, 0, 0.08)',
  borderSubtle: 'rgba(0, 0, 0, 0.04)',
  textPrimary: '#0f1a14',
  textSecondary: '#3d6a4e',
  textMuted: '#7a9882',
  income: '#2e7d48',
  incomeSubtle: 'rgba(46, 125, 72, 0.12)',
  expense: '#c94444',
  expenseSubtle: 'rgba(201, 68, 68, 0.1)',
  chartBar1: '#3d7a52',
  chartBar2: '#5aab72',
  chartBar3: '#2a5438',
  white: '#ffffff',
}

interface ThemeContextValue {
  colors: ThemeColors
  isDark: boolean
  toggleTheme: () => void
}

export const ThemeContext = createContext<ThemeContextValue | null>(null)

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider')
  return ctx
}