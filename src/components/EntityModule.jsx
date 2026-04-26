// ─── Module 4: Entity Resolution & Link Analysis ──────────────────────────────
import { useState } from 'react'
import { T, riskColor } from '../theme'
import { callClaude, buildEntityPrompt } from '../api/claude'
import { useApiKey } from '../hooks/useApiKey'
import { Badge, RiskBar, StatCard, Spinner, ActionButton } from './shared'
import { ENTITIES, ENTITY_EDGES } from '../data/synthetic'

const ICONS = { person: '👤', company: '🏢', account: '💳', wallet: '₿' }
const COLORS = { person: T.blue, company: T.amber, account: T.green, wallet: T.cyan }

export default function EntityModule() {
  const [selected, setSelected] = useState(null)
  const [report, setReport] = useState('')
  const [loading, setLoading] = useState(false)
  const { apiKey } = useApiKey()

  const connEdges = selected
    ? ENTITY_EDGES.filter(e => e.from === selected.id || e.to === selected.id)
    : []
  const connEnts = connEdges.map(e => ({
    ent: ENTITIES[e.from === selected?.id ? e.to : e.from],
    edge: e,
  }))

  async function generateProfile() {
    if (!selected) return
    setLoading(true)
    setReport('')
    const text = await callClaude(buildEntityPrompt(selected, connEnts), 'entity', apiKey)
    setReport(text)
    setLoading(false)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Stats */}
      <div style={{ display: 'flex', gap: 12 }}>
        <StatCard label="Entities" value={ENTITIES.length} sub="Under investigation" accent={T.blue} />
        <StatCard label="Relationships" value={ENTITY_EDGES.length} sub="Mapped connections" accent={T.amber} />
        <StatCard label="High Risk" value={ENTITIES.filter(e => e.risk > 0.75).length} sub="Flagged entities" accent={T.red} />
        <StatCard label="Shell Structures" value="2" sub="Detected layering" accent={T.cyan} />
      </div>

      {/* Graph + Intel Panel */}
      <div style={{ display: 'flex', gap: 12 }}>
        {/* Link Analysis Graph */}
        <div style={{ flex: 2, background: T.card, border: `1px solid ${T.border}`, borderRadius: 8, padding: 16 }}>
          <div style={{ fontSize: 11, color: T.sub, fontFamily: T.font, marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Entity Link Analysis — Click to profile
          </div>
          <svg viewBox="0 0 860 450" style={{ width: '100%', background: T.surface, borderRadius: 6, maxHeight: 440 }}>
            <defs>
              <pattern id="entitygrid" width="28" height="28" patternUnits="userSpaceOnUse">
                <path d="M 28 0 L 0 0 0 28" fill="none" stroke={T.border} strokeWidth="0.4" opacity="0.5" />
              </pattern>
              <marker id="earr" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
                <path d="M 0 0 L 6 3 L 0 6 z" fill={T.muted} opacity="0.5" />
              </marker>
              <filter id="glow">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            <rect width="860" height="450" fill="url(#entitygrid)" />

            {/* Edges */}
            {ENTITY_EDGES.map((edge, i) => {
              const f = ENTITIES[edge.from], t = ENTITIES[edge.to]
              const isHighlighted = selected && (edge.from === selected.id || edge.to === selected.id)
              const ec = isHighlighted ? T.amber : T.muted
              const mx = (f.x + t.x) / 2, my = (f.y + t.y) / 2
              return (
                <g key={i}>
                  <line
                    x1={f.x} y1={f.y} x2={t.x} y2={t.y}
                    stroke={ec} strokeWidth={isHighlighted ? 2 : 1}
                    strokeOpacity={isHighlighted ? 0.9 : 0.2}
                    markerEnd="url(#earr)"
                  />
                  {isHighlighted && (
                    <text x={mx} y={my - 7} fill={T.amber} fontSize={9} fontFamily={T.font} textAnchor="middle">
                      {edge.label}
                    </text>
                  )}
                </g>
              )
            })}

            {/* Nodes */}
            {ENTITIES.map(ent => {
              const isSel = selected?.id === ent.id
              const isConn = selected && connEnts.some(c => c.ent.id === ent.id)
              const nc = COLORS[ent.type]
              const r = isSel ? 23 : 17
              const opacity = isSel || isConn || !selected ? 1 : 0.3

              return (
                <g key={ent.id} onClick={() => setSelected(ent)} style={{ cursor: 'pointer' }} opacity={opacity}>
                  {isSel && (
                    <circle cx={ent.x} cy={ent.y} r={r + 9} fill="none"
                      stroke={T.amber} strokeWidth={1.5} strokeDasharray="4,2" opacity={0.6} />
                  )}
                  <circle
                    cx={ent.x} cy={ent.y} r={r}
                    fill={nc + '22'} stroke={nc}
                    strokeWidth={isSel ? 2.5 : isConn ? 2 : 1.5}
                  />
                  <text x={ent.x} y={ent.y + 5} fill={T.text} fontSize={isSel ? 16 : 12} textAnchor="middle">
                    {ICONS[ent.type]}
                  </text>
                  <text x={ent.x} y={ent.y + r + 14} fill={isSel ? T.amber : nc}
                    fontSize={9} fontFamily={T.font} textAnchor="middle" fontWeight={isSel ? 700 : 400}>
                    {ent.label.length > 16 ? ent.label.substr(0, 16) + '…' : ent.label}
                  </text>
                  <text x={ent.x} y={ent.y + r + 24} fill={T.muted} fontSize={8} fontFamily={T.font} textAnchor="middle">
                    {ent.detail}
                  </text>
                  {/* Risk dot */}
                  <circle cx={ent.x + r * 0.7} cy={ent.y - r * 0.7} r={4}
                    fill={riskColor(ent.risk)} stroke={T.surface} strokeWidth={1} />
                </g>
              )
            })}

            {/* Legend */}
            <g transform="translate(10,435)">
              {Object.entries(ICONS).map(([type, icon], i) => (
                <g key={type} transform={`translate(${i * 120}, 0)`}>
                  <circle cx={8} cy={-4} r={8} fill={COLORS[type] + '22'} stroke={COLORS[type]} strokeWidth={1.5} />
                  <text x={8} y={0} fill={T.text} fontSize={9} textAnchor="middle">{icon}</text>
                  <text x={22} y={0} fill={T.muted} fontSize={9} fontFamily={T.font}>{type}</text>
                </g>
              ))}
            </g>
          </svg>
        </div>

        {/* Entity Intelligence Panel */}
        <div style={{
          flex: 1, background: T.card, border: `1px solid ${T.border}`,
          borderRadius: 8, padding: 16, display: 'flex',
          flexDirection: 'column', gap: 12, minWidth: 256,
        }}>
          <div style={{ fontSize: 11, color: T.sub, fontFamily: T.font, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Entity Intelligence
          </div>

          {selected ? (
            <>
              <div style={{
                background: T.surface, borderRadius: 6, padding: 12,
                border: `1px solid ${COLORS[selected.type]}44`,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <span style={{ fontSize: 20 }}>{ICONS[selected.type]}</span>
                  <div>
                    <div style={{ fontSize: 13, color: T.text, fontFamily: T.font, fontWeight: 600 }}>
                      {selected.label}
                    </div>
                    <div style={{ fontSize: 10, color: COLORS[selected.type], fontFamily: T.font, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                      {selected.type}
                    </div>
                  </div>
                </div>
                <div style={{ fontSize: 11, color: T.sub, fontFamily: T.font, marginBottom: 8 }}>
                  {selected.detail}
                </div>
                <RiskBar score={selected.risk} width={110} />
              </div>

              {connEnts.length > 0 && (
                <>
                  <div style={{ fontSize: 10, color: T.muted, fontFamily: T.font, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Connections ({connEdges.length})
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4, maxHeight: 180, overflowY: 'auto' }}>
                    {connEnts.map((c, i) => (
                      <div key={i} style={{
                        padding: '6px 10px', background: T.surface,
                        borderRadius: 4, border: `1px solid ${T.border}`,
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      }}>
                        <span style={{ fontSize: 13 }}>{ICONS[c.ent.type]}</span>
                        <span style={{ fontSize: 11, color: T.text, fontFamily: T.font, flex: 1, marginLeft: 6 }}>
                          {c.ent.label}
                        </span>
                        <Badge label={c.edge.label} color={T.sub} />
                      </div>
                    ))}
                  </div>
                </>
              )}

              <ActionButton onClick={generateProfile} loading={loading} color={T.purple}>
                {loading ? '⚙ Profiling…' : '🕸 Generate Profile'}
              </ActionButton>

              {loading && <Spinner label="Building intelligence profile…" />}

              {report && (
                <div style={{ flex: 1, overflowY: 'auto', background: T.surface, borderRadius: 6, padding: 10, border: `1px solid ${T.border}` }}>
                  <div style={{ fontSize: 11, color: T.text, fontFamily: T.font, lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>
                    {report}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flex: 1, color: T.muted, fontSize: 11, fontFamily: T.font,
              textAlign: 'center', lineHeight: 1.7,
            }}>
              Click an entity in the graph to view intelligence profile and generate reports
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
