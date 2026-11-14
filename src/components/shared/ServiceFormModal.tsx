import { useState } from 'react'
import { radius } from '../../theme'
import { useTheme, type ThemeColors } from '../../context/ThemeContext'
import { useBreakpoint } from '../../hooks/useBreakpoint'
import { formatAmountInput, formatBRL, parseAmount } from '../../lib/money'
import { todayISO } from '../../lib/date'
import { serviceSchema } from '../../schemas/service.schema'
import { Spinner } from './Spinner'
import type { ServiceDto, ServiceRequest } from '../../types/service'

interface ServiceFormModalProps {
  /** The service being edited, or null to create a new one. */
  service: ServiceDto | null
  isSaving: boolean
  onClose: () => void
  /** Resolves when saved; rejects with an Error whose message is shown in the form. */
  onSubmit: (data: ServiceRequest) => Promise<void>
}

interface FormState {
  name: string
  clientName: string
  date: string
  amount: string
  receivedAmount: string
  expenses: string
  notes: string
}

const toForm = (s: ServiceDto | null): FormState =>
  s
    ? {
        name: s.name,
        clientName: s.clientName ?? '',
        date: s.date,
        amount: formatAmountInput(s.amount),
        receivedAmount: s.receivedAmount ? formatAmountInput(s.receivedAmount) : '',
        expenses: s.expenses ? formatAmountInput(s.expenses) : '',
        notes: s.notes ?? '',
      }
    : { name: '', clientName: '', date: todayISO(), amount: '', receivedAmount: '', expenses: '', notes: '' }

/** Blank optional amounts mean zero. */
const parseOptional = (v: string) => (v.trim() === '' ? 0 : parseAmount(v))

export function ServiceFormModal({ service, isSaving, onClose, onSubmit }: ServiceFormModalProps) {
  const { colors } = useTheme()
  const { isMobile } = useBreakpoint()
  const [form, setForm] = useState<FormState>(() => toForm(service))
  const [error, setError] = useState<string | null>(null)

  const set = (key: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((f) => ({ ...f, [key]: e.target.value }))
    if (error) setError(null)
  }

  const amount = parseAmount(form.amount)
  const received = parseOptional(form.receivedAmount)
  const receivable = Number.isFinite(amount) && Number.isFinite(received) ? Math.max(amount - received, 0) : null

  const close = () => { if (!isSaving) onClose() }

  const save = async () => {
    const parsed = serviceSchema.safeParse({
      name: form.name.trim(),
      clientName: form.clientName.trim(),
      date: form.date,
      amount,
      receivedAmount: received,
      expenses: parseOptional(form.expenses),
      notes: form.notes.trim(),
    })
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? 'Dados inválidos')
      return
    }
    const d = parsed.data
    try {
      await onSubmit({ ...d, clientName: d.clientName || null, notes: d.notes || null })
    } catch (e) {
      // The API client rejects with a plain { message, requestId }, not an Error.
      const message = typeof e === 'object' && e !== null && 'message' in e ? String(e.message) : ''
      setError(message || 'Não foi possível salvar o serviço')
    }
  }

  const input: React.CSSProperties = {
    width: '100%',
    boxSizing: 'border-box',
    background: colors.bgSurface,
    border: `1px solid ${colors.border}`,
    borderRadius: radius.md,
    color: colors.textPrimary,
    fontSize: '14px',
    padding: '12px 14px',
    outline: 'none',
    minHeight: '44px',
    fontFamily: 'inherit',
  }
  const twoCols: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, minmax(0, 1fr))',
    columnGap: '12px',
  }
  const threeCols: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, minmax(0, 1fr))',
    columnGap: '12px',
  }

  return (
    <div
      onPointerDown={(e) => { if (e.target === e.currentTarget) close() }}
      onKeyDown={(e) => { if (e.key === 'Escape') close() }}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(10, 20, 16, 0.72)',
        display: 'flex',
        alignItems: isMobile ? 'flex-end' : 'center',
        justifyContent: 'center',
        padding: isMobile ? 0 : '24px',
        // Above the BottomNav (z-index 50), so Salvar is never covered on mobile.
        zIndex: 100,
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="service-form-title"
        className="service-form"
        style={{
          width: '100%',
          maxWidth: isMobile ? '100%' : '560px',
          maxHeight: isMobile ? '92dvh' : 'calc(100dvh - 48px)',
          overflowY: 'auto',
          background: colors.bgCard,
          border: `1px solid ${colors.border}`,
          borderRadius: isMobile ? '16px 16px 0 0' : radius.xl,
          padding: isMobile ? '20px 16px 0' : '24px',
          paddingBottom: isMobile ? 'max(24px, calc(env(safe-area-inset-bottom) + 24px))' : '24px',
          boxShadow: '0 2px 6px rgba(0, 0, 0, 0.12), 0 24px 80px rgba(0, 0, 0, 0.32)',
          animation: isMobile ? 'serviceSheetUp 0.25s ease-out' : undefined,
        }}
      >
        {isMobile && (
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '14px' }}>
            <div style={{ width: '36px', height: '4px', borderRadius: '2px', background: colors.border }} />
          </div>
        )}

        <div id="service-form-title" style={{ fontSize: '18px', fontWeight: 600, color: colors.textPrimary, marginBottom: '18px', letterSpacing: '-0.02em' }}>
          {service ? 'Editar serviço' : 'Novo serviço'}
        </div>

        <Field label="Nome" colors={colors}>
          <input autoFocus value={form.name} onChange={set('name')} placeholder="Ex.: Corte e escova" maxLength={200} style={input} />
        </Field>

        <div style={twoCols}>
          <Field label="Cliente" hint="opcional" colors={colors}>
            <input value={form.clientName} onChange={set('clientName')} placeholder="Nome do cliente" maxLength={150} style={input} />
          </Field>
          <Field label="Data" colors={colors}>
            <input type="date" value={form.date} onChange={set('date')} style={input} />
          </Field>
        </div>

        <div style={threeCols}>
          <Field label="Valor" colors={colors}>
            <input value={form.amount} onChange={set('amount')} placeholder="0,00" inputMode="decimal" style={input} />
          </Field>
          <Field label="Já recebido" colors={colors}>
            <input value={form.receivedAmount} onChange={set('receivedAmount')} placeholder="0,00" inputMode="decimal" style={input} />
          </Field>
          <Field label="Gastos" colors={colors}>
            <input value={form.expenses} onChange={set('expenses')} placeholder="0,00" inputMode="decimal" style={input} />
          </Field>
        </div>

        <div style={{ fontSize: '13px', color: colors.textSecondary, margin: '-2px 0 14px', fontVariantNumeric: 'tabular-nums' }}>
          {receivable === null ? 'Informe o valor para ver quanto falta receber.' : `A receber: ${formatBRL(receivable)}`}
        </div>

        <Field label="Anotações" hint="opcional" colors={colors}>
          <textarea
            value={form.notes}
            onChange={set('notes')}
            placeholder="Detalhes combinados, endereço, materiais…"
            maxLength={2000}
            rows={3}
            style={{ ...input, resize: 'vertical', lineHeight: 1.5, minHeight: '84px' }}
          />
        </Field>

        <div role="alert" style={{ minHeight: '20px', fontSize: '12px', color: colors.expense }}>
          {error ?? ''}
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
          <button
            type="button"
            className="svc-btn"
            onClick={close}
            disabled={isSaving}
            style={{
              background: colors.bgSurface,
              border: `1px solid ${colors.border}`,
              borderRadius: radius.md,
              color: colors.textSecondary,
              fontSize: '13px',
              fontWeight: 500,
              padding: '8px 16px',
              cursor: isSaving ? 'default' : 'pointer',
              minHeight: '44px',
              flex: isMobile ? 1 : undefined,
            }}
          >
            Fechar
          </button>
          <button
            type="button"
            className="svc-btn"
            onClick={() => void save()}
            disabled={isSaving}
            aria-busy={isSaving}
            style={{
              background: colors.primaryButtonBg,
              border: `1px solid ${colors.primaryButtonBorder}`,
              borderRadius: radius.md,
              color: colors.primaryButtonText,
              fontSize: '13px',
              fontWeight: 600,
              padding: '8px 18px',
              cursor: isSaving ? 'default' : 'pointer',
              opacity: isSaving ? 0.75 : 1,
              minHeight: '44px',
              flex: isMobile ? 1.5 : undefined,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
            }}
          >
            {isSaving ? <><Spinner />Salvando…</> : 'Salvar'}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes serviceSheetUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
        .service-form input:focus-visible, .service-form textarea:focus-visible { border-color: ${colors.accentGreen}; }
        @media (prefers-reduced-motion: reduce) { .service-form { animation: none !important; } }
      `}</style>
    </div>
  )
}

function Field({ label, hint, children, colors }: { label: string; hint?: string; children: React.ReactNode; colors: ThemeColors }) {
  return (
    <label style={{ display: 'block', marginBottom: '14px' }}>
      <span style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: colors.textSecondary, marginBottom: '8px' }}>
        {label}
        {hint && <span aria-hidden="true" style={{ color: colors.textMuted, fontWeight: 400 }}> · {hint}</span>}
      </span>
      {children}
    </label>
  )
}
