import type { CategoryDto } from '../../types/category'
import { colors, radius } from '../../theme'

interface CategoryPanelProps {
  categories: CategoryDto[]
  isLoading?: boolean
  onNew?: () => void
  onEdit?: (category: CategoryDto) => void
  onDelete?: (id: string) => void
}

export function CategoryPanel({ categories, isLoading, onNew, onEdit, onDelete }: CategoryPanelProps) {
  return (
    <aside style={{
      width: '200px',
      minWidth: '200px',
      background: colors.bgSurface,
      borderLeft: `1px solid ${colors.border}`,
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      position: 'sticky',
      top: 0,
    }}>
      {/* Header */}
      <div style={{
        padding: '20px 14px 14px',
        borderBottom: `1px solid ${colors.border}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <span style={{ fontSize: '13px', fontWeight: 600, color: colors.textPrimary }}>Categorias</span>
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
          }}
        >
          + nova
        </button>
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
              padding: '7px 14px',
              borderBottom: `1px solid ${colors.borderSubtle}`,
            }}
          >
            <span style={{ fontSize: '12px', color: colors.textSecondary }}>{cat.name}</span>
            <div style={{ display: 'flex', gap: '4px' }}>
              <ActionBtn onClick={() => onEdit?.(cat)} title="Editar"><EditIcon /></ActionBtn>
              <ActionBtn onClick={() => onDelete?.(cat.id)} title="Excluir" danger><TrashIcon /></ActionBtn>
            </div>
          </div>
        ))}
      </div>
    </aside>
  )
}

function ActionBtn({ children, onClick, title, danger }: { children: React.ReactNode, onClick?: () => void, title?: string, danger?: boolean }) {
  return (
    <button
      onClick={onClick}
      title={title}
      style={{
        background: 'transparent',
        border: 'none',
        cursor: 'pointer',
        color: danger ? colors.expense : colors.textMuted,
        padding: '2px',
        display: 'flex',
        alignItems: 'center',
        borderRadius: '4px',
        opacity: 0.7,
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
