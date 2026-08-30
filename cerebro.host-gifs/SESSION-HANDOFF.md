# Session Handoff — XPR Gifs

> Live context-passing doc for anyone picking up the XPR Gifs library. Written so a
> fresh session can orient in under 60 seconds with zero prior context.

## Last Updated
2026-08-30

## Latest Commit
`0533412` Keep cerebro.host/gifs as canonical; footer links open in new tab

## Status: SHIPPED ✅

**Live at https://cerebro.host/gifs** — 100 gifs, browsable, downloadable.
Every item is watermarked and numbered.

---

## What Shipped This Session (2026-08-30)

### MP4 sources, numbering, unbranded cleanup — 103 → 100 items

**The build now accepts a `.mp4` as a catalog `src`** and encodes the GIF itself at
480px (`gif_from_mp4`). Previously only a GIF could be a source, so `100-one piece
luffy-laughing xpr.mp4` could not be published. The GIF→MP4 direction already
existed; this is the reverse.

Three landmines found while wiring it up, all fixed:

- **`make_poster` silently wrote a 0-byte file for any mp4 input.** `mjpeg` rejects
  limited-range `yuv420p` (`Non full-range YUV is non-standard`). Needs
  `format=yuvj420p` in the filter chain. GIF sources decode to RGB and never hit it.
- **Short clips were being decimated.** Capping at 20fps turned a 5-frame reaction
  loop into 3 frames. `encode_gif` now keeps source fps when the clip is ≤30 frames.
- **Neither build script pruned.** Removing a catalog record left its derivatives and
  its `g/<slug>/` page live. Both now delete orphans, and `404.html` was added —
  without it Pages soft-200s every unknown path with `index.html`, so a deleted GIF
  looked like it was still there.

### Branding audit — the definitive answer

Audited all 103 at **full frame**. Exactly **7 carried no XPR/Metallicus mark**, and
they were exactly the 7 with no numeric filename prefix — the whole `1new/` set.
Everything from `live gifs/` is branded.

The mark is often at the **top**, not the bottom: `1.1`, `3`, `25`, `50`, `55`, `66`,
`67`, `80`, `85`, `90`, `91`, `92` all read as bare from a bottom-crop and are not.
Crop the content bbox and check top and bottom, or you will re-run the same mistake
the 2026-08-24 session made from a too-small contact sheet.

`luffy-laughing` was repointed to the watermarked **#100** (slug kept, so the existing
deep link still resolves). The other 6 were **pulled**, pending re-export with a logo
— listed at the bottom of this file. One of them, `one-piece-conquerors-haki`, also
carries a third-party creator watermark (`@mod515`); it needs a clean source, not just
a logo, and would have been a problem for the Giphy Brand application too.

### Numbering

Every record now carries `num`, taken from the source filename prefix, and it is a
**publish gate** — a record without one fails the build. That is what stops the
unnumbered/unbranded class reappearing silently. It shows as a chip top-left on each
card (the `New` badge moved to top-right to make room), in the lightbox title, in the
`g/<slug>/` page title, and it is searchable, so typing `67` finds #67.

`fry-take-my-money-mtl` was repointed from `1.1-fry take my money mtl.gif` to
`86-fry take my money metal.gif` — sha256-identical bytes, but a unique number, which
resolved the only numbering collision.

### Added from the backlog

`97-fight bear xpr`, `98-fight bear mtl`, `99-one piece garf laugh2 xpr` were finished
and watermarked but had never been catalogued — invisible on the site since Aug 26.
#99's mp4 lives in `live gifs/`, not `wave*/`, so it needs an explicit `mp4src`;
`find_source_mp4` only scans the wave folders and that is deliberate.

### Deploy gotcha that cost a cycle

`wrangler pages deploy` infers the branch from git. This repo's working branch is
`xpr-gifs`, so the first deploy went to a **preview** URL and the live site did not
change, while the command reported success. **Always pass `--branch main`.**

### Still open

The 6 pulled GIFs are gone from the origin but their `.gif` bytes remain in
Cloudflare's cache (`immutable, max-age=31536000`). Purge
`https://xpr-gifs.pages.dev/assets/{gif,mp4,poster,preview}/<slug>.*` in the
dashboard — the wrangler OAuth token has no `cache_purge` scope. See DEPLOY.md.

---

## What Shipped This Session (2026-08-24)

### Why this exists
X removed Tenor from its composer (Giphy-only now) and the Giphy creator-account
application was denied. The community had no route to these GIFs. This is the
stopgap.

**The constraint that shaped everything:** an animated GIF *cannot* be made to play
in an X post from a URL. Only uploaded files animate; link cards show the first frame.
So the page is built around making download-then-drag feel deliberate, not around
pretending a link will work.

### Architecture
```
cerebro.host/gifs           <- public URL
  └─ Worker `xpr-gifs-route`   routes cerebro.host/gifs + /gifs/*
       └─ strips the /gifs prefix, proxies to:
          xpr-gifs.pages.dev  <- Cloudflare Pages project `xpr-gifs`
                                 (413 files, all assets live here)
```
cerebro.host is a **Sitejet** site proxied through Cloudflare. Sitejet has no CLI or
repo, so files cannot be deployed into it — the Worker intercepts the route *before*
the request reaches Sitejet. The rest of cerebro.host is untouched.

DNS note: domain is **registered at Namecheap but DNS is delegated to Cloudflare**
(`magali.ns.cloudflare.com`). Records added in Namecheap are silently ignored.

### Built
- `site/build/catalog.json` — hand-authored taxonomy, 78 gifs. Publish gate: a record
  missing `reaction`, `source` or `alt` fails the build.
- `site/build/build-assets.py` — per gif: download copy, <5MB mobile variant (14 of
  them), JPEG poster, 480px preview mp4, 720px alt-download mp4.
- `site/build/build-pages.py` — 78 deep-link pages at `/g/<slug>/` + `_headers`.
- `site/` — the page. Dark chrome, emerald `#10B981`, uniform grid, search +
  reaction/source/network chips, lightbox.

### Decisions made (and why)
- **Grid paints posters only.** Verified by netlog: 0 `.gif` / 0 `.mp4` requests on
  initial load. Motion attaches on hover/tap, IntersectionObserver-gated. Without this
  the page is a 340MB scroll. **Do not relax this for any feature.**
- **Branding audited from rendered frames, not filenames.** Filename guesses were
  badly wrong — actual split is 73 $XPR / 5 $MTL. Nothing is unbranded -- rule from the user:
  when in doubt it is XPR. A first pass wrongly marked 10 as unbranded; 3 of those
  genuinely carried a watermark that was unreadable at the tile size used, so ALWAYS
  audit branding at full frame size, not from a small contact sheet.
- **MP4 download kept alongside GIF** (user decision, 2026-08-24). All 78 have one:
  64 from pristine `wave*` originals, 14 transcoded from the GIF (softer, still fine).
- **No submission CTA.** Removed entirely — this library is for *taking* gifs, not
  collecting them. Retired the placeholder `SUBMIT_URL` with it.
- **Copy-link is a card-level action** beside download, since those two are the whole
  point of the page.
- **No platform table.** Earlier claims about which apps animate a remote GIF link were
  never verified and are NOT in the UI. See open items.
- **`mp4src` overrides are frame-verified only, never fuzzy-matched.** Several
  near-name-matches are the same scene with a *different brand watermark* —
  `fry-take-my-money-mtl` matched an XPR-branded mp4 and would have shipped off-brand.

### Deliberately NOT done
- **Hero button on cerebro.host is deferred** (user decision, 2026-08-24). The main
  site is not being updated for now. Ready-to-paste snippet sits at
  `site/ADD-GIFS-BUTTON.md` — it needs a column wrapper because `.hero-inner` is a flex
  row, so a bare second anchor lands *beside* News rather than above it.
- **`gifs.cerebro.host` was explored and removed** (2026-08-24). It is no longer on
  the Pages project. The path route needs no DNS record at all -- cerebro.host already
  resolves and the Worker intercepts `/gifs*`. If the subdomain is ever wanted: re-add
  it as a Pages custom domain and create CNAME `gifs -> xpr-gifs.pages.dev` in
  **Cloudflare** (the domain is registered at Namecheap but DNS is delegated to
  Cloudflare, so Namecheap records are ignored).

---

## Open items
1. **Worker request ceiling.** `/gifs` runs through a Worker; Cloudflare free tier is
   100k requests/day ≈ **~1,200 page views/day** (one page load is ~80 requests). Fine
   for launch. If it is ever hit: $5/mo Workers Paid, or activate the subdomain.
2. **Which chat apps animate a remote GIF link is UNVERIFIED.** An earlier test looked
   like a failure but was invalid — Telegram/Signal unfurl server-side and were handed
   a LAN URL they could never reach. Now testable for real:
   `https://cerebro.host/gifs/assets/gif/pepe-take-my-money.gif`
3. **Quote-post probe never run.** Post one gif as native X media, quote-post it, see
   if it animates. If yes, that is a genuine one-click share path.
4. **28 wave MP4s still have no GIF conversion** and are absent from the library. List
   in `PROGRESS.md`. Branded ones are highest value.

## Adding a gif later
Drop the `.gif` into `live gifs/`, add a `catalog.json` record (`reaction`, `source`,
`alt` mandatory), then:
```bash
python3 site/build/build-assets.py
python3 site/build/build-pages.py
npx wrangler@4.123.0 pages deploy site --project-name xpr-gifs --branch main
```
No page changes needed. Media (~580MB) is gitignored; derivatives rebuild from source.


---

## Pending: 6 GIFs pulled 2026-08-30, awaiting a logo

Re-export with an XPR Network or Metallicus watermark **and a number**, then drop the
file in and add a catalog record. A `.mp4` is fine now — the build converts it.

| source file | note |
|---|---|
| `1new/point finger GIF.gif` | |
| `1new/One Piece Conquerors Haki.gif` | also carries `@mod515` — needs a clean source, not just a logo |
| `1new/One Piece Laughing.gif` | |
| `1new/popcorn black dude.gif` | |
| `1new/popcorn Michael Jackson.gif` | |
| `1new/popcorn snl.gif` | |
