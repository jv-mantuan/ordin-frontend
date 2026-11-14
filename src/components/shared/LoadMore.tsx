import { useEffect, useRef } from 'react'
import { radius } from '../../theme'
import { useTheme } from '../../context/ThemeContext'
import { Spinner } from './Spinner'

interface LoadMoreProps {
  hasNextPage: boolean
  isFetching: boolean
  /** The last next-page fetch failed: stop auto-loading (no retry loop) and offer a manual retry. */
  hasError?: boolean
  onLoadMore: () => void
}

/**
 * End-of-list row for infinite scroll: fetches the next page when it scrolls into view, and keeps a
 * real button for keyboard users and browsers without IntersectionObserver. Renders nothing at the end.
 */
export function LoadMore({ hasNextPage, isFetching, hasError = false, onLoadMore }: LoadMoreProps) {
  const { colors } = useTheme()
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el || !hasNextPage || isFetching || hasError || typeof IntersectionObserver === 'undefined') return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) onLoadMore()
      },
      { rootMargin: '300px 0px' },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [hasNextPage, isFetching, hasError, onLoadMore])

  if (!hasNextPage) return null

  return (
    <div
      ref={ref}
      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', padding: '16px 0 8px' }}
    >
      {hasError && !isFetching && (
        <span role="alert" style={{ fontSize: '13px', color: colors.expense }}>
          Não foi possível carregar mais itens.
        </span>
      )}
      <button
        type="button"
        className="load-more-btn"
        // Stable name while loading, so assistive tech (and tests) keep finding the same control.
        aria-label="Carregar mais"
        aria-busy={isFetching}
        disabled={isFetching}
        onClick={onLoadMore}
        style={{
          minHeight: '44px',
          padding: '0 20px',
          borderRadius: radius.full,
          border: `1px solid ${colors.border}`,
          background: colors.bgCard,
          color: colors.textSecondary,
          fontSize: '13px',
          fontWeight: 500,
          cursor: isFetching ? 'default' : 'pointer',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
        }}
      >
        {isFetching ? <><Spinner />Carregando…</> : hasError ? 'Tentar de novo' : 'Carregar mais'}
      </button>
      <style>{`
        .load-more-btn { transition: opacity 0.15s ease, transform 0.1s ease; }
        .load-more-btn:hover:not(:disabled) { opacity: 0.85; }
        .load-more-btn:active:not(:disabled) { transform: scale(0.97); }
        .load-more-btn:focus-visible { outline: 2px solid ${colors.accentGreenBright}; outline-offset: 2px; }
      `}</style>
    </div>
  )
}
