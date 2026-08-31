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
<meta name="color-scheme" content="dark light">
<meta name="theme-color" content="#0a0c0e" media="(prefers-color-scheme: dark)">
<meta name="theme-color" content="#f6f8f9" media="(prefers-color-scheme: light)">
<meta name="description" content="{alt}">
<meta property="og:title" content="{title}">
<meta property="og:description" content="{alt}">
<meta property="og:type" content="website">
<meta property="og:url" content="{base}/g/{slug}/">
<meta property="og:image" content="{base}/assets/card/{slug}.jpg?v={v}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:type" content="image/jpeg">
<meta property="og:image:alt" content="{alt}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="{title}">
<meta name="twitter:description" content="{alt}">
<meta name="twitter:image" content="{base}/assets/card/{slug}.jpg?v={v}">
<meta name="twitter:image:alt" content="{alt}">
<link rel="canonical" href="{base}/g/{slug}/">
<link rel="icon" type="image/png" sizes="32x32" href="../../assets/brand/favicon-32.png">
<link rel="icon" type="image/png" sizes="256x256" href="../../assets/brand/cerebro-256.png">
<link rel="apple-touch-icon" href="../../assets/brand/apple-touch-icon.png">
<link rel="stylesheet" href="../../styles.css">
<script>
try {{
  var t = localStorage.getItem('gifs-theme');
  if (t === 'light' || t === 'dark') document.documentElement.setAttribute('data-theme', t);
}} catch (e) {{}}
</script>
</head>
<body>
<header>
  <div class="wrap">
    <button type="button" id="theme" aria-label="Switch colour scheme" title="Switch colour scheme">
      <svg class="i-sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
           stroke-linecap="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>
      <svg class="i-moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
           stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>
    </button>
    <p class="eyebrow"><a href="../../">← XPR Gifs</a></p>
    <h1>#{num} · {title}</h1>
    <p class="lede">{alt}</p>
  </div>
</header>
<main>
  <div class="wrap" style="max-width:620px">
    <img src="../../assets/gif/{slug}.gif?v={v}" alt="{alt}"
         style="width:100%;border-radius:12px;border:1px solid var(--border)">
    <div style="display:flex;flex-direction:column;gap:12px;margin-top:20px">
      <a class="btn btn-primary" id="dl" href="../../assets/gif/{slug}.gif?v={v}&amp;dl=1"
         download="{slug}.gif">Download GIF</a>
      <p class="hint"><strong>Download, then attach it to your X post.</strong>
         X only animates files you upload — a pasted link shows a still frame.</p>
      <div class="btn-row">
        <a class="btn btn-ghost" href="../../assets/mp4/{slug}.mp4?v={v}" download="{slug}.mp4">MP4</a>
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
/* These pages do not load app.js, so the scheme toggle needs its own handler --
   otherwise the button renders and does nothing. */
(function () {{
  var btn = document.getElementById('theme'), root = document.documentElement;
  if (!btn) return;
  btn.addEventListener('click', function () {{
    var cur = root.getAttribute('data-theme') ||
      (window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
    var next = cur === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    try {{ localStorage.setItem('gifs-theme', next); }} catch (e) {{}}
  }});
}})();

/* This page is static, so the mobile-variant swap app.js does has to happen here
   too -- otherwise a phone gets the full-size GIF, which for the 20 heavy items is
   over X's 5MB mobile cap and simply will not upload. */
(function () {{
  if (!{has_mobile}) return;
  if (!window.matchMedia('(max-width: 820px)').matches) return;
  var a = document.getElementById('dl');
  a.href = '../../assets/gif-mobile/{slug}.gif?v={v}&dl=1';
}})();
</script>
</body>
</html>
"""

HEADERS = """# Immutable assets -- filenames change when content changes.
/assets/*
  Cache-Control: public, max-age=31536000, immutable
  Access-Control-Allow-Origin: *

# The page polls this to pick up new gifs without a refresh, so the window in
# which an addition stays invisible is exactly this number. 30s is cheap -- the
# file is ~40KB and only fetched by open tabs.
/gifs-data.json
  Cache-Control: public, max-age=30

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
                has_mobile="true" if g.get("hasMobile") else "false",
                v=html.escape(g.get("v", ""))))
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
