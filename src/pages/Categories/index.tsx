import { useMemo, useState } from "react";
import { toast } from "react-toastify";
import { TopBar } from "../../components/shared/TopBar";
import { CategoryTable } from "../../components/shared/CategoryTable";
import {
  useCategories,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
} from "../../hooks/useCategories";
import { useBreakpoint } from "../../hooks/useBreakpoint";
import { categorySchema } from "../../schemas/category.schema";
import { radius } from "../../theme";
import { useTheme } from "../../context/ThemeContext";

export function CategoriesPage() {
  const { colors } = useTheme();
  const { isMobile } = useBreakpoint();
  const { data: categories = [], isLoading: catLoading } = useCategories();
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const deleteCatgory = useDeleteCategory();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  const totalCategories = categories.length;

  const latestCategory = useMemo(
    () => categories.at(-1)?.name ?? "Sem categorias ainda",
    [categories],
  );

  const openCreateModal = () => {
    setEditingId(null);
    setName("");
    setFormError(null);
    setIsCreateModalOpen(true);
  };

  const handleEdit = (category: { id: string; name: string }) => {
    setEditingId(category.id);
    setName(category.name);
    setFormError(null);
    setIsCreateModalOpen(true);
  };

  const closeCreateModal = () => {
    if (createCategory.isPending || updateCategory.isPending) return;
    setIsCreateModalOpen(false);
    setEditingId(null);
    setName("");
    setFormError(null);
  };

  const handleSaveCategory = async () => {
    const parsed = categorySchema.safeParse({ name: name.trim() });
    if (!parsed.success) {
      setFormError(parsed.error.issues[0]?.message ?? "Nome inválido");
      return;
    }

    try {
      if (editingId) {
        await updateCategory.mutateAsync({ id: editingId, data: parsed.data });
        toast.success("Categoria atualizada com sucesso!");
      } else {
        await createCategory.mutateAsync(parsed.data);
        toast.success("Categoria criada com sucesso!");
      }
      closeCreateModal();
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Não foi possível salvar a categoria";
      setFormError(message);
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    try {
      await deleteCatgory.mutateAsync(categoryId);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Não foi possível remover a categoria";
      toast.error(message);
    }
  };

  return (
    <div style={{ display: "flex", flex: 1, minHeight: 0 }}>
      <main
        style={{
          flex: 1,
          padding: isMobile ? "16px" : "24px",
          paddingBottom: isMobile ? "76px" : "24px",
          overflowY: "auto",
          minWidth: 0,
        }}
      >
        <TopBar title="Categorias">
          <button
            onClick={openCreateModal}
            disabled={createCategory.isPending}
            style={{
              background: colors.accentGreenMuted,
              border: `1px solid rgba(90,171,114,0.25)`,
              borderRadius: radius.md,
              color: colors.income,
              fontSize: "12px",
              fontWeight: 500,
              padding: "6px 14px",
              cursor: createCategory.isPending ? "wait" : "pointer",
              opacity: createCategory.isPending ? 0.7 : 1,
            }}
          >
            {createCategory.isPending ? "Criando..." : "+ Nova categoria"}
          </button>
        </TopBar>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "minmax(0, 1fr)" : "repeat(2, minmax(0, 1fr))",
            gap: "14px",
            marginBottom: "16px",
          }}
        >
          <SummaryCard
            label="Categorias cadastradas"
            value={String(totalCategories)}
            colors={colors}
          />
          <SummaryCard
            label="Última categoria"
            value={latestCategory}
            colors={colors}
          />
        </div>

        <div
          style={{
            background: colors.bgCard,
            border: `1px solid ${colors.border}`,
            borderRadius: radius.lg,
            overflow: "hidden",
          }}
        >
          <CategoryTable
            categories={categories}
            isLoading={catLoading}
            onEdit={handleEdit}
            onDelete={(id) => handleDeleteCategory(id)}
          />
        </div>
      </main>

      {isCreateModalOpen && (
        <div
          onPointerDown={(e) => { if (e.target === e.currentTarget) closeCreateModal() }}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(10, 20, 16, 0.72)",
            display: "flex",
            alignItems: isMobile ? "flex-end" : "center",
            justifyContent: "center",
            padding: isMobile ? "0" : "24px",
            zIndex: 30,
          }}
        >
          <div
            onClick={(event) => event.stopPropagation()}
            style={{
              width: "100%",
              maxWidth: isMobile ? "100%" : "420px",
              background: colors.bgCard,
              border: `1px solid ${colors.border}`,
              borderRadius: isMobile ? `24px 24px 0 0` : radius.xl,
              padding: isMobile ? "24px 20px max(env(safe-area-inset-bottom), 24px)" : "22px",
              boxShadow: "0 24px 80px rgba(0, 0, 0, 0.32)",
              animation: isMobile ? "slideUp 0.25s ease-out forwards" : "fadeContent 0.3s cubic-bezier(0.2, 0.8, 0.2, 1) forwards",
            }}
          >
            <div
              style={{
                fontSize: "18px",
                fontWeight: 600,
                color: colors.textPrimary,
                marginBottom: "18px",
              }}
            >
              {editingId ? "Editar categoria" : "Nova categoria"}
            </div>

            <label
              style={{
                display: "block",
                fontSize: "12px",
                fontWeight: 500,
                color: colors.textSecondary,
                marginBottom: "8px",
              }}
            >
              Nome
            </label>
            <input
              autoFocus
              value={name}
              onChange={(event) => {
                setName(event.target.value);
                if (formError) setFormError(null);
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  void handleSaveCategory();
                }
                if (event.key === "Escape") {
                  closeCreateModal();
                }
              }}
              placeholder="Ex.: Alimentação"
              style={{
                width: "100%",
                boxSizing: "border-box",
                background: colors.bgSurface,
                border: `1px solid ${colors.border}`,
                borderRadius: radius.md,
                color: colors.textPrimary,
                fontSize: "14px",
                padding: "12px 14px",
                outline: "none",
              }}
            />

            <div
              style={{
                minHeight: "20px",
                marginTop: "10px",
                fontSize: "12px",
                color: colors.expense,
              }}
            >
              {formError ?? ""}
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: "10px",
                marginTop: "12px",
              }}
            >
              <button
                onClick={closeCreateModal}
                disabled={createCategory.isPending || updateCategory.isPending}
                style={{
                  background: colors.bgSurface,
                  border: `1px solid ${colors.border}`,
                  borderRadius: radius.md,
                  color: colors.textSecondary,
                  fontSize: "12px",
                  fontWeight: 500,
                  padding: "8px 14px",
                  minHeight: "44px",
                  flex: isMobile ? 1 : undefined,
                  cursor: (createCategory.isPending || updateCategory.isPending) ? "not-allowed" : "pointer",
                }}
              >
                Cancelar
              </button>
              <button
                onClick={() => void handleSaveCategory()}
                disabled={createCategory.isPending || updateCategory.isPending}
                style={{
                  background: colors.accentGreenMuted,
                  border: `1px solid rgba(90,171,114,0.25)`,
                  borderRadius: radius.md,
                  color: colors.income,
                  fontSize: "12px",
                  fontWeight: 600,
                  padding: "8px 14px",
                  minHeight: "44px",
                  flex: isMobile ? 1.5 : undefined,
                  cursor: (createCategory.isPending || updateCategory.isPending) ? "not-allowed" : "pointer",
                  opacity: (createCategory.isPending || updateCategory.isPending) ? 0.75 : 1,
                }}
              >
                {(createCategory.isPending || updateCategory.isPending) ? "Salvando..." : "Salvar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SummaryCard({
  label,
  value,
  colors,
}: {
  label: string;
  value: string;
  colors: ReturnType<typeof useTheme>["colors"];
}) {
  return (
    <div
      style={{
        background: colors.bgCard,
        border: `1px solid ${colors.border}`,
        borderRadius: radius.lg,
        padding: "20px 22px",
        overflow: "hidden",
        minWidth: 0,
      }}
    >
      <div
        style={{
          fontSize: "15px",
          fontWeight: 600,
          color: colors.textSecondary,
          marginBottom: "12px",
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: "30px",
          fontWeight: 700,
          color: colors.textPrimary,
          letterSpacing: "-0.03em",
          lineHeight: 1.1,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {value}
      </div>
    </div>
  );
}
