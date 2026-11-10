import type { AuthUser } from '../context/AuthContext'

/** Human-readable name: the account name if present, else the email. */
export function displayName(user: AuthUser | null): string {
  if (!user) return ''
  return user.name.trim() || user.email || ''
}

/** Up to two uppercase initials for avatars. */
export function initials(user: AuthUser | null): string {
  const name = displayName(user)
  if (!name) return '?'
  const parts = name.split(/\s+/).filter(Boolean)
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
  return name.slice(0, 2).toUpperCase()
}
