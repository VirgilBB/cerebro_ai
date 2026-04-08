# Cerebro AI — cerebro.host

Multi-chain infrastructure operator. Website source for [cerebro.host](https://cerebro.host).

## Overview

Cerebro AI operates production blockchain infrastructure across multiple networks, builds A2A microservices, and conducts security research. This repo contains the source for the main website.

## Platform

| Project | Description | Links |
|---|---|---|
| Cerebro AI | Platform source | [GitHub](https://github.com/VirgilBB) |
| AGDP.io | Agent with 5 service offerings on A2A marketplace | [Agent Profile](https://agdp.io) |
| Moltbook | A2A social platform for agent-to-agent content sharing | [Profile](https://moltbook.com) |

## Production Systems

| Project | Role | Links |
|---|---|---|
| XPR Network | Block Producer | [Mainnet](https://mainnet.cerebro.host) |
| Metal Blockchain | Validator | [Explorer](https://explorer.metalblockchain.org) |
| Akash Network | Validator | [Stats](https://akash.network) |
| Decred Network | VSP Operator | [Live](https://dcr.cerebro.host) |
| VB ARMS | FFL ecommerce; gov contract bidding via BidForge | [GitHub](https://github.com/VirgilBB) |

## Akash Deployment Templates

Reproducible infrastructure templates deployed on Akash decentralized cloud.

| Template | Description | Links |
|---|---|---|
| Metal Validator | Metal blockchain validator deployment template | [GitHub](https://github.com/VirgilBB) |
| DCRPulse | Decred VSP deployment template | [GitHub](https://github.com/VirgilBB) |

## Security Research

- 29-class vulnerability taxonomy covering DeFi, bridges, ZK circuits, governance, and Web2 infrastructure
- Mandatory program intake gate — scope, prior audits, and eligibility verified before analysis begins
- Every finding validated with Foundry fork tests against live chain state
- Protocol-type routing to prioritize highest-impact bug classes per target
- [Security Portfolio](https://github.com/VirgilBB/virgilbb-security-portfolio)

## Website Source Structure

```
cerebro.host/
├── cerebro.host-main/         # Main landing page (HTML)
│   └── cerebro-preview-v2.html
├── cerebro.host-articles/     # Articles showcase page
│   ├── cerebro-articles-preview-v1.html
│   ├── articles-data.json     # Article metadata
│   ├── generate-articles-html.js
│   ├── extract-linkedin-articles.js
│   ├── reindex-articles-json.js
│   └── update-articles-page.js
└── content/                   # Page content & assets
    ├── network-logos/         # SVG + PNG logo assets
    ├── front-page-content.md
    ├── contact-page.md
    ├── github-repositories.md
    ├── code-of-conduct.md
    ├── ownership-page.md
    └── visual-design-guide.md
```

## Key Features

- Multi-network blockchain operator showcase (XPR, Metal, Akash, Decred, Metallicus)
- Articles page with 107 LinkedIn items (89 articles + 18 videos), searchable with 80+ keyword filters
- Fully responsive, no build step required
- Self-contained HTML — deploy by pasting into any host

## Tech Stack

- Plain HTML5 / CSS3 / vanilla JS
- Node.js scripts for article generation (no runtime dependency in prod)
- Deployed via Namecheap / Sitejet

## Live URL

[https://cerebro.host](https://cerebro.host)
