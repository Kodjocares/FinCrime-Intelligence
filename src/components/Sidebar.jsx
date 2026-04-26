// ─── Sidebar Component ────────────────────────────────────────────────────────
import { useState } from 'react'
import { T } from '../theme'
import { useApiKey } from '../hooks/useApiKey'
import { TRANSACTIONS, FRAUD_ACCOUNTS, BTC_WALLETS, ENTITIES, SANCTIONS } from '../data/synthetic'

const MODULES = [
  {
    id: 'aml',
    icon: '⚖',
    label: 'AML Monitor',
    sub: 'Transaction Monitoring',
    getAlerts: () => TRANSACTIONS.filter(t => t.status === 'ALERT').length,
  },
  {
    id: 'fraud',
    icon: '🛡',
    label: 'Fraud Detection',
    sub: 'Account Risk Scoring',
    getAlerts: () => FRAUD_ACCOUNTS.filter(a => a.status === 'HIGH_RISK').length,
  },
  {
    id: 'crypto',
    icon: '⛓',
    label: 'Crypto Tracer',
    sub: 'Blockchain Forensics',
    getAlerts: () => BTC_WALLETS.filter(w => w.risk > 0.75).length,
  },
  {
    id: 'entity',
    icon: '🕸',
    label: 'Entity Graph',
    sub: 'Link Analysis',
    getAlerts: () => ENTITIES.filter(e => e.risk > 0.75).length,
  },
  {
    id: 'osint',
    icon: '🔍',
    label: 'OSINT',
    sub: 'Intelligence Enrichment',
    getAlerts: () => SANCTIONS.length,
  },
]

export default function Sidebar({ active, setActive }) {
  const [time, setTime] = useState(new Date())
  const [showSettings, setShowSettings] = useState(false)
  const { apiKey, setApiKey, clearApiKey, isConfigured } = useApiKey()
  const [inputKey, setInputKey] = useState('')

  // Clock tick
  useState(() => {
    const t = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(t)
  })

  const totalAlerts = MODULES.reduce((s, m) => s + m.getAlerts(), 0)

  return (
    <div style={{
      width: 220,
      flexShrink: 0,
      background: T.surface,
      borderRight: `1px solid ${T.border}`,
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
    }}>
      {/* Logo */}
      <div style={{ padding: '18px 18px 14px', borderBottom: `1px solid ${T.border}` }}>
        <div style={{ fontSize: 17, fontFamily: T.fontDisplay, fontWeight: 800, letterSpacing: '0.04em', lineHeight: 1 }}>
          <span style={{ color: T.amber }}>FIN</span>
          <span style={{ color: T.red }}>CRIME</span>
        </div>
        <div style={{ fontSize: 9, color: T.muted, fontFamily: T.font, letterSpacing: '0.16em', textTransform: 'uppercase', marginTop: 3 }}>
          Intelligence Platform
        </div>
      </div>

      {/* Status Bar */}
      <div style={{ padding: '8px 18px 10px', borderBottom: `1px solid ${T.border}`, fontSize: 10, fontFamily: T.font }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: T.green }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: T.green, animation: 'pulse 2s infinite' }} />
          SYSTEM ONLINE
        </div>
        <div style={{ color: T.muted, marginTop: 2 }}>
          {time.toUTCString().substr(17, 8)} UTC
        </div>
        <div style={{ color: isConfigured ? T.green : T.amber, marginTop: 2, display: 'flex', alignItems: 'center', gap: 4 }}>
          <span>{isConfigured ? '● AI ACTIVE' : '○ AI NOT CONFIGURED'}</span>
        </div>
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, padding: '10px 8px', display: 'flex', flexDirection: 'column', gap: 2, overflowY: 'auto' }}>
        {MODULES.map(m => {
          const alerts = m.getAlerts()
          const isActive = active === m.id
          return (
            <button
              key={m.id}
              onClick={() => setActive(m.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '10px 10px',
                borderRadius: 6,
                border: 'none',
                textAlign: 'left',
                cursor: 'pointer',
                background: isActive ? T.amber + '18' : 'transparent',
                borderLeft: `2px solid ${isActive ? T.amber : 'transparent'}`,
                transition: 'all 0.15s',
                width: '100%',
              }}
            >
              <span style={{ fontSize: 16, lineHeight: 1 }}>{m.icon}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, color: isActive ? T.amber : T.text, fontWeight: 600, lineHeight: 1.3 }}>
                  {m.label}
                </div>
                <div style={{ fontSize: 9, color: T.muted, fontFamily: T.font, lineHeight: 1.2 }}>
                  {m.sub}
                </div>
              </div>
              {alerts > 0 && (
                <span style={{
                  background: T.red + '22', color: T.red,
                  border: `1px solid ${T.red}44`,
                  borderRadius: 10, padding: '1px 6px',
                  fontSize: 9, fontFamily: T.font, fontWeight: 600,
                }}>
                  {alerts}
                </span>
              )}
            </button>
          )
        })}
      </nav>

      {/* Settings Panel */}
      {showSettings && (
        <div style={{
          borderTop: `1px solid ${T.border}`,
          padding: '12px 14px',
          background: T.bg,
        }}>
          <div style={{ fontSize: 10, color: T.sub, fontFamily: T.font, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
            API Key
          </div>
          {isConfigured ? (
            <div>
              <div style={{ fontSize: 10, color: T.green, fontFamily: T.font, marginBottom: 6 }}>
                ● Active: {apiKey.substr(0, 8)}…{apiKey.substr(-4)}
              </div>
              <button onClick={clearApiKey} style={{ fontSize: 10, fontFamily: T.font, color: T.red, background: 'none', border: `1px solid ${T.red}44`, borderRadius: 4, padding: '3px 8px', cursor: 'pointer' }}>
                Clear Key
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <input
                type="password"
                value={inputKey}
                onChange={e => setInputKey(e.target.value)}
                placeholder="sk-ant-api03-..."
                style={{
                  background: T.card, border: `1px solid ${T.border}`,
                  borderRadius: 4, padding: '5px 8px',
                  color: T.text, fontSize: 10, fontFamily: T.font, outline: 'none',
                }}
              />
              <button
                onClick={() => { setApiKey(inputKey); setInputKey('') }}
                disabled={!inputKey.startsWith('sk-ant')}
                style={{
                  padding: '5px 10px', borderRadius: 4,
                  border: `1px solid ${T.amber}`, background: T.amber + '22',
                  color: T.amber, fontSize: 10, fontFamily: T.font,
                  fontWeight: 600, cursor: 'pointer',
                }}
              >
                Save Key
              </button>
            </div>
          )}
        </div>
      )}

      {/* Footer */}
      <div style={{ padding: '10px 14px', borderTop: `1px solid ${T.border}`, fontSize: 9, color: T.muted, fontFamily: T.font }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
          <span style={{ color: T.sub, fontWeight: 600, fontSize: 10 }}>FINCRIME INTEL v2.1</span>
          <button
            onClick={() => setShowSettings(s => !s)}
            title="API Settings"
            style={{
              background: showSettings ? T.amber + '22' : 'none',
              border: `1px solid ${showSettings ? T.amber : T.border}`,
              borderRadius: 4, padding: '2px 6px',
              color: showSettings ? T.amber : T.muted,
              cursor: 'pointer', fontSize: 12,
            }}
          >
            ⚙
          </button>
        </div>
        <div>AI Engine: Claude Sonnet</div>
        <div style={{ color: T.green + '99' }}>● Threat feeds active</div>
        <div style={{ color: T.amber + '99' }}>● {totalAlerts} active alerts</div>
      </div>
    </div>
  )
}
