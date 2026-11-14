import { radius } from '../../theme'
import { useTheme, type ThemeColors } from '../../context/ThemeContext'
import { useBreakpoint } from '../../hooks/useBreakpoint'
import { formatBRL } from '../../lib/money'
import { formatDateBR } from '../../lib/date'
import type { ServiceDto, ServiceStatus } from '../../types/service'

export interface ServiceActions {
  onEdit: (s: ServiceDto) => void
  onComplete: (s: ServiceDto) => void
  onCancel: (s: ServiceDto) => void
  onReopen: (s: ServiceDto) => void
}

interface ServiceListProps extends ServiceActions {
  services: ServiceDto[]
  today: string
  isLoading: boolean
  emptyText: string
  busyId: string | null
}

const STATUS_LABEL: Record<ServiceStatus, string> = {
  scheduled: 'Agendado',
  completed: 'Concluído',
  cancelled: 'Cancelado',
}

const receivableOf = (s: ServiceDto) => Math.max(s.amount - s.receivedAmount, 0)

export function ServiceList({ services, today, isLoading, emptyText, ...rest }: ServiceListProps) {
  const { colors } = useTheme()
  const { isMobile } = useBreakpoint()

  if (isLoading) return <Message colors={colors}>Carregando serviços…</Message>
  if (services.length === 0) return <Message colors={colors}>{emptyText}</Message>

  return isMobile ? (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      {services.map((s) => <ServiceCard key={s.id} s={s} today={today} {...rest} />)}
    </div>
  ) : (
    <ServiceTable services={services} today={today} {...rest} />
  )
}

function Message({ colors, children }: { colors: ThemeColors; children: React.ReactNode }) {
  return (
    <div style={{
      background: colors.bgCard, border: `1px dashed ${colors.border}`, borderRadius: radius.lg,
      padding: '36px 20px', textAlign: 'center', color: colors.textSecondary, fontSize: '14px', lineHeight: 1.6,
    }}>
      {children}
    </div>
  )
}

type RowProps = { s: ServiceDto; today: string } & Omit<ServiceListProps, 'services' | 'today' | 'isLoading' | 'emptyText'>

/* ── Mobile ── */
function ServiceCard({ s, today, ...actions }: RowProps) {
  const { colors } = useTheme()
  const muted = s.status === 'cancelled'

  return (
    <article
      data-testid={`service-${s.id}`}
      style={{
        background: colors.bgCard, border: `1px solid ${colors.border}`, borderRadius: radius.lg,
        padding: '16px', opacity: muted ? 0.72 : 1,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '10px' }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: '15px', fontWeight: 600, color: colors.textPrimary, overflowWrap: 'anywhere' }}>{s.name}</div>
          {s.clientName && <div style={{ fontSize: '13px', color: colors.textSecondary, marginTop: '2px' }}>{s.clientName}</div>}
        </div>
        <StatusBadge status={s.status} />
      </div>

      <div style={{ marginTop: '10px' }}><DateLine s={s} today={today} /></div>

      <dl style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px 16px', margin: '14px 0 0' }}>
        <Amount label="Valor" value={s.amount} colors={colors} />
        <Amount label="A receber" value={receivableOf(s)} colors={colors} strong={s.status !== 'cancelled' && receivableOf(s) > 0} />
        <Amount label="Recebido" value={s.receivedAmount} colors={colors} />
        <Amount label="Gastos" value={s.expenses} colors={colors} />
      </dl>

      {s.notes && <Notes text={s.notes} colors={colors} />}

      <div style={{ display: 'flex', gap: '8px', marginTop: '14px' }}>
        <RowActions s={s} {...actions} big />
      </div>
    </article>
  )
}

function Amount({ label, value, colors, strong }: { label: string; value: number; colors: ThemeColors; strong?: boolean }) {
  return (
    <div style={{ minWidth: 0 }}>
      <dt style={{ fontSize: '12px', color: colors.textMuted }}>{label}</dt>
      <dd style={{
        margin: '2px 0 0', fontSize: '14px', fontVariantNumeric: 'tabular-nums',
        fontWeight: strong ? 600 : 500, color: strong ? colors.accentGreenBright : colors.textPrimary,
      }}>
        {formatBRL(value)}
      </dd>
    </div>
  )
}

/* ── Desktop / tablet ── */
function ServiceTable({ services, today, ...actions }: Omit<ServiceListProps, 'isLoading' | 'emptyText'>) {
  const { colors } = useTheme()
  const th: React.CSSProperties = {
    textAlign: 'left', fontSize: '12px', fontWeight: 500, color: colors.textMuted,
    padding: '12px 14px', borderBottom: `1px solid ${colors.border}`, whiteSpace: 'nowrap',
  }
  const num: React.CSSProperties = { ...th, textAlign: 'right' }

  return (
    <div style={{ background: colors.bgCard, border: `1px solid ${colors.border}`, borderRadius: radius.lg, overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '860px' }}>
        <thead>
          <tr>
            <th style={th}>Serviço</th>
            <th style={th}>Data</th>
            <th style={num}>Valor</th>
            <th style={num}>Recebido</th>
            <th style={num}>A receber</th>
            <th style={num}>Gastos</th>
            <th style={th}>Status</th>
            <th style={{ ...th, textAlign: 'right' }}>
              <span style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0 0 0 0)', whiteSpace: 'nowrap' }}>Ações</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {services.map((s) => (
            <ServiceRow key={s.id} s={s} today={today} {...actions} />
          ))}
        </tbody>
      </table>
    </div>
  )
}

function ServiceRow({ s, today, ...actions }: RowProps) {
  const { colors } = useTheme()
  const td: React.CSSProperties = {
    padding: '14px', borderBottom: `1px solid ${colors.borderSubtle}`, fontSize: '14px',
    color: colors.textPrimary, verticalAlign: 'top',
  }
  const num: React.CSSProperties = { ...td, textAlign: 'right', fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }
  const receivable = receivableOf(s)

  return (
    <tr data-testid={`service-${s.id}`} className="svc-row" style={{ opacity: s.status === 'cancelled' ? 0.68 : 1 }}>
      <td style={{ ...td, maxWidth: '280px' }}>
        <div style={{ fontWeight: 600, overflowWrap: 'anywhere' }}>{s.name}</div>
        {s.clientName && <div style={{ fontSize: '13px', color: colors.textSecondary, marginTop: '2px' }}>{s.clientName}</div>}
        {s.notes && <Notes text={s.notes} colors={colors} />}
      </td>
      <td style={{ ...td, whiteSpace: 'nowrap' }}><DateLine s={s} today={today} /></td>
      <td style={num}>{formatBRL(s.amount)}</td>
      <td style={num}>{formatBRL(s.receivedAmount)}</td>
      <td style={{
        ...num,
        fontWeight: s.status !== 'cancelled' && receivable > 0 ? 600 : 400,
        color: s.status !== 'cancelled' && receivable > 0 ? colors.accentGreenBright : colors.textSecondary,
      }}>
        {formatBRL(receivable)}
      </td>
      <td style={num}>{formatBRL(s.expenses)}</td>
      <td style={td}><StatusBadge status={s.status} /></td>
      <td style={{ ...td, textAlign: 'right' }}>
        <div style={{ display: 'inline-flex', gap: '6px', justifyContent: 'flex-end' }}>
          <RowActions s={s} {...actions} />
        </div>
      </td>
    </tr>
  )
}

/* ── Shared bits ── */
function Notes({ text, colors }: { text: string; colors: ThemeColors }) {
  return (
    <p
      title={text}
      style={{
        margin: '8px 0 0', fontSize: '13px', lineHeight: 1.5, color: colors.textSecondary,
        borderLeft: `2px solid ${colors.accentGreenMuted}`, paddingLeft: '8px',
        display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
        whiteSpace: 'pre-line',
      }}
    >
      {text}
    </p>
  )
}

function DateLine({ s, today }: { s: ServiceDto; today: string }) {
  const { colors } = useTheme()
  const isToday = s.date === today
  const late = s.status === 'scheduled' && s.date < today

  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: colors.textSecondary, fontVariantNumeric: 'tabular-nums' }}>
      {formatDateBR(s.date)}
      {isToday && (
        <span style={{
          fontSize: '11px', fontWeight: 600, color: colors.accentGreenBright, background: colors.incomeSubtle,
          borderRadius: radius.full, padding: '2px 8px',
        }}>
          Hoje
        </span>
      )}
      {late && (
        <span style={{ fontSize: '12px', fontWeight: 500, color: colors.expense }}>Atrasado</span>
      )}
    </span>
  )
}

function StatusBadge({ status }: { status: ServiceStatus }) {
  const { colors } = useTheme()
  const tone = {
    scheduled: { fg: colors.textSecondary, bg: colors.bgCardElevated },
    completed: { fg: colors.income, bg: colors.incomeSubtle },
    cancelled: { fg: colors.expense, bg: colors.expenseSubtle },
  }[status]

  return (
    <span style={{
      display: 'inline-block', fontSize: '12px', fontWeight: 500, color: tone.fg, background: tone.bg,
      borderRadius: radius.full, padding: '3px 10px', whiteSpace: 'nowrap',
    }}>
      {STATUS_LABEL[status]}
    </span>
  )
}

function RowActions({ s, onEdit, onComplete, onCancel, onReopen, busyId, big }: Omit<RowProps, 'today'> & { big?: boolean }) {
  const { colors } = useTheme()
  const { isTablet } = useBreakpoint()
  const busy = busyId === s.id
  // Touch screens (phones and tablets) get 44px targets.
  const touch = big || isTablet
  const base: React.CSSProperties = {
    minHeight: touch ? '44px' : '36px',
    padding: big ? '0 14px' : '0 12px',
    flex: big ? 1 : undefined,
    borderRadius: radius.md,
    fontSize: '13px',
    fontWeight: 500,
    cursor: busy ? 'wait' : 'pointer',
    border: `1px solid ${colors.border}`,
    background: colors.bgSurface,
    color: colors.textSecondary,
    whiteSpace: 'nowrap',
  }
  const primary: React.CSSProperties = {
    ...base,
    background: colors.accentGreenMuted,
    border: '1px solid rgba(90,171,114,0.25)',
    color: colors.income,
    fontWeight: 600,
  }

  return (
    <>
      {s.status === 'scheduled' && (
        <button type="button" className="svc-btn" style={primary} disabled={busy} aria-label={`Concluir ${s.name}`} onClick={() => onComplete(s)}>
          Concluir
        </button>
      )}
      {s.status !== 'scheduled' && (
        <button type="button" className="svc-btn" style={base} disabled={busy} aria-label={`Reabrir ${s.name}`} onClick={() => onReopen(s)}>
          Reabrir
        </button>
      )}
      <button type="button" className="svc-btn" style={base} disabled={busy} aria-label={`Editar ${s.name}`} onClick={() => onEdit(s)}>
        Editar
      </button>
      {s.status !== 'cancelled' && (
        <button
          type="button"
          className="svc-btn"
          style={{ ...base, color: colors.expense }}
          disabled={busy}
          aria-label={`Cancelar ${s.name}`}
          onClick={() => onCancel(s)}
        >
          Cancelar
        </button>
      )}
    </>
  )
}
