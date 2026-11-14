import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useRecentTransactions, useTransactionsSummary } from '../../hooks/useTransactions'
import { useBreakpoint } from '../../hooks/useBreakpoint'
import { TopBar } from '../../components/shared/TopBar'
import { StatCard } from '../../components/shared/StatCard'
import { BarChart, type ExpenseByMonth } from '../../components/shared/BarChart'
import { DonutChart, type DonutSegment } from '../../components/shared/DonutChart'
import { TransactionTable } from '../../components/shared/TransactionTable'
import { radius, spacing } from '../../theme'
import { useTheme } from '../../context/ThemeContext'

const SEGMENT_COLORS = ['#5aab72', '#2f6b47', '#8fd39d', '#1f4730', '#6fbf83', '#b4e6bf']

/** "novembro de 2026" → "Novembro de 2026" (only the first letter, unlike CSS capitalize). */
function monthTitle(date: Date) {
  const text = date.toLocaleString('pt-BR', { month: 'long', year: 'numeric' })
  return text.charAt(0).toUpperCase() + text.slice(1)
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}

export function DashboardPage() {
  const { colors } = useTheme()
  const { isMobile, isTablet } = useBreakpoint()
  const navigate = useNavigate()

  const [currentDate, setCurrentDate] = useState(() => new Date())
  const handlePrevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
  const handleNextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))

  // Every number is computed by the API for the whole month (independent of any list page).
  const summary = useTransactionsSummary(currentDate)
  const { data: recent = [], isLoading: txLoading } = useRecentTransactions(currentDate, 5)

  const { totalIncome, totalExpense, balance, donutSegments, barChartData } = useMemo(() => {
    const s = summary.data
    const barChartData: ExpenseByMonth[] = (s?.expenseByDay ?? []).map(({ day, total }) => ({ day, value: total }))
    const donutSegments: DonutSegment[] = (s?.expenseByCategory ?? []).map(({ categoryName, total }, i) => ({
      label: categoryName,
      value: total,
      color: SEGMENT_COLORS[i % SEGMENT_COLORS.length],
    }))
    return {
      totalIncome: s?.income ?? 0,
      totalExpense: s?.expense ?? 0,
      balance: s?.balance ?? 0,
      donutSegments,
      barChartData,
    }
  }, [summary.data])

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
                background: colors.primaryButtonBg,
                border: `1px solid ${colors.primaryButtonBorder}`,
                borderRadius: radius.md,
                color: colors.primaryButtonText,
                fontSize: '13px',
                fontWeight: 600,
                padding: '0 16px',
                minHeight: '44px',
                cursor: 'pointer',
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
              background: colors.primaryButtonBg,
              border: `1px solid ${colors.primaryButtonBorder}`,
              borderRadius: radius.md,
              color: colors.primaryButtonText,
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
          <button onClick={handlePrevMonth} aria-label="Mês anterior" title="Mês anterior" style={{ background: colors.bgCard, border: `1px solid ${colors.border}`, borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: colors.textSecondary, transition: 'background 0.2s' }}>
            <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
          </button>
          
          {/* Fixed min width so the arrows barely move between months; never wraps. */}
          <div style={{ fontSize: isMobile ? '16px' : '18px', fontWeight: 600, color: colors.textPrimary, minWidth: isMobile ? '160px' : '190px', whiteSpace: 'nowrap', textAlign: 'center', letterSpacing: '-0.01em' }}>
            {monthTitle(currentDate)}
          </div>
          
          <button onClick={handleNextMonth} aria-label="Próximo mês" title="Próximo mês" style={{ background: colors.bgCard, border: `1px solid ${colors.border}`, borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: colors.textSecondary, transition: 'background 0.2s' }}>
            <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
          </button>
        </div>

        <div key={currentDate.toISOString()} className="animate-fade" style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, minWidth: 0 }}>
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
              </div>
              <TransactionTable transactions={recent} isLoading={txLoading} compact />
            </div>
          </div>
        </div>
        </div>{/* end inner padding wrapper */}
      </main>
    </div>
  )
}
