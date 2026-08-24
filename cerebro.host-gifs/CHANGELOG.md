# Changelog — cerebro-gifs

All notable changes to the GIF master library (`wave1`–`wave4`) and the published
`live gifs/` set. Dates are absolute.

## 2026-08-23

### XPR Gifs — public web library (`site/`)
Built a browsable, downloadable GIF library for the community, to be published at
`gifs.cerebro.host`. Motivation: X removed Tenor from its composer (Giphy-only now)
and the Giphy creator-account application was denied, leaving no route for the
community to reach these GIFs.

- **`site/build/catalog.json`** — hand-authored taxonomy for 79 GIFs: slug, title,
  alt text, reaction, source, network, search tags. Publish gate: a record missing
  `reaction`, `source` or `alt` fails the build.
  - 8 reactions: take-my-money, let-him-cook, approval, hype, celebration, confused,
    popcorn, cope. (`cat-chaos` was dropped as redundant with the `cats` source facet;
    `popcorn` earned the slot with 4 members.)
  - Network split audited **from the rendered frames, not filenames**: 73 $XPR,
    5 $MTL/Metallicus, none unbranded. Filename guesses were badly wrong, and a first
    frame-audit at 240px tiles was still too small to read some watermarks.
  - Content fixes found in the same audit: `32-smart brain` is Roll Safe, not a galaxy
    brain; `69-austin-powers-come here` is Dr. Evil (reslugged `dr-evil-come-here`);
    `80-simpsons barney` is a take-my-money, not a cope.
- **`site/build/build-assets.py`** — derivative pipeline. Per GIF: byte-identical
  download copy, a <5MB mobile variant for the 14 over X's mobile cap, a 480px JPEG
  poster, a 480px preview MP4, and a 720px MP4 alt-download.
  - Posters are JPEG because this ffmpeg build has no webp encoder and `sips` cannot
    write webp either.
  - Poster frames are chosen by sampling 4 timestamps and keeping the highest-variance
    one. A fixed offset landed on transition flashes (`vegeta` was a white frame).
- **`site/build/build-pages.py`** — 79 deep-link pages at `/g/<slug>/` with OG and
  `twitter:card` tags, plus Cloudflare Pages `_headers`.
- **The page** — dark chrome matching cerebro.host, single emerald `#10B981` accent,
  uniform 6/4/3/2-column grid, search + reaction/source/network chips, lightbox with
  Download GIF primary and MP4 / Copy link / Post on X secondary.
  - **Grid paints posters only.** Verified by netlog capture: 0 `.gif` and 0 `.mp4`
    requests on initial load. Motion is attached on hover (desktop) or tap (touch),
    IntersectionObserver-gated, `preload="none"`.
  - `prefers-reduced-motion` disables hover playback and exposes a play control.
- Media stays out of git (~580MB). `.gitignore` covers the wave folders, `live gifs/`
  and `site/assets/`; derivatives rebuild from source with `build-assets.py`.

### Known limitations
- **X cannot animate a GIF from a URL.** Only uploaded files animate; link cards show
  the first frame. The page teaches download-then-drag rather than pretending otherwise.
- 28 wave MP4s still have no GIF conversion and are absent from the library.

## 2026-08-22

### Wave library — global renumbering (1–84)
- Renamed every media file in `wave1`–`wave4` into one continuous, gap-free sequence
  with an `N-` prefix (old leading digits stripped, files kept in their wave folders).
  Offsets applied so waves stay in order:
  - `wave1` → **1–3**
  - `wave2` → **4–19** (+3; e.g. `1yes-nod.mp4` → `4-yes-nod.mp4`)
  - `wave3` → **20–48** (+19)
  - `wave4` (previously numbered 30–53) → **49–72** (+19)
  - `wave4` un-numbered tail `.gif`s → **73–84**, ordered by file creation time
- Note: during this pass iCloud synced concurrent edits from another device, which
  assigned `73-halo`, `74-halo-ship`, and `83-blinking-white-guy` on their own; the
  remaining tail gifs were filled into the free slots (…82, then 84, skipping 83).

### `live gifs/` — numbering + name sync to wave masters
- Matched each published `live gifs/*.gif` to its wave master and applied the **same
  number** (prefix `N-`), keeping the **live-gif filename** as the canonical name.
- Wave master files were then **renamed to match the live-gif names** (per request:
  "keep the names of the live gifs and update the waves accordingly").
- Ambiguous matches were resolved with **ffprobe** metadata (duration/dimensions),
  not just filename guessing. Confirmed/adjusted mappings:
  - `booyah` = 39 (was `whitmencantjump`)
  - `dlow` = 42 (was `bossman`)
  - `marmot surprised` = 9 (was `surprised chipmunk` / dramatic chipmunk)
  - `cat typing` = 36, `cat excellent` = 38
  - `chappelle cant stop` = 22 (vs. 24, resolved by 5.47s ≈ 6.1s)
  - `cat shocked` = 61 (was `silly-cat`)
  - `kidyes` = 79 (was `baby-yes`)
  - `let cook toy story` = 51 (was `Hold Up Sani`)
  - `wojak hugs` = 21 (was `Feels $XPR`)
  - `smart brain` = 32 (was `think about it`)
- New published content with no wave master was numbered **85–92** (live-only).

### Cleanup
- **Deleted** `wave4/82-i want GIF.gif` — confirmed duplicate (same 3.800s duration) of
  the Colbert "I want it" master already at **78**. Number 82 is now free.

### Verification
- Cross-checked wave vs. live base names for every shared number: **0 mismatches**.
- No duplicate numbers within either set (aside from the known `#1` double, see PROGRESS).

### Related (planning only, no file changes)
- Clarified that the `Tenor Compatibility API Guide` is a GIPHY *developer* doc for
  migrating an app's API code — **not** a tool to connect/sync Tenor and Giphy content
  accounts. Content strategy plan saved separately (see `~/.claude/plans/`).
