# FinCrime Intelligence Platform

> AI-Powered AML, Fraud Detection & Crypto Investigation Suite

A production-grade financial crime investigation platform covering all five core FinCrime domains: Anti-Money Laundering (AML), Fraud Detection, Blockchain Forensics, Entity Link Analysis, and OSINT Intelligence Enrichment. Powered by Claude AI for automated report generation.

---

## Screenshots

```
┌─────────────────────────────────────────────────────────────┐
│  FINCRIME  │  AML Monitor — Transaction Monitoring          │
│            │                                                 │
│  ⚖ AML    │  [60 TXNs] [12 Alerts] [8 Review] [$42.1M]    │
│  🛡 Fraud  │                                                 │
│  ⛓ Crypto │  [Volume Chart 30d]   [Typology Breakdown]     │
│  🕸 Entity │                                                 │
│  🔍 OSINT  │  [Transaction Table]  [SAR Generator + AI]     │
│            │                                                 │
│  v2.1      │                                                 │
└─────────────────────────────────────────────────────────────┘
```

---

## Features

### ⚖ Module 1 — AML Transaction Monitor
- Real-time transaction monitoring with risk scoring
- Typology detection: Structuring, Layering, Rapid Movement, Shell Companies, Sanctioned Parties
- 30-day volume chart and typology breakdown
- Filter by status: ALERT / REVIEW / CLEAR
- **AI SAR Generator** — Claude writes full FinCEN-format Suspicious Activity Report narratives

### 🛡 Module 2 — Fraud Detection
- Account-level risk profiling with multi-signal scoring
- Velocity, IP anomaly, behavioral, and device fingerprint analysis
- Money mule account detection
- 24h fraud attempt vs blocked timeline chart
- **AI Fraud Analysis** — structured investigation report with recommended action (BLOCK/RESTRICT/MONITOR/CLEAR)

### ⛓ Module 3 — Crypto Tracer
- Bitcoin wallet risk register with cluster attribution
- Interactive SVG transaction graph (UTXO flow visualization)
- Darknet, Mixer, OFAC, Ransomware, and DeFi cluster detection
- **AI Blockchain Forensics** — UTXO analysis, co-spend heuristics, peeling chain tracing

### 🕸 Module 4 — Entity Graph
- Multi-type entity graph: Persons, Companies, Accounts, Wallets
- Relationship mapping with edge labels (Beneficial Owner, Subsidiary, Crypto Offramp, etc.)
- Shell company structure detection
- **AI Entity Profile** — UBO analysis, layering structure, EDD recommendations

### 🔍 Module 5 — OSINT Intelligence
- Sanctions screening: OFAC SDN, EU Consolidated, UN Consolidated
- PEP (Politically Exposed Person) database
- Adverse media monitoring
- **AI Intelligence Report** — synthesized OSINT assessment with risk rating and CDD/EDD triggers

---

## Quick Start

### Prerequisites
- Node.js 18+
- npm 9+
- An [Anthropic API key](https://console.anthropic.com) (for AI report generation)

### Installation

```bash
# Clone the repo
git clone https://github.com/YOUR_USERNAME/fincrime-intelligence.git
cd fincrime-intelligence

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env and add your Anthropic API key:
# VITE_ANTHROPIC_API_KEY=sk-ant-api03-...

# Start development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Without an API Key

The app runs fully without an API key — all data visualization, graphs, and tables work normally. AI report generation (SAR, fraud analysis, blockchain forensics, entity profiles, OSINT enrichment) requires an Anthropic API key.

You can also enter your API key directly in the app via the ⚙ Settings button in the sidebar — no restart required.

---

## Project Structure

```
fincrime-intelligence/
├── public/
│   └── favicon.svg
├── src/
│   ├── api/
│   │   └── claude.js          # Anthropic API client + prompt builders
│   ├── components/
│   │   ├── shared/
│   │   │   └── index.jsx      # Reusable UI: Badge, RiskBar, StatCard, Table, etc.
│   │   ├── Sidebar.jsx        # Navigation + settings panel
│   │   ├── AMLModule.jsx      # Module 1: AML Transaction Monitor
│   │   ├── FraudModule.jsx    # Module 2: Fraud Detection
│   │   ├── CryptoModule.jsx   # Module 3: Crypto Tracer
│   │   ├── EntityModule.jsx   # Module 4: Entity Link Analysis
│   │   └── OSINTModule.jsx    # Module 5: OSINT Enrichment
│   ├── data/
│   │   └── synthetic.js       # All synthetic data generators
│   ├── hooks/
│   │   └── useApiKey.js       # API key management hook
│   ├── theme/
│   │   └── index.js           # Design tokens + risk color helpers
│   ├── App.jsx                # Root component + module router
│   ├── main.jsx               # React entry point
│   └── index.css              # Global styles + CSS variables
├── .env.example               # Environment variable template
├── .gitignore
├── eslint.config.js
├── index.html
├── package.json
├── README.md
└── vite.config.js
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 18 |
| Build Tool | Vite 5 |
| Charts | Recharts |
| Graphs | Custom SVG (no deps) |
| AI Engine | Claude Sonnet (Anthropic API) |
| Styling | Inline styles + CSS variables |
| Fonts | JetBrains Mono · DM Sans · Syne |

---

## Configuration

| Variable | Description | Required |
|---|---|---|
| `VITE_ANTHROPIC_API_KEY` | Your Anthropic API key | For AI features |
| `VITE_ENABLE_AI` | Enable/disable AI features (`true`/`false`) | No |
| `VITE_APP_TITLE` | Override app title | No |

---

## Connecting Real Data

The platform is built to swap synthetic data for real feeds. Key integration points:

### AML
- Connect to your transaction database via `src/data/synthetic.js` → replace `TRANSACTIONS` export
- Integrate with SWIFT, SEPA, or core banking API
- Add FATF typology rule engine in `src/api/claude.js`

### Crypto
- Replace `BTC_WALLETS` with live data from Chainalysis, TRM Labs, or Elliptic API
- Add Etherscan/Blockstream API calls for real-time wallet data
- Integrate OFAC SDN list via US Treasury API

### OSINT
- Replace `SANCTIONS` with live OFAC SDN feed: `https://www.treasury.gov/ofac/downloads/sdn.xml`
- Add OpenSanctions API: `https://api.opensanctions.org`
- Integrate World-Check or Refinitiv for PEP data

---

## AI Report Quality

Each module has a dedicated expert system prompt in `src/api/claude.js`:

| Module | Persona | Key Terminology |
|---|---|---|
| AML | Senior AML Compliance Officer | FinCEN, FATF, SAR, CTR, typologies |
| Fraud | Certified Fraud Examiner (CFE) | ATO, mule accounts, synthetic identity, velocity |
| Crypto | Blockchain Forensics Analyst | UTXO, co-spend, peeling chain, VASP, Travel Rule |
| Entity | Financial Intelligence Analyst | UBO, nominee, bearer shares, EDD, Rec 24/25 |
| OSINT | Intelligence Analyst | OFAC SDN, PEP, CDD, Wolfsberg, Basel AML Index |

---

## Build for Production

```bash
npm run build
# Output: dist/
```

Deploy to Vercel, Netlify, or any static host. For production use, move API calls server-side (Next.js API routes, Express proxy) to protect your API key.

---

## Legal & Disclaimer

> This platform uses **entirely synthetic, randomly generated data**. All names, transaction IDs, wallet addresses, and entity information are fictional and generated at runtime. No real individuals, companies, or financial institutions are represented.

> This project is intended for **educational and research purposes** — demonstrating FinTech/RegTech concepts, AML typologies, blockchain forensics techniques, and AI-assisted compliance workflows.

> **Do not use for real investigations without proper legal authority, data governance review, and compliance with applicable laws** (GDPR, CCPA, AML regulations, etc.).

---

## License

MIT © 2025

---

## Related Resources

- [FATF Typologies](https://www.fatf-gafi.org/publications/methodsandtrends/)
- [FinCEN SAR Filing Instructions](https://www.fincen.gov/resources/filing-information)
- [Chainalysis Crypto Crime Report](https://www.chainalysis.com/crypto-crime-report/)
- [OpenSanctions Database](https://www.opensanctions.org)
- [Anthropic API Docs](https://docs.anthropic.com)
