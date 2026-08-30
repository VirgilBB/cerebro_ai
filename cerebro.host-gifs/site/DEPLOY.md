# Deploying XPR Gifs → cerebro.host/gifs

Target: **Cloudflare Pages**. Chosen because `cerebro.host` nameservers are already
Cloudflare (`magali.ns.cloudflare.com` / `tosana.ns.cloudflare.com`), egress is free,
and the largest asset (11MB) is under the 25MB/file limit.

Not Sitejet (no real asset hosting) and not Hetzner (96% disk, 3.2GB free).

## 0. Before the first deploy

Two things need a human:

1. **Point `SUBMIT_URL` at the real channel.** `site/app.js` line ~9 currently holds a
   placeholder, `https://t.me/cerebro_ai`.
2. **Verify the platform table.** `site/index.html` and every `site/g/*/index.html`
   claim Discord / Telegram / Slack / Reddit animate a remote GIF link, and that X /
   Instagram / WhatsApp / Signal / Facebook / LinkedIn / Bluesky do not. Paste a real
   asset URL into each and correct anything that is wrong. These were not hand-tested.

## 1. Build the assets

Derivatives are not in git. From `cerebro.host-gifs/`:

```bash
python3 site/build/build-assets.py     # ~40s, writes site/assets/ + site/gifs-data.json
python3 site/build/build-pages.py      # writes site/g/<slug>/ + site/_headers
```

Expected: 100 gif / 100 poster / 100 preview / 100 mp4 / 20 gif-mobile.
The script exits non-zero and lists problems if anything failed. Both scripts
prune derivatives and pages for slugs that have left the catalog.

## 2. Authenticate (interactive — run this yourself)

```bash
npx wrangler@4.123.0 login
```

Pinned to 4.123.0: it is 10 days old. 4.124.0 (5d) and 4.125.0 (3d) violate the
7-day minimum-release-age rule. Re-check with `npm view wrangler time --json` before
bumping.

## 3. Deploy

```bash
cd cerebro.host-gifs
npx wrangler@4.123.0 pages project create xpr-gifs --production-branch main   # first time only
npx wrangler@4.123.0 pages deploy site --project-name xpr-gifs --branch main
```

**`--branch main` is not optional.** Wrangler infers the branch from git, and this
repo's working branch is `xpr-gifs`, so omitting it publishes a preview deployment
that `xpr-gifs.pages.dev` (and therefore `cerebro.host/gifs`) never serves. The
deploy "succeeds" and the live site does not change.

## 4. Custom domain

In the Cloudflare dashboard → Workers & Pages → xpr-gifs → Custom domains → add
`gifs.cerebro.host`. Cloudflare creates the CNAME automatically since the zone is
already there.

## 5. Verify after deploy

```bash
curl -sI https://cerebro.host/gifs/ | head -1                       # 200
curl -sI https://cerebro.host/gifs/assets/gif/pepe-take-my-money.gif | grep -i 'content-type\|cache'
curl -sI https://cerebro.host/gifs/g/pepe-take-my-money/ | head -1   # 200
```

Then by hand, in a real browser (none of this was confirmable headlessly):

- [ ] Hover a card → it animates. Scroll away and back → no request storm.
- [ ] DevTools Network, hard reload → **zero `.gif` and `.mp4` requests** until hover.
      This is the load-bearing invariant; if it breaks the page becomes a 338MB scroll.
- [ ] Download a GIF, drag it into the X composer → it animates. The actual user story.
- [ ] On a phone: tap-to-play works, and one of the 14 heavy GIFs downloads under 5MB.
- [ ] OS reduce-motion on → nothing autoplays, play icons appear.
- [ ] Paste a `/g/<slug>/` link into Telegram → animates.

## 6. Link it from cerebro.host

Add a nav item "XPR Gifs" → `https://cerebro.host/gifs` in the Sitejet editor.

## Removing a GIF: purge the edge cache

`_headers` caches `/assets/*` as `immutable, max-age=31536000`. Deleting an item
removes it from the origin (both build scripts prune, and `404.html` makes unknown
paths return a real 404), **but the bytes stay served from Cloudflare's cache for up
to a year.** The Worker fetches from `xpr-gifs.pages.dev`, so that is the hostname to
purge, not `cerebro.host`:

Cloudflare dashboard → Caching → Configuration → Purge Custom URLs, e.g.

```
https://xpr-gifs.pages.dev/assets/gif/<slug>.gif
https://xpr-gifs.pages.dev/assets/mp4/<slug>.mp4
https://xpr-gifs.pages.dev/assets/poster/<slug>.jpg
https://xpr-gifs.pages.dev/assets/preview/<slug>.mp4
```

The wrangler OAuth token cannot do this — it has no `cache_purge` scope, so the API
route needs a token created for it.

## Adding GIFs later

Drop the file into `live gifs/` and add a record to `site/build/catalog.json`, then
rerun both build scripts and redeploy. No page changes.

The source may be a **`.gif` or a `.mp4`** — an mp4 is encoded to a 480px GIF by
`build-assets.py`. `num`, `reaction`, `source` and `alt` are mandatory; the build
rejects a record without them.

**Layout.** GIFs go in `live gifs/`, pristine source mp4s in `live mp4s/` (the old
`wave1`–`wave5` split is gone). `find_source_mp4` matches a GIF to its mp4 by
**basename only** — never fuzzily, because several near-name-matches are the same
scene with a different brand watermark. Where the names genuinely differ, set an
explicit, frame-verified `mp4src`.

**Numbering.** `num` is what the card badge shows and defaults to the numeric prefix
of the source filename, but the catalog value is authoritative. Convention: an XPR
cut takes the whole number and its Metal twin takes the `.1` — `#13` / `#13.1`,
`#97` / `#97.1`. Standalone Metal items (no XPR counterpart) keep a whole number.
