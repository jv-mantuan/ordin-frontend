import { useMemo } from 'react'
import { useTransactions } from '../../hooks/useTransactions'
import { TopBar } from '../../components/shared/TopBar'
import { StatCard } from '../../components/shared/StatCard'
import { BarChart, type ExpenseByMonth } from '../../components/shared/BarChart'
import { DonutChart, type DonutSegment } from '../../components/shared/DonutChart'
import { TransactionTable } from '../../components/shared/TransactionTable'
import { colors, radius, spacing } from '../../theme'

const SEGMENT_COLORS = ['#5aab72', '#2f6b47', '#8fd39d', '#1f4730', '#6fbf83', '#b4e6bf']

function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}

export function DashboardPage() {
  const { data: transactions = [], isLoading: txLoading } = useTransactions()

  const { totalIncome, totalExpense, balance, donutSegments, barChartData } = useMemo(() => {
    const totalIncome = transactions
      .filter((t) => t.type === 0)
      .reduce((s, t) => s + t.amount, 0)
    const totalExpense = transactions
      .filter((t) => t.type === 1)
      .reduce((s, t) => s + t.amount, 0)

    const expenseByCategory = transactions
      .filter((t) => t.type === 1)
      .reduce<Record<string, number>>((acc, t) => {
        const key = t.categoryName ?? 'Sem categoria'
        acc[key] = (acc[key] ?? 0) + t.amount
        return acc
      }, {})

    const expensesByDate = transactions
      .filter((t) => t.type === 1)
      .reduce<Record<string, number>>((acc, t) => {
        const key = new Date(t.date).toISOString().split('T')[0]
        acc[key] = (acc[key] ?? 0) + t.amount

        return acc
      }, {})

    const barChartData: ExpenseByMonth[] = Object.entries(expensesByDate)
      .sort((a, b) => new Date(a[0]).getTime() - new Date(b[0]).getTime())
      .map(([day, value]) => ({ day, value }))

    const donutSegments: DonutSegment[] = Object.entries(expenseByCategory)
      .sort((a, b) => b[1] - a[1])
      .map(([label, value], i) => ({
        label,
        value,
        color: SEGMENT_COLORS[i % SEGMENT_COLORS.length],
      }))

    return { totalIncome, totalExpense, balance: totalIncome - totalExpense, donutSegments, barChartData }
  }, [transactions])

  const recent = [...transactions]
    .sort((a, b) => {
      const aTimestamp = new Date(a.createdAt ?? a.date).getTime()
      const bTimestamp = new Date(b.createdAt ?? b.date).getTime()
      return bTimestamp - aTimestamp
    })
    .slice(0, 5)

  return (
    <div style={{ flex: 1, minHeight: 0 }}>
      <main
        style={{
          height: '100%',
          padding: '30px',
          overflowY: 'auto',
          minWidth: 0,
          display: 'flex',
          flexDirection: 'column',
          minHeight: 0,
        }}
      >
        <TopBar title="Dashboard" />

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1.62fr) minmax(390px, 1fr)',
            gridTemplateRows: 'auto minmax(450px, auto) auto',
            gap: '22px',
            alignItems: 'stretch',
          }}
        >
          <div
            style={{
              gridColumn: '1 / -1',
              display: 'grid',
              gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
              gap: '20px',
            }}
          >
            <StatCard
              label="Receitas"
              value={formatCurrency(totalIncome)}
              accent
              sub={
                <div style={{ display: 'flex', gap: '12px' }}>
                  {['Jul', 'Ago', 'Set'].map((m) => (
                    <span key={m} style={{ fontSize: '10px', color: colors.textMuted }}>{m}</span>
                  ))}
                </div>
              }
            />
            <StatCard label="Despesas" value={formatCurrency(totalExpense || 8430)} />
            <div style={{
              background: colors.bgCard,
              border: `1px solid ${colors.border}`,
              borderRadius: radius.lg,
              padding: '24px 26px',
              minWidth: 0,
            }}>
              <div>
                <div style={{ fontSize: '16px', fontWeight: 600, color: colors.textSecondary, marginBottom: spacing.md }}>Saldo</div>
                <div style={{ fontSize: '36px', fontWeight: 700, color: colors.textPrimary, letterSpacing: '-0.03em', lineHeight: 1.05 }}>
                  {formatCurrency(balance || 6620)}
                </div>
              </div>
            </div>
          </div>

          <div style={{ minHeight: 0, minWidth: 0 }}>
            <BarChart title={`Despesas por dia - ${new Date().toLocaleString('pt-BR', { month: 'long' })}`} expensesByDate={barChartData} />
          </div>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: spacing.lg,
              alignSelf: 'stretch',
            }}
          >
            <DonutChart segments={donutSegments} />
          </div>

          <div style={{
            gridColumn: '1 / -1',
            background: colors.bgCard,
            border: `1px solid ${colors.border}`,
            borderRadius: radius.lg,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            alignSelf: 'start',
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '18px 20px',
              borderBottom: `1px solid ${colors.border}`,
            }}>
              <span style={{ fontSize: '16px', fontWeight: 600, color: colors.textPrimary }}>
                Últimas Transações
              </span>
              <button style={{
                background: colors.bgCardElevated,
                border: `1px solid ${colors.border}`,
                borderRadius: radius.sm,
                color: colors.textSecondary,
                fontSize: '13px',
                fontWeight: 500,
                padding: '7px 13px',
                cursor: 'pointer',
              }}>
                Exportar CSV
              </button>
            </div>
            <TransactionTable transactions={recent} isLoading={txLoading} compact />
          </div>
        </div>
      </main>
    </div>
  )
}
