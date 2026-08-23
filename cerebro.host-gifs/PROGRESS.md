# Progress — cerebro-gifs GIF library

_Last updated: 2026-08-23 (deployed)_

Two parallel sets, tied together by a shared number:
- **Wave masters** — source clips in `wave1`–`wave4` (mostly `.mp4`).
- **Live gifs** — published `.gif` versions in `live gifs/`.

For any given number `N`, the wave master and the live gif share the **same base name**.

## Snapshot

| Metric | Count |
|---|---|
| Wave master files (`wave1`–`wave4`) | 84 |
| Live gifs numbered | 69 |
| Live gifs un-numbered | 0 |
| Numbers present in **both** sets | 60 |
| Name mismatches on shared numbers | **0** ✅ |

## ✅ Done
- Global 1–84 numbering of the wave library.
- All live gifs numbered and name-matched to their wave masters.
- Metadata-verified matches for every ambiguous case.
- Removed the colbert duplicate (old wave 82).

## 🔵 Live-only (published, no wave master yet) — 85–92
New content that exists as a live gif but has no source clip in the wave library.
If you want the libraries fully mirrored, these need wave masters created.

## 🟡 Wave-only (master exists, not yet published as a live gif) — 23
Numbers: `1, 3, 5, 8, 10, 11, 13, 15, 16, 17, 18, 19, 23, 24, 25, 40, 56, 59, 62, 72, 76, 81, 83`
These are the "missing for now" items — masters that don't yet have a published live gif.

## ⚠️ Open items / decisions
- **#1 is doubled** — the wave library has two `1-` files (`1-fry-…` and
  `1-new-fry-…`) and the live side has `1.1-new-fry-…`. Decide whether `new-fry`
  should get its own number or stay as the `1.1` variant.
- **#82 is now free** (colbert dup removed) — available if you want to reuse it.
- **`happy gilmore`**: wave **10** (4.5s) and live **91** `happy gilmore shooter`
  (3.0s) are different lengths — treated as separate clips, not a match. Confirm if intended.

## Naming notes (from copying live-gif names onto wave masters)
Some wave masters lost descriptive/brand info when renamed to the shorter live names —
flag if you want them restored:
- **2** `Lock In $XPR` → `lockin` (dropped `$XPR`)
- **7** `Antonio Margheriti $XPR` → `margharetti` (dropped `$XPR`)
- **21** `Feels $XPR` → `wojak hugs` (dropped `$XPR`)
- **47** `wolfof. chest beat` → `wolf of` (dropped "chest beat")
- **44** now `Donald Duck Money GIF (1)` (carries junky `(1)` / `GIF`)

## Next steps (when ready)
1. Resolve the `#1 / 1.1 new-fry` double.
2. Decide whether to create wave masters for live-only **85–92**.
3. Optionally produce a CSV tracker mapping each number → wave file → live gif →
   Tenor URL → Giphy URL for channel management.

## XPR Gifs web library (`site/`) — 2026-08-23

Public library for `gifs.cerebro.host`. Built because X dropped Tenor (Giphy-only now)
and the Giphy creator account was denied.

| Metric | Count |
|---|---|
| GIFs published | 79 |
| — from `live gifs/` | 72 (one dupe dropped: `leo toast.gif`) |
| — from `1new/` | 7 (flagged `new`) |
| Network: $XPR / $MTL / unbranded | 63 / 6 / 10 |
| GIFs needing a <5MB mobile variant | 14 |
| Deep-link pages generated | 79 |
| Initial page load | 0 gif + 0 mp4 requests (verified via netlog) |

### Deployed 2026-08-23
- **Live at https://xpr-gifs.pages.dev** — Cloudflare Pages project `xpr-gifs`,
  account `50a670e61c07a36d77ba423be605b7f0`, 413 files, 78 gifs.
- `_headers` confirmed applied: assets return `cache-control: immutable` + CORS `*`.
- Hover playback confirmed working in a real browser.

### Still open
- **`gifs.cerebro.host` is `pending`.** The Pages custom domain is registered but will
  not validate until a DNS record exists. The wrangler OAuth token has `zone (read)`
  only — no DNS write — so this needs the dashboard:
  `cerebro.host` → DNS → add **CNAME `gifs` → `xpr-gifs.pages.dev`**, proxied.
  Zone id `7212c6a9bc34d429969d0d54cc6e6470`.
- **`SUBMIT_URL` in `site/app.js` is a placeholder** (`https://t.me/cerebro_ai`) —
  point it at the real community channel before launch.
- Platform claims were removed from the UI entirely (never verified; the earlier
  LAN-URL test was invalid because Telegram/Signal unfurl server-side and could not
  reach 192.168.1.123). Now testable for real against a public URL:
  https://xpr-gifs.pages.dev/assets/gif/pepe-take-my-money.gif
- Sitejet nav link from cerebro.host → gifs.cerebro.host not yet added.

### Conversion backlog — 28 wave MP4s with no GIF
Highest value first (branded): `wave1/3-Do It! $XPR`, `wave5/93-napoleon dynamite yes xpr`,
`wave5/94-napoleon dynamite yes mtl`, `wave1/1-fry-Shut up and take my money XPR`.
Remainder: wave1 `1-new-fry…`; wave2 `5-i'm in`, `8-Dog Smile Shyboos`, `10-happy gilmore`,
`11-jack nicholson yes`, `13-leo toast`, `15-shaq shimmy`, `16-so cool face`,
`17-surprise chris pratt`, `19-tomjerry-love`; wave3 `23-charlie murphy`, `24-chappelle`,
`25-fry shocked`, `40-arnold`; wave4 `56-pepe-crazy`, `59-pepe-thinking`, `62-pepe-money`,
`72-ted lasso yes`, `76-star trek make it so`, `81-joe rogan omg`, `83-blinking-white-guy`;
wave5 `90-learning SpongeBob`, `95-One Piece Ace`, `96-wolf of - leo dance`.

Adding one later: drop the GIF in, add a `catalog.json` record, rerun
`build-assets.py` then `build-pages.py`. No page changes.
