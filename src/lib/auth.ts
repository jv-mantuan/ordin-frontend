import { createAuthClient, type VanillaBetterAuthClient } from '@neon/auth'
import { BetterAuthVanillaAdapter } from '@neon/auth/vanilla/adapters'

const url = import.meta.env.VITE_NEON_AUTH_URL as string | undefined

if (!url) {
  throw new Error('Neon Auth não configurado: defina VITE_NEON_AUTH_URL em .env.local')
}

/** Neon Auth (Better Auth) client. The session lives in an HttpOnly cookie on the Auth domain. */
// createAuthClient's conditional return type collapses to the plugin-less AuthClient here; the
// adapter actually builds the Neon client (emailOtp, jwt, …), so type it as the SDK documents.
export const authClient = createAuthClient(url, { adapter: BetterAuthVanillaAdapter() }) as unknown as NeonAuthClient

type SdkResult = Promise<{ data: unknown; error: unknown }>

/**
 * The email-OTP and JWT methods exist at runtime (verified against the dev branch, see the backend
 * spec "Discovered facts"), but their plugin types don't resolve through @neon/auth under pnpm.
 */
interface NeonAuthExtras {
  emailOtp: {
    sendVerificationOtp: (args: { email: string; type: 'email-verification' | 'forget-password' }) => SdkResult
    verifyEmail: (args: { email: string; otp: string }) => SdkResult
    requestPasswordReset: (args: { email: string }) => SdkResult
    resetPassword: (args: { email: string; otp: string; password: string }) => SdkResult
  }
}

type NeonAuthClient = VanillaBetterAuthClient & NeonAuthExtras

/** Normalized auth failure: Better Auth error `code` (e.g. INVALID_OTP), HTTP status and raw message. */
export interface AuthFailure {
  code?: string
  status?: number
  message: string
}

/**
 * Runs an SDK call and normalizes both failure styles the SDK uses:
 * a returned `{ error }` and a thrown `AuthApiError`.
 */
export async function attempt<T>(
  call: () => Promise<{ data: T | null; error: unknown } | T>,
): Promise<{ data: T | null; error: AuthFailure | null }> {
  try {
    const result = await call()
    if (result && typeof result === 'object' && 'error' in result && 'data' in result) {
      const { data, error } = result as { data: T | null; error: unknown }
      return { data, error: error ? toFailure(error) : null }
    }
    return { data: result as T, error: null }
  } catch (err) {
    return { data: null, error: toFailure(err) }
  }
}

/**
 * The SDK throws AuthApiError with a Supabase-style `code` (e.g. "invalid_credentials") and keeps
 * the original Better Auth error in `.error` (e.g. { code: "INVALID_EMAIL_OR_PASSWORD" }).
 * Prefer the Better Auth code: it is what the server sends and what mapAuthError switches on.
 */
function toFailure(err: unknown): AuthFailure {
  const e = (err ?? {}) as { code?: unknown; status?: unknown; message?: unknown; error?: unknown }
  const inner = (e.error && typeof e.error === 'object' ? e.error : {}) as { code?: unknown; message?: unknown }
  const code = typeof inner.code === 'string' ? inner.code : typeof e.code === 'string' ? e.code : undefined
  const message = typeof inner.message === 'string' ? inner.message : typeof e.message === 'string' ? e.message : ''
  return { code, status: typeof e.status === 'number' ? e.status : undefined, message }
}

// ---- JWT for the Ordin API -------------------------------------------------------------

let cached: { token: string; exp: number } | null = null
let inFlight: Promise<string | null> | null = null

/** Neon JWTs live 15 min; refresh 60 s before they expire. */
const REFRESH_MARGIN_S = 60

/** Forgets the cached JWT (after sign-out, or when the API answers 401). */
export function invalidateAccessToken(): void {
  cached = null
}

/** A JWT to send as `Authorization: Bearer`, or null when signed out. Concurrent calls share one fetch. */
export async function getAccessToken(): Promise<string | null> {
  if (cached && cached.exp - REFRESH_MARGIN_S > Date.now() / 1000) return cached.token
  inFlight ??= fetchToken().finally(() => {
    inFlight = null
  })
  return inFlight
}

async function fetchToken(): Promise<string | null> {
  // The Neon adapter puts the JWT (from the set-auth-jwt header) in session.token and refreshes it.
  // Its getJWTToken() hits /get-jwt-token (404 on this server) and token() returns the session.
  const { data } = await attempt(() => authClient.getSession())
  const raw = (data as { session?: { token?: unknown } } | null)?.session?.token
  const token = typeof raw === 'string' && raw.split('.').length === 3 ? raw : null
  if (!token) {
    cached = null
    return null
  }
  cached = { token, exp: readExp(token) }
  return token
}

function readExp(jwt: string): number {
  try {
    const payload = JSON.parse(atob(jwt.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')))
    return typeof payload.exp === 'number' ? payload.exp : 0
  } catch {
    return 0
  }
}
