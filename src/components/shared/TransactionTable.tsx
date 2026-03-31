import type { TransactionWithCategoryNameDto } from '../../types/transaction'
import { colors, radius } from '../../theme'

interface TransactionTableProps {
  transactions: TransactionWithCategoryNameDto[]
  isLoading?: boolean
  compact?: boolean
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}
function formatDate(dateValue: string | Date) {
  return new Intl.DateTimeFormat('pt-BR', { timeZone: 'UTC' }).format(new Date(dateValue))
}

export function TransactionTable({ transactions, isLoading, compact }: TransactionTableProps) {
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
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {[1, 2, 3].map((n) => (
          <div key={n} style={{ height: '40px', background: colors.bgCardElevated, borderRadius: radius.sm, opacity: 0.5 }} />
        ))}
      </div>
    )
  }

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
          </tr>
        </thead>
        <tbody>
          {transactions.length === 0 && (
            <tr>
              <td colSpan={5} style={{ ...cellStyle, textAlign: 'center', padding: '24px' }}>
                Nenhuma transação encontrada
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
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
