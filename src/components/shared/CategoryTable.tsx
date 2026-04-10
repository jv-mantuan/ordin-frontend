import type { CategoryDto } from "../../types/category";
import { radius } from "../../theme";
import { useTheme } from "../../context/ThemeContext";

interface CategoryTableProps {
  categories: CategoryDto[];
  isLoading?: boolean;
  onEdit?: (category: CategoryDto) => void;
  onDelete?: (id: string) => void;
}

export function CategoryTable({
  categories,
  isLoading,
  //onEdit,
  onDelete,
}: CategoryTableProps) {
  const { colors } = useTheme();

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

  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th style={headStyle}>Nome</th>
            <th style={headStyle}></th>
          </tr>
        </thead>
        <tbody>
          {categories.length === 0 && (
            <tr>
              <td
                style={{
                  ...cellStyle,
                  textAlign: "center",
                  padding: "28px 24px",
                }}
              >
                Nenhuma categoria encontrada
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
              <td
                style={{
                  ...cellStyle,
                  textAlign: "right",
                }}
              >
                <button
                  style={{
                    cursor: "pointer",
                    background: "transparent",
                    border: "none",
                    color: colors.expense,
                    alignItems: "center",
                  }}
                  onClick={() => onDelete && onDelete(category.id)}
                >
                  <TrashIcon />
                </button>
              </td>
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
}
