import { colors } from '../../theme'

export interface DonutSegment {
  label: string
  value: number
  color: string
}

interface DonutChartProps {
  segments: DonutSegment[]
}

function polar(cx: number, cy: number, r: number, angleDeg: number): [number, number] {
  const rad = ((angleDeg - 90) * Math.PI) / 180
  return [cx + r * Math.cos(rad), cy + r * Math.sin(rad)]
}

function segmentPath(
  cx: number, cy: number,
  outerR: number, innerR: number,
  startAngle: number, endAngle: number,
): string {
  const [ox1, oy1] = polar(cx, cy, outerR, startAngle)
  const [ox2, oy2] = polar(cx, cy, outerR, endAngle)
  const [ix1, iy1] = polar(cx, cy, innerR, startAngle)
  const [ix2, iy2] = polar(cx, cy, innerR, endAngle)
  const large = endAngle - startAngle > 180 ? 1 : 0

  return [
    `M ${ox1} ${oy1}`,
    `A ${outerR} ${outerR} 0 ${large} 1 ${ox2} ${oy2}`, // outer arc, clockwise
    `L ${ix2} ${iy2}`,
    `A ${innerR} ${innerR} 0 ${large} 0 ${ix1} ${iy1}`, // inner arc, counter-clockwise
    'Z',
  ].join(' ')
}

function formatLegendValue(value: number): string {
  if (value >= 1000) return `R$${(value / 1000).toFixed(1)}k`
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}

export function DonutChart({ segments }: DonutChartProps) {
  const total = segments.reduce((s, d) => s + d.value, 0)
  const cx = 114, cy = 114, outerR = 88, innerR = 58

  const paths = segments.reduce<(DonutSegment & { start: number; end: number })[]>((acc, seg) => {
    const start = acc.length > 0 ? acc[acc.length - 1].end : 0
    const end = start + (seg.value / total) * 360
    return [...acc, { ...seg, start, end }]
  }, [])

  const totalFormatted = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(total)

  return (
    <div style={{
      background: colors.bgCard,
      border: `1px solid ${colors.border}`,
      borderRadius: '14px',
      padding: '22px 24px',
      minWidth: '220px',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
    }}>
      <div style={{ fontSize: '16px', fontWeight: 600, color: colors.textPrimary, marginBottom: '20px' }}>
        Despesas por Categoria
      </div>

      {segments.length === 0 ? (
        <div style={{ fontSize: '12px', color: colors.textMuted, textAlign: 'center', padding: '24px 0' }}>
          Nenhuma despesa registrada
        </div>
      ) : (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flex: 1 }}>
          <div style={{ flexShrink: 0, width: '64%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <svg width={228} height={228} viewBox="0 0 228 228">
              {paths.map((seg, i) => (
                <path
                  key={i}
                  d={segmentPath(cx, cy, outerR, innerR, seg.start, seg.end)}
                  fill={seg.color}
                  stroke={colors.bgCard}
                  strokeWidth={3}
                />
              ))}
              <text x={cx} y={cy - 12} textAnchor="middle" fontSize="14" fill={colors.textSecondary}>Total</text>
              <text x={cx} y={cy + 20} textAnchor="middle" fontSize="20" fontWeight="700" fill={colors.textPrimary}>
                {totalFormatted}
              </text>
            </svg>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', flex: 1, minWidth: 0, justifyContent: 'center' }}>
            {segments.map((seg) => (
              <div key={seg.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: 0 }}>
                  <div style={{ width: '11px', height: '11px', borderRadius: '50%', background: seg.color, flexShrink: 0 }} />
                  <span style={{ fontSize: '13px', color: colors.textSecondary, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{seg.label}</span>
                </div>
                <span style={{ fontSize: '14px', color: colors.textPrimary, fontWeight: 600, flexShrink: 0 }}>
                  {formatLegendValue(seg.value)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
