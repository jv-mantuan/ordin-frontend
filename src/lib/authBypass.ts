import type { AuthSession } from '../context/AuthContext'

/**
 * Dev-only auth bypass for the Playwright suite (see playwright.config.ts).
 * On only under the Vite dev server with VITE_AUTH_BYPASS=true: `import.meta.env.DEV` is the
 * literal `false` in a build, so this whole module folds away, and vite.config.ts refuses to
 * build with the flag set (checked by `pnpm test:bypass-guard`).
 * Under the bypass the session is whatever the test stored in localStorage (none = signed out),
 * and the API (AUTH_USE_NEON=false) accepts any bearer token as the master user.
 */
export const AUTH_BYPASS: boolean = import.meta.env.DEV && import.meta.env.VITE_AUTH_BYPASS === 'true'

export const BYPASS_TOKEN = 'ordin-e2e-bypass-token'
export const BYPASS_SESSION_KEY = 'ordin.e2e.session'

export function readBypassSession(): AuthSession | null {
  try {
    const raw = localStorage.getItem(BYPASS_SESSION_KEY)
    const parsed = raw ? (JSON.parse(raw) as AuthSession) : null
    return parsed?.user?.id && parsed.user.email ? parsed : null
  } catch {
    return null
  }
}

export function writeBypassSession(session: AuthSession | null): void {
  if (session) localStorage.setItem(BYPASS_SESSION_KEY, JSON.stringify(session))
  else localStorage.removeItem(BYPASS_SESSION_KEY)
}
