// ─── Module 2: Fraud Detection ────────────────────────────────────────────────
import { useState } from 'react'
import {
  AreaChart, Area, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import { T, riskColor, statusColor } from '../theme'
import { callClaude, buildFraudPrompt } from '../api/claude'
import { useApiKey } from '../hooks/useApiKey'
import {
  Badge, RiskBar, StatCard, Spinner, ActionButton, DataTable, TableRow, Td,
} from './shared'
import { FRAUD_ACCOUNTS, FRAUD_TREND } from '../data/synthetic'

export default function FraudModule() {
  const [selected, setSelected] = useState(null)
  const [report, setReport] = useState('')
  const [loading, setLoading] = useState(false)
  const { apiKey } = useApiKey()

  const highRisk = FRAUD_ACCOUNTS.filter(a => a.status === 'HIGH_RISK').length
  const mules = FRAUD_ACCOUNTS.filter(a => a.flags.includes('Mule Account')).length
  const avgScore = FRAUD_ACCOUNTS.reduce((s, a) => s + a.fraudProb, 0) / FRAUD_ACCOUNTS.length

  async function analyzeAccount() {
    if (!selected) return
    setLoading(true)
    setReport('')
    const text = await callClaude(buildFraudPrompt(selected), 'fraud', apiKey)
    setReport(text)
    setLoading(false)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Stats */}
      <div style={{ display: 'flex', gap: 12 }}>
        <StatCard label="Monitored Accounts" value={FRAUD_ACCOUNTS.length} sub="Active profiles" accent={T.blue} />
        <StatCard label="High Risk" value={highRisk} sub="Immediate action" accent={T.red} />
        <StatCard label="Mule Suspects" value={mules} sub="Money mule indicators" accent={T.amber} />
        <StatCard label="Avg Fraud Score" value={`${(avgScore * 100).toFixed(0)}%`} sub="Portfolio risk" accent={T.cyan} />
      </div>

      {/* 24h Timeline */}
      <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 8, padding: 16 }}>
        <div style={{ fontSize: 11, color: T.sub, fontFamily: T.font, marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          Fraud Attempts vs Blocked — 24h Timeline
        </div>
        <ResponsiveContainer width="100%" height={120}>
          <AreaChart data={FRAUD_TREND}>
            <defs>
              <linearGradient id="fa" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={T.red} stopOpacity={0.3} />
                <stop offset="95%" stopColor={T.red} stopOpacity={0} />
              </linearGradient>
              <linearGradient id="fb" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={T.green} stopOpacity={0.3} />
                <stop offset="95%" stopColor={T.green} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={T.border} />
            <XAxis dataKey="hour" tick={{ fill: T.muted, fontSize: 9, fontFamily: T.font }} interval={3} />
            <YAxis tick={{ fill: T.muted, fontSize: 9, fontFamily: T.font }} />
            <Tooltip
              contentStyle={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 4, fontFamily: T.font, fontSize: 11 }}
            />
            <Area type="monotone" dataKey="attempts" stroke={T.red} fill="url(#fa)" strokeWidth={2} name="Attempts" />
            <Area type="monotone" dataKey="blocked" stroke={T.green} fill="url(#fb)" strokeWidth={2} name="Blocked" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Table + Analysis */}
      <div style={{ display: 'flex', gap: 12 }}>
        <div style={{ flex: 2, background: T.card, border: `1px solid ${T.border}`, borderRadius: 8, overflow: 'hidden' }}>
          <DataTable
            maxHeight={320}
            headers={['Account', 'Name', 'Cntry', 'Devices', 'Tx/24h', 'Velocity', 'Fraud Score', 'Flags', 'Risk']}
          >
            {FRAUD_ACCOUNTS.map((a, i) => (
              <TableRow
                key={a.id}
                selected={selected?.id === a.id}
                striped={i % 2 !== 0}
                onClick={() => setSelected(a)}
                color={riskColor(a.fraudProb)}
              >
                <Td color={T.amber}>{a.id}</Td>
                <Td color={T.text} style={{ whiteSpace: 'nowrap' }}>{a.name}</Td>
                <Td color={T.sub}>{a.country}</Td>
                <Td color={a.deviceCount > 5 ? T.red : T.sub}>{a.deviceCount}</Td>
                <Td color={a.txCount24h > 40 ? T.red : T.sub}>{a.txCount24h}</Td>
                <Td><RiskBar score={a.velocityScore} width={50} /></Td>
                <Td><RiskBar score={a.fraudProb} width={50} /></Td>
                <Td>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                    {a.flags.slice(0, 2).map(f => <Badge key={f} label={f} color={riskColor(a.fraudProb)} />)}
                  </div>
                </Td>
                <Td><Badge label={a.status.replace('_', ' ')} color={statusColor[a.status]} /></Td>
              </TableRow>
            ))}
          </DataTable>
        </div>

        {/* Analysis Panel */}
        <div style={{
          flex: 1, background: T.card, border: `1px solid ${T.border}`,
          borderRadius: 8, padding: 16, display: 'flex',
          flexDirection: 'column', gap: 12, minWidth: 260,
        }}>
          <div style={{ fontSize: 11, color: T.sub, fontFamily: T.font, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            AI Fraud Analysis
          </div>

          {selected ? (
            <>
              <div style={{ background: T.surface, borderRadius: 6, padding: 12, border: `1px solid ${riskColor(selected.fraudProb)}44` }}>
                <div style={{ fontSize: 13, color: riskColor(selected.fraudProb), fontFamily: T.font, fontWeight: 600, marginBottom: 6 }}>
                  {selected.name}
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3, marginBottom: 8 }}>
                  {selected.flags.map(f => <Badge key={f} label={f} color={riskColor(selected.fraudProb)} />)}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                  {[
                    ['Velocity', selected.velocityScore],
                    ['IP Anomaly', selected.ipAnomalyScore],
                    ['Behavioral', selected.behavScore],
                    ['Fraud Prob', selected.fraudProb],
                  ].map(([label, val]) => (
                    <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontSize: 10, color: T.muted, fontFamily: T.font, minWidth: 68 }}>{label}</span>
                      <RiskBar score={val} width={80} />
                    </div>
                  ))}
                </div>
              </div>

              <ActionButton onClick={analyzeAccount} loading={loading} color={riskColor(selected.fraudProb)}>
                {loading ? '⚙ Analyzing…' : '🔍 Analyze Account'}
              </ActionButton>

              {loading && <Spinner />}

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
              Select an account to run AI fraud analysis
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
