# Session Handoff — XPR Gifs

> Live context-passing doc for anyone picking up the XPR Gifs library. Written so a
> fresh session can orient in under 60 seconds with zero prior context.

## Last Updated
2026-08-24

## Latest Commit
`0533412` Keep cerebro.host/gifs as canonical; footer links open in new tab

## Status: SHIPPED ✅

**Live at https://cerebro.host/gifs** — 78 gifs, browsable, downloadable.

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
- **`gifs.cerebro.host` was explored and abandoned.** It is still registered on the
  Pages project in `pending` state and is inert. Activating it only needs a CNAME
  `gifs -> xpr-gifs.pages.dev` added in **Cloudflare** (not Namecheap). Left as an
  escape hatch.

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
