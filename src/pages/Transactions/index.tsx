import { useState } from 'react'
import { useTransactions, useCreateTransaction, useUpdateTransaction, useDeleteTransaction } from '../../hooks/useTransactions'
import { useCategories } from '../../hooks/useCategories'
import { useBreakpoint } from '../../hooks/useBreakpoint'
import { TopBar } from '../../components/shared/TopBar'
import { TransactionTable } from '../../components/shared/TransactionTable'
import { CategoryPanel } from '../../components/shared/CategoryPanel'
import type { TransactionType } from '../../types/transaction'
import { radius } from '../../theme'
import { useTheme } from '../../context/ThemeContext'
import type { ThemeColors } from '../../context/ThemeContext'
import { transactionSchema } from '../../schemas/transaction.schema'
import { transactionsApi } from '../../api/transactions'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-toastify'
import type { TransactionWithCategoryNameDto } from '../../types/transaction'

type Filter = 'all' | TransactionType

export function TransactionsPage() {
  const { colors } = useTheme()
  const { isMobile, isTablet } = useBreakpoint()
  const [filter, setFilter] = useState<Filter>('all')
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isCategoryDrawerOpen, setIsCategoryDrawerOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
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
  const updateTransaction = useUpdateTransaction()
  const deleteTransaction = useDeleteTransaction()
  const queryClient = useQueryClient()

  const isSmall = isMobile || isTablet

  const filtered = filter === 'all'
    ? transactions
    : transactions.filter((t) => t.type === filter)

  const tabs: { label: string; value: Filter }[] = [
    { label: 'Todos', value: 'all' },
    { label: 'Receitas', value: 0 },
    { label: 'Despesas', value: 1 },
  ]

  const openCreateModal = () => {
    setEditingId(null)
    setFormError(null)
    setFormData({
      name: '',
      amount: '',
      type: '0',
      date: new Date().toISOString().split('T')[0],
      categoryId: categories[0]?.id ?? '',
    })
    setIsCreateModalOpen(true)
  }

  const handleEdit = (tx: TransactionWithCategoryNameDto) => {
    setEditingId(tx.id || null)
    setFormError(null)
    setFormData({
      name: tx.name,
      amount: String(tx.amount),
      type: String(tx.type),
      date: new Date(tx.date).toISOString().split('T')[0], // Extracting YYYY-MM-DD
      categoryId: tx.categoryId || '',
    })
    setIsCreateModalOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja remover esta transação?')) {
      try {
        await deleteTransaction.mutateAsync(id)
        toast.success('Transação removida com sucesso!')
      } catch {
        toast.error('Erro ao remover transação.')
      }
    }
  }

  const closeCreateModal = () => {
    if (createTransaction.isPending || updateTransaction.isPending) return
    setIsCreateModalOpen(false)
    setFormError(null)
    setEditingId(null)
  }

  const handleSaveTransaction = async () => {
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

      if (editingId) {
        await updateTransaction.mutateAsync({ id: editingId, data: payload })
        toast.success('Transação atualizada com sucesso!')
      } else {
        await createTransaction.mutateAsync(payload)
        toast.success('Transação criada com sucesso!')
      }
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

  const pagePadding = isMobile ? '16px' : isTablet ? '20px' : '24px'

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
    minHeight: '44px',
  }

  const selectStyle: React.CSSProperties = {
    ...inputStyle,
    cursor: 'pointer',
    paddingRight: '36px',
    appearance: 'none',
    WebkitAppearance: 'none',
    MozAppearance: 'none',
    backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23809088' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 14px center',
    backgroundSize: '16px',
  }

  return (
    <div style={{ display: 'flex', flex: 1, minHeight: 0, minWidth: 0 }}>
      <main style={{
        flex: 1,
        overflowY: 'auto',
        overflowX: 'hidden',
        minWidth: 0,
      }}>
        {/* Inner wrapper carries padding — fixes overflow-y right-padding loss bug */}
        <div style={{
          padding: pagePadding,
          paddingBottom: isMobile ? '80px' : pagePadding,
          minWidth: 0,
        }}>
        <TopBar title="Transações">
          {/* Nova transação button — only in header on desktop */}
          {!isMobile && (
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
            onClick={openCreateModal}
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

        {/* Filter tabs + actions */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '16px',
          gap: '8px',
          flexWrap: 'wrap',
        }}>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
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
                  transition: 'background 0.15s, color 0.15s',
                  minHeight: '32px',
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
              minHeight: '32px',
            }}>
              <FilterIcon /> Filtros
            </button>

            {/* Categories button — mobile only */}
            {isMobile && (
              <button
                onClick={() => setIsCategoryDrawerOpen(true)}
                style={{
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
                  minHeight: '32px',
                }}
              >
                <TagIcon /> Categorias
              </button>
            )}
          </div>

          {!isMobile && (
            <button style={{
              background: colors.bgCard,
              border: `1px solid ${colors.border}`,
              borderRadius: radius.md,
              color: colors.textSecondary,
              fontSize: '11px',
              padding: '5px 12px',
              cursor: 'pointer',
              minHeight: '32px',
            }}>
              Exportar CSV
            </button>
          )}
        </div>

        {/* Table */}
        <div style={{
          background: colors.bgCard,
          border: `1px solid ${colors.border}`,
          borderRadius: radius.lg,
          overflow: 'hidden',
        }}>
          <TransactionTable
            transactions={filtered}
            isLoading={isLoading}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </div>
        </div>{/* end inner padding wrapper */}
      </main>

      {/* CategoryPanel — sidebar on desktop, drawer on mobile */}
      {!isSmall && (
        <CategoryPanel
          categories={categories}
          isLoading={catLoading}
        />
      )}

      {isSmall && isCategoryDrawerOpen && (
        <CategoryPanel
          categories={categories}
          isLoading={catLoading}
          asDrawer
          onClose={() => setIsCategoryDrawerOpen(false)}
        />
      )}

      {/* Create transaction modal */}
      {isCreateModalOpen && (
        <div
          onPointerDown={(e) => { if (e.target === e.currentTarget) closeCreateModal() }}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(10, 20, 16, 0.72)',
            display: 'flex',
            alignItems: isMobile ? 'flex-end' : 'center',
            justifyContent: 'center',
            padding: isMobile ? '0' : '24px',
            zIndex: 100,
          }}
        >
          <div
            onClick={(event) => event.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: isMobile ? '100%' : '460px',
              background: colors.bgCard,
              border: `1px solid ${colors.border}`,
              borderRadius: isMobile ? '16px 16px 0 0' : radius.xl,
              padding: isMobile ? '20px 16px 0' : '22px',
              // On mobile the sheet slides up from bottom — adding safe area padding
              paddingBottom: isMobile ? 'max(24px, calc(env(safe-area-inset-bottom) + 24px))' : '22px',
              boxShadow: '0 24px 80px rgba(0, 0, 0, 0.32)',
              animation: isMobile ? 'slideUp 0.25s ease-out' : undefined,
            }}
          >
            {/* Drag handle for mobile sheet */}
            {isMobile && (
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '14px' }}>
                <div style={{ width: '36px', height: '4px', borderRadius: '2px', background: colors.border }} />
              </div>
            )}

            <div style={{ fontSize: '18px', fontWeight: 600, color: colors.textPrimary, marginBottom: '18px' }}>
              {editingId ? 'Editar transação' : 'Nova transação'}
            </div>

            <FormField label="Descrição" colors={colors}>
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

            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, minmax(0, 1fr))', gap: '12px' }}>
              <FormField label="Valor" colors={colors}>
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

              <FormField label="Tipo" colors={colors}>
                <select
                  value={formData.type}
                  onChange={(event) => {
                    setFormData((current) => ({ ...current, type: event.target.value }))
                    if (formError) setFormError(null)
                  }}
                  style={selectStyle}
                >
                  <option value="0">Receita</option>
                  <option value="1">Despesa</option>
                </select>
              </FormField>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, minmax(0, 1fr))', gap: '12px' }}>
              <FormField label="Data" colors={colors}>
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

              <FormField label="Categoria" colors={colors}>
                <select
                  value={formData.categoryId}
                  onChange={(event) => {
                    setFormData((current) => ({ ...current, categoryId: event.target.value }))
                    if (formError) setFormError(null)
                  }}
                  style={selectStyle}
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
                disabled={createTransaction.isPending || updateTransaction.isPending}
                style={{
                  background: colors.bgSurface,
                  border: `1px solid ${colors.border}`,
                  borderRadius: radius.md,
                  color: colors.textSecondary,
                  fontSize: '12px',
                  fontWeight: 500,
                  padding: '8px 14px',
                  cursor: (createTransaction.isPending || updateTransaction.isPending) ? 'not-allowed' : 'pointer',
                  minHeight: '44px',
                  flex: isMobile ? 1 : undefined,
                }}
              >
                Cancelar
              </button>
              <button
                onClick={() => void handleSaveTransaction()}
                disabled={createTransaction.isPending || updateTransaction.isPending}
                style={{
                  background: colors.accentGreenMuted,
                  border: `1px solid rgba(90,171,114,0.25)`,
                  borderRadius: radius.md,
                  color: colors.income,
                  fontSize: '12px',
                  fontWeight: 600,
                  padding: '8px 14px',
                  cursor: (createTransaction.isPending || updateTransaction.isPending) ? 'not-allowed' : 'pointer',
                  opacity: (createTransaction.isPending || updateTransaction.isPending) ? 0.75 : 1,
                  minHeight: '44px',
                  flex: isMobile ? 1.5 : undefined,
                }}
              >
                {(createTransaction.isPending || updateTransaction.isPending) ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to   { transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}

function FormField({ label, children, colors }: { label: string; children: React.ReactNode; colors: ThemeColors }) {
  return (
    <label style={{ display: 'block', marginBottom: '12px' }}>
      <span style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: colors.textSecondary, marginBottom: '8px' }}>
        {label}
      </span>
      {children}
    </label>
  )
}

function FilterIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
      <path d="M1.5 3h9M3 6h6M5 9h2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
    </svg>
  )
}

function TagIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
      <path d="M6.5 1H11v4.5L6 10.5a.85.85 0 01-1.2 0L1.5 7.2a.85.85 0 010-1.2L6.5 1z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/>
      <circle cx="8.5" cy="3.5" r=".8" fill="currentColor"/>
    </svg>
  )
}
