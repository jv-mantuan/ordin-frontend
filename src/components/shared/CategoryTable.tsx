import type { CategoryDto } from '../../types/category'
import { colors, radius } from '../../theme'

interface CategoryTableProps {
  categories: CategoryDto[]
  isLoading?: boolean
}

export function CategoryTable({ categories, isLoading }: CategoryTableProps) {
  const cellStyle: React.CSSProperties = {
    padding: '12px 16px',
    fontSize: '14px',
    color: colors.textSecondary,
    borderBottom: `1px solid ${colors.border}`,
    whiteSpace: 'nowrap',
  }

  const headStyle: React.CSSProperties = {
    ...cellStyle,
    color: colors.textMuted,
    fontWeight: 500,
    fontSize: '13px',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    textAlign: 'left',
  }

  if (isLoading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '12px' }}>
        {[1, 2, 3, 4].map((n) => (
          <div key={n} style={{ height: '44px', background: colors.bgCardElevated, borderRadius: radius.sm, opacity: 0.5 }} />
        ))}
      </div>
    )
  }

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={headStyle}>Nome</th>
          </tr>
        </thead>
        <tbody>
          {categories.length === 0 && (
            <tr>
              <td style={{ ...cellStyle, textAlign: 'center', padding: '28px 24px' }}>
                Nenhuma categoria encontrada
              </td>
            </tr>
          )}
          {categories.map((category) => (
            <tr key={category.id} style={{ cursor: 'default' }}>
              <td style={{ ...cellStyle, color: colors.textPrimary, fontWeight: 500 }}>
                {category.name}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
