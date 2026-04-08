# cerebro.host

Personal website showcasing blockchain infrastructure operations across multiple networks — live at [cerebro.host](https://cerebro.host).

## What It Is

A static, multi-page site built as custom HTML/CSS hosted via a website builder. No framework dependencies — just portable, self-contained HTML that can be pasted into any host or served directly.

## Architecture

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
- Keyword quick-access buttons (BTC, ETH, Stable Tokens, and more)
- Fully responsive, no build step required
- Self-contained HTML — deploy by pasting into any host

## Infrastructure Highlighted

| Network | Role | Details |
|---|---|---|
| XPR Network | Block Producer | `cerebroai` — mainnet.cerebro.host |
| Metal Blockchain | Validator (×2) | Dedicated + Akash-deployed, 60K METAL staked |
| Akash Network | Provider + Validator | CPAX Unity (112 CPU, 1TB RAM) |
| Decred | VSP Operator | dcr.cerebro.host, 0.888% fee, multi-cloud |
| Metallicus | Ecosystem Integration | Validator services |

## Tech Stack

- Plain HTML5 / CSS3 / vanilla JS
- Node.js scripts for article generation (no runtime dependency in prod)
- Deployed via Namecheap / Sitejet

## Live URL

[https://cerebro.host](https://cerebro.host)
