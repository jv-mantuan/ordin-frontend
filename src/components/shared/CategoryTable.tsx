import type { CategoryDto } from "../../types/category";
import { radius } from "../../theme";
import { useTheme } from "../../context/ThemeContext";
import { useBreakpoint } from "../../hooks/useBreakpoint";

interface CategoryTableProps {
  categories: CategoryDto[];
  isLoading?: boolean;
  onEdit?: (category: CategoryDto) => void;
  onDelete?: (id: string) => void;
}

export function CategoryTable({
  categories,
  isLoading,
  onEdit,
  onDelete,
}: CategoryTableProps) {
  const { colors } = useTheme();
  const { isMobile } = useBreakpoint();

  const cellStyle: React.CSSProperties = {
    padding: "12px 16px",
    fontSize: "14px",
    color: colors.textSecondary,
    borderBottom: `1px solid ${colors.border}`,
    whiteSpace: "nowrap",
  };

  const headStyle: React.CSSProperties = {
    ...cellStyle,
    color: colors.textMuted,
    fontWeight: 500,
    fontSize: "13px",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    textAlign: "left",
  };

  if (isLoading) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "8px",
          padding: "12px",
        }}
      >
        {[1, 2, 3, 4].map((n) => (
          <div
            key={n}
            style={{
              height: "44px",
              background: colors.bgCardElevated,
              borderRadius: radius.sm,
              opacity: 0.5,
            }}
          />
        ))}
      </div>
    );
  }

  const emptyState = (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', padding: '64px 24px', textAlign: 'center' }}>
      <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: colors.bgCardElevated, display: 'flex', alignItems: 'center', justifyContent: 'center', color: colors.textMuted }}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>
      </div>
      <div>
        <div style={{ fontSize: '15px', fontWeight: 600, color: colors.textPrimary, marginBottom: '6px' }}>Você ainda não tem categorias</div>
        <div style={{ fontSize: '13px', color: colors.textSecondary, maxWidth: '280px', margin: '0 auto', lineHeight: 1.5 }}>
          Não encontramos nenhum registro. Crie sua primeira categoria no botão <b>+ Nova categoria</b>.
        </div>
      </div>
    </div>
  )

  if (isMobile) {
    if (categories.length === 0) return emptyState

    return (
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {categories.map((category, i) => (
          <div key={category.id ?? i} style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px',
            borderBottom: i < categories.length - 1 ? `1px solid ${colors.border}` : 'none',
          }}>
            <div style={{ fontSize: '14px', color: colors.textPrimary, fontWeight: 500 }}>
              {category.name}
            </div>
            
            {(onEdit || onDelete) && (
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <button
                  onClick={() => onEdit && onEdit(category)}
                  style={{ background: 'transparent', border: 'none', color: colors.textSecondary, cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '6px' }}
                >
                  <EditIcon />
                </button>
                <button
                  onClick={() => onDelete && onDelete(category.id)}
                  style={{ background: 'transparent', border: 'none', color: colors.expense, cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '6px' }}
                >
                  <TrashIcon />
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    )
  }

  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th style={headStyle}>Nome</th>
            {(onEdit || onDelete) && <th style={headStyle}></th>}
          </tr>
        </thead>
        <tbody>
          {categories.length === 0 && (
            <tr>
              <td colSpan={2} style={{ padding: 0 }}>
                {emptyState}
              </td>
            </tr>
          )}
          {categories.map((category) => (
            <tr key={category.id} style={{ cursor: "default" }}>
              <td
                style={{
                  ...cellStyle,
                  color: colors.textPrimary,
                  fontWeight: 500,
                }}
              >
                {category.name}
              </td>
              {(onEdit || onDelete) && (
                <td style={{ ...cellStyle, textAlign: "right" }}>
                  <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                    <button
                      onClick={() => onEdit && onEdit(category)}
                      style={{ background: "transparent", border: "none", color: colors.textSecondary, cursor: "pointer", display: "flex", alignItems: "center" }}
                    >
                      <EditIcon />
                    </button>
                    <button
                      onClick={() => onDelete && onDelete(category.id)}
                      style={{ background: "transparent", border: "none", color: colors.expense, cursor: "pointer", display: "flex", alignItems: "center" }}
                    >
                      <TrashIcon />
                    </button>
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  function TrashIcon() {
    return (
      <svg width="18" height="18" viewBox="0 0 12 12" fill="none">
        <path
          d="M1.5 3h9M4 3V2h4v1M5 5.5v3M7 5.5v3M2.5 3l.5 7h6l.5-7"
          stroke="currentColor"
          strokeWidth="1.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  function EditIcon() {
    return (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    )
  }
}
