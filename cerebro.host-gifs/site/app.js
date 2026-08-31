/* XPR Gifs -- grid, filters, hover playback, lightbox.

   There is deliberately no "Post on X" button. x.com/intent/post accepts text
   and a url and nothing else -- there is no media parameter, so an intent link
   can never carry the gif. X animates a gif only when the file goes through its
   media upload endpoint, which needs OAuth user context and a paid API tier.
   A button that opened the composer with a link in it produced a still frame
   every time, which is worse than not offering it: it looks like it works.
   Downloading the file is the only path to an animated gif in a post.

   Hard rule: the grid paints posters only. No .gif or .mp4 byte is fetched until
   the user shows intent (hover on desktop, tap on touch). 100 items at ~3MB each
   would otherwise be a quarter-gigabyte scroll. */

'use strict';

var REACTIONS = [
  ['take-my-money', 'Take My Money'], ['let-him-cook', 'Let Him Cook'],
  ['approval', 'Approval'], ['hype', 'Hype'], ['celebration', 'Celebration'],
  ['confused', 'Confused'], ['popcorn', 'Popcorn'], ['cope', 'Cope']
];
var SOURCES = [
  ['pepe', 'Pepe'], ['one-piece', 'One Piece'], ['cats', 'Cats'], ['goku', 'Dragon Ball'],
  ['fry', 'Fry'], ['drake', 'Drake'], ['other', 'Everything else']
];
var NETWORKS = [['xpr', '$XPR'], ['mtl', '$MTL / Metallicus'], ['none', 'Unbranded']];

var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
var coarse = window.matchMedia('(hover: none)').matches;

/* Dragging a card out to a folder lands a real, named .gif -- but only via the
   `DownloadURL` dataTransfer entry, which is Chromium-only. Firefox and Safari
   get the link instead, so the shortcut is only mentioned where it works.
   Confirmed by hand in Chrome; note this is a drag to the FILESYSTEM. Dropping
   on another website still conveys a link, whatever the browser. */
var canDragOut = (function () {
  if (coarse) return false;
  var uad = navigator.userAgentData;
  if (uad && uad.brands) {
    return uad.brands.some(function (b) { return b.brand === 'Chromium'; });
  }
  return /Chrome\/|Chromium\//.test(navigator.userAgent);
})();
if (reduced) document.body.classList.add('reduced');


var LINK_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"' +
  ' stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0' +
  ' 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>';
var TICK_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"' +
  ' stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>';

function copyLink(url, btn) {
  var restore = btn.innerHTML;
  var isBtn = btn.classList.contains('cp');
  var done = function () {
    btn.innerHTML = isBtn ? TICK_ICON : btn.innerHTML;
    if (!isBtn) btn.textContent = 'Copied';
    btn.classList.add('copied');
    setTimeout(function () {
      btn.classList.remove('copied');
      if (isBtn) btn.innerHTML = restore; else btn.textContent = 'Copy link';
    }, 1500);
  };
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(url).then(done, function () { prompt('Copy this link:', url); });
  } else {
    prompt('Copy this link:', url);
  }
}


/* Network synonyms, so someone typing "xpr", "mtl", "metal" or "metallicus" finds
   the branded gifs -- the network is a chip facet, but people type it too. */
var NETWORK_WORDS = {
  xpr: 'xpr $xpr xpr network proton',
  mtl: 'mtl $mtl metal metallicus metal blockchain'
};

function haystack(g) {
  return (g.title + ' ' + g.tags.join(' ') + ' ' + g.alt + ' ' +
          '#' + g.num + ' ' + g.num + ' ' +
          (NETWORK_WORDS[g.branded] || '') + ' ' +
          g.reaction.replace(/-/g, ' ') + ' ' +
          g.source.replace(/-/g, ' ')).toLowerCase();
}


/* Drag-out support.
 *
 * Two mechanisms, because no single one covers everything:
 *   1. `DownloadURL` -- Chrome/Edge only. Lets a drag out of the browser land as a
 *      real, correctly-named .gif on the desktop or in a file picker.
 *   2. text/uri-list + text/plain -- the universal fallback. Targets that accept a
 *      URL (most chat composers) get the absolute gif link.
 *
 * What this does NOT do is put the file into another website. Dropping on x.com
 * delivers text/uri-list -- a link, which X renders as a still frame. A page
 * cannot hand a File to a cross-origin drop target; `items.add(file)` above is
 * kept only because it is free when ignored. Confirmed against the live site.
 * The only route to an animated gif in a post is downloading it and attaching it,
 * so that is what the copy says.
 */
function absUrl(path) {
  return new URL(path, location.href).href;
}

/* Blobs kept so dragstart -- which is synchronous and cannot await -- has a real
   File ready to offer. Populated when the lightbox opens; the .gif is already in
   cache by then, so this costs nothing. */
var fileCache = {};

function prefetchFile(g) {
  if (fileCache[g.slug]) return;
  fetch(gifHref(g))
    .then(function (r) { return r.ok ? r.blob() : null; })
    .then(function (b) {
      if (b) fileCache[g.slug] = new File([b], g.slug + '.gif', { type: 'image/gif' });
    })
    .catch(function () { /* drag falls back to the URL */ });
}

function attachDrag(el, g) {
  el.addEventListener('dragstart', function (e) {
    var href = absUrl(gifHref(g));
    var name = g.slug + '.gif';

    // Best effort: offer an actual File. Whether a cross-origin drop target ever
    // receives it is up to the browser -- Chromium historically does not deliver
    // page-authored Files to another site. Harmless when ignored.
    var f = fileCache[g.slug];
    if (f) {
      try { e.dataTransfer.items.add(f); } catch (err) { /* ignored */ }
    }
    try {
      // Chromium only: makes a drop onto the filesystem land as a named .gif.
      e.dataTransfer.setData('DownloadURL', 'image/gif:' + name + ':' + href);
    } catch (err) { /* not supported elsewhere */ }
    e.dataTransfer.setData('text/uri-list', href);
    e.dataTransfer.setData('text/plain', href);
    e.dataTransfer.effectAllowed = 'copy';
  });
}


/* Counts what Cloudflare Web Analytics cannot see: downloads, copies, shares.
   Fire-and-forget; failures are ignored so a blocked beacon never breaks a click. */
function track(ev, slug) {
  try {
    var u = 'https://cerebro.host/gifs/__e?ev=' + encodeURIComponent(ev) +
            '&slug=' + encodeURIComponent(slug);
    if (navigator.sendBeacon) navigator.sendBeacon(u);
    else fetch(u, { method: 'GET', mode: 'no-cors', keepalive: true });
  } catch (e) { /* never let analytics break an action */ }
}

var gifs = [];
var filters = { q: '', reaction: null, source: null, network: null };
var grid = document.getElementById('grid');
var countEl = document.getElementById('count');
var emptyEl = document.getElementById('empty');

/* ---------------- boot ---------------- */

fetch('gifs-data.json')
  .then(function (r) {
    if (!r.ok) throw new Error('HTTP ' + r.status);
    return r.json();
  })
  .then(function (data) {
    gifs = data.gifs || [];
    // The build already writes these in numeric order; re-sort defensively so a
    // stale or hand-edited gifs-data.json can never scramble the grid.
    gifs.sort(function (a, b) { return parseFloat(a.num) - parseFloat(b.num); });
    gifs.forEach(function (g) { g._hay = haystack(g); });
    buildChips();
    render();
    openFromHash();
  })
  .catch(function (err) {
    grid.innerHTML = '';
    emptyEl.hidden = false;
    emptyEl.textContent = 'Could not load the GIF library (' + err.message + '). Try a refresh.';
  });

/* ---------------- first-visit banner ---------------- */

(function () {
  var banner = document.getElementById('banner');
  if (canDragOut) {
    var line = document.getElementById('banner-line');
    if (line) {
      line.textContent = ' Drag one straight to your desktop, or download it — then ' +
        'attach it to your post. A pasted link shows a still frame.';
    }
  }
  var seen;
  try { seen = localStorage.getItem('xprgifs-banner'); } catch (e) { seen = null; }
  if (!seen) banner.hidden = false;
  document.getElementById('banner-close').addEventListener('click', function () {
    banner.hidden = true;
    try { localStorage.setItem('xprgifs-banner', '1'); } catch (e) { /* private mode */ }
  });
})();

/* ---------------- chips ---------------- */

function buildChips() {
  // [containerId, label, options, filterKey, dataField]
  // filterKey and dataField differ for network: the record field is `branded`.
  var groups = [
    ['chips-reaction', 'Reaction', REACTIONS, 'reaction', 'reaction'],
    ['chips-source', 'Source', SOURCES, 'source', 'source'],
    ['chips-network', 'Network', NETWORKS, 'network', 'branded']
  ];
  groups.forEach(function (g) {
    var box = document.getElementById(g[0]);
    var label = document.createElement('span');
    label.className = 'chiplabel';
    label.textContent = g[1];
    box.appendChild(label);

    g[2].forEach(function (pair) {
      var n = gifs.filter(function (x) { return x[g[4]] === pair[0]; }).length;
      if (!n) return;
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'chip';
      b.textContent = pair[1] + ' ' + n;
      b.setAttribute('aria-pressed', 'false');
      b.addEventListener('click', function () {
        filters[g[3]] = filters[g[3]] === pair[0] ? null : pair[0];
        syncChips();
        render();
      });
      b.dataset.group = g[3];
      b.dataset.value = pair[0];
      box.appendChild(b);
    });
  });
}

function syncChips() {
  document.querySelectorAll('.chip').forEach(function (c) {
    c.setAttribute('aria-pressed', String(filters[c.dataset.group] === c.dataset.value));
  });
}

document.getElementById('search').addEventListener('input', function (e) {
  filters.q = e.target.value.trim().toLowerCase();
  render();
});

/* ---------------- render ---------------- */

function matches(g) {
  if (filters.reaction && g.reaction !== filters.reaction) return false;
  if (filters.source && g.source !== filters.source) return false;
  if (filters.network && g.branded !== filters.network) return false;
  if (filters.q) {
    var hay = g._hay || haystack(g);
    // Every whitespace-separated term must match, so "pepe money" narrows.
    var terms = filters.q.split(/\s+/);
    for (var i = 0; i < terms.length; i++) {
      if (terms[i] && hay.indexOf(terms[i]) === -1) return false;
    }
  }
  return true;
}

var io = 'IntersectionObserver' in window
  ? new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        en.target._visible = en.isIntersecting;
        if (!en.isIntersecting) stopCard(en.target);
      });
    }, { rootMargin: '200px' })
  : null;

function render() {
  var list = gifs.filter(matches);
  grid.innerHTML = '';
  emptyEl.hidden = list.length > 0;
  countEl.textContent = list.length + (list.length === 1 ? ' gif' : ' gifs');

  var frag = document.createDocumentFragment();
  list.forEach(function (g) { frag.appendChild(card(g)); });
  grid.appendChild(frag);
}

function card(g) {
  var el = document.createElement('div');
  el.className = 'card';
  el.tabIndex = 0;
  el.setAttribute('role', 'button');
  el.setAttribute('aria-label', '#' + g.num + ' ' + g.title + ' — open');
  el._gif = g;

  var img = document.createElement('img');
  img.src = posterHref(g);
  img.alt = g.alt;
  img.loading = 'lazy';
  img.decoding = 'async';
  img.draggable = true;
  // Without this a card drag would hand over the poster JPEG -- a still frame.
  attachDrag(img, g);
  el.appendChild(img);

  // The number ties a card back to its numbered source file, so a problem with
  // one can be reported as "#67" instead of by description.
  var num = document.createElement('span');
  num.className = 'num';
  num.textContent = g.num;
  num.setAttribute('aria-hidden', 'true');
  el.appendChild(num);

  if (g.new) {
    var badge = document.createElement('span');
    badge.className = 'badge';
    badge.textContent = 'New';
    el.appendChild(badge);
  }

  if (reduced) {
    var play = document.createElement('span');
    play.className = 'play';
    play.innerHTML = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>';
    el.appendChild(play);
  }

  var dl = document.createElement('a');
  dl.className = 'dl';
  dl.href = downloadHref(g);
  dl.setAttribute('download', g.slug + '.gif');
  dl.title = 'Download ' + g.title + ' as a GIF';
  dl.setAttribute('aria-label', 'Download ' + g.title + ' as a GIF');
  dl.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"' +
    ' stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2' +
    ' 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>';
  dl.addEventListener('click', function (e) {
    e.stopPropagation();
    track('download', g.slug);
  });
  el.appendChild(dl);

  var cp = document.createElement('button');
  cp.type = 'button';
  cp.className = 'dl cp';
  cp.title = 'Copy link to ' + g.title;
  cp.setAttribute('aria-label', 'Copy link to ' + g.title);
  cp.innerHTML = LINK_ICON;
  cp.addEventListener('click', function (e) {
    e.stopPropagation();
    copyLink(pageUrl(g), cp);
    track('copy', g.slug);
  });
  el.appendChild(cp);

  if (!reduced) {
    if (coarse) {
      el.addEventListener('click', function (e) {
        // First tap plays in place, second opens the detail view.
        if (!el._video) { e.preventDefault(); playCard(el, g); }
        else open(g);
      });
    } else {
      el.addEventListener('mouseenter', function () { playCard(el, g); });
      el.addEventListener('mouseleave', function () { stopCard(el); });
      el.addEventListener('click', function () { open(g); });
    }
  } else {
    el.addEventListener('click', function () { open(g); });
  }

  el.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(g); }
  });

  if (io) io.observe(el);
  return el;
}

/* Attach src only on intent. preload="none" plus late src assignment means an
   un-hovered card costs exactly one lazy poster and nothing else. */
function playCard(el, g) {
  if (el._video || el._visible === false) return;
  var v = document.createElement('video');
  v.muted = true; v.loop = true; v.playsInline = true;
  v.setAttribute('muted', ''); v.setAttribute('playsinline', '');
  v.preload = 'none';
  // Poster behind the video: if decode is slow or autoplay is refused, the card
  // shows the frame rather than a black box.
  v.poster = posterHref(g);
  v.src = 'assets/preview/' + g.slug + '.mp4' + ver(g);
  v.draggable = true;
  attachDrag(v, g);
  el.appendChild(v);
  el._video = v;
  var p = v.play();
  if (p && p.catch) p.catch(function () { stopCard(el); });
}

function stopCard(el) {
  if (!el._video) return;
  el._video.pause();
  el._video.removeAttribute('src');
  el._video.load();
  el._video.remove();
  el._video = null;
}

/* ---------------- downloads ---------------- */

/* The 14 GIFs over 5MB can't be posted from a phone. Hand small screens the
   compressed variant so the download is always actually usable where you are. */
/* ?v= is the item's content hash. Assets are cached immutable for a year under
   slug-based filenames, so a re-cut gif would otherwise keep serving from the
   visitor's browser cache indefinitely. Changing the token changes the URL.
   The Worker drops the query before going upstream, so this never fragments the
   Pages cache -- it only busts the client's. */
function ver(g) { return g.v ? '?v=' + g.v : ''; }
function posterHref(g) { return 'assets/poster/' + g.slug + '.jpg' + ver(g); }

function gifHref(g) {
  var small = window.matchMedia('(max-width: 820px)').matches;
  return (small && g.hasMobile ? 'assets/gif-mobile/' : 'assets/gif/') + g.slug + '.gif' + ver(g);
}
function downloadHref(g) { return gifHref(g) + (g.v ? '&' : '?') + 'dl=1'; }

/* ---------------- lightbox ---------------- */

var lb = document.getElementById('lb');
var lbMedia = document.getElementById('lb-media');
var current = null;

function open(g) {
  current = g;
  document.getElementById('lb-title').textContent = '#' + g.num + ' · ' + g.title;

  var mb = (g.sizeBytes / 1048576).toFixed(1);
  var bits = [mb + ' MB GIF'];
  if (g.hasMobile) bits.push('mobile version available');
  document.getElementById('lb-meta').textContent = bits.join(' · ');

  if (!reduced) prefetchFile(g);

  lbMedia.innerHTML = '';
  // The real .gif, not the mp4 preview. Costs more bytes on open, but it is the
  // actual artifact: right-click-save and drag-to-desktop both need it to be one.
  // Poster sits behind it as a background so there is no blank while it loads.
  var im = document.createElement('img');
  im.src = reduced ? posterHref(g) : gifHref(g);
  im.alt = g.alt;
  im.draggable = true;
  im.style.backgroundImage = 'url("' + posterHref(g) + '")';
  im.style.backgroundSize = 'contain';
  im.style.backgroundRepeat = 'no-repeat';
  im.style.backgroundPosition = 'center';
  attachDrag(im, g);
  im.addEventListener('error', function () {
    im.src = posterHref(g);
  });
  lbMedia.appendChild(im);

  var d = document.getElementById('lb-download');
  d.href = downloadHref(g);
  d.setAttribute('download', g.slug + '.gif');

  var m = document.getElementById('lb-mp4');
  m.href = 'assets/mp4/' + g.slug + '.mp4' + ver(g);
  m.setAttribute('download', g.slug + '.mp4');

  document.getElementById('lb-hint').innerHTML = coarse
    ? '<strong>Long-press the GIF to save it</strong>, then attach it in your X post.'
    : canDragOut
      ? '<strong>Drag it to your desktop, or download it</strong> — then attach it ' +
        'to your post. X only animates files you upload; a pasted link shows a still frame.'
      : '<strong>Download it, then attach it to your post.</strong> ' +
        'X only animates files you upload — a pasted link shows a still frame.';

  var url = pageUrl(g);
  document.getElementById('lb-copy').textContent = 'Copy link';
  document.getElementById('lb-copy').dataset.url = url;

  if (typeof lb.showModal === 'function') lb.showModal(); else lb.setAttribute('open', '');
  history.replaceState(null, '', '#' + g.slug);
}

function pageUrl(g) {
  return location.origin + location.pathname.replace(/index\.html$/, '') + 'g/' + g.slug + '/';
}

function close() {
  lbMedia.innerHTML = '';
  current = null;
  if (typeof lb.close === 'function' && lb.open) lb.close(); else lb.removeAttribute('open');
  history.replaceState(null, '', location.pathname + location.search);
}

/* Colour scheme toggle. No stored value means "follow the OS"; the first click
   writes an explicit choice that outlives the session. localStorage throws in
   some privacy modes, so every access is guarded -- the toggle degrades to
   per-page rather than breaking the script. */
(function () {
  var btn = document.getElementById('theme');
  if (!btn) return;
  var root = document.documentElement;
  function current() {
    var set = root.getAttribute('data-theme');
    if (set) return set;
    return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  }
  btn.addEventListener('click', function () {
    var next = current() === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    try { localStorage.setItem('gifs-theme', next); } catch (e) {}
  });
})();

document.getElementById('lb-close').addEventListener('click', close);
lb.addEventListener('cancel', function (e) { e.preventDefault(); close(); });
lb.addEventListener('click', function (e) { if (e.target === lb) close(); });

document.getElementById('lb-copy').addEventListener('click', function () {
  copyLink(this.dataset.url, this);
  if (current) track('copy', current.slug);
});

document.getElementById('lb-download').addEventListener('click', function () {
  if (current) track('download', current.slug);
});

function openFromHash() {
  var slug = location.hash.replace(/^#/, '');
  if (!slug) return;
  var g = gifs.filter(function (x) { return x.slug === slug; })[0];
  if (g) open(g);
}
