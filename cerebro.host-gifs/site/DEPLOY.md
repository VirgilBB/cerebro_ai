# Deploying XPR Gifs → gifs.cerebro.host

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

Expected: 79 gif / 79 poster / 79 preview / 79 mp4 / 14 gif-mobile, ~338MB total.
The script exits non-zero and lists problems if anything failed.

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
npx wrangler@4.123.0 pages deploy site --project-name xpr-gifs
```

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

## Adding GIFs later

Drop the `.gif` into `live gifs/`, add a record to `site/build/catalog.json`
(`reaction`, `source` and `alt` are mandatory — the build rejects a record without
them), rerun both build scripts, redeploy. No page changes.
