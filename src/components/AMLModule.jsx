// ─── Module 1: AML Transaction Monitor ───────────────────────────────────────
import { useState } from 'react'
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts'
import { T, riskColor, statusColor } from '../theme'
import { callClaude, buildSARPrompt } from '../api/claude'
import { useApiKey } from '../hooks/useApiKey'
import {
  Badge, RiskBar, StatCard, Spinner, ActionButton, DataTable, TableRow, Td,
} from './shared'
import { TRANSACTIONS, TX_VOLUME_DATA, TYPOLOGY_DATA } from '../data/synthetic'

const TYPOLOGY_COLORS = [T.amber, T.blue, T.cyan, T.purple, T.red]

export default function AMLModule() {
  const [selected, setSelected] = useState(null)
  const [sarText, setSarText] = useState('')
  const [loading, setLoading] = useState(false)
  const [filter, setFilter] = useState('ALL')
  const { apiKey } = useApiKey()

  const filtered = filter === 'ALL'
    ? TRANSACTIONS
    : TRANSACTIONS.filter(t => t.status === filter)

  const alertCount = TRANSACTIONS.filter(t => t.status === 'ALERT').length
  const reviewCount = TRANSACTIONS.filter(t => t.status === 'REVIEW').length
  const totalVol = TRANSACTIONS.reduce((s, t) => s + t.amount, 0)

  async function generateSAR() {
    if (!selected) return
    setLoading(true)
    setSarText('')
    const text = await callClaude(buildSARPrompt(selected), 'aml', apiKey)
    setSarText(text)
    setLoading(false)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Stats Row */}
      <div style={{ display: 'flex', gap: 12 }}>
        <StatCard label="Transactions" value={TRANSACTIONS.length} sub="Last 7 days" accent={T.blue} />
        <StatCard label="SAR Alerts" value={alertCount} sub="Filing required" accent={T.red} />
        <StatCard label="Under Review" value={reviewCount} sub="EDD required" accent={T.amber} />
        <StatCard label="Volume" value={`$${(totalVol / 1e6).toFixed(1)}M`} sub="Monitored period" accent={T.cyan} />
      </div>

      {/* Charts Row */}
      <div style={{ display: 'flex', gap: 12 }}>
        <div style={{ flex: 2, background: T.card, border: `1px solid ${T.border}`, borderRadius: 8, padding: 16 }}>
          <div style={{ fontSize: 11, color: T.sub, fontFamily: T.font, marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Transaction Volume — 30 Days
          </div>
          <ResponsiveContainer width="100%" height={130}>
            <AreaChart data={TX_VOLUME_DATA}>
              <defs>
                <linearGradient id="vg" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={T.blue} stopOpacity={0.35} />
                  <stop offset="95%" stopColor={T.blue} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={T.border} />
              <XAxis dataKey="day" tick={{ fill: T.muted, fontSize: 9, fontFamily: T.font }} interval={4} />
              <YAxis tick={{ fill: T.muted, fontSize: 9, fontFamily: T.font }} tickFormatter={v => `$${(v / 1e6).toFixed(1)}M`} />
              <Tooltip
                contentStyle={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 4, fontFamily: T.font, fontSize: 11 }}
                labelStyle={{ color: T.sub }}
                itemStyle={{ color: T.blue }}
              />
              <Area type="monotone" dataKey="volume" stroke={T.blue} fill="url(#vg)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div style={{ flex: 1, background: T.card, border: `1px solid ${T.border}`, borderRadius: 8, padding: 16 }}>
          <div style={{ fontSize: 11, color: T.sub, fontFamily: T.font, marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Typology Breakdown
          </div>
          <ResponsiveContainer width="100%" height={130}>
            <BarChart data={TYPOLOGY_DATA} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke={T.border} horizontal={false} />
              <XAxis type="number" tick={{ fill: T.muted, fontSize: 9, fontFamily: T.font }} />
              <YAxis dataKey="name" type="category" tick={{ fill: T.sub, fontSize: 9, fontFamily: T.font }} width={68} />
              <Tooltip contentStyle={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 4, fontFamily: T.font, fontSize: 11 }} />
              <Bar dataKey="count" radius={[0, 3, 3, 0]}>
                {TYPOLOGY_DATA.map((_, i) => <Cell key={i} fill={TYPOLOGY_COLORS[i]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Table + SAR Panel */}
      <div style={{ display: 'flex', gap: 12 }}>
        <div style={{ flex: 2, background: T.card, border: `1px solid ${T.border}`, borderRadius: 8, overflow: 'hidden' }}>
          {/* Filter Bar */}
          <div style={{ display: 'flex', alignItems: 'center', padding: '9px 14px', borderBottom: `1px solid ${T.border}`, gap: 8 }}>
            <span style={{ fontSize: 10, color: T.sub, fontFamily: T.font, textTransform: 'uppercase', letterSpacing: '0.08em', marginRight: 4 }}>Filter:</span>
            {['ALL', 'ALERT', 'REVIEW', 'CLEAR'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                style={{
                  padding: '3px 10px', borderRadius: 3, fontSize: 10,
                  fontFamily: T.font, fontWeight: 600,
                  border: `1px solid ${filter === f ? (statusColor[f] || T.amber) : T.border}`,
                  background: filter === f ? (statusColor[f] || T.amber) + '22' : 'transparent',
                  color: filter === f ? (statusColor[f] || T.amber) : T.muted,
                  cursor: 'pointer',
                }}
              >
                {f}
              </button>
            ))}
            <span style={{ marginLeft: 'auto', fontSize: 10, color: T.muted, fontFamily: T.font }}>
              {filtered.length} records
            </span>
          </div>

          <DataTable
            maxHeight={300}
            headers={['ID', 'Time', 'From → To', 'Amount', 'Countries', 'Risk', 'Flags', 'Status']}
          >
            {filtered.map((t, i) => (
              <TableRow
                key={t.id}
                selected={selected?.id === t.id}
                striped={i % 2 !== 0}
                onClick={() => setSelected(t)}
              >
                <Td color={T.amber}>{t.id}</Td>
                <Td color={T.sub} style={{ whiteSpace: 'nowrap' }}>{t.tsStr.substr(5, 14)}</Td>
                <Td style={{ maxWidth: 150 }}>
                  <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: T.text }}>{t.from}</div>
                  <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: T.muted }}>→ {t.to}</div>
                </Td>
                <Td color={T.text} style={{ whiteSpace: 'nowrap' }}>
                  {t.currency} {t.amount >= 1e6 ? `${(t.amount / 1e6).toFixed(1)}M` : t.amount >= 1000 ? `${(t.amount / 1000).toFixed(0)}K` : t.amount.toFixed(0)}
                </Td>
                <Td color={T.sub}>{t.fromCountry}→{t.toCountry}</Td>
                <Td><RiskBar score={t.riskScore} width={55} /></Td>
                <Td>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                    {t.flags.slice(0, 2).map(f => <Badge key={f} label={f} color={T.amber} />)}
                    {t.flags.length > 2 && <Badge label={`+${t.flags.length - 2}`} color={T.muted} />}
                  </div>
                </Td>
                <Td><Badge label={t.status} color={statusColor[t.status]} /></Td>
              </TableRow>
            ))}
          </DataTable>
        </div>

        {/* SAR Panel */}
        <div style={{
          flex: 1, background: T.card, border: `1px solid ${T.border}`,
          borderRadius: 8, padding: 16, display: 'flex',
          flexDirection: 'column', gap: 12, minWidth: 260,
        }}>
          <div style={{ fontSize: 11, color: T.sub, fontFamily: T.font, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            SAR Generator
          </div>

          {selected ? (
            <>
              <div style={{ background: T.surface, borderRadius: 6, padding: 12, border: `1px solid ${T.border}` }}>
                <div style={{ fontSize: 12, color: T.amber, fontFamily: T.font, fontWeight: 600, marginBottom: 6 }}>{selected.id}</div>
                <div style={{ fontSize: 11, color: T.sub, fontFamily: T.font, lineHeight: 1.7 }}>
                  <div>{selected.from} → {selected.to}</div>
                  <div>{selected.currency} {selected.amount.toLocaleString()}</div>
                  <div>{selected.fromCountry} → {selected.toCountry}</div>
                  <div style={{ marginTop: 4, display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                    {selected.flags.map(f => <Badge key={f} label={f} color={T.amber} />)}
                  </div>
                </div>
              </div>

              <ActionButton onClick={generateSAR} loading={loading} color={T.amber}>
                {loading ? '⚙ Generating…' : '⚡ Generate SAR Draft'}
              </ActionButton>

              {loading && <Spinner />}

              {sarText && (
                <div style={{ flex: 1, overflowY: 'auto', background: T.surface, borderRadius: 6, padding: 10, border: `1px solid ${T.border}` }}>
                  <div style={{ fontSize: 10, color: T.muted, fontFamily: T.font, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    SAR Narrative
                  </div>
                  <div style={{ fontSize: 11, color: T.text, fontFamily: T.font, lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>
                    {sarText}
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
              Select a transaction from the table to generate a SAR narrative
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
