import type { CategoryDto } from '../../types/category'
import { radius } from '../../theme'
import { useTheme } from '../../context/ThemeContext'

interface CategoryPanelProps {
  categories: CategoryDto[]
  isLoading?: boolean
  onNew?: () => void
  onEdit?: (category: CategoryDto) => void
  onDelete?: (id: string) => void
  /** When true, renders as a fixed bottom sheet (mobile drawer) */
  asDrawer?: boolean
  /** Called when backdrop or close button is clicked (only used when asDrawer) */
  onClose?: () => void
}

export function CategoryPanel({ categories, isLoading, onNew, onEdit, onDelete, asDrawer, onClose }: CategoryPanelProps) {
  const { colors } = useTheme()

  const panelStyle: React.CSSProperties = asDrawer
    ? {
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: '72vh',
        maxHeight: '72vh',
        background: colors.bgSurface,
        borderTop: `1px solid ${colors.border}`,
        borderRadius: '16px 16px 0 0',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 60,
        // Push up above BottomNav (60px) + safe area
        paddingBottom: 'max(env(safe-area-inset-bottom), 0px)',
        boxShadow: '0 -8px 40px rgba(0,0,0,0.35)',
        animation: 'slideUp 0.25s ease-out',
      }
    : {
        width: '200px',
        minWidth: '200px',
        background: colors.bgSurface,
        borderLeft: `1px solid ${colors.border}`,
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        position: 'sticky',
        top: 0,
      }

  return (
    <>
      {/* Backdrop – only for drawer */}
      {asDrawer && (
        <div
          onClick={onClose}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(10, 20, 16, 0.55)',
            zIndex: 59,
            animation: 'fadeIn 0.2s ease-out',
          }}
        />
      )}

      <aside style={panelStyle}>
        {/* Drag handle (drawer only) */}
        {asDrawer && (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '10px 0 4px' }}>
            <div style={{ width: '36px', height: '4px', borderRadius: '2px', background: colors.border }} />
          </div>
        )}

        {/* Header */}
        <div style={{
          padding: asDrawer ? '10px 16px 12px' : '20px 14px 14px',
          borderBottom: `1px solid ${colors.border}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <span style={{ fontSize: '13px', fontWeight: 600, color: colors.textPrimary }}>Categorias</span>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <button
              onClick={onNew}
              style={{
                background: colors.accentGreenMuted,
                border: `1px solid rgba(90,171,114,0.2)`,
                borderRadius: radius.full,
                color: colors.income,
                fontSize: '10px',
                fontWeight: 500,
                padding: '3px 8px',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                minHeight: '28px',
              }}
            >
              + nova
            </button>
            {asDrawer && (
              <button
                onClick={onClose}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: colors.textMuted,
                  cursor: 'pointer',
                  fontSize: '18px',
                  lineHeight: 1,
                  padding: '2px 4px',
                  minHeight: '28px',
                }}
              >
                ×
              </button>
            )}
          </div>
        </div>

        {/* Column headers */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '8px 14px',
          borderBottom: `1px solid ${colors.border}`,
        }}>
          <span style={{ fontSize: '10px', color: colors.textMuted, fontWeight: 500, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
            Nome
          </span>
          <span style={{ fontSize: '10px', color: colors.textMuted, fontWeight: 500, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
            Ações
          </span>
        </div>

        {/* List */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {isLoading && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', padding: '8px' }}>
              {[1,2,3,4,5].map((n) => (
                <div key={n} style={{ height: '28px', background: colors.bgCardElevated, borderRadius: radius.sm, opacity: 0.4 }} />
              ))}
            </div>
          )}
          {!isLoading && categories.map((cat) => (
            <div
              key={cat.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: asDrawer ? '10px 16px' : '7px 14px',
                borderBottom: `1px solid ${colors.borderSubtle}`,
                minHeight: '44px',
              }}
            >
              <span style={{ fontSize: '12px', color: colors.textSecondary }}>{cat.name}</span>
              <div style={{ display: 'flex', gap: '4px' }}>
                <ActionBtn onClick={() => onEdit?.(cat)} title="Editar" expense={colors.expense} textMuted={colors.textMuted}><EditIcon /></ActionBtn>
                <ActionBtn onClick={() => onDelete?.(cat.id)} title="Excluir" danger expense={colors.expense} textMuted={colors.textMuted}><TrashIcon /></ActionBtn>
              </div>
            </div>
          ))}
        </div>
      </aside>

      <style>{`
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to   { transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
      `}</style>
    </>
  )
}

function ActionBtn({ children, onClick, title, danger, expense, textMuted }: {
  children: React.ReactNode
  onClick?: () => void
  title?: string
  danger?: boolean
  expense: string
  textMuted: string
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      style={{
        background: 'transparent',
        border: 'none',
        cursor: 'pointer',
        color: danger ? expense : textMuted,
        padding: '4px',
        display: 'flex',
        alignItems: 'center',
        borderRadius: '4px',
        opacity: 0.7,
        minHeight: '44px',
        minWidth: '32px',
        justifyContent: 'center',
      }}
    >
      {children}
    </button>
  )
}

function EditIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
      <path d="M8.5 1.5l2 2L4 10H2v-2L8.5 1.5z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/>
    </svg>
  )
}
function TrashIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
      <path d="M1.5 3h9M4 3V2h4v1M5 5.5v3M7 5.5v3M2.5 3l.5 7h6l.5-7" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}
