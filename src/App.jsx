// ─── App.jsx — Main Application Shell ────────────────────────────────────────
import { useState, useEffect } from 'react'
import { T } from './theme'
import Sidebar from './components/Sidebar'
import AMLModule from './components/AMLModule'
import FraudModule from './components/FraudModule'
import CryptoModule from './components/CryptoModule'
import EntityModule from './components/EntityModule'
import OSINTModule from './components/OSINTModule'
import { TRANSACTIONS, FRAUD_ACCOUNTS, BTC_WALLETS, ENTITIES, SANCTIONS } from './data/synthetic'

const MODULE_META = {
  aml:    { label: 'AML Monitor',       sub: 'Transaction Monitoring & SAR Generation',  icon: '⚖' },
  fraud:  { label: 'Fraud Detection',   sub: 'Account Risk Scoring & Behavioral Analysis', icon: '🛡' },
  crypto: { label: 'Crypto Tracer',     sub: 'Blockchain Forensics & Wallet Clustering',  icon: '⛓' },
  entity: { label: 'Entity Graph',      sub: 'Link Analysis & Beneficial Ownership',      icon: '🕸' },
  osint:  { label: 'OSINT Enrichment',  sub: 'Sanctions · PEP · Adverse Media Screening', icon: '🔍' },
}

const COMPONENTS = {
  aml:    AMLModule,
  fraud:  FraudModule,
  crypto: CryptoModule,
  entity: EntityModule,
  osint:  OSINTModule,
}

const totalAlerts =
  TRANSACTIONS.filter(t => t.status === 'ALERT').length +
  FRAUD_ACCOUNTS.filter(a => a.status === 'HIGH_RISK').length +
  BTC_WALLETS.filter(w => w.risk > 0.75).length +
  ENTITIES.filter(e => e.risk > 0.75).length +
  SANCTIONS.length

export default function App() {
  const [active, setActive] = useState('aml')
  const [time, setTime] = useState(new Date())

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(t)
  }, [])

  const meta = MODULE_META[active]
  const ActiveModule = COMPONENTS[active]

  return (
    <div style={{
      display: 'flex',
      height: '100vh',
      width: '100vw',
      background: T.bg,
      color: T.text,
      fontFamily: T.fontUI,
      overflow: 'hidden',
    }}>
      {/* ── Sidebar ── */}
      <Sidebar active={active} setActive={setActive} />

      {/* ── Main Content ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>

        {/* Top Bar */}
        <div style={{
          padding: '12px 24px',
          borderBottom: `1px solid ${T.border}`,
          background: T.surface,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 22 }}>{meta.icon}</span>
            <div>
              <div style={{ fontSize: 17, fontWeight: 600, fontFamily: T.fontDisplay, color: T.text, lineHeight: 1.2 }}>
                {meta.label}
              </div>
              <div style={{ fontSize: 11, color: T.muted, fontFamily: T.font }}>
                {meta.sub}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            {[
              { label: 'Active Alerts', value: totalAlerts, color: T.red },
              { label: 'Rules Active',  value: '247',        color: T.green },
              { label: 'Data Feeds',    value: '12',         color: T.cyan },
            ].map(item => (
              <div key={item.label} style={{
                padding: '6px 14px',
                background: item.color + '11',
                border: `1px solid ${item.color}33`,
                borderRadius: 6,
                textAlign: 'center',
              }}>
                <div style={{
                  fontSize: 18, fontWeight: 700,
                  color: item.color, fontFamily: T.fontDisplay, lineHeight: 1,
                }}>
                  {item.value}
                </div>
                <div style={{ fontSize: 9, color: T.muted, fontFamily: T.font, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {item.label}
                </div>
              </div>
            ))}

            <div style={{
              padding: '6px 14px',
              background: T.border,
              borderRadius: 6,
              textAlign: 'right',
            }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: T.text, fontFamily: T.font, lineHeight: 1 }}>
                {time.toUTCString().substr(17, 8)}
              </div>
              <div style={{ fontSize: 9, color: T.muted, fontFamily: T.font, letterSpacing: '0.05em' }}>
                UTC
              </div>
            </div>
          </div>
        </div>

        {/* Module Content */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: 20,
        }}>
          <ActiveModule />
        </div>

        {/* Footer Bar */}
        <div style={{
          padding: '6px 24px',
          borderTop: `1px solid ${T.border}`,
          background: T.surface,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: 9,
          fontFamily: T.font,
          color: T.muted,
          flexShrink: 0,
        }}>
          <span>FinCrime Intelligence Platform v2.1 · For research & educational purposes only</span>
          <span style={{ display: 'flex', gap: 16 }}>
            <span style={{ color: T.green + '99' }}>● AML Engine</span>
            <span style={{ color: T.green + '99' }}>● Fraud Engine</span>
            <span style={{ color: T.green + '99' }}>● Chain Analytics</span>
            <span style={{ color: T.green + '99' }}>● OSINT Feeds</span>
          </span>
        </div>
      </div>
    </div>
  )
}
