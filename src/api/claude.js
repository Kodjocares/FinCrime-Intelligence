// ─── Claude API Client ────────────────────────────────────────────────────────
const API_URL = 'https://api.anthropic.com/v1/messages'
const MODEL = 'claude-sonnet-4-20250514'

// System prompts for each module
const SYSTEM_PROMPTS = {
  aml: `You are a senior AML (Anti-Money Laundering) compliance officer and FinCEN reporting specialist. 
Generate detailed, professional SAR (Suspicious Activity Report) narratives following FinCEN/FATF standards. 
Use formal regulatory language. Structure reports with numbered sections. Be specific about typologies, dollar amounts, and recommended actions.`,

  fraud: `You are a certified fraud examiner (CFE) and financial crimes investigator. 
Analyze account risk indicators and generate structured investigation reports. 
Use behavioral analysis terminology, reference fraud typologies (account takeover, mule accounts, synthetic identity), 
and provide specific actionable recommendations (BLOCK/RESTRICT/MONITOR/CLEAR).`,

  crypto: `You are a blockchain forensics analyst and cryptocurrency investigator with expertise in tracing illicit funds.
Use technical terminology: UTXO, co-spend heuristics, change address analysis, peeling chains, clustering, chain-hopping.
Reference real frameworks: Chainalysis Reactor methodology, FATF Travel Rule, VASP compliance.
Provide detailed wallet attribution analysis and investigative recommendations.`,

  entity: `You are a financial intelligence analyst specializing in corporate structure analysis and beneficial ownership.
Use terms: UBO (Ultimate Beneficial Owner), nominee directors, bearer shares, layering, integration, placement.
Reference: FATF Recommendations 24/25, EU AMLD, FinCEN BOI reporting.
Map shell structures, identify control chains, and assess EDD (Enhanced Due Diligence) requirements.`,

  osint: `You are an intelligence analyst specializing in financial crime OSINT and KYC/CDD screening.
Synthesize sanctions data (OFAC SDN, UN Consolidated, EU Consolidated), PEP exposure, and adverse media.
Reference: FATF Recommendation 12 (PEPs), Wolfsberg Principles, Basel AML Index.
Produce structured intelligence assessments with clear risk ratings and due diligence recommendations.`,
}

/**
 * Call Claude API for AI-powered investigation reports
 * @param {string} prompt - The investigation prompt
 * @param {string} module - Which module ('aml'|'fraud'|'crypto'|'entity'|'osint')
 * @param {string} apiKey - Anthropic API key
 * @returns {Promise<string>} - Generated report text
 */
export async function callClaude(prompt, module = 'aml', apiKey) {
  const key = apiKey || import.meta.env.VITE_ANTHROPIC_API_KEY

  if (!key || key === 'your_anthropic_api_key_here') {
    return [
      '⚠ API KEY NOT CONFIGURED',
      '',
      'To enable AI-powered reports:',
      '1. Copy .env.example → .env',
      '2. Add your Anthropic API key: VITE_ANTHROPIC_API_KEY=sk-ant-...',
      '3. Get your key at: https://console.anthropic.com',
      '4. Restart the dev server (npm run dev)',
      '',
      'Or enter your API key in the Settings panel (⚙ icon in sidebar).',
    ].join('\n')
  }

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 1200,
        system: SYSTEM_PROMPTS[module] || SYSTEM_PROMPTS.aml,
        messages: [{ role: 'user', content: prompt }],
      }),
    })

    if (!response.ok) {
      const err = await response.json().catch(() => ({}))
      if (response.status === 401) return '❌ Invalid API key. Check your VITE_ANTHROPIC_API_KEY in .env'
      if (response.status === 429) return '⏳ Rate limited. Please wait a moment and try again.'
      return `❌ API Error ${response.status}: ${err.error?.message || 'Unknown error'}`
    }

    const data = await response.json()
    return data.content?.[0]?.text || 'No response generated.'
  } catch (error) {
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      return '❌ Network error. Check your internet connection or CORS configuration.'
    }
    return `❌ Error: ${error.message}`
  }
}

/**
 * Build SAR (Suspicious Activity Report) prompt from transaction data
 */
export function buildSARPrompt(txn) {
  return `Generate a formal SAR (Suspicious Activity Report) for this transaction:

Transaction ID: ${txn.id}
Date/Time: ${txn.tsStr}
From: ${txn.from} (${txn.fromCountry}) – ${txn.fromAcct}
To: ${txn.to} (${txn.toCountry}) – ${txn.toAcct}
Amount: ${txn.currency} ${txn.amount.toLocaleString()}
Risk Score: ${(txn.riskScore * 100).toFixed(1)}%
Flags: ${txn.flags.join(', ') || 'None'}
Hops: ${txn.hop}
Status: ${txn.status}

Write a 4-paragraph SAR narrative:
1. Subject Description — who the parties are, their jurisdictions and risk profile
2. Suspicious Activity — what occurred, amounts, timing, structuring patterns
3. Typology Analysis — which FATF typologies apply and why
4. Recommendation — filing urgency, law enforcement referral, account action

Use FinCEN/FATF format. Be specific. Include dollar amounts.`
}

/**
 * Build Fraud Analysis prompt from account data
 */
export function buildFraudPrompt(account) {
  return `Fraud investigation report for account:

Account ID: ${account.id} – ${account.name}
Email: ${account.email} | Country: ${account.country}
Joined: ${account.joinDate}
Transactions (24h / 7d): ${account.txCount24h} / ${account.txCount7d}
Devices: ${account.deviceCount} | IPs: ${account.ipCount}
Velocity Score: ${(account.velocityScore * 100).toFixed(0)}%
IP Anomaly Score: ${(account.ipAnomalyScore * 100).toFixed(0)}%
Behavioral Score: ${(account.behavScore * 100).toFixed(0)}%
Fraud Probability: ${(account.fraudProb * 100).toFixed(1)}%
Flags: ${account.flags.join(', ') || 'None'}

Write structured fraud investigation report:
1. Risk Summary — overall assessment and fraud probability breakdown
2. Behavioral Indicators — what the scores reveal about account activity
3. Device & IP Analysis — multi-device and geolocation red flags
4. Fraud Typology — most likely fraud type (ATO, mule, synthetic identity, etc.)
5. Recommended Action — BLOCK / RESTRICT / STEP-UP AUTH / MONITOR / CLEAR with rationale`
}

/**
 * Build Blockchain Forensics prompt from wallet data
 */
export function buildCryptoPrompt(wallet, edges) {
  return `Blockchain forensics report for Bitcoin wallet:

Address: ${wallet.addr}
Label: ${wallet.label}
Cluster: ${wallet.cluster}
Balance: ${wallet.btc} BTC
Risk Score: ${(wallet.risk * 100).toFixed(0)}%
Transaction connections: ${edges.length}
Total BTC in connected transactions: ${edges.reduce((s, e) => s + e.btc, 0).toFixed(2)}
Connected clusters: ${[...new Set(edges.map(e => e.cluster || 'Unknown'))].join(', ')}

Write blockchain forensics investigation report:
1. Wallet Attribution — entity identification, cluster assignment confidence
2. Transaction Pattern Analysis — UTXO behavior, flow direction, timing patterns
3. Risk Indicators — specific red flags (mixer use, darknet exposure, OFAC links)
4. Clustering Analysis — co-spend heuristics, change address analysis, peeling chains
5. Investigative Actions — next steps for tracing, VASP subpoenas, law enforcement notification`
}

/**
 * Build Entity Intelligence prompt
 */
export function buildEntityPrompt(entity, connections) {
  const connStr = connections.map(c => `  - ${c.ent.type.toUpperCase()}: ${c.ent.label} [${c.edge.label}] Risk: ${(c.ent.risk * 100).toFixed(0)}%`).join('\n')
  return `Entity intelligence profile:

Subject: ${entity.label}
Type: ${entity.type.toUpperCase()}
Risk Score: ${(entity.risk * 100).toFixed(0)}%
Detail: ${entity.detail}

Network Connections (${connections.length}):
${connStr || '  None identified'}

Write entity intelligence report:
1. Subject Profile — identification, role, jurisdiction, risk classification
2. Ownership & Control Structure — corporate hierarchy, beneficial ownership, nominee arrangements
3. Network Analysis — key relationships, transaction flows, shell structure mapping
4. Financial Exposure — estimated exposure amounts, account activity, crypto holdings
5. Risk Conclusion & Recommendations — KYC tier, EDD requirements, escalation recommendation`
}

/**
 * Build OSINT Enrichment prompt
 */
export function buildOSINTPrompt(query, sanctions, peps, news) {
  const sanStr = sanctions.map(s => `  - ${s.name} on ${s.list} (${s.score}% match) – ${s.reason}`).join('\n') || '  None matched'
  const pepStr = peps.map(p => `  - ${p.name}: ${p.role}, ${p.country} since ${p.since}`).join('\n') || '  None matched'
  const newsStr = news.map(n => `  - [${n.source}, ${n.date}] ${n.headline}`).join('\n') || '  None found'

  return `OSINT intelligence report for: "${query}"

Sanctions Screening:
${sanStr}

PEP Screening:
${pepStr}

Adverse Media:
${newsStr}

Write structured intelligence assessment:
1. Executive Summary — one paragraph risk verdict for compliance officers
2. Sanctions Exposure — list matches, confidence levels, program details, blocking obligations
3. PEP Risk Analysis — role, jurisdiction, family/associate exposure, EDD trigger assessment
4. Adverse Media Review — credibility of sources, severity of allegations, recency
5. Overall Risk Rating & Due Diligence Recommendations — CDD/EDD level, transaction monitoring flags, escalation triggers`
}
