import { useState } from 'react'
import { useTransactions } from '../../hooks/useTransactions'
import { useCreateTransaction } from '../../hooks/useTransactions'
import { useCategories } from '../../hooks/useCategories'
import { TopBar } from '../../components/shared/TopBar'
import { TransactionTable } from '../../components/shared/TransactionTable'
import { CategoryPanel } from '../../components/shared/CategoryPanel'
import type { TransactionType } from '../../types/transaction'
import { colors, radius } from '../../theme'
import { transactionSchema } from '../../schemas/transaction.schema'
import { transactionsApi } from '../../api/transactions'
import { useQueryClient } from '@tanstack/react-query'

type Filter = 'all' | TransactionType

export function TransactionsPage() {
  const [filter, setFilter] = useState<Filter>('all')
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    type: '0',
    date: '',
    categoryId: '',
  })
  const { data: transactions = [], isLoading } = useTransactions()
  const { data: categories = [], isLoading: catLoading } = useCategories()
  const createTransaction = useCreateTransaction()
  const queryClient = useQueryClient()

  const filtered = filter === 'all'
    ? transactions
    : transactions.filter((t) => t.type === filter)

  const tabs: { label: string; value: Filter }[] = [
    { label: 'Todos', value: 'all' },
    { label: 'Receitas', value: 0 },
    { label: 'Despesas', value: 1 },
  ]

  const openCreateModal = () => {
    setFormError(null)
    setFormData({
      name: '',
      amount: '',
      type: '0',
      date: '',
      categoryId: categories[0]?.id ?? '',
    })
    setIsCreateModalOpen(true)
  }

  const closeCreateModal = () => {
    if (createTransaction.isPending) return
    setIsCreateModalOpen(false)
    setFormError(null)
  }

  const handleCreateTransaction = async () => {
    const parsed = transactionSchema.safeParse({
      name: formData.name.trim(),
      amount: Number(formData.amount),
      type: Number(formData.type),
      date: formData.date,
      categoryId: formData.categoryId,
    })

    if (!parsed.success) {
      setFormError(parsed.error.issues[0]?.message ?? 'Dados inválidos')
      return
    }

    try {
      const payload = {
        ...parsed.data,
        type: parsed.data.type as TransactionType,
        date: new Date(parsed.data.date),
      }

      await createTransaction.mutateAsync(payload)
      closeCreateModal()
    } catch (error) {
      const payloadDate = new Date(parsed.data.date).getTime()

      try {
        const refreshed = await transactionsApi.getAll().then((response) => response.data.data)
        const wasCreated = refreshed.some((transaction) => (
          transaction.name === parsed.data.name
          && Number(transaction.amount) === parsed.data.amount
          && transaction.type === parsed.data.type
          && transaction.categoryId === parsed.data.categoryId
          && new Date(transaction.date).getTime() === payloadDate
        ))

        if (wasCreated) {
          await queryClient.invalidateQueries({ queryKey: ['transactions'] })
          closeCreateModal()
          return
        }
      } catch {
        // Keep the original error message when the recovery check also fails.
      }

      const message = typeof error === 'object' && error !== null && 'message' in error
        ? String(error.message)
        : 'Não foi possível criar a transação'
      setFormError(message)
    }
  }

  return (
    <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>
      <main style={{ flex: 1, padding: '24px', overflowY: 'auto', minWidth: 0 }}>
        <TopBar title="Transações">
          <button
            onClick={openCreateModal}
            style={{
              background: colors.accentGreenMuted,
              border: `1px solid rgba(90,171,114,0.25)`,
              borderRadius: radius.md,
              color: colors.income,
              fontSize: '12px',
              fontWeight: 500,
              padding: '6px 14px',
              cursor: 'pointer',
            }}
          >
            + Nova transação
          </button>
        </TopBar>

        {/* Filter tabs + export */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '16px',
        }}>
          <div style={{ display: 'flex', gap: '6px' }}>
            {tabs.map((tab) => (
              <button
                key={tab.value}
                onClick={() => setFilter(tab.value)}
                style={{
                  background: filter === tab.value ? colors.bgActive : colors.bgCard,
                  border: `1px solid ${filter === tab.value ? colors.accentGreenMuted : colors.border}`,
                  borderRadius: radius.full,
                  color: filter === tab.value ? colors.textPrimary : colors.textSecondary,
                  fontSize: '12px',
                  fontWeight: filter === tab.value ? 500 : 400,
                  padding: '5px 14px',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
              >
                {tab.label}
              </button>
            ))}
            <button style={{
              background: colors.bgCard,
              border: `1px solid ${colors.border}`,
              borderRadius: radius.full,
              color: colors.textSecondary,
              fontSize: '12px',
              padding: '5px 12px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}>
              <FilterIcon /> Filtros
            </button>
          </div>

          <button style={{
            background: colors.bgCard,
            border: `1px solid ${colors.border}`,
            borderRadius: radius.md,
            color: colors.textSecondary,
            fontSize: '11px',
            padding: '5px 12px',
            cursor: 'pointer',
          }}>
            Exportar CSV
          </button>
        </div>

        {/* Table */}
        <div style={{
          background: colors.bgCard,
          border: `1px solid ${colors.border}`,
          borderRadius: radius.lg,
          overflow: 'hidden',
        }}>
          <TransactionTable transactions={filtered} isLoading={isLoading} />
        </div>
      </main>

      <CategoryPanel
        categories={categories}
        isLoading={catLoading}
      />

      {isCreateModalOpen && (
        <div
          onClick={closeCreateModal}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(10, 20, 16, 0.72)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
            zIndex: 30,
          }}
        >
          <div
            onClick={(event) => event.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: '460px',
              background: colors.bgCard,
              border: `1px solid ${colors.border}`,
              borderRadius: radius.xl,
              padding: '22px',
              boxShadow: '0 24px 80px rgba(0, 0, 0, 0.32)',
            }}
          >
            <div style={{ fontSize: '18px', fontWeight: 600, color: colors.textPrimary, marginBottom: '18px' }}>
              Nova transação
            </div>

            <FormField label="Descrição">
              <input
                autoFocus
                value={formData.name}
                onChange={(event) => {
                  setFormData((current) => ({ ...current, name: event.target.value }))
                  if (formError) setFormError(null)
                }}
                placeholder="Ex.: Supermercado"
                style={inputStyle}
              />
            </FormField>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '12px' }}>
              <FormField label="Valor">
                <input
                  value={formData.amount}
                  onChange={(event) => {
                    setFormData((current) => ({ ...current, amount: event.target.value }))
                    if (formError) setFormError(null)
                  }}
                  placeholder="0,00"
                  inputMode="decimal"
                  style={inputStyle}
                />
              </FormField>

              <FormField label="Tipo">
                <select
                  value={formData.type}
                  onChange={(event) => {
                    setFormData((current) => ({ ...current, type: event.target.value }))
                    if (formError) setFormError(null)
                  }}
                  style={inputStyle}
                >
                  <option value="0">Receita</option>
                  <option value="1">Despesa</option>
                </select>
              </FormField>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '12px' }}>
              <FormField label="Data">
                <input
                  type="date"
                  value={formData.date}
                  onChange={(event) => {
                    setFormData((current) => ({ ...current, date: event.target.value }))
                    if (formError) setFormError(null)
                  }}
                  style={inputStyle}
                />
              </FormField>

              <FormField label="Categoria">
                <select
                  value={formData.categoryId}
                  onChange={(event) => {
                    setFormData((current) => ({ ...current, categoryId: event.target.value }))
                    if (formError) setFormError(null)
                  }}
                  style={inputStyle}
                >
                  <option value="">Selecione</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </FormField>
            </div>

            <div style={{ minHeight: '20px', marginTop: '10px', fontSize: '12px', color: colors.expense }}>
              {formError ?? ''}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
              <button
                onClick={closeCreateModal}
                disabled={createTransaction.isPending}
                style={{
                  background: colors.bgSurface,
                  border: `1px solid ${colors.border}`,
                  borderRadius: radius.md,
                  color: colors.textSecondary,
                  fontSize: '12px',
                  fontWeight: 500,
                  padding: '8px 14px',
                  cursor: createTransaction.isPending ? 'not-allowed' : 'pointer',
                }}
              >
                Cancelar
              </button>
              <button
                onClick={() => void handleCreateTransaction()}
                disabled={createTransaction.isPending}
                style={{
                  background: colors.accentGreenMuted,
                  border: `1px solid rgba(90,171,114,0.25)`,
                  borderRadius: radius.md,
                  color: colors.income,
                  fontSize: '12px',
                  fontWeight: 600,
                  padding: '8px 14px',
                  cursor: createTransaction.isPending ? 'wait' : 'pointer',
                  opacity: createTransaction.isPending ? 0.75 : 1,
                }}
              >
                {createTransaction.isPending ? 'Criando...' : 'Criar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label style={{ display: 'block', marginBottom: '12px' }}>
      <span style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: colors.textSecondary, marginBottom: '8px' }}>
        {label}
      </span>
      {children}
    </label>
  )
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  boxSizing: 'border-box',
  background: colors.bgSurface,
  border: `1px solid ${colors.border}`,
  borderRadius: radius.md,
  color: colors.textPrimary,
  fontSize: '14px',
  padding: '12px 14px',
  outline: 'none',
}

function FilterIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
      <path d="M1.5 3h9M3 6h6M5 9h2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
    </svg>
  )
}
