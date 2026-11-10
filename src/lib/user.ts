import type { User } from '@supabase/supabase-js'

/** Human-readable name: user_metadata.name if present, else the email. */
export function displayName(user: User | null): string {
  if (!user) return ''
  const name = (user.user_metadata?.name as string | undefined)?.trim()
  return name || user.email || ''
}

/** Up to two uppercase initials for avatars. */
export function initials(user: User | null): string {
  const name = displayName(user)
  if (!name) return '?'
  const parts = name.split(/\s+/).filter(Boolean)
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
  return name.slice(0, 2).toUpperCase()
}
