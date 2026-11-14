import { useMemo, useState } from 'react'
import { toast } from 'react-toastify'
import { radius } from '../../theme'
import { useTheme } from '../../context/ThemeContext'
import { useBreakpoint } from '../../hooks/useBreakpoint'
import { TopBar } from '../../components/shared/TopBar'
import { StatCard } from '../../components/shared/StatCard'
import { ServiceList } from '../../components/shared/ServiceList'
import { ServiceFormModal } from '../../components/shared/ServiceFormModal'
import {
  useCancelService,
  useCompleteService,
  useCompleteServicesBatch,
  useCreateService,
  useReopenService,
  useServices,
  useUpdateService,
} from '../../hooks/useServices'
import { computeServiceMetrics, SERVICE_METRIC_INFO, type ServiceMetrics } from '../../lib/serviceMetrics'
import { formatBRL } from '../../lib/money'
import { todayISO } from '../../lib/date'
import type { ServiceDto, ServiceRequest, ServiceStatus } from '../../types/service'

type Filter = ServiceStatus | 'all'

const FILTERS: { value: Filter; label: string; empty: string }[] = [
  { value: 'scheduled', label: 'Agendados', empty: 'Nenhum serviço agendado. Cadastre um em "Novo serviço".' },
  { value: 'completed', label: 'Concluídos', empty: 'Nenhum serviço concluído ainda.' },
  { value: 'cancelled', label: 'Cancelados', empty: 'Nenhum serviço cancelado.' },
  { value: 'all', label: 'Todos', empty: 'Você ainda não cadastrou serviços.' },
]

/** Row 1: billing; row 2: costs and what is left. "A receber" is the highlighted card. */
const CARD_ORDER: { key: keyof ServiceMetrics; accent?: boolean }[] = [
  { key: 'total' },
  { key: 'consolidated' },
  { key: 'receivable', accent: true },
  { key: 'expenses' },
  { key: 'netForecast' },
]

const errorMessage = (e: unknown, fallback: string) =>
  typeof e === 'object' && e !== null && 'message' in e && e.message ? String(e.message) : fallback

const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`

export function ServicesPage() {
  const { colors } = useTheme()
  const { isMobile, isTablet } = useBreakpoint()
  const [filter, setFilter] = useState<Filter>('scheduled')
  const [modal, setModal] = useState<{ service: ServiceDto | null } | null>(null)
  const [busyId, setBusyId] = useState<string | null>(null)

  const { data: services = [], isLoading, isError } = useServices()
  const createService = useCreateService()
  const updateService = useUpdateService()
  const completeService = useCompleteService()
  const cancelService = useCancelService()
  const reopenService = useReopenService()
  const completeBatch = useCompleteServicesBatch()

  const today = todayISO()
  const metrics = useMemo(() => computeServiceMetrics(services), [services])
  const todayIds = useMemo(
    () => services.filter((s) => s.status === 'scheduled' && s.date === today).map((s) => s.id),
    [services, today],
  )
  const visible = useMemo(() => {
    if (filter === 'all') return services
    const list = services.filter((s) => s.status === filter)
    // Finished work reads newest first; scheduled work reads in the order it will happen.
    return filter === 'scheduled' ? list : [...list].reverse()
  }, [services, filter])

  const runAction = async (s: ServiceDto, fn: (id: string) => Promise<unknown>, success: string, fallback: string) => {
    setBusyId(s.id)
    try {
      await fn(s.id)
      toast.success(success)
    } catch (e) {
      toast.error(errorMessage(e, fallback))
    } finally {
      setBusyId(null)
    }
  }

  const handleSubmit = async (data: ServiceRequest) => {
    const editing = modal?.service
    if (editing) {
      await updateService.mutateAsync({ id: editing.id, data })
      toast.success('Serviço atualizado com sucesso!')
    } else {
      await createService.mutateAsync(data)
      toast.success('Serviço criado com sucesso!')
    }
    setModal(null)
  }

  const handleCompleteToday = async () => {
    if (todayIds.length === 0) return
    if (!confirm(`Concluir ${plural(todayIds.length, 'serviço', 'serviços')} de hoje?`)) return
    try {
      const done = await completeBatch.mutateAsync(todayIds)
      if (done.length === 0) toast.info('Nenhum serviço de hoje estava agendado.')
      else toast.success(plural(done.length, 'serviço concluído', 'serviços concluídos'))
    } catch (e) {
      toast.error(errorMessage(e, 'Não foi possível concluir os serviços de hoje.'))
    }
  }

  const pagePadding = isMobile ? '16px' : isTablet ? '24px' : '30px'
  const gridColumns = isMobile ? '1fr' : isTablet ? 'repeat(2, minmax(0, 1fr))' : 'repeat(6, minmax(0, 1fr))'
  const cardSpan = (i: number) => {
    if (isMobile) return undefined
    if (isTablet) return i === CARD_ORDER.length - 1 ? 'span 2' : undefined
    return i < 3 ? 'span 2' : 'span 3'
  }

  const newButton = (
    <button
      type="button"
      className="svc-btn"
      onClick={() => setModal({ service: null })}
      style={{
        background: colors.accentGreenMuted,
        border: '1px solid rgba(90,171,114,0.25)',
        borderRadius: radius.md,
        color: colors.income,
        fontSize: '13px',
        fontWeight: 600,
        padding: '0 16px',
        cursor: 'pointer',
        minHeight: '44px',
        whiteSpace: 'nowrap',
        flex: isMobile ? 1 : undefined,
      }}
    >
      + Novo serviço
    </button>
  )

  const todayButton = (
    <button
      type="button"
      className="svc-btn"
      onClick={() => void handleCompleteToday()}
      disabled={todayIds.length === 0 || completeBatch.isPending}
      title={todayIds.length === 0 ? 'Nenhum serviço agendado para hoje' : undefined}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        background: colors.bgCard,
        border: `1px solid ${todayIds.length ? colors.accentGreenMuted : colors.border}`,
        borderRadius: radius.md,
        color: todayIds.length ? colors.textPrimary : colors.textMuted,
        fontSize: '13px',
        fontWeight: 500,
        padding: '0 14px',
        cursor: todayIds.length === 0 ? 'not-allowed' : completeBatch.isPending ? 'wait' : 'pointer',
        minHeight: '44px',
        whiteSpace: 'nowrap',
        flex: isMobile ? 1 : undefined,
      }}
    >
      {completeBatch.isPending ? 'Concluindo…' : 'Concluir serviços de hoje'}
      <span
        aria-label={`(${todayIds.length})`}
        style={{
          minWidth: '22px', height: '22px', padding: '0 6px', borderRadius: radius.full,
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '12px', fontWeight: 600, fontVariantNumeric: 'tabular-nums',
          background: todayIds.length ? colors.incomeSubtle : colors.bgCardElevated,
          color: todayIds.length ? colors.accentGreenBright : colors.textMuted,
        }}
      >
        {todayIds.length}
      </span>
    </button>
  )

  return (
    <div style={{ display: 'flex', flex: 1, minHeight: 0, minWidth: 0 }}>
      <main style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', minWidth: 0 }}>
        <div
          className="animate-fade"
          style={{ padding: pagePadding, paddingBottom: isMobile ? '80px' : pagePadding, minWidth: 0 }}
        >
          <TopBar title="Serviços">
            {!isMobile && (
              <div style={{ display: 'flex', gap: '10px' }}>
                {todayButton}
                {newButton}
              </div>
            )}
          </TopBar>

          {isMobile && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
              {newButton}
              {todayButton}
            </div>
          )}

          <section
            aria-label="Resumo dos serviços"
            style={{ display: 'grid', gridTemplateColumns: gridColumns, gap: isMobile ? '10px' : '14px', marginBottom: '24px' }}
          >
            {CARD_ORDER.map(({ key, accent }, i) => (
              <div key={key} style={{ gridColumn: cardSpan(i), display: 'flex', minWidth: 0 }}>
                <StatCard
                  label={SERVICE_METRIC_INFO[key].label}
                  info={SERVICE_METRIC_INFO[key].info}
                  value={isLoading ? '—' : formatBRL(metrics[key])}
                  accent={accent}
                  icon={null}
                  valueSize={isMobile ? 28 : 30}
                />
              </div>
            ))}
          </section>

          <div role="group" aria-label="Filtrar serviços" style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '14px' }}>
            {FILTERS.map((f) => {
              const active = filter === f.value
              return (
                <button
                  key={f.value}
                  type="button"
                  className="svc-btn"
                  aria-pressed={active}
                  onClick={() => setFilter(f.value)}
                  style={{
                    background: active ? colors.bgActive : colors.bgCard,
                    border: `1px solid ${active ? colors.accentGreenMuted : colors.border}`,
                    borderRadius: radius.full,
                    color: active ? colors.textPrimary : colors.textSecondary,
                    fontSize: '13px',
                    fontWeight: active ? 500 : 400,
                    padding: '0 16px',
                    cursor: 'pointer',
                    minHeight: isMobile ? '44px' : '36px',
                    transition: 'background 0.15s, color 0.15s',
                  }}
                >
                  {f.label}
                </button>
              )
            })}
          </div>

          {isError ? (
            <div role="alert" style={{ color: colors.expense, fontSize: '14px', padding: '24px 0' }}>
              Não foi possível carregar os serviços. Verifique sua conexão e recarregue a página.
            </div>
          ) : (
            <ServiceList
              services={visible}
              today={today}
              isLoading={isLoading}
              emptyText={FILTERS.find((f) => f.value === filter)!.empty}
              busyId={busyId}
              onEdit={(s) => setModal({ service: s })}
              onComplete={(s) => void runAction(s, completeService.mutateAsync, 'Serviço concluído!', 'Não foi possível concluir o serviço.')}
              onReopen={(s) => void runAction(s, reopenService.mutateAsync, 'Serviço reaberto.', 'Não foi possível reabrir o serviço.')}
              onCancel={(s) => {
                if (!confirm(`Cancelar o serviço "${s.name}"?`)) return
                void runAction(s, cancelService.mutateAsync, 'Serviço cancelado.', 'Não foi possível cancelar o serviço.')
              }}
            />
          )}
        </div>
      </main>

      {modal && (
        <ServiceFormModal
          service={modal.service}
          isSaving={createService.isPending || updateService.isPending}
          onClose={() => setModal(null)}
          onSubmit={handleSubmit}
        />
      )}

      <style>{`
        .svc-btn { transition: transform 0.1s ease, opacity 0.15s ease; }
        .svc-btn:hover:not(:disabled) { opacity: 0.88; }
        .svc-btn:active:not(:disabled) { transform: scale(0.97); }
        .svc-btn:focus-visible { outline: 2px solid ${colors.accentGreenBright}; outline-offset: 2px; }
        .svc-btn:disabled { opacity: 0.55; }
        .svc-row:hover td { background: ${colors.bgCardElevated}; }
        @media (prefers-reduced-motion: reduce) { .svc-btn { transition: none; } }
      `}</style>
    </div>
  )
}
