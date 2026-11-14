import { useCallback, useMemo, useState } from 'react'
import { toast } from 'react-toastify'
import { radius } from '../../theme'
import { useTheme } from '../../context/ThemeContext'
import { useBreakpoint } from '../../hooks/useBreakpoint'
import { TopBar } from '../../components/shared/TopBar'
import { ServiceSummaryCard } from '../../components/shared/ServiceSummaryCard'
import { ServiceList, type BusyRow, type RowAction } from '../../components/shared/ServiceList'
import { Spinner } from '../../components/shared/Spinner'
import { ServiceFormModal } from '../../components/shared/ServiceFormModal'
import { LoadMore } from '../../components/shared/LoadMore'
import { PeriodFilter } from '../../components/shared/PeriodFilter'
import { periodRange, type DateRange, type Period } from '../../lib/period'
import {
  useCancelService,
  useCompleteService,
  useCompleteServicesByDate,
  useCreateService,
  useReopenService,
  useServicesInfinite,
  useServicesSummary,
  useUpdateService,
} from '../../hooks/useServices'
import { todayISO } from '../../lib/date'
import { useToday } from '../../hooks/useToday'
import type { ServiceDto, ServiceRequest, ServiceStatus } from '../../types/service'

type Filter = ServiceStatus | 'all'

const FILTERS: { value: Filter; label: string; empty: string }[] = [
  { value: 'scheduled', label: 'Agendados', empty: 'Nenhum serviço agendado. Cadastre um em "Novo serviço".' },
  { value: 'completed', label: 'Concluídos', empty: 'Nenhum serviço concluído ainda.' },
  { value: 'cancelled', label: 'Cancelados', empty: 'Nenhum serviço cancelado.' },
  { value: 'all', label: 'Todos', empty: 'Você ainda não cadastrou serviços.' },
]

const errorMessage = (e: unknown, fallback: string) =>
  typeof e === 'object' && e !== null && 'message' in e && e.message ? String(e.message) : fallback

const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`

export function ServicesPage() {
  const { colors } = useTheme()
  const { isMobile, isTablet } = useBreakpoint()
  const isDesktop = !isMobile && !isTablet
  const [filter, setFilter] = useState<Filter>('scheduled')
  const [period, setPeriod] = useState<Period>({ preset: 'all', from: '', to: '' })
  // The range sent to the API. A reversed custom range is shown as an error and not applied,
  // so the list and the metrics keep the last valid period.
  const [range, setRange] = useState<DateRange>({})
  const periodInvalid = periodRange(period) === null
  const changePeriod = (next: Period) => {
    setPeriod(next)
    const nextRange = periodRange(next)
    if (nextRange) setRange(nextRange)
  }
  const [modal, setModal] = useState<{ service: ServiceDto | null } | null>(null)
  const [busy, setBusy] = useState<BusyRow | null>(null)

  const createService = useCreateService()
  const updateService = useUpdateService()
  const completeService = useCompleteService()
  const cancelService = useCancelService()
  const reopenService = useReopenService()
  const completeByDate = useCompleteServicesByDate()

  const today = useToday()
  // Filter and order are applied by the API; switching the filter starts a fresh list (new query key).
  const list = useServicesInfinite(filter === 'all' ? undefined : filter, range)
  const services = useMemo(() => list.data?.pages.flatMap((p) => p.items) ?? [], [list.data])
  const { fetchNextPage } = list
  const loadMore = useCallback(() => void fetchNextPage(), [fetchNextPage])
  // Every number comes from the API over all services, never from the pages loaded so far.
  const summary = useServicesSummary(today, range)
  const todayCount = summary.data?.todayScheduled ?? 0

  const runAction = async (
    s: ServiceDto,
    action: RowAction,
    fn: (id: string) => Promise<unknown>,
    success: string,
    fallback: string,
  ) => {
    setBusy({ id: s.id, action })
    try {
      await fn(s.id)
      toast.success(success)
    } catch (e) {
      toast.error(errorMessage(e, fallback))
    } finally {
      setBusy(null)
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
    if (todayCount === 0) {
      toast.info('Nenhum serviço agendado para hoje.')
      return
    }
    if (!confirm(`Concluir ${plural(todayCount, 'serviço', 'serviços')} de hoje?`)) return
    try {
      // The date is taken at click time: never trust a "today" captured before midnight.
      const { completed } = await completeByDate.mutateAsync(todayISO())
      if (completed === 0) toast.info('Nenhum serviço de hoje estava agendado.')
      else toast.success(plural(completed, 'serviço concluído', 'serviços concluídos'))
    } catch (e) {
      toast.error(errorMessage(e, 'Não foi possível concluir os serviços de hoje.'))
    }
  }

  const pagePadding = isMobile ? '16px' : isTablet ? '24px' : '30px'

  const newButton = (
    <button
      type="button"
      className="svc-btn"
      onClick={() => setModal({ service: null })}
      style={{
        background: colors.primaryButtonBg,
        border: `1px solid ${colors.primaryButtonBorder}`,
        borderRadius: radius.md,
        color: colors.primaryButtonText,
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
      disabled={todayCount === 0 || completeByDate.isPending}
      title={todayCount === 0 ? 'Nenhum serviço agendado para hoje' : undefined}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        background: colors.bgCard,
        border: `1px solid ${todayCount ? colors.accentGreenMuted : colors.border}`,
        borderRadius: radius.md,
        color: todayCount ? colors.textPrimary : colors.textMuted,
        fontSize: '13px',
        fontWeight: 500,
        padding: '0 14px',
        cursor: todayCount === 0 ? 'not-allowed' : 'pointer',
        minHeight: '44px',
        whiteSpace: 'nowrap',
        flex: isMobile ? 1 : undefined,
      }}
    >
      {completeByDate.isPending ? <><Spinner />Concluindo…</> : 'Concluir serviços de hoje'}
      <span
        aria-label={`(${todayCount})`}
        style={{
          minWidth: '22px', height: '22px', padding: '0 6px', borderRadius: radius.full,
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '12px', fontWeight: 600, fontVariantNumeric: 'tabular-nums',
          background: todayCount ? colors.incomeSubtle : colors.bgCardElevated,
          color: todayCount ? colors.accentGreenBright : colors.textMuted,
        }}
      >
        {todayCount}
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

          <ServiceSummaryCard metrics={summary.data ?? null} />
          {summary.isError && (
            <div role="alert" style={{ color: colors.expense, fontSize: '13px', margin: '-12px 0 20px' }}>
              Não foi possível carregar o resumo. Os valores acima aparecem quando a conexão voltar.
            </div>
          )}

          <div
            style={{
              display: 'flex',
              flexDirection: isMobile ? 'column-reverse' : 'row',
              justifyContent: 'space-between',
              alignItems: isMobile ? 'stretch' : 'flex-end',
              gap: '12px',
              marginBottom: '14px',
            }}
          >
            <div role="group" aria-label="Filtrar serviços" style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
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
                      minHeight: isDesktop ? '36px' : '44px',
                      transition: 'background 0.15s, color 0.15s',
                    }}
                  >
                    {f.label}
                  </button>
                )
              })}
            </div>
            <PeriodFilter value={period} onChange={changePeriod} invalid={periodInvalid} />
          </div>

          {list.isError && !list.data ? (
            <div role="alert" style={{ color: colors.expense, fontSize: '14px', padding: '24px 0' }}>
              Não foi possível carregar os serviços. Verifique sua conexão e recarregue a página.
            </div>
          ) : (
            <ServiceList
              services={services}
              today={today}
              isLoading={list.isLoading}
              emptyText={range.from || range.to ? 'Nenhum serviço neste período.' : FILTERS.find((f) => f.value === filter)!.empty}
              busy={busy}
              onEdit={(s) => setModal({ service: s })}
              onComplete={(s) => void runAction(s, 'complete', completeService.mutateAsync, 'Serviço concluído!', 'Não foi possível concluir o serviço.')}
              onReopen={(s) => void runAction(s, 'reopen', reopenService.mutateAsync, 'Serviço reaberto.', 'Não foi possível reabrir o serviço.')}
              onCancel={(s) => {
                if (!confirm(`Cancelar o serviço "${s.name}"?`)) return
                void runAction(s, 'cancel', cancelService.mutateAsync, 'Serviço cancelado.', 'Não foi possível cancelar o serviço.')
              }}
            />
          )}
          {list.data && (
            <LoadMore
              hasNextPage={!!list.hasNextPage}
              isFetching={list.isFetchingNextPage}
              hasError={list.isFetchNextPageError}
              onLoadMore={loadMore}
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
