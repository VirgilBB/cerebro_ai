# Cerebro.host Website Revamp

Multi-network blockchain infrastructure showcase for Cerebro AI's blockchain operations across XPR Network, Metal Blockchain, Akash Network, Decred Network, and Metallicus ecosystem.

**Status**: ✅ Live and Operational  
**Version**: 2.2.0  
**Last Updated**: February 1, 2026

---

## Overview

Cerebro.host serves as the central hub showcasing Cerebro AI's comprehensive blockchain infrastructure operations across multiple networks:

- **XPR Network**: Block Producer (cerebroai)
- **Metal Blockchain**: Validator (2 nodes - dedicated + Akash-deployed)
- **Akash Network**: Provider, Validator, and Template Developer
- **Decred Network**: VSP Operator (3-server multi-cloud setup)
- **Metallicus Ecosystem**: Integration and validator services

## Current Infrastructure

### XPR Network
- **Role**: Block Producer
- **Account**: cerebroai
- **Node**: Production mainnet validator on Hetzner
- **Features**: Automated rewards claiming, security hardening
- **Endpoint**: https://mainnet.cerebro.host

### Metal Blockchain
- **Primary Validator**: NodeID-HDdohvYFYmiQYN44aX9KC1pdg5hQTEeaU
- **Akash Validator**: NodeID-KCN65VuqFCAd1ti6dCD2KThJfoR8QhVCE
- **Total Stake**: 60,000 METAL across both validators
- **Templates**: One-click Metal validator deployment on Akash

### Akash Network
- **Provider**: akash1nj6ygd4ggz589ldtt4e7yklazxm9zpp8cf7yh7
- **Validator**: Cerebro AI 🚀 (akashvaloper163zp6lyavlg7r2cru8djmv6d8qnpvlm0nsnr6s)
- **Templates**: Metal blockchain validator, Decred GUI dashboard
- **Infrastructure**: CPAX Unity server (112 CPU cores, 1TB RAM)

### Decred Network
- **VSP**: https://dcr.cerebro.host (0.888% fee)
- **Infrastructure**: Multi-cloud (Hetzner + Azure)
- **Status**: Production VSP with 9 live tickets
- **Wallets**: 5 voting wallets across 3 geographic locations

## Website Requirements

### Front Page Updates
- Replace single XPR focus with multi-network showcase
- Display 5 network logos: XPR, Metal, Akash, Decred, Metallicus
- Highlight roles: Block Producer, Validator, Provider, VSP
- Link to deployment templates and services

### New Pages Needed
- **Code of Conduct**: Community standards and operational ethics ✅
- **Ownership**: Legal structure and operational transparency ✅
- **Articles**: LinkedIn articles showcase (HTML Complete - Ready for Sitejet - 107 items: 89 articles + 18 videos) ✅
- **Services**: Detailed breakdown of each network's services
- **Templates**: Showcase of Akash deployment templates

### GitHub Integration
- Link to Metal validator template repository
- Link to Decred GUI dashboard repository
- Showcase deployment automation and infrastructure-as-code

## Technical Implementation

Since you're using Sitejet via Namecheap, the implementation will involve:
1. Content creation and organization
2. Visual design with network logos and branding
3. Page structure and navigation updates
4. Integration of service links and GitHub repositories

## Documentation

### Main Project Tracking
- **[CEREBRO-HOST-02-CHANGELOG.md](CEREBRO-HOST-02-CHANGELOG.md)** - Version history
- **[CEREBRO-HOST-03-DEVELOPMENT.md](CEREBRO-HOST-03-DEVELOPMENT.md)** - Development details
- **[CEREBRO-HOST-04-PROGRESS.md](CEREBRO-HOST-04-PROGRESS.md)** - Current status
- **[CEREBRO-HOST-05-DEPLOYMENT.md](CEREBRO-HOST-05-DEPLOYMENT.md)** - Deployment guide
- **[CEREBRO-HOST-06-RAGFILE.md](CEREBRO-HOST-06-RAGFILE.md)** - Technical reference

**Tracking structure**: Main site tracking (CEREBRO-HOST-01 through 06) and articles tracking (`cerebro.host-articles/` CEREBRO.HOST-ARTICLES-01 through 06) are kept **separate by design**. Do not consolidate: the main site and the articles page have different scope, release cycles, and implementation details; each set remains the source of truth for its area.

### Implementation Guides
All implementation guides are in `cerebro.host-main/`:
- `BACKUP-STRATEGY.md` - Backup workflow for safe migration
- `GO-LIVE-CHECKLIST.md` - Complete deployment checklist
- `PUBLIC-HTML-UPLOAD-GUIDE.md` - Guide for uploading files to public_html
- `SITEJET-IMPLEMENTATION-CHECKLIST.md` - Step-by-step Sitejet implementation
- `SITEJET-QUICK-START.md` - Quick start guide for Sitejet builder
- `PASTE-HTML-INSTRUCTIONS.md` - How to paste HTML into Sitejet

### Articles Page
Articles page documentation is in `cerebro.host-articles/`:
- See `cerebro.host-articles/CEREBRO.HOST-ARTICLES-01-README.md` for overview

## Current Status

✅ **Website Live**: Multi-network showcase successfully deployed  
✅ **XPR Endpoints**: All endpoints operational (bp.json, mainnet.cerebro.host)  
✅ **Service Pages**: Code of Conduct and Ownership pages implemented  
✅ **Multi-Network Display**: All 5 networks prominently featured  
✅ **Articles Page**: HTML complete with all 107 items, view toggles, keyword search, mobile optimizations - Ready for Sitejet implementation

## Next Steps

1. **Articles Page Sitejet Implementation**: Upload complete HTML to Sitejet (`/articles` page)
2. **Navigation Integration**: Add Articles link to main site menu
3. Monitor website performance and user feedback
4. Regular content updates for network metrics
5. SEO optimization and analytics integration

---

**Contact**: cerebro@cerebro.host  
**Networks**: XPR • Metal • Akash • Decred • Metallicus
