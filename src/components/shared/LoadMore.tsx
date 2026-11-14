import { useEffect, useRef } from 'react'
import { radius } from '../../theme'
import { useTheme } from '../../context/ThemeContext'

interface LoadMoreProps {
  hasNextPage: boolean
  isFetching: boolean
  onLoadMore: () => void
}

/**
 * End-of-list row for infinite scroll: fetches the next page when it scrolls into view, and keeps a
 * real button for keyboard users and browsers without IntersectionObserver. Renders nothing at the end.
 */
export function LoadMore({ hasNextPage, isFetching, onLoadMore }: LoadMoreProps) {
  const { colors } = useTheme()
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el || !hasNextPage || isFetching || typeof IntersectionObserver === 'undefined') return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) onLoadMore()
      },
      { rootMargin: '300px 0px' },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [hasNextPage, isFetching, onLoadMore])

  if (!hasNextPage) return null

  return (
    <div ref={ref} style={{ display: 'flex', justifyContent: 'center', padding: '16px 0 8px' }}>
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
          cursor: isFetching ? 'wait' : 'pointer',
        }}
      >
        {isFetching ? 'Carregando…' : 'Carregar mais'}
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
