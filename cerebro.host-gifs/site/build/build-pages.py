#!/usr/bin/env python3
"""Generate site/g/<slug>/index.html -- one shareable page per GIF, carrying OG /
twitter:card tags so a pasted link unfurls with the poster and a real title.
Also writes site/_headers for Cloudflare Pages caching."""
import html, json, os, shutil

SITE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BASE = "https://cerebro.host/gifs"

TPL = """<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>#{num} {title} — XPR Gifs</title>
<meta name="description" content="{alt}">
<meta property="og:title" content="{title}">
<meta property="og:description" content="{alt}">
<meta property="og:type" content="website">
<meta property="og:url" content="{base}/g/{slug}/">
<meta property="og:image" content="{base}/assets/poster/{slug}.jpg">
<meta property="og:image:alt" content="{alt}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="{title}">
<meta name="twitter:description" content="{alt}">
<meta name="twitter:image" content="{base}/assets/poster/{slug}.jpg">
<link rel="canonical" href="{base}/g/{slug}/">
<link rel="icon" type="image/png" sizes="32x32" href="../../assets/brand/favicon-32.png">
<link rel="icon" type="image/png" sizes="256x256" href="../../assets/brand/cerebro-256.png">
<link rel="apple-touch-icon" href="../../assets/brand/apple-touch-icon.png">
<link rel="stylesheet" href="../../styles.css">
</head>
<body>
<header>
  <div class="wrap">
    <p class="eyebrow"><a href="../../">← XPR Gifs</a></p>
    <h1>#{num} · {title}</h1>
    <p class="lede">{alt}</p>
  </div>
</header>
<main>
  <div class="wrap" style="max-width:620px">
    <img src="../../assets/gif/{slug}.gif" alt="{alt}"
         style="width:100%;border-radius:12px;border:1px solid var(--border)">
    <div style="display:flex;flex-direction:column;gap:12px;margin-top:20px">
      <a class="btn btn-primary" id="dl" href="../../assets/gif/{slug}.gif?dl=1"
         download="{slug}.gif">Download GIF</a>
      <p class="hint"><strong>Download, then drag into your X post</strong> —
         X only animates uploaded files, not links.</p>
      <div class="btn-row">
        <a class="btn btn-ghost" href="../../assets/mp4/{slug}.mp4" download="{slug}.mp4">MP4</a>
        <a class="btn btn-ghost" href="../../">Browse all {count} gifs</a>
      </div>
      <div class="platforms">
        <p style="margin:0"><strong>X, Instagram and most social apps</strong> need the
        file itself — a link shows a still frame. Chat apps vary: some animate a pasted
        link, some don't. When in doubt, download and attach.</p>
      </div>
    </div>
  </div>
</main>
<script>
/* This page is static, so the mobile-variant swap app.js does has to happen here
   too -- otherwise a phone gets the full-size GIF, which for the 20 heavy items is
   over X's 5MB mobile cap and simply will not upload. */
(function () {{
  if (!{has_mobile}) return;
  if (!window.matchMedia('(max-width: 820px)').matches) return;
  var a = document.getElementById('dl');
  a.href = '../../assets/gif-mobile/{slug}.gif?dl=1';
}})();
</script>
</body>
</html>
"""

HEADERS = """# Immutable assets -- filenames change when content changes.
/assets/*
  Cache-Control: public, max-age=31536000, immutable
  Access-Control-Allow-Origin: *

/gifs-data.json
  Cache-Control: public, max-age=300

/*
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
"""

def main():
    data = json.load(open(os.path.join(SITE, "gifs-data.json")))
    n = data["count"]
    for g in data["gifs"]:
        d = os.path.join(SITE, "g", g["slug"])
        os.makedirs(d, exist_ok=True)
        with open(os.path.join(d, "index.html"), "w") as f:
            f.write(TPL.format(
                title=html.escape(g["title"]), alt=html.escape(g["alt"]),
                slug=g["slug"], num=html.escape(g.get("num", "")), base=BASE, count=n,
                has_mobile="true" if g.get("hasMobile") else "false"))
    # Drop pages for slugs that left the catalog, or a removed GIF keeps a live,
    # indexable page pointing at assets that no longer exist.
    live = {g["slug"] for g in data["gifs"]}
    gdir = os.path.join(SITE, "g")
    for slug in os.listdir(gdir):
        d = os.path.join(gdir, slug)
        if os.path.isdir(d) and slug not in live:
            shutil.rmtree(d)
            print(f"pruned g/{slug}/")

    with open(os.path.join(SITE, "_headers"), "w") as f:
        f.write(HEADERS)
    print(f"wrote {n} deep-link pages + _headers")
    if not os.path.exists(os.path.join(SITE, "404.html")):
        print("  ! 404.html missing -- Pages will soft-200 unknown paths with index.html")

if __name__ == "__main__":
    main()
