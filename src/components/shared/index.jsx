// ─── Shared UI Components ─────────────────────────────────────────────────────
import { T, riskColor } from '../../theme'

// ─── Badge ────────────────────────────────────────────────────────────────────
export function Badge({ label, color = T.amber }) {
  return (
    <span style={{
      display: 'inline-block',
      padding: '2px 7px',
      borderRadius: 3,
      fontSize: 10,
      fontFamily: T.font,
      fontWeight: 600,
      letterSpacing: '0.05em',
      color,
      background: color + '22',
      border: `1px solid ${color}44`,
      whiteSpace: 'nowrap',
    }}>
      {label}
    </span>
  )
}

// ─── RiskBar ──────────────────────────────────────────────────────────────────
export function RiskBar({ score, width = 80 }) {
  const color = riskColor(score)
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <div style={{ width, height: 4, background: T.border, borderRadius: 2, overflow: 'hidden' }}>
        <div style={{ width: `${score * 100}%`, height: '100%', background: color, borderRadius: 2 }} />
      </div>
      <span style={{ fontSize: 11, fontFamily: T.font, color, minWidth: 32 }}>
        {(score * 100).toFixed(0)}%
      </span>
    </div>
  )
}

// ─── StatCard ─────────────────────────────────────────────────────────────────
export function StatCard({ label, value, sub, accent = T.amber }) {
  return (
    <div style={{
      background: T.card,
      border: `1px solid ${T.border}`,
      borderRadius: 8,
      padding: '14px 18px',
      flex: 1,
      minWidth: 130,
    }}>
      <div style={{
        fontSize: 10, color: T.sub, fontFamily: T.font,
        letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6,
      }}>
        {label}
      </div>
      <div style={{
        fontSize: 24, fontWeight: 700, fontFamily: T.fontDisplay,
        color: accent, lineHeight: 1,
      }}>
        {value}
      </div>
      {sub && (
        <div style={{ fontSize: 10, color: T.muted, fontFamily: T.font, marginTop: 4 }}>
          {sub}
        </div>
      )}
    </div>
  )
}

// ─── Spinner ──────────────────────────────────────────────────────────────────
export function Spinner({ label = 'Generating AI report…' }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: T.amber, fontFamily: T.font, fontSize: 12 }}>
      <div style={{
        width: 14, height: 14,
        border: `2px solid ${T.amberFade}`,
        borderTopColor: T.amber,
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
      }} />
      {label}
    </div>
  )
}

// ─── AI Report Panel ──────────────────────────────────────────────────────────
export function AIPanel({ title, report, loading, placeholder, children }) {
  return (
    <div style={{
      flex: 1,
      background: T.card,
      border: `1px solid ${T.border}`,
      borderRadius: 8,
      padding: 16,
      display: 'flex',
      flexDirection: 'column',
      gap: 12,
      minWidth: 260,
    }}>
      <div style={{
        fontSize: 11, color: T.sub, fontFamily: T.font,
        textTransform: 'uppercase', letterSpacing: '0.08em',
      }}>
        {title}
      </div>

      {children}

      {loading && <Spinner />}

      {report ? (
        <div style={{
          flex: 1, overflowY: 'auto',
          background: T.surface, borderRadius: 6,
          padding: 12, border: `1px solid ${T.border}`,
        }}>
          <div style={{
            fontSize: 10, color: T.muted, fontFamily: T.font,
            marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.08em',
          }}>
            AI-Generated Report
          </div>
          <div style={{
            fontSize: 11, color: T.text, fontFamily: T.font,
            lineHeight: 1.8, whiteSpace: 'pre-wrap',
          }}>
            {report}
          </div>
        </div>
      ) : (
        !loading && (
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flex: 1, color: T.muted, fontSize: 11, fontFamily: T.font,
            textAlign: 'center', padding: 20, lineHeight: 1.7,
          }}>
            {placeholder}
          </div>
        )
      )}
    </div>
  )
}

// ─── Action Button ────────────────────────────────────────────────────────────
export function ActionButton({ onClick, disabled, loading, color = T.amber, children }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      style={{
        padding: '9px 14px',
        borderRadius: 5,
        border: `1px solid ${color}`,
        background: loading || disabled ? T.surface : color + '22',
        color: loading || disabled ? T.muted : color,
        fontSize: 11,
        fontFamily: T.font,
        fontWeight: 600,
        cursor: loading || disabled ? 'not-allowed' : 'pointer',
        letterSpacing: '0.05em',
        textTransform: 'uppercase',
        transition: 'all 0.15s',
      }}
    >
      {children}
    </button>
  )
}

// ─── Section Header ───────────────────────────────────────────────────────────
export function SectionHeader({ children }) {
  return (
    <div style={{
      fontSize: 11, color: T.sub, fontFamily: T.font,
      textTransform: 'uppercase', letterSpacing: '0.08em',
      marginBottom: 2,
    }}>
      {children}
    </div>
  )
}

// ─── Card ─────────────────────────────────────────────────────────────────────
export function Card({ children, style = {}, accentColor }) {
  return (
    <div style={{
      background: T.card,
      border: `1px solid ${accentColor ? accentColor + '33' : T.border}`,
      borderLeft: accentColor ? `3px solid ${accentColor}` : undefined,
      borderRadius: 8,
      ...style,
    }}>
      {children}
    </div>
  )
}

// ─── Table Wrapper ────────────────────────────────────────────────────────────
export function DataTable({ headers, children, maxHeight = 300 }) {
  return (
    <div style={{ overflowY: 'auto', maxHeight }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11, fontFamily: T.font }}>
        <thead style={{ position: 'sticky', top: 0, background: T.surface }}>
          <tr>
            {headers.map(h => (
              <th key={h} style={{
                padding: '7px 10px',
                textAlign: 'left',
                color: T.muted,
                fontWeight: 600,
                letterSpacing: '0.05em',
                borderBottom: `1px solid ${T.border}`,
                whiteSpace: 'nowrap',
              }}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  )
}

export function TableRow({ children, selected, color = T.amber, onClick, striped }) {
  return (
    <tr
      onClick={onClick}
      style={{
        background: selected
          ? '#2a334744'
          : striped ? T.surface + '66' : 'transparent',
        cursor: onClick ? 'pointer' : 'default',
        borderLeft: selected ? `2px solid ${color}` : '2px solid transparent',
        transition: 'background 0.1s',
      }}
    >
      {children}
    </tr>
  )
}

export function Td({ children, color = T.text, style = {} }) {
  return (
    <td style={{ padding: '6px 10px', color, ...style }}>
      {children}
    </td>
  )
}
