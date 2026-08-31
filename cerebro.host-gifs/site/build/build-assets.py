#!/usr/bin/env python3
"""
XPR Gifs asset pipeline.

Reads site/build/catalog.json, emits derivatives into site/assets/ and writes
site/gifs-data.json for the page to consume.

Run from cerebro.host-gifs/:  python3 site/build/build-assets.py [--force]

A catalog `src` may be a .gif (copied byte-identically) or a .mp4 (encoded to GIF
at 480px). Everything downstream is identical either way.

Outputs per item:
  assets/gif/<slug>.gif         byte-identical original -- THE download
  assets/gif-mobile/<slug>.gif  only when original >5MB (X mobile cap)
  assets/poster/<slug>.jpg      static frame, the only thing the grid paints
  assets/preview/<slug>.mp4     480px hover playback, never a download
  assets/mp4/<slug>.mp4         720px optional secondary download
"""
import hashlib, json, os, shutil, subprocess, sys

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
SITE = os.path.join(ROOT, "site")
ASSETS = os.path.join(SITE, "assets")
# Every pristine source mp4 lives here, flattened out of the old wave1..wave5 dirs
# so a GIF's motion source is found by basename in one place.
MP4S = "live mp4s"
MOBILE_CAP = 5 * 1024 * 1024      # X mobile upload cap
DESKTOP_CAP = 15 * 1024 * 1024    # X desktop upload cap
FORCE = "--force" in sys.argv

def run(args):
    r = subprocess.run(args, capture_output=True, text=True)
    return r.returncode == 0, r.stderr

def ffmpeg(args):
    return run(["ffmpeg", "-y", "-loglevel", "error"] + args)

def find_source_mp4(src):
    """The pristine mp4 this GIF was converted from, if we still have it.

    Basename match only -- never fuzzy. Several near-name-matches are the same
    scene carrying a *different* brand watermark, so a loose match ships an
    off-brand mp4. Where the names genuinely differ, use an explicit `mp4src`.
    """
    base = os.path.splitext(os.path.basename(src))[0]
    p = os.path.join(ROOT, MP4S, base + ".mp4")
    return p if os.path.exists(p) else None

def probe_duration(path):
    ok, _ = run(["ffprobe", "-v", "error", "-show_entries", "format=duration",
                 "-of", "csv=p=0", path])
    r = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration",
                        "-of", "csv=p=0", path], capture_output=True, text=True)
    try:
        return float(r.stdout.strip())
    except ValueError:
        return 0.0

def probe_fps(path):
    r = subprocess.run(["ffprobe", "-v", "error", "-select_streams", "v:0",
                        "-show_entries", "stream=r_frame_rate", "-of", "csv=p=0", path],
                       capture_output=True, text=True)
    try:
        num, den = r.stdout.strip().split("/")
        return float(num) / float(den)
    except Exception:
        return 15.0

def probe_frames(path):
    r = subprocess.run(["ffprobe", "-v", "error", "-select_streams", "v:0", "-count_frames",
                        "-show_entries", "stream=nb_read_frames", "-of", "csv=p=0", path],
                       capture_output=True, text=True)
    try:
        return int(r.stdout.strip())
    except ValueError:
        return 999

def frame_interest(path):
    """Std-dev of pixel values. A transition flash or a black frame scores near zero."""
    try:
        from PIL import Image, ImageStat
        im = Image.open(path).convert("L")
        return ImageStat.Stat(im).stddev[0]
    except Exception:
        return 0.0

def make_poster(gif, out, at=None):
    """JPEG, not WebP: this ffmpeg build ships no webp encoder and sips cannot write
    webp either. Samples several timestamps and keeps the most visually interesting
    frame -- a fixed offset lands on fades and transition flashes (vegeta was a white
    flash at 0.3s), which makes a card look broken in the grid."""
    # format=yuvj420p is not cosmetic: mjpeg refuses limited-range yuv420p with
    # "Non full-range YUV is non-standard" and writes a 0-byte file. GIF sources
    # decode to RGB and never hit it, mp4 sources always do.
    args = ["-frames:v", "1", "-vf", "scale=480:-1:flags=lanczos,format=yuvj420p",
            "-q:v", "4"]
    dur = probe_duration(gif)
    # `posterAt` pins the thumbnail to a chosen second. Variance scoring picks the
    # busiest frame, which is not always the most legible one -- on a wide
    # establishing shot it lands on texture rather than on the character.
    if at is not None:
        offsets = [float(at)]
    else:
        offsets = [dur * f for f in (0.15, 0.35, 0.55, 0.75)] if dur > 0.4 else [0.0]
    best, best_score = None, -1.0
    for n, off in enumerate(offsets):
        cand = out + f".c{n}.jpg"
        ok, _ = ffmpeg(["-ss", f"{off:.3f}", "-i", gif] + args + [cand])
        if not (ok and os.path.exists(cand) and os.path.getsize(cand) > 0):
            continue
        score = frame_interest(cand)
        if score > best_score:
            if best:
                os.remove(best)
            best, best_score = cand, score
        else:
            os.remove(cand)
    if best:
        shutil.move(best, out)
        return True
    # Very short GIF: every seek overshot, take the first frame.
    ok, _ = ffmpeg(["-i", gif] + args + [out])
    return ok and os.path.exists(out) and os.path.getsize(out) > 0

def make_mp4(src, out, width, crf):
    # yuv420p + even dimensions + baseline profile: required for iOS Safari.
    vf = f"scale={width}:-2:flags=lanczos,crop=trunc(iw/2)*2:trunc(ih/2)*2"
    return ffmpeg(["-i", src, "-an", "-movflags", "+faststart",
                   "-c:v", "libx264", "-profile:v", "baseline", "-level", "3.0",
                   "-pix_fmt", "yuv420p", "-crf", str(crf), "-vf", vf, out])

def encode_gif(src, out, width, fps, colors=128):
    """Two-pass palettegen/paletteuse. One global palette per GIF -- per-frame
    palettes look better but roughly double the file, and these are meant to be
    uploaded into X, where size is the binding constraint."""
    pal = out + ".pal.png"
    vf = f"fps={fps:g},scale={width}:-1:flags=lanczos"
    ok, _ = ffmpeg(["-i", src, "-vf", vf + f",palettegen=max_colors={colors}", pal])
    if not ok:
        return False
    ok, _ = ffmpeg(["-i", src, "-i", pal, "-lavfi",
                    vf + "[x];[x][1:v]paletteuse=dither=bayer:bayer_scale=3", out])
    if os.path.exists(pal):
        os.remove(pal)
    return ok and os.path.exists(out) and os.path.getsize(out) > 0

def gif_from_mp4(src, out, width=480):
    """Publish an mp4-only source as a GIF.

    480px matches the rest of the library. Sources are commonly 1080x1080, and a
    full-size GIF of one is enormous for no visible gain at the size these get
    posted. Falls back through smaller widths only if the encode fails outright;
    the desktop/mobile size caps are enforced by the caller as for any other item.
    """
    # Only decimate clips long enough to spare the frames. Several of these are
    # 5-frame reaction loops; capping those at 20fps drops two of the five and
    # visibly stutters the loop.
    src_fps = probe_fps(src)
    fps = src_fps if probe_frames(src) <= 30 else min(20, max(10, round(src_fps)))
    for w in [width, 400, 320]:
        if encode_gif(src, out, w, fps):
            return True
    return False

def shrink_gif(src, out, cap):
    """Step down scale/fps until the GIF fits under cap. Returns True if it fit."""
    for width, fps in [(360, 15), (320, 14), (280, 12), (240, 12), (200, 10), (180, 8)]:
        if encode_gif(src, out, width, fps) and os.path.getsize(out) <= cap:
            return True, width, fps
    return False, None, None

def main():
    catalog = json.load(open(os.path.join(SITE, "build", "catalog.json")))
    items = catalog["items"]
    for d in ["gif", "gif-mobile", "poster", "preview", "mp4"]:
        os.makedirs(os.path.join(ASSETS, d), exist_ok=True)

    out_records, problems = [], []

    for n, it in enumerate(items, 1):
        slug = it["slug"]
        src = os.path.join(ROOT, it["src"])
        if not os.path.exists(src):
            problems.append(f"{slug}: source missing -> {it['src']}")
            continue

        is_mp4 = src.lower().endswith(".mp4")
        p_gif    = os.path.join(ASSETS, "gif", slug + ".gif")
        p_mobile = os.path.join(ASSETS, "gif-mobile", slug + ".gif")
        p_poster = os.path.join(ASSETS, "poster", slug + ".jpg")
        p_prev   = os.path.join(ASSETS, "preview", slug + ".mp4")
        p_mp4    = os.path.join(ASSETS, "mp4", slug + ".mp4")

        # 1. The download. A .gif source is copied byte-identically -- that file IS
        # the product. A .mp4 source is encoded here instead, so a clip that was
        # never converted by hand can still be published.
        if FORCE or not os.path.exists(p_gif):
            if is_mp4:
                if not gif_from_mp4(src, p_gif):
                    problems.append(f"{slug}: could not encode a GIF from {it['src']}")
                    continue
            else:
                shutil.copy2(src, p_gif)
        size = os.path.getsize(p_gif)
        if size > DESKTOP_CAP:
            problems.append(f"{slug}: {size/1e6:.1f}MB exceeds X desktop cap")

        # 2. Mobile variant, only where the original blows the 5MB cap.
        has_mobile = False
        if size > MOBILE_CAP:
            if FORCE or not os.path.exists(p_mobile):
                fit, w, fps = shrink_gif(p_gif if is_mp4 else src, p_mobile, MOBILE_CAP)
                if not fit:
                    problems.append(f"{slug}: could not shrink under 5MB for mobile")
            has_mobile = os.path.exists(p_mobile) and os.path.getsize(p_mobile) <= MOBILE_CAP

        # 3. Poster.
        if FORCE or not os.path.exists(p_poster):
            # mp4 source = cleaner frame than the gif
            if not make_poster(src, p_poster, it.get("posterAt")):
                problems.append(f"{slug}: poster generation failed")

        # 4+5. Motion. Prefer the pristine wave original over the lossy GIF.
        # `mp4src` is an explicit, frame-verified override for the cases where the
        # wave original does not share the GIF's basename. Never guess this by fuzzy
        # name match -- several near-matches are the same scene with a *different*
        # brand watermark, which would ship an off-brand MP4.
        # A dangling mp4src used to fail quietly: ffmpeg errored, no mp4 was
        # written, and `from_gif` still read False (motion_src != src), so the
        # item counted as having a pristine master while serving nothing at all.
        # Flattening wave1-5 into `live mp4s/` left exactly one such override.
        override = it.get("mp4src")
        if override and not os.path.exists(os.path.join(ROOT, override)):
            problems.append(f"{slug}: mp4src points at a missing file -> {override}")
            override = None
        motion_src = (os.path.join(ROOT, override) if override
                      else find_source_mp4(it["src"])) or src
        from_gif = motion_src == src and not is_mp4
        if FORCE or not os.path.exists(p_prev):
            ok, err = make_mp4(motion_src, p_prev, 480, 30)
            if not ok:
                problems.append(f"{slug}: preview mp4 failed -- {err.strip()[:120]}")
        if FORCE or not os.path.exists(p_mp4):
            ok, err = make_mp4(motion_src, p_mp4, 720, 23)
            if not ok:
                problems.append(f"{slug}: download mp4 failed -- {err.strip()[:120]}")

        # Publish gate. `num` ties an item back to its numbered source file; the
        # only records that ever lacked one were also the only unbranded ones, so
        # failing the build here is what stops that class coming back silently.
        for field in ("num", "reaction", "source", "alt"):
            if not it.get(field):
                problems.append(f"{slug}: missing required field `{field}`")

        # Short content hash, appended to every asset URL for this item as ?v=.
        # `_headers` marks assets immutable for a year and the filenames are
        # slug-based, so without this a swapped source keeps serving out of the
        # visitor's own browser cache -- Cloudflare invalidates on deploy, but
        # the browser was told it never needs to ask again.
        with open(p_gif, "rb") as fh:
            ver = hashlib.sha256(fh.read()).hexdigest()[:8]

        rec = {
            "slug": slug, "num": it.get("num", ""), "v": ver,
            "title": it["title"], "alt": it["alt"],
            "reaction": it["reaction"], "source": it["source"],
            "branded": it["branded"], "tags": it.get("tags", []),
            "sizeBytes": size, "hasMobile": has_mobile,
            "mp4FromGif": from_gif, "new": it.get("new", False),
        }
        if it.get("credit"):
            rec["credit"] = it["credit"]
        out_records.append(rec)
        print(f"[{n:>3}/{len(items)}] #{it.get('num','?'):<5} {slug:<30} {size/1e6:>5.1f}MB"
              f"{'  +mobile' if has_mobile else ''}{'  (mp4 from gif)' if from_gif else ''}")

    # Prune derivatives for slugs that left the catalog. Without this a removed
    # item stays downloadable at its old asset URL -- which for the unbranded set
    # would mean "pulled from the site" but still live.
    live = {r["slug"] for r in out_records}
    for d, ext in [("gif", ".gif"), ("gif-mobile", ".gif"), ("poster", ".jpg"),
                   ("preview", ".mp4"), ("mp4", ".mp4")]:
        dp = os.path.join(ASSETS, d)
        for fn in os.listdir(dp):
            if fn.endswith(ext) and fn[: -len(ext)] not in live:
                os.remove(os.path.join(dp, fn))
                print(f"pruned {d}/{fn}")

    # Ship in numeric order. catalog.json is grouped by taxonomy for editing, but
    # the grid reads this file top to bottom, so the two must not be conflated.
    # "13.1" sorts right after "13" and before "14" -- hence float, not string.
    out_records.sort(key=lambda r: float(r["num"]))

    with open(os.path.join(SITE, "gifs-data.json"), "w") as f:
        json.dump({"count": len(out_records), "gifs": out_records}, f, indent=1)

    print(f"\nwrote gifs-data.json -- {len(out_records)} records")
    if problems:
        print(f"\n{len(problems)} PROBLEM(S):")
        for p in problems:
            print("  !", p)
        sys.exit(1)
    print("no problems")

if __name__ == "__main__":
    main()
