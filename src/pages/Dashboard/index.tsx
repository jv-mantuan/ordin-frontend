import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTransactions } from '../../hooks/useTransactions'
import { useBreakpoint } from '../../hooks/useBreakpoint'
import { TopBar } from '../../components/shared/TopBar'
import { StatCard } from '../../components/shared/StatCard'
import { BarChart, type ExpenseByMonth } from '../../components/shared/BarChart'
import { DonutChart, type DonutSegment } from '../../components/shared/DonutChart'
import { TransactionTable } from '../../components/shared/TransactionTable'
import { radius, spacing } from '../../theme'
import { useTheme } from '../../context/ThemeContext'

const SEGMENT_COLORS = ['#5aab72', '#2f6b47', '#8fd39d', '#1f4730', '#6fbf83', '#b4e6bf']

function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}

export function DashboardPage() {
  const { colors } = useTheme()
  const { isMobile, isTablet } = useBreakpoint()
  const navigate = useNavigate()
  const { data: transactions = [], isLoading: txLoading } = useTransactions()

  const [currentDate, setCurrentDate] = useState(() => new Date())
  const handlePrevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
  const handleNextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))

  const { totalIncome, totalExpense, balance, donutSegments, barChartData, currentMonthTransactions } = useMemo(() => {
    const monthTx = transactions.filter(t => {
      const d = new Date(t.date)
      return d.getMonth() === currentDate.getMonth() && d.getFullYear() === currentDate.getFullYear()
    })

    const totalIncome = monthTx
      .filter((t) => t.type === 0)
      .reduce((s, t) => s + t.amount, 0)
    const totalExpense = monthTx
      .filter((t) => t.type === 1)
      .reduce((s, t) => s + t.amount, 0)

    const expenseByCategory = monthTx
      .filter((t) => t.type === 1)
      .reduce<Record<string, number>>((acc, t) => {
        const key = t.categoryName ?? 'Sem categoria'
        acc[key] = (acc[key] ?? 0) + t.amount
        return acc
      }, {})

    const expensesByDate = monthTx
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

    return { totalIncome, totalExpense, balance: totalIncome - totalExpense, donutSegments, barChartData, currentMonthTransactions: monthTx }
  }, [transactions, currentDate])

  const recent = [...currentMonthTransactions]
    .sort((a, b) => {
      const aTimestamp = new Date(a.createdAt ?? a.date).getTime()
      const bTimestamp = new Date(b.createdAt ?? b.date).getTime()
      return bTimestamp - aTimestamp
    })
    .slice(0, 5)

  const pagePadding = isMobile ? '16px' : isTablet ? '24px' : '30px'
  const isSmall = isMobile || isTablet

  return (
    <div style={{ flex: 1, minHeight: 0, minWidth: 0 }}>
      <main
        style={{
          height: '100%',
          overflowY: 'auto',
          overflowX: 'hidden',
          minWidth: 0,
        }}
      >
        {/* Inner wrapper carries the padding — fixes overflow-y right-padding loss bug */}
        <div style={{
          padding: pagePadding,
          paddingBottom: isMobile ? '80px' : pagePadding,
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0,
        }}>
        <TopBar title="Dashboard">
          {/* Nova transação button — only in header on desktop */}
          {!isMobile && (
            <button
              onClick={() => navigate('/transacoes')}
              style={{
                background: colors.accentGreenMuted,
                border: `1px solid rgba(90,171,114,0.25)`,
                borderRadius: radius.md,
                color: colors.income,
                fontSize: '12px',
                fontWeight: 500,
                padding: '6px 14px',
                cursor: 'pointer',
                minHeight: '36px',
                whiteSpace: 'nowrap',
              }}
            >
              + Nova transação
            </button>
          )}
        </TopBar>

        {/* On mobile: full-width action button below the title bar */}
        {isMobile && (
          <button
            onClick={() => navigate('/transacoes')}
            style={{
              width: '100%',
              background: colors.accentGreenMuted,
              border: `1px solid rgba(90,171,114,0.25)`,
              borderRadius: radius.md,
              color: colors.income,
              fontSize: '13px',
              fontWeight: 600,
              padding: '12px 16px',
              cursor: 'pointer',
              minHeight: '44px',
              marginBottom: '16px',
              letterSpacing: '0.01em',
            }}
          >
            + Nova transação
          </button>
        )}

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: isMobile ? '24px' : '32px', gap: '12px' }}>
          <button onClick={handlePrevMonth} style={{ background: colors.bgCard, border: `1px solid ${colors.border}`, borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: colors.textSecondary, transition: 'background 0.2s' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
          </button>
          
          <div style={{ fontSize: isMobile ? '16px' : '18px', fontWeight: 600, color: colors.textPrimary, textTransform: 'capitalize', width: '160px', textAlign: 'center', letterSpacing: '-0.01em' }}>
            {currentDate.toLocaleString('pt-BR', { month: 'long', year: 'numeric' })}
          </div>
          
          <button onClick={handleNextMonth} style={{ background: colors.bgCard, border: `1px solid ${colors.border}`, borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: colors.textSecondary, transition: 'background 0.2s' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
          </button>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: isSmall ? 'minmax(0, 1fr)' : 'minmax(0, 1.62fr) minmax(390px, 1fr)',
            gridTemplateRows: isSmall ? 'auto' : 'auto minmax(450px, auto) auto',
            gap: isMobile ? '14px' : '22px',
            alignItems: 'stretch',
          }}
        >
          {/* Stat Cards row */}
          <div
            style={{
              gridColumn: isSmall ? '1' : '1 / -1',
              display: 'grid',
              gridTemplateColumns: isMobile ? 'minmax(0, 1fr)' : 'repeat(3, minmax(0, 1fr))',
              gap: isMobile ? '10px' : '20px',
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
            <StatCard label="Despesas" value={formatCurrency(totalExpense)} />
            <div style={{
              background: colors.bgCard,
              border: `1px solid ${colors.border}`,
              borderRadius: radius.lg,
              padding: isMobile ? '18px 20px' : '24px 26px',
              minWidth: 0,
            }}>
              <div>
                <div style={{ fontSize: '16px', fontWeight: 600, color: colors.textSecondary, marginBottom: spacing.md }}>Saldo</div>
                <div style={{ fontSize: isMobile ? '28px' : '36px', fontWeight: 700, color: colors.textPrimary, letterSpacing: '-0.03em', lineHeight: 1.05 }}>
                  {formatCurrency(balance)}
                </div>
              </div>
            </div>
          </div>

          {/* BarChart */}
          <div style={{ minHeight: 0, minWidth: 0 }}>
            <BarChart title={`Despesas por dia - ${currentDate.toLocaleString('pt-BR', { month: 'long' })}`} expensesByDate={barChartData} />
          </div>

          {/* DonutChart — on mobile it goes below bar chart (grid single col handles this) */}
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

          {/* Recent transactions */}
          <div style={{
            gridColumn: isSmall ? '1' : '1 / -1',
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
              padding: isMobile ? '14px 16px' : '18px 20px',
              borderBottom: `1px solid ${colors.border}`,
            }}>
              <span style={{ fontSize: isMobile ? '14px' : '16px', fontWeight: 600, color: colors.textPrimary }}>
                Últimas Transações
              </span>
              {!isMobile && (
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
              )}
            </div>
            <TransactionTable transactions={recent} isLoading={txLoading} compact />
          </div>
        </div>
        </div>{/* end inner padding wrapper */}
      </main>
    </div>
  )
}
