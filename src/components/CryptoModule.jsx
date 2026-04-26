// ─── Module 3: Crypto Tracer ──────────────────────────────────────────────────
import { useState } from 'react'
import { T, riskColor, riskLabel } from '../theme'
import { callClaude, buildCryptoPrompt } from '../api/claude'
import { useApiKey } from '../hooks/useApiKey'
import {
  Badge, RiskBar, StatCard, Spinner, ActionButton, DataTable, TableRow, Td,
} from './shared'
import { BTC_WALLETS, CRYPTO_EDGES } from '../data/synthetic'

// Graph layout: center node + ring
const CX = 330, CY = 200, RADIUS = 148
const nodePositions = BTC_WALLETS.map((_, i) => {
  if (i === 0) return { x: CX, y: CY }
  const angle = ((i - 1) / (BTC_WALLETS.length - 1)) * 2 * Math.PI - Math.PI / 2
  return { x: CX + RADIUS * Math.cos(angle), y: CY + RADIUS * Math.sin(angle) }
})

export default function CryptoModule() {
  const [selected, setSelected] = useState(null)
  const [report, setReport] = useState('')
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const { apiKey } = useApiKey()

  const filtered = search
    ? BTC_WALLETS.filter(w =>
        w.addr.toLowerCase().includes(search.toLowerCase()) ||
        w.label.toLowerCase().includes(search.toLowerCase()) ||
        w.cluster.toLowerCase().includes(search.toLowerCase())
      )
    : BTC_WALLETS

  async function traceWallet() {
    if (!selected) return
    setLoading(true)
    setReport('')
    const wi = BTC_WALLETS.indexOf(selected)
    const edges = CRYPTO_EDGES.filter(e => e.from === wi || e.to === wi)
    const enrichedEdges = edges.map(e => ({
      ...e,
      cluster: BTC_WALLETS[e.from === wi ? e.to : e.from]?.cluster,
    }))
    const text = await callClaude(buildCryptoPrompt(selected, enrichedEdges), 'crypto', apiKey)
    setReport(text)
    setLoading(false)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Stats */}
      <div style={{ display: 'flex', gap: 12 }}>
        <StatCard label="Wallets Tracked" value={BTC_WALLETS.length} sub="Active monitoring" accent={T.blue} />
        <StatCard label="High Risk" value={BTC_WALLETS.filter(w => w.risk > 0.75).length} sub="Darknet/OFAC/Mixer" accent={T.red} />
        <StatCard label="Total BTC" value={BTC_WALLETS.reduce((s, w) => s + w.btc, 0).toFixed(0)} sub="Under investigation" accent={T.amber} />
        <StatCard label="Graph Edges" value={CRYPTO_EDGES.length} sub="Traced transactions" accent={T.cyan} />
      </div>

      {/* Graph + Inspector */}
      <div style={{ display: 'flex', gap: 12 }}>
        {/* Transaction Graph */}
        <div style={{ flex: 2, background: T.card, border: `1px solid ${T.border}`, borderRadius: 8, padding: 16 }}>
          <div style={{ fontSize: 11, color: T.sub, fontFamily: T.font, marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Transaction Graph — Click node to investigate
          </div>
          <svg viewBox="0 0 660 420" style={{ width: '100%', background: T.surface, borderRadius: 6 }}>
            <defs>
              <marker id="arr" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
                <path d="M 0 0 L 6 3 L 0 6 z" fill={T.muted} opacity="0.7" />
              </marker>
              <pattern id="dotgrid" width="20" height="20" patternUnits="userSpaceOnUse">
                <circle cx="10" cy="10" r="0.6" fill={T.border} />
              </pattern>
            </defs>
            <rect width="660" height="420" fill="url(#dotgrid)" />

            {/* Edges */}
            {CRYPTO_EDGES.map((edge, i) => {
              const f = nodePositions[edge.from], t = nodePositions[edge.to]
              const ec = edge.risk > 0.75 ? T.red : edge.risk > 0.45 ? T.amber : T.green
              const mx = (f.x + t.x) / 2, my = (f.y + t.y) / 2
              return (
                <g key={i}>
                  <line
                    x1={f.x} y1={f.y} x2={t.x} y2={t.y}
                    stroke={ec} strokeWidth={1.5} strokeOpacity={0.6}
                    strokeDasharray={edge.risk > 0.75 ? '5,2' : 'none'}
                    markerEnd="url(#arr)"
                  />
                  <text x={mx} y={my - 5} fill={ec} fontSize={8} fontFamily={T.font} textAnchor="middle" opacity={0.9}>
                    {edge.btc}₿
                  </text>
                </g>
              )
            })}

            {/* Nodes */}
            {BTC_WALLETS.map((w, i) => {
              const p = nodePositions[i], isSel = selected?.addr === w.addr
              const nc = riskColor(w.risk)
              const wi = BTC_WALLETS.indexOf(w)
              const isConnected = selected &&
                CRYPTO_EDGES.some(e => (e.from === wi || e.to === wi) &&
                  (e.from === BTC_WALLETS.indexOf(selected) || e.to === BTC_WALLETS.indexOf(selected)))

              return (
                <g key={i} onClick={() => setSelected(w)} style={{ cursor: 'pointer' }}>
                  {isSel && (
                    <circle cx={p.x} cy={p.y} r={24} fill="none" stroke={T.amber}
                      strokeWidth={1.5} strokeDasharray="4,2" opacity={0.7} />
                  )}
                  <circle
                    cx={p.x} cy={p.y} r={isSel ? 17 : 13}
                    fill={nc + '2a'} stroke={nc}
                    strokeWidth={isSel ? 2.5 : isConnected ? 2 : 1.5}
                    opacity={isSel || isConnected || !selected ? 1 : 0.3}
                  />
                  {w.risk > 0.75 && (
                    <circle cx={p.x} cy={p.y} r={isSel ? 22 : 18}
                      fill="none" stroke={nc} strokeWidth={1}
                      strokeOpacity={0.25} strokeDasharray="3,2" />
                  )}
                  <text x={p.x} y={p.y + 4} fill={T.text} fontSize={9}
                    fontFamily={T.font} textAnchor="middle" fontWeight={isSel ? 700 : 400}>
                    {w.btc >= 100 ? `${w.btc.toFixed(0)}₿` : `${w.btc.toFixed(1)}₿`}
                  </text>
                  <text x={p.x} y={p.y + (isSel ? 27 : 24)} fill={nc}
                    fontSize={8} fontFamily={T.font} textAnchor="middle">
                    {w.label.length > 13 ? w.label.substr(0, 13) + '…' : w.label}
                  </text>
                </g>
              )
            })}

            {/* Legend */}
            <g transform="translate(10,405)">
              {[[T.green, 'Low Risk'], [T.amber, 'Medium Risk'], [T.red, 'High Risk']].map(([c, l], i) => (
                <g key={i} transform={`translate(${i * 90}, 0)`}>
                  <circle cx={5} cy={-3} r={5} fill={c + '2a'} stroke={c} strokeWidth={1.5} />
                  <text x={14} y={0} fill={T.muted} fontSize={8} fontFamily={T.font}>{l}</text>
                </g>
              ))}
            </g>
          </svg>
        </div>

        {/* Wallet Inspector */}
        <div style={{
          flex: 1, background: T.card, border: `1px solid ${T.border}`,
          borderRadius: 8, padding: 16, display: 'flex',
          flexDirection: 'column', gap: 10, minWidth: 250,
        }}>
          <div style={{ fontSize: 11, color: T.sub, fontFamily: T.font, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Wallet Inspector
          </div>

          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search address, label, cluster…"
            style={{
              background: T.surface, border: `1px solid ${T.border}`,
              borderRadius: 5, padding: '7px 10px',
              color: T.text, fontSize: 11, fontFamily: T.font, outline: 'none',
            }}
          />

          <div style={{ overflowY: 'auto', maxHeight: 200, display: 'flex', flexDirection: 'column', gap: 4 }}>
            {filtered.map((w, i) => (
              <div
                key={i}
                onClick={() => setSelected(w)}
                style={{
                  padding: '8px 10px', borderRadius: 5,
                  border: `1px solid ${selected?.addr === w.addr ? riskColor(w.risk) + '88' : T.border}`,
                  background: selected?.addr === w.addr ? riskColor(w.risk) + '11' : T.surface,
                  cursor: 'pointer',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                  <span style={{ fontSize: 11, color: T.text, fontFamily: T.font, fontWeight: 600 }}>{w.label}</span>
                  <Badge label={`${(w.risk * 100).toFixed(0)}%`} color={riskColor(w.risk)} />
                </div>
                <div style={{ fontSize: 9, color: T.muted, fontFamily: T.font }}>{w.addr.substr(0, 20)}…</div>
                <div style={{ fontSize: 10, color: T.sub, fontFamily: T.font }}>{w.btc} BTC · {w.cluster}</div>
              </div>
            ))}
          </div>

          {selected && (
            <>
              <ActionButton onClick={traceWallet} loading={loading} color={T.cyan}>
                {loading ? '⚙ Tracing…' : '⛓ Trace & Report'}
              </ActionButton>
              {loading && <Spinner label="Tracing blockchain…" />}
              {report && (
                <div style={{ flex: 1, overflowY: 'auto', background: T.surface, borderRadius: 6, padding: 10, border: `1px solid ${T.border}` }}>
                  <div style={{ fontSize: 11, color: T.text, fontFamily: T.font, lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>
                    {report}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Wallet Risk Register */}
      <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 8, overflow: 'hidden' }}>
        <div style={{ padding: '9px 14px', borderBottom: `1px solid ${T.border}`, fontSize: 11, color: T.sub, fontFamily: T.font, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          Wallet Risk Register
        </div>
        <DataTable maxHeight={240} headers={['Address', 'Label', 'Cluster', 'Balance', 'Risk Score', 'Level']}>
          {BTC_WALLETS.map((w, i) => (
            <TableRow key={i} selected={selected?.addr === w.addr} striped={i % 2 !== 0} onClick={() => setSelected(w)}>
              <Td color={T.cyan} style={{ fontFamily: T.font }}>{w.addr.substr(0, 22)}…</Td>
              <Td color={T.text}>{w.label}</Td>
              <Td><Badge label={w.cluster} color={T.blue} /></Td>
              <Td color={T.amber}>{w.btc} BTC</Td>
              <Td><RiskBar score={w.risk} width={80} /></Td>
              <Td><Badge label={riskLabel(w.risk)} color={riskColor(w.risk)} /></Td>
            </TableRow>
          ))}
        </DataTable>
      </div>
    </div>
  )
}
