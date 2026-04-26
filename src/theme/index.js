// ─── Theme Constants ──────────────────────────────────────────────────────────
export const T = {
  bg: '#07080d',
  surface: '#0b0d14',
  card: '#0f1119',
  border: '#171c28',
  borderActive: '#2a3347',
  amber: '#f59e0b',
  amberFade: '#451a03',
  red: '#f43f5e',
  redFade: '#4c0519',
  green: '#10b981',
  greenFade: '#022c22',
  blue: '#818cf8',
  blueFade: '#1e1b4b',
  cyan: '#22d3ee',
  purple: '#a855f7',
  text: '#e2e8f0',
  sub: '#8892a4',
  muted: '#3d4a5c',
  font: "'JetBrains Mono', monospace",
  fontUI: "'DM Sans', sans-serif",
  fontDisplay: "'Syne', sans-serif",
}

// ─── Risk Helpers ─────────────────────────────────────────────────────────────
export const riskColor = (score) =>
  score > 0.75 ? T.red : score > 0.45 ? T.amber : T.green

export const riskLabel = (score) =>
  score > 0.75 ? 'HIGH' : score > 0.45 ? 'MEDIUM' : 'LOW'

export const statusColor = {
  ALERT: T.red,
  REVIEW: T.amber,
  CLEAR: T.green,
  HIGH_RISK: T.red,
  MEDIUM: T.amber,
  LOW: T.green,
}
