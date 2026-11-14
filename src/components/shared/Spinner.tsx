/**
 * Small inline spinner for buttons while an action runs. Inherits the text color; decorative only
 * (the button's text and aria-busy carry the meaning). Only transform is animated; with reduced
 * motion it pulses opacity instead of spinning.
 */
export function Spinner({ size = 12 }: { size?: number }) {
  return (
    <>
      <span
        aria-hidden="true"
        className="ordin-spinner"
        style={{
          display: 'inline-block',
          width: `${size}px`,
          height: `${size}px`,
          borderRadius: '50%',
          border: '2px solid currentColor',
          borderRightColor: 'transparent',
          flexShrink: 0,
        }}
      />
      <style>{`
        @keyframes ordin-spin { to { transform: rotate(360deg); } }
        @keyframes ordin-pulse { 50% { opacity: 0.35; } }
        .ordin-spinner { animation: ordin-spin 0.7s linear infinite; }
        @media (prefers-reduced-motion: reduce) { .ordin-spinner { animation: ordin-pulse 1.2s ease-in-out infinite; } }
      `}</style>
    </>
  )
}
