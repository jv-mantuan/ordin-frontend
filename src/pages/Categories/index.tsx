import { useMemo, useState } from 'react'
import { TopBar } from '../../components/shared/TopBar'
import { CategoryTable } from '../../components/shared/CategoryTable'
import { CategoryPanel } from '../../components/shared/CategoryPanel'
import { useCategories, useCreateCategory } from '../../hooks/useCategories'
import { categorySchema } from '../../schemas/category.schema'
import { colors, radius } from '../../theme'

export function CategoriesPage() {
  const { data: categories = [], isLoading: catLoading } = useCategories()
  const createCategory = useCreateCategory()
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [name, setName] = useState('')
  const [formError, setFormError] = useState<string | null>(null)

  const totalCategories = categories.length

  const latestCategory = useMemo(
    () => categories.at(-1)?.name ?? 'Sem categorias ainda',
    [categories],
  )

  const openCreateModal = () => {
    setName('')
    setFormError(null)
    setIsCreateModalOpen(true)
  }

  const closeCreateModal = () => {
    if (createCategory.isPending) return
    setIsCreateModalOpen(false)
    setName('')
    setFormError(null)
  }

  const handleCreateCategory = async () => {
    const parsed = categorySchema.safeParse({ name: name.trim() })
    if (!parsed.success) {
      setFormError(parsed.error.issues[0]?.message ?? 'Nome inválido')
      return
    }

    try {
      await createCategory.mutateAsync(parsed.data)
      closeCreateModal()
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Não foi possível criar a categoria'
      setFormError(message)
    }
  }

  return (
    <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>
      <main style={{ flex: 1, padding: '24px', overflowY: 'auto', minWidth: 0 }}>
        <TopBar title="Categorias">
          <button
            onClick={openCreateModal}
            disabled={createCategory.isPending}
            style={{
              background: colors.accentGreenMuted,
              border: `1px solid rgba(90,171,114,0.25)`,
              borderRadius: radius.md,
              color: colors.income,
              fontSize: '12px',
              fontWeight: 500,
              padding: '6px 14px',
              cursor: createCategory.isPending ? 'wait' : 'pointer',
              opacity: createCategory.isPending ? 0.7 : 1,
            }}
          >
            {createCategory.isPending ? 'Criando...' : '+ Nova categoria'}
          </button>
        </TopBar>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
            gap: '14px',
            marginBottom: '16px',
          }}
        >
          <SummaryCard label="Categorias cadastradas" value={String(totalCategories)} />
          <SummaryCard label="Última categoria" value={latestCategory} />
        </div>

        <div
          style={{
            background: colors.bgCard,
            border: `1px solid ${colors.border}`,
            borderRadius: radius.lg,
            overflow: 'hidden',
          }}
        >
          <CategoryTable categories={categories} isLoading={catLoading} />
        </div>
      </main>

      <CategoryPanel
        categories={categories}
        isLoading={catLoading}
        onNew={openCreateModal}
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
              maxWidth: '420px',
              background: colors.bgCard,
              border: `1px solid ${colors.border}`,
              borderRadius: radius.xl,
              padding: '22px',
              boxShadow: '0 24px 80px rgba(0, 0, 0, 0.32)',
            }}
          >
            <div style={{ fontSize: '18px', fontWeight: 600, color: colors.textPrimary, marginBottom: '18px' }}>
              Nova categoria
            </div>

            <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: colors.textSecondary, marginBottom: '8px' }}>
              Nome
            </label>
            <input
              autoFocus
              value={name}
              onChange={(event) => {
                setName(event.target.value)
                if (formError) setFormError(null)
              }}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault()
                  void handleCreateCategory()
                }
                if (event.key === 'Escape') {
                  closeCreateModal()
                }
              }}
              placeholder="Ex.: Alimentação"
              style={{
                width: '100%',
                boxSizing: 'border-box',
                background: colors.bgSurface,
                border: `1px solid ${colors.border}`,
                borderRadius: radius.md,
                color: colors.textPrimary,
                fontSize: '14px',
                padding: '12px 14px',
                outline: 'none',
              }}
            />

            <div style={{ minHeight: '20px', marginTop: '10px', fontSize: '12px', color: colors.expense }}>
              {formError ?? ''}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
              <button
                onClick={closeCreateModal}
                disabled={createCategory.isPending}
                style={{
                  background: colors.bgSurface,
                  border: `1px solid ${colors.border}`,
                  borderRadius: radius.md,
                  color: colors.textSecondary,
                  fontSize: '12px',
                  fontWeight: 500,
                  padding: '8px 14px',
                  cursor: createCategory.isPending ? 'not-allowed' : 'pointer',
                }}
              >
                Cancelar
              </button>
              <button
                onClick={() => void handleCreateCategory()}
                disabled={createCategory.isPending}
                style={{
                  background: colors.accentGreenMuted,
                  border: `1px solid rgba(90,171,114,0.25)`,
                  borderRadius: radius.md,
                  color: colors.income,
                  fontSize: '12px',
                  fontWeight: 600,
                  padding: '8px 14px',
                  cursor: createCategory.isPending ? 'wait' : 'pointer',
                  opacity: createCategory.isPending ? 0.75 : 1,
                }}
              >
                {createCategory.isPending ? 'Criando...' : 'Criar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        background: colors.bgCard,
        border: `1px solid ${colors.border}`,
        borderRadius: radius.lg,
        padding: '20px 22px',
      }}
    >
      <div style={{ fontSize: '15px', fontWeight: 600, color: colors.textSecondary, marginBottom: '12px' }}>
        {label}
      </div>
      <div style={{ fontSize: '30px', fontWeight: 700, color: colors.textPrimary, letterSpacing: '-0.03em', lineHeight: 1.1 }}>
        {value}
      </div>
    </div>
  )
}
