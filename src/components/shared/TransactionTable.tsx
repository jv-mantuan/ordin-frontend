import type { TransactionWithCategoryNameDto } from '../../types/transaction'
import { radius } from '../../theme'
import { useTheme } from '../../context/ThemeContext'
import { useBreakpoint } from '../../hooks/useBreakpoint'

interface TransactionTableProps {
  transactions: TransactionWithCategoryNameDto[]
  isLoading?: boolean
  compact?: boolean
  onEdit?: (transaction: TransactionWithCategoryNameDto) => void
  onDelete?: (id: string) => void
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}
function formatDate(dateValue: string | Date) {
  return new Intl.DateTimeFormat('pt-BR', { timeZone: 'UTC' }).format(new Date(dateValue))
}

export function TransactionTable({ transactions, isLoading, compact, onEdit, onDelete }: TransactionTableProps) {
  const { colors } = useTheme()
  const { isMobile } = useBreakpoint()

  const cellStyle: React.CSSProperties = {
    padding: compact ? '12px 16px' : '12px 16px',
    fontSize: compact ? '14px' : '14px',
    color: colors.textSecondary,
    borderBottom: `1px solid ${colors.border}`,
    whiteSpace: 'nowrap',
  }
  const headStyle: React.CSSProperties = {
    ...cellStyle,
    color: colors.textMuted,
    fontWeight: 500,
    fontSize: compact ? '13px' : '13px',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
    textAlign: 'left',
  }

  if (isLoading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '12px' }}>
        {[1, 2, 3].map((n) => (
          <div key={n} style={{ height: '52px', background: colors.bgCardElevated, borderRadius: radius.sm, opacity: 0.5 }} />
        ))}
      </div>
    )
  }

  /* ── Mobile: card list ── */
  if (isMobile) {
    if (transactions.length === 0) {
      return (
        <div style={{ padding: '40px 20px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', background: colors.bgCard, borderRadius: radius.lg, border: `1px dashed ${colors.border}` }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: colors.bgCardElevated, display: 'flex', alignItems: 'center', justifyContent: 'center', color: colors.textMuted }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
          </div>
          <div>
            <div style={{ fontSize: '15px', fontWeight: 600, color: colors.textPrimary, marginBottom: '6px' }}>Tudo limpo por aqui</div>
            <div style={{ fontSize: '13px', color: colors.textSecondary, maxWidth: '240px', margin: '0 auto', lineHeight: 1.5 }}>
              Você não tem registros neste mês. Adicione uma transação para começar a acompanhar.
            </div>
          </div>
        </div>
      )
    }
    return (
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {transactions.map((tx, i) => (
          <div
            key={tx.id ?? i}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '14px 16px',
              borderBottom: `1px solid ${colors.border}`,
              gap: '12px',
            }}
          >
            {/* Left: info */}
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{
                fontSize: '14px',
                fontWeight: 500,
                color: colors.textPrimary,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                marginBottom: '4px',
              }}>
                {tx.name}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <span style={{
                  background: colors.bgCardElevated,
                  border: `1px solid ${colors.border}`,
                  borderRadius: radius.full,
                  padding: '2px 8px',
                  fontSize: '11px',
                  color: colors.textSecondary,
                }}>
                  {tx.categoryName ?? '—'}
                </span>
                <span style={{ fontSize: '11px', color: colors.textMuted }}>
                  {formatDate(tx.date)}
                </span>
              </div>
            </div>
            {/* Right: amount + badge */}
            <div style={{ textAlign: 'right', flexShrink: 0 }}>
              <div style={{
                fontSize: '14px',
                fontWeight: 700,
                color: tx.type === 0 ? colors.income : colors.expense,
                marginBottom: '4px',
              }}>
                {tx.type === 1 ? '- ' : '+ '}{formatCurrency(tx.amount)}
              </div>
              <span style={{
                color: tx.type === 0 ? colors.income : colors.expense,
                background: tx.type === 0 ? colors.incomeSubtle : colors.expenseSubtle,
                borderRadius: radius.full,
                padding: '2px 8px',
                fontSize: '11px',
                fontWeight: 500,
              }}>
                {tx.type === 0 ? 'Receita' : 'Despesa'}
              </span>
            </div>
            
            {/* Actions (if provided) */}
            {(onEdit || onDelete) && (
              <div style={{ display: 'flex', gap: '8px', borderLeft: `1px solid ${colors.border}`, paddingLeft: '12px', marginLeft: '12px', alignItems: 'center' }}>
                <button
                  onClick={() => onEdit && onEdit(tx)}
                  style={{ background: 'transparent', border: 'none', color: colors.textSecondary, cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                >
                  <EditIcon />
                </button>
                <button
                  onClick={() => onDelete && tx.id && onDelete(tx.id)}
                  style={{ background: 'transparent', border: 'none', color: colors.expense, cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                >
                  <TrashIcon />
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    )
  }

  /* ── Desktop/Tablet: traditional table ── */
  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={headStyle}>Categoria</th>
            <th style={headStyle}>Descrição</th>
            <th style={headStyle}>Tipo</th>
            <th style={headStyle}>Data</th>
            <th style={{ ...headStyle, textAlign: 'right' }}>Valor</th>
            {(onEdit || onDelete) && <th style={headStyle}></th>}
          </tr>
        </thead>
        <tbody>
          {transactions.length === 0 && (
            <tr>
              <td colSpan={5} style={{ padding: '64px 24px', textAlign: 'center' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: colors.bgCardElevated, display: 'flex', alignItems: 'center', justifyContent: 'center', color: colors.textMuted }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                  </div>
                  <div>
                    <div style={{ fontSize: '15px', fontWeight: 600, color: colors.textPrimary, marginBottom: '6px' }}>Você ainda não tem transações</div>
                    <div style={{ fontSize: '13px', color: colors.textSecondary, maxWidth: '280px', margin: '0 auto', lineHeight: 1.5 }}>
                      Não encontramos nenhum registro para este período. Cadastre sua primeira transação no botão <b>+ Nova transação</b>.
                    </div>
                  </div>
                </div>
              </td>
            </tr>
          )}
          {transactions.map((tx, i) => (
            <tr key={tx.id ?? i} style={{ cursor: 'default' }}>
              <td style={cellStyle}>
                <span style={{
                  background: colors.bgCardElevated,
                  border: `1px solid ${colors.border}`,
                  borderRadius: radius.full,
                  padding: '3px 9px',
                  fontSize: '12px',
                  color: colors.textSecondary,
                }}>
                  {tx.categoryName ?? '—'}
                </span>
              </td>
              <td style={{ ...cellStyle, color: colors.textPrimary, fontWeight: 450 }}>{tx.name}</td>
              <td style={cellStyle}>
                <span style={{
                  color: tx.type === 0 ? colors.income : colors.expense,
                  background: tx.type === 0 ? colors.incomeSubtle : colors.expenseSubtle,
                  borderRadius: radius.full,
                  padding: '3px 9px',
                  fontSize: '12px',
                  fontWeight: 500,
                }}>
                  {tx.type === 0 ? 'Receita' : 'Despesa'}
                </span>
              </td>
              <td style={cellStyle}>{formatDate(tx.date)}</td>
              <td style={{
                ...cellStyle,
                textAlign: 'right',
                color: tx.type === 0 ? colors.income : colors.expense,
                fontWeight: 600,
              }}>
                {tx.type === 1 ? '- ' : '+ '}
                {formatCurrency(tx.amount)}
              </td>
              {(onEdit || onDelete) && (
                <td style={{ ...cellStyle, textAlign: 'right' }}>
                  <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                    <button
                      onClick={() => onEdit && onEdit(tx)}
                      style={{ background: 'transparent', border: 'none', color: colors.textSecondary, cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                    >
                      <EditIcon />
                    </button>
                    <button
                      onClick={() => onDelete && tx.id && onDelete(tx.id)}
                      style={{ background: 'transparent', border: 'none', color: colors.expense, cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                    >
                      <TrashIcon />
                    </button>
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )

  function TrashIcon() {
    return (
      <svg width="16" height="16" viewBox="0 0 12 12" fill="none">
        <path d="M1.5 3h9M4 3V2h4v1M5 5.5v3M7 5.5v3M2.5 3l.5 7h6l.5-7" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    )
  }

  function EditIcon() {
    return (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    )
  }
}
