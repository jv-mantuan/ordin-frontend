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
  /** Primary action buttons (+ Novo…, Salvar, Concluir). Contrast ≥ 4.5:1 in both themes. */
  primaryButtonBg: string
  primaryButtonText: string
  primaryButtonBorder: string
  /** Page background: the solid color plus soft green glows that show through the glass. */
  appBackground: string
  /** backdrop-filter for overlays (dialogs, tooltips, toasts, bottom bar); 'none' when solid. */
  glassBlur: string
  /** Dimmed backdrop behind dialogs, and the dialog panel itself (more opaque than a card). */
  scrim: string
  dialogBg: string
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
  primaryButtonBg: '#2a5438',
  primaryButtonText: '#a8dcb5', // 5.6:1 on the bg
  primaryButtonBorder: 'rgba(90, 171, 114, 0.25)',
  appBackground: '#0a1410',
  glassBlur: 'none',
  scrim: 'rgba(10, 20, 16, 0.72)',
  dialogBg: '#142019',
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
  primaryButtonBg: '#2e7d48',
  primaryButtonText: '#ffffff', // 5.1:1 on the bg
  primaryButtonBorder: '#2e7d48',
  appBackground: '#eef4f0',
  glassBlur: 'none',
  scrim: 'rgba(15, 26, 20, 0.35)',
  dialogBg: '#f7faf8',
}

const GLASS_BLUR = 'blur(18px) saturate(140%)'

/**
 * "Glass" (direction A, subtle): translucent surfaces over a background with two soft green glows.
 * darkColors/lightColors above stay as the solid look, used when the OS asks for reduced transparency.
 */
export const darkGlassColors: ThemeColors = {
  ...darkColors,
  bgSurface: 'rgba(15, 26, 20, 0.55)',
  bgCard: 'rgba(20, 32, 25, 0.55)',
  bgCardElevated: 'rgba(28, 45, 33, 0.62)',
  bgActive: 'rgba(30, 53, 39, 0.78)',
  appBackground:
    'radial-gradient(900px 600px at 85% -10%, rgba(90, 171, 114, 0.22), transparent 70%), ' +
    'radial-gradient(800px 600px at 0% 110%, rgba(61, 122, 82, 0.28), transparent 70%), #0a1410',
  glassBlur: GLASS_BLUR,
  dialogBg: 'rgba(20, 32, 25, 0.78)',
}

export const lightGlassColors: ThemeColors = {
  ...lightColors,
  bgSurface: 'rgba(255, 255, 255, 0.6)',
  bgCard: 'rgba(255, 255, 255, 0.55)',
  bgCardElevated: 'rgba(237, 245, 239, 0.72)',
  bgActive: 'rgba(216, 237, 223, 0.85)',
  appBackground:
    'radial-gradient(900px 600px at 85% -10%, rgba(90, 171, 114, 0.28), transparent 70%), ' +
    'radial-gradient(800px 600px at 0% 110%, rgba(46, 125, 72, 0.16), transparent 70%), #eef4f0',
  glassBlur: GLASS_BLUR,
  scrim: 'rgba(15, 26, 20, 0.28)',
  dialogBg: 'rgba(255, 255, 255, 0.82)',
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