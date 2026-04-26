// ─── Synthetic Data — FinCrime Intelligence Platform ─────────────────────────

const NAMES = [
  'Ahmad Hassan', 'Liu Wei', 'Dmitri Volkov', 'Maria Santos', 'James Okafor',
  'Elena Petrov', 'Carlos Mendez', 'Fatima Al-Rashid', 'Viktor Kovalev',
  'Amara Diallo', 'Hassan Iqbal', 'Natasha Romanova', 'Zhou Lin',
  'Patrick Osei', 'Irina Kuznetsova',
]

const COUNTRIES = ['US', 'NG', 'RU', 'CN', 'DE', 'GB', 'AE', 'CH', 'PA', 'CY', 'BV', 'VG', 'KY', 'LB', 'IR']

const COUNTRY_RISK = {
  US: 0.1, DE: 0.1, GB: 0.1, NG: 0.8, RU: 0.85, IR: 0.95,
  PA: 0.7, CY: 0.6, BV: 0.9, VG: 0.85, KY: 0.7, CH: 0.2,
  AE: 0.5, LB: 0.75, CN: 0.5,
}

const BANKS = [
  'CHASE_NYC', 'HSBC_HK', 'DEUTSCHE_DE', 'ACCESS_NG',
  'SBERBANK_RU', 'EMIRATES_AE', 'UBS_CH', 'CAYMAN_KY',
]

const rnd = (min, max) => Math.random() * (max - min) + min
const rndInt = (min, max) => Math.floor(rnd(min, max))
const pick = (arr) => arr[rndInt(0, arr.length)]

// Seeded for reproducibility across renders
let seed = 42
const seededRand = () => {
  seed = (seed * 1664525 + 1013904223) & 0xffffffff
  return (seed >>> 0) / 0xffffffff
}

// ─── AML Transactions ─────────────────────────────────────────────────────────
export const TRANSACTIONS = Array.from({ length: 60 }, (_, i) => {
  const amount = Math.random() < 0.35
    ? rnd(7500, 9900)
    : Math.random() < 0.5
      ? rnd(10000, 100000)
      : rnd(100000, 2000000)

  const fromC = pick(COUNTRIES), toC = pick(COUNTRIES)
  const fr = COUNTRY_RISK[fromC] || 0.3
  const tr = COUNTRY_RISK[toC] || 0.3
  const isStr = amount < 10000 && amount > 7000
  const flags = []
  if (isStr) flags.push('Structuring')
  if (Math.random() < 0.25) flags.push('Layering')
  if (Math.random() < 0.2) flags.push('Rapid Movement')
  if (Math.random() < 0.08) flags.push('Sanctioned Party')
  if (fromC === 'BV' || toC === 'BV') flags.push('Shell Company')
  const riskScore = Math.min(0.99, (fr + tr) / 2 + flags.length * 0.12 + Math.random() * 0.1)
  const ts = new Date(Date.now() - rnd(0, 168) * 3600000)

  return {
    id: `TXN${String(i + 1).padStart(5, '0')}`,
    ts,
    tsStr: ts.toISOString().replace('T', ' ').substr(0, 19),
    from: pick(NAMES),
    fromAcct: `${pick(BANKS)}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
    fromCountry: fromC,
    to: pick(NAMES),
    toAcct: `${pick(BANKS)}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
    toCountry: toC,
    amount: parseFloat(amount.toFixed(2)),
    currency: pick(['USD', 'EUR', 'GBP', 'USDT']),
    riskScore: parseFloat(riskScore.toFixed(3)),
    flags,
    status: riskScore > 0.75 ? 'ALERT' : riskScore > 0.45 ? 'REVIEW' : 'CLEAR',
    hop: rndInt(1, 8),
  }
}).sort((a, b) => b.ts - a.ts)

// ─── Fraud Accounts ───────────────────────────────────────────────────────────
export const FRAUD_ACCOUNTS = Array.from({ length: 30 }, (_, i) => {
  const velocity = Math.random()
  const deviceCount = rndInt(1, 12)
  const ipAnomaly = Math.random()
  const behav = Math.random()
  const fraudProb = Math.min(0.99,
    velocity * 0.3 + ipAnomaly * 0.3 + behav * 0.2 + (deviceCount > 5 ? 0.2 : 0)
  )
  const flags = []
  if (velocity > 0.7) flags.push('High Velocity')
  if (deviceCount > 5) flags.push('Multi-Device')
  if (ipAnomaly > 0.7) flags.push('IP Anomaly')
  if (behav > 0.8) flags.push('Behavioral Anomaly')
  if (fraudProb > 0.85) flags.push('Mule Account')

  return {
    id: `UA${String(i + 1).padStart(4, '0')}`,
    name: NAMES[i % NAMES.length],
    email: `user${i + 1}@${pick(['gmail.com', 'yahoo.com', 'protonmail.com'])}`,
    country: pick(COUNTRIES),
    joinDate: new Date(Date.now() - rnd(30, 730) * 86400000).toISOString().substr(0, 10),
    txCount24h: rndInt(0, 80),
    txCount7d: rndInt(0, 400),
    amountToday: parseFloat(rnd(0, 50000).toFixed(2)),
    deviceCount,
    ipCount: rndInt(1, deviceCount + 2),
    velocityScore: parseFloat(velocity.toFixed(3)),
    ipAnomalyScore: parseFloat(ipAnomaly.toFixed(3)),
    behavScore: parseFloat(behav.toFixed(3)),
    fraudProb: parseFloat(fraudProb.toFixed(3)),
    flags,
    status: fraudProb > 0.7 ? 'HIGH_RISK' : fraudProb > 0.4 ? 'MEDIUM' : 'LOW',
  }
}).sort((a, b) => b.fraudProb - a.fraudProb)

// ─── Crypto Wallets ───────────────────────────────────────────────────────────
export const BTC_WALLETS = [
  { addr: '1A1zP1eP5QGefi2DMPTfTL5SLmv7Divf', label: 'Genesis Block', risk: 0.05, btc: 68.5, cluster: 'Satoshi' },
  { addr: '3FZbgi29cpjq2GjdwV8eyHuJJnkLtktZc5', label: 'Binance Hot', risk: 0.15, btc: 4521.2, cluster: 'Exchange' },
  { addr: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkf', label: 'Unknown Wallet', risk: 0.62, btc: 12.3, cluster: 'Unknown' },
  { addr: '1BoatSLRHtKNngkdXEeobR76b53LETtpyT', label: 'Darknet Market', risk: 0.95, btc: 8.7, cluster: 'Darknet' },
  { addr: 'bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf', label: 'Mixer Output', risk: 0.88, btc: 3.2, cluster: 'Mixer' },
  { addr: '1Ey6zDzHVMQ9U1VcZX3P7uRWVxJNk4XiZb', label: 'Cold Storage', risk: 0.08, btc: 102.1, cluster: 'Institutional' },
  { addr: 'bc1q9h6yz8xzp2djm5wfhq35gnhq84m3hy3', label: 'Ransomware C2', risk: 0.97, btc: 1.8, cluster: 'Malware' },
  { addr: '3KBx6e7LpqQMbAfgr5K78eEW6n3N4CGXN5', label: 'DeFi Protocol', risk: 0.2, btc: 892.4, cluster: 'DeFi' },
  { addr: '1LQoWist8KkaUXSPKZHNvEyfrEkPHzSsSd', label: 'Sanctioned Entity', risk: 0.99, btc: 45.6, cluster: 'OFAC' },
  { addr: 'bc1qcgd7wn3p4xq8mqf8k92djvyh0y2fz5n', label: 'Unknown Wallet 2', risk: 0.55, btc: 5.4, cluster: 'Unknown' },
]

export const CRYPTO_EDGES = [
  { from: 0, to: 2, btc: 2.3, risk: 0.5 },
  { from: 2, to: 4, btc: 2.1, risk: 0.8 },
  { from: 4, to: 3, btc: 1.9, risk: 0.93 },
  { from: 3, to: 6, btc: 1.5, risk: 0.97 },
  { from: 1, to: 2, btc: 5.0, risk: 0.3 },
  { from: 2, to: 8, btc: 1.8, risk: 0.9 },
  { from: 7, to: 2, btc: 3.2, risk: 0.4 },
  { from: 5, to: 1, btc: 10.0, risk: 0.1 },
  { from: 9, to: 3, btc: 0.8, risk: 0.85 },
  { from: 6, to: 3, btc: 1.2, risk: 0.96 },
]

// ─── Entity Graph ─────────────────────────────────────────────────────────────
export const ENTITIES = [
  { id: 0, type: 'person', label: 'Ahmad Hassan', risk: 0.85, detail: 'PEP – Govt Official', x: 350, y: 200 },
  { id: 1, type: 'company', label: 'Nexus Holdings Ltd', risk: 0.9, detail: 'BVI Shell Company', x: 540, y: 140 },
  { id: 2, type: 'company', label: 'Global Trade Corp', risk: 0.7, detail: 'Panama Registered', x: 540, y: 290 },
  { id: 3, type: 'account', label: 'HSBC-HK #4821', risk: 0.75, detail: '$2.4M inflows', x: 190, y: 140 },
  { id: 4, type: 'account', label: 'CAYMAN-KY #9932', risk: 0.92, detail: 'Cayman Account', x: 710, y: 200 },
  { id: 5, type: 'wallet', label: '1LQoW…SsSd', risk: 0.99, detail: 'OFAC Sanctioned', x: 730, y: 360 },
  { id: 6, type: 'person', label: 'Dmitri Volkov', risk: 0.8, detail: 'Known Associate', x: 190, y: 310 },
  { id: 7, type: 'account', label: 'SBER-RU #1104', risk: 0.82, detail: 'Russian Bank', x: 80, y: 240 },
  { id: 8, type: 'company', label: 'Alpine Ventures SA', risk: 0.65, detail: 'Swiss Entity', x: 430, y: 370 },
]

export const ENTITY_EDGES = [
  { from: 0, to: 1, label: 'Beneficial Owner' },
  { from: 0, to: 3, label: 'Account Holder' },
  { from: 1, to: 4, label: 'Controls Account' },
  { from: 1, to: 2, label: 'Business Partner' },
  { from: 4, to: 5, label: 'Crypto Offramp' },
  { from: 3, to: 4, label: '$1.2M Transfer' },
  { from: 6, to: 0, label: 'Known Associate' },
  { from: 6, to: 7, label: 'Account Holder' },
  { from: 7, to: 3, label: '$450K Transfer' },
  { from: 2, to: 8, label: 'Subsidiary' },
  { from: 8, to: 4, label: '$780K Transfer' },
]

// ─── OSINT Databases ──────────────────────────────────────────────────────────
export const SANCTIONS = [
  { name: 'Ahmad Hassan', list: 'OFAC SDN', score: 89, dob: '1968-03-14', nat: 'LB', reason: 'Terrorism Financing' },
  { name: 'Nexus Holdings Ltd', list: 'EU Consolidated', score: 76, dob: 'N/A', nat: 'BV', reason: 'Sanctions Evasion' },
  { name: 'Dmitri Volkov', list: 'OFAC SDN', score: 92, dob: '1975-11-22', nat: 'RU', reason: 'Oligarch Designation' },
]

export const PEPS = [
  { name: 'Ahmad Hassan', role: 'Deputy Finance Minister', country: 'Lebanon', since: '2016', risk: 'HIGH' },
  { name: 'Fatima Al-Rashid', role: 'Central Bank Board Member', country: 'UAE', since: '2019', risk: 'MEDIUM' },
]

export const ADVERSE_NEWS = [
  { entity: 'Ahmad Hassan', headline: 'Deputy Minister investigated for illicit enrichment', source: 'Reuters', date: '2024-09-15' },
  { entity: 'Nexus Holdings Ltd', headline: 'BVI firm linked to asset concealment scheme', source: 'ICIJ', date: '2024-10-02' },
  { entity: 'Dmitri Volkov', headline: 'Sanctions designation upheld on appeal', source: 'Bloomberg', date: '2024-11-01' },
  { entity: 'Global Trade Corp', headline: 'Subsidiary flagged in FATF mutual evaluation', source: 'FATF', date: '2024-08-20' },
]

// ─── Chart Data ───────────────────────────────────────────────────────────────
export const TX_VOLUME_DATA = Array.from({ length: 30 }, (_, i) => ({
  day: `D-${29 - i}`,
  volume: rndInt(200000, 2000000),
  alerts: rndInt(0, 15),
}))

export const TYPOLOGY_DATA = [
  { name: 'Structuring', count: 23 },
  { name: 'Layering', count: 15 },
  { name: 'Rapid Mvmt', count: 18 },
  { name: 'Shell Co.', count: 9 },
  { name: 'Sanctioned', count: 5 },
]

export const FRAUD_TREND = Array.from({ length: 24 }, (_, i) => ({
  hour: `${String(i).padStart(2, '0')}:00`,
  attempts: rndInt(5, 80),
  blocked: rndInt(3, 60),
}))
