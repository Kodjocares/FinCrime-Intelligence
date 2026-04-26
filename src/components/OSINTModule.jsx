// ─── Module 5: OSINT Intelligence Enrichment ─────────────────────────────────
import { useState } from 'react'
import { T } from '../theme'
import { callClaude, buildOSINTPrompt } from '../api/claude'
import { useApiKey } from '../hooks/useApiKey'
import { Badge, StatCard, Spinner, ActionButton } from './shared'
import { SANCTIONS, PEPS, ADVERSE_NEWS } from '../data/synthetic'

const TABS = [
  { id: 'sanctions', label: 'Sanctions', color: T.red },
  { id: 'pep', label: 'PEP Database', color: T.amber },
  { id: 'news', label: 'Adverse Media', color: T.blue },
]

export default function OSINTModule() {
  const [query, setQuery] = useState('')
  const [report, setReport] = useState('')
  const [loading, setLoading] = useState(false)
  const [tab, setTab] = useState('sanctions')
  const { apiKey } = useApiKey()

  const q = query.toLowerCase()
  const filteredSanctions = q ? SANCTIONS.filter(s => s.name.toLowerCase().includes(q)) : SANCTIONS
  const filteredPEPs = q ? PEPS.filter(p => p.name.toLowerCase().includes(q)) : PEPS
  const filteredNews = q ? ADVERSE_NEWS.filter(n => n.entity.toLowerCase().includes(q)) : ADVERSE_NEWS

  async function enrichAndReport() {
    if (!query.trim()) return
    setLoading(true)
    setReport('')
    const text = await callClaude(
      buildOSINTPrompt(query, filteredSanctions, filteredPEPs, filteredNews),
      'osint',
      apiKey
    )
    setReport(text)
    setLoading(false)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') enrichAndReport()
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Stats */}
      <div style={{ display: 'flex', gap: 12 }}>
        <StatCard label="Sanctions Hits" value={SANCTIONS.length} sub="Active list matches" accent={T.red} />
        <StatCard label="PEP Matches" value={PEPS.length} sub="Politically exposed" accent={T.amber} />
        <StatCard label="Adverse Media" value={ADVERSE_NEWS.length} sub="Negative mentions" accent={T.blue} />
        <StatCard label="Lists Monitored" value="47" sub="OFAC, UN, EU, FATF…" accent={T.cyan} />
      </div>

      {/* Search Bar */}
      <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 8, padding: 16 }}>
        <div style={{ fontSize: 11, color: T.sub, fontFamily: T.font, marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          OSINT Search & AI Enrichment Engine
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search name, entity, company (e.g. 'Ahmad Hassan', 'Nexus Holdings')…"
            style={{
              flex: 1, background: T.surface, border: `1px solid ${T.border}`,
              borderRadius: 5, padding: '9px 12px',
              color: T.text, fontSize: 12, fontFamily: T.font, outline: 'none',
            }}
          />
          <ActionButton
            onClick={enrichAndReport}
            disabled={!query.trim()}
            loading={loading}
            color={T.amber}
          >
            {loading ? '⚙ Enriching…' : '🔎 Enrich & Report'}
          </ActionButton>
        </div>
        <div style={{ fontSize: 10, color: T.muted, fontFamily: T.font, marginTop: 8 }}>
          Try: "Ahmad Hassan" · "Nexus Holdings" · "Dmitri Volkov" · "Global Trade"
        </div>
      </div>

      {/* Results + Report */}
      <div style={{ display: 'flex', gap: 12 }}>
        {/* Tab Panel */}
        <div style={{ flex: 2, background: T.card, border: `1px solid ${T.border}`, borderRadius: 8, overflow: 'hidden' }}>
          {/* Tabs */}
          <div style={{ display: 'flex', borderBottom: `1px solid ${T.border}` }}>
            {TABS.map(t => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                style={{
                  flex: 1, padding: '10px 16px', border: 'none',
                  borderBottom: tab === t.id ? `2px solid ${t.color}` : '2px solid transparent',
                  background: 'transparent',
                  color: tab === t.id ? t.color : T.muted,
                  fontSize: 12, fontFamily: T.font, fontWeight: 600,
                  cursor: 'pointer', letterSpacing: '0.05em',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                }}
              >
                {t.label}
                <span style={{
                  background: t.color + '22', color: t.color,
                  borderRadius: 10, padding: '0 6px', fontSize: 10,
                }}>
                  {t.id === 'sanctions' ? filteredSanctions.length
                    : t.id === 'pep' ? filteredPEPs.length
                    : filteredNews.length}
                </span>
              </button>
            ))}
          </div>

          <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 10, overflowY: 'auto', maxHeight: 360 }}>
            {/* Sanctions */}
            {tab === 'sanctions' && (
              filteredSanctions.length === 0
                ? <EmptyState label="No sanctions matches" />
                : filteredSanctions.map((s, i) => (
                  <div key={i} style={{
                    background: T.surface, borderRadius: 6, padding: 14,
                    border: `1px solid ${T.red}33`, borderLeft: `3px solid ${T.red}`,
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                      <div>
                        <div style={{ fontSize: 14, color: T.text, fontFamily: T.font, fontWeight: 600 }}>{s.name}</div>
                        <div style={{ fontSize: 11, color: T.red, fontFamily: T.font }}>⚠ {s.list}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: 22, fontWeight: 700, color: T.red, fontFamily: T.fontDisplay, lineHeight: 1 }}>{s.score}%</div>
                        <div style={{ fontSize: 10, color: T.muted, fontFamily: T.font }}>Match Score</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 16, fontSize: 11, color: T.sub, fontFamily: T.font, flexWrap: 'wrap' }}>
                      <span>DOB: {s.dob}</span>
                      <span>Nationality: {s.nat}</span>
                      <span>Reason: <span style={{ color: T.red }}>{s.reason}</span></span>
                    </div>
                  </div>
                ))
            )}

            {/* PEPs */}
            {tab === 'pep' && (
              filteredPEPs.length === 0
                ? <EmptyState label="No PEP matches" />
                : filteredPEPs.map((p, i) => (
                  <div key={i} style={{
                    background: T.surface, borderRadius: 6, padding: 14,
                    border: `1px solid ${T.amber}33`, borderLeft: `3px solid ${T.amber}`,
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                      <div>
                        <div style={{ fontSize: 14, color: T.text, fontFamily: T.font, fontWeight: 600 }}>{p.name}</div>
                        <div style={{ fontSize: 11, color: T.amber, fontFamily: T.font }}>{p.role}</div>
                      </div>
                      <Badge label={p.risk} color={p.risk === 'HIGH' ? T.red : T.amber} />
                    </div>
                    <div style={{ display: 'flex', gap: 16, fontSize: 11, color: T.sub, fontFamily: T.font }}>
                      <span>Country: {p.country}</span>
                      <span>In Position Since: {p.since}</span>
                    </div>
                  </div>
                ))
            )}

            {/* News */}
            {tab === 'news' && (
              filteredNews.length === 0
                ? <EmptyState label="No adverse media found" />
                : filteredNews.map((n, i) => (
                  <div key={i} style={{
                    background: T.surface, borderRadius: 6, padding: 14,
                    border: `1px solid ${T.blue}33`, borderLeft: `3px solid ${T.blue}`,
                  }}>
                    <div style={{ fontSize: 13, color: T.text, fontFamily: T.font, fontWeight: 500, marginBottom: 6 }}>
                      {n.headline}
                    </div>
                    <div style={{ display: 'flex', gap: 12, fontSize: 11, color: T.sub, fontFamily: T.font, flexWrap: 'wrap', alignItems: 'center' }}>
                      <span>Entity: <span style={{ color: T.blue }}>{n.entity}</span></span>
                      <span>Source: <span style={{ color: T.text }}>{n.source}</span></span>
                      <span>{n.date}</span>
                      <Badge label="Adverse" color={T.red} />
                    </div>
                  </div>
                ))
            )}
          </div>
        </div>

        {/* AI Report Panel */}
        <div style={{
          flex: 1, background: T.card, border: `1px solid ${T.border}`,
          borderRadius: 8, padding: 16, display: 'flex',
          flexDirection: 'column', gap: 12, minWidth: 260,
        }}>
          <div style={{ fontSize: 11, color: T.sub, fontFamily: T.font, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Intelligence Report
          </div>

          {loading && <Spinner label="Enriching intelligence…" />}

          {report ? (
            <div style={{ flex: 1, overflowY: 'auto', background: T.surface, borderRadius: 6, padding: 12, border: `1px solid ${T.border}` }}>
              <div style={{ fontSize: 10, color: T.muted, fontFamily: T.font, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                AI Intelligence Report
              </div>
              <div style={{ fontSize: 11, color: T.text, fontFamily: T.font, lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>
                {report}
              </div>
            </div>
          ) : (
            !loading && (
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flex: 1, color: T.muted, fontSize: 11, fontFamily: T.font,
                textAlign: 'center', padding: 16, lineHeight: 1.8,
              }}>
                Search for a name or entity and click <br />
                <strong style={{ color: T.amber, marginLeft: 4 }}>Enrich & Report</strong>
                <br />to generate an AI-powered OSINT profile
              </div>
            )
          )}
        </div>
      </div>
    </div>
  )
}

function EmptyState({ label }) {
  return (
    <div style={{
      textAlign: 'center', padding: '32px 16px',
      color: T.muted, fontSize: 12, fontFamily: T.font,
    }}>
      {label}
    </div>
  )
}
