# Cerebro.host Articles Page

LinkedIn articles and insights showcase page for Cerebro AI's thought leadership content.

**Status**: ✅ HTML Complete - Ready for Sitejet Implementation  
**Version**: 1.1.0  
**Last Updated**: February 2026

---

## Overview

The `/articles` page showcases Cerebro AI's published content from the "Orbital Assets" LinkedIn newsletter, including articles and animated videos covering blockchain infrastructure analysis and market insights.

**Total Content**: 102+ articles (updated as new Orbital Assets are added)
- Written content from "Orbital Assets" newsletter

**Date Range**: July 2025 - February 2026 (with some September 2024)

---

## Content Statistics

### Articles by Category
- **Orbital Assets**: Regular written content (count in hero badge)

### Articles by Month
- **February 2026**: 6+ articles
- **January 2026**: 10+ articles
- **December 2025**: 14 articles
- **November 2025**: 20 articles
- **October 2025**: 20 articles
- **August 2025**: 10 articles
- **July 2025**: 17 articles
- **September 2024**: 9 articles

**Note**: When adding articles for a new month, a new month section must be created in the HTML. The `generate-articles-html.js` script automatically creates month sections based on article dates.

---

## Features

### Implemented ✅
- Complete HTML page with all articles (count in hero badge)
- Article card layout with featured section (3 latest articles)
- Search functionality with comprehensive keyword matching:
  - Company names (Coinbase, Binance, Kraken, Gemini, etc.)
  - Tokens (AKT, METAL, XPR, DCR, BTC, ETH, SOL, MATIC, ADA, AVAX, LINK, UNI, AAVE, MKR, COMP, and more)
  - Network names (Akash, Metal, XPR, Decred, Bitcoin, Ethereum, Solana, Polygon, etc.)
  - Stablecoins (USDT, USDC, DAI, FRAX)
- Keyword quick-access buttons (BTC, ETH, Stable Tokens)
- View toggle options (Grid, List, Compact)
- Responsive design (3 columns desktop, 2 tablet, 1 mobile)
- Category icons with full-card image overlay
- Date organization by month (reverse chronological)
- Dynamic result counting
- Home button navigation
- Mobile-optimized layouts (compact view hidden on mobile)
- Text wrapping prevention for article titles
- Full-width hero sections

### In Progress ⏳
- Sitejet implementation (`/articles` page)
- Navigation menu integration
- Article content display (modal or inline)

### Planned 📋
- Video/animation display support
- Article content modal with full text
- Full-text content search (requires content storage)
- SEO optimization for thought leadership content

---

## Technical Implementation

### Files
- `cerebro-articles-preview-v1.html` - Complete articles page HTML (paste into Sitejet Custom HTML block)
- `SITEJET-PASTE-GUIDE.md` - Paste instructions and terminal-update options (FTP/API/clipboard)
- `extract-linkedin-articles.js` - Browser console script to extract articles from LinkedIn
- `generate-articles-html.js` - Node.js script to generate HTML from article data
- `articles-data.json` - Article data (titles, URLs, dates); reindex with `reindex-articles-json.js`
- `copy-articles-for-paste.js` - Copies full HTML to clipboard for Sitejet paste (run from `cerebro.host-articles/` or use `cd cerebro.host-articles && node copy-articles-for-paste.js` from repo root)

**Important**: When adding articles for a new month, the HTML generation script will automatically create a new month section. Ensure the script is run after updating `articles-data.json` to generate the correct month sections.

### Category System
- **Orbital Assets** (`orbital`): Regular articles (blue badge #DBEAFE)
- **Orbital Assets in Motion** (`motion`): Videos with "Transmission available now 🌌" (yellow badge #FEF3C7)
- **Digital Assets Daily** (`daily`): Videos → Renamed to "Orbital Assets"

### Search Keywords
The search functionality supports:
- **Companies**: Coinbase, Binance
- **Networks**: Akash, Metal, XPR, Decred, Bitcoin, Ethereum
- **Tokens**: AKT, METAL, XPR, DCR, BTC, ETH, SOL, MATIC, ADA, AVAX, LINK, UNI, AAVE, MKR, COMP

### Standard process (add article → update page → copy for Sitejet)

**Split of tasks:**

| Who | Step | Action |
|-----|------|--------|
| **Assistant (AI)** | 1 | Add new article to `articles-data.json` (top of array: `title`, `url`, `date`). Then run: `cd cerebro.host-articles && node reindex-articles-json.js && node update-articles-page.js` (reindex + update HTML; does **not** copy to clipboard). |
| **You** | 2 | Run: `cd cerebro.host-articles && node copy-articles-for-paste.js` → then in Sitejet: open Custom HTML block for `/articles`, select all, paste (Cmd+V / Ctrl+V), save. |

**Your step only (from repo root):**
```bash
cd cerebro.host-articles && node copy-articles-for-paste.js
```
Then paste in Sitejet and save.

---

## Content Source

**Newsletter**: https://www.linkedin.com/newsletters/orbital-assets-7347506734581600256/

**Extraction Method**: Browser console script (`extract-linkedin-articles.js`)

**Data Format**: JSON with title, URL, date, and category

---

## Current Status

✅ **Data Extraction**: 102+ articles in `articles-data.json`  
✅ **HTML Structure**: Complete page; run `update-articles-page.js` after adding articles  
✅ **Category Updates**: Renamed categories ("Orbital Assets", "Orbital Assets: In Motion")  
✅ **Search Enhancement**: Comprehensive keyword matching (80+ keywords)  
✅ **UI Enhancements**: View toggles, keyword buttons, home navigation, mobile optimizations  
✅ **Read Buttons**: Removed (users click on images directly)  
✅ **Text Layout**: No-wrap titles, optimized spacing  
⏳ **Sitejet Implementation**: Ready to deploy  
⏳ **Content Display**: Modal or inline viewer pending

---

## Next Steps

1. **Sitejet Implementation**: Create `/articles` page and paste complete HTML
2. **Navigation**: Add link from main site menu
3. **Content Display**: Implement modal or inline article viewer (optional)
4. **Video Display**: Add support for video/animation playback (optional)

---

## Documentation

- **[CEREBRO.HOST-ARTICLES-02-CHANGELOG.md](CEREBRO.HOST-ARTICLES-02-CHANGELOG.md)** - Version history
- **[CEREBRO.HOST-ARTICLES-03-DEVELOPMENT.md](CEREBRO.HOST-ARTICLES-03-DEVELOPMENT.md)** - Development details
- **[CEREBRO.HOST-ARTICLES-04-PROGRESS.md](CEREBRO.HOST-ARTICLES-04-PROGRESS.md)** - Current status
- **[CEREBRO.HOST-ARTICLES-05-DEPLOYMENT.md](CEREBRO.HOST-ARTICLES-05-DEPLOYMENT.md)** - Implementation guide
- **[CEREBRO.HOST-ARTICLES-06-RAGFILE.md](CEREBRO.HOST-ARTICLES-06-RAGFILE.md)** - Technical reference

**Tracking structure**: Articles tracking (01–06) is **separate from** main site tracking (`../CEREBRO-HOST-01-README.md` through 06). Do not consolidate: main site and articles have different scope and release cycles; each set is the source of truth for its area.

---

**Contact**: cerebro@cerebro.host  
**Newsletter**: https://www.linkedin.com/newsletters/orbital-assets-7347506734581600256/
