#!/usr/bin/env python3
"""
XPR Gifs asset pipeline.

Reads site/build/catalog.json, emits derivatives into site/assets/ and writes
site/gifs-data.json for the page to consume.

Run from cerebro.host-gifs/:  python3 site/build/build-assets.py [--force]

Outputs per item:
  assets/gif/<slug>.gif         byte-identical original -- THE download
  assets/gif-mobile/<slug>.gif  only when original >5MB (X mobile cap)
  assets/poster/<slug>.jpg      static frame, the only thing the grid paints
  assets/preview/<slug>.mp4     480px hover playback, never a download
  assets/mp4/<slug>.mp4         720px optional secondary download
"""
import json, os, shutil, subprocess, sys

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
SITE = os.path.join(ROOT, "site")
ASSETS = os.path.join(SITE, "assets")
WAVES = ["wave1", "wave2", "wave3", "wave4", "wave5"]
MOBILE_CAP = 5 * 1024 * 1024      # X mobile upload cap
DESKTOP_CAP = 15 * 1024 * 1024    # X desktop upload cap
FORCE = "--force" in sys.argv

def run(args):
    r = subprocess.run(args, capture_output=True, text=True)
    return r.returncode == 0, r.stderr

def ffmpeg(args):
    return run(["ffmpeg", "-y", "-loglevel", "error"] + args)

def find_source_mp4(src):
    """The wave/*.mp4 this GIF was converted from, if it still exists."""
    base = os.path.splitext(os.path.basename(src))[0]
    for w in WAVES:
        p = os.path.join(ROOT, w, base + ".mp4")
        if os.path.exists(p):
            return p
    return None

def probe_duration(path):
    ok, _ = run(["ffprobe", "-v", "error", "-show_entries", "format=duration",
                 "-of", "csv=p=0", path])
    r = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration",
                        "-of", "csv=p=0", path], capture_output=True, text=True)
    try:
        return float(r.stdout.strip())
    except ValueError:
        return 0.0

def frame_interest(path):
    """Std-dev of pixel values. A transition flash or a black frame scores near zero."""
    try:
        from PIL import Image, ImageStat
        im = Image.open(path).convert("L")
        return ImageStat.Stat(im).stddev[0]
    except Exception:
        return 0.0

def make_poster(gif, out):
    """JPEG, not WebP: this ffmpeg build ships no webp encoder and sips cannot write
    webp either. Samples several timestamps and keeps the most visually interesting
    frame -- a fixed offset lands on fades and transition flashes (vegeta was a white
    flash at 0.3s), which makes a card look broken in the grid."""
    args = ["-frames:v", "1", "-vf", "scale=480:-1:flags=lanczos", "-q:v", "4"]
    dur = probe_duration(gif)
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

def shrink_gif(src, out, cap):
    """Step down scale/fps until the GIF fits under cap. Returns True if it fit."""
    for width, fps in [(360, 15), (320, 14), (280, 12), (240, 12), (200, 10), (180, 8)]:
        pal = out + ".pal.png"
        vf = f"fps={fps},scale={width}:-1:flags=lanczos"
        ok, _ = ffmpeg(["-i", src, "-vf", vf + ",palettegen=max_colors=128", pal])
        if not ok:
            continue
        ok, _ = ffmpeg(["-i", src, "-i", pal, "-lavfi",
                        vf + "[x];[x][1:v]paletteuse=dither=bayer:bayer_scale=3", out])
        if os.path.exists(pal):
            os.remove(pal)
        if ok and os.path.exists(out) and os.path.getsize(out) <= cap:
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

        p_gif    = os.path.join(ASSETS, "gif", slug + ".gif")
        p_mobile = os.path.join(ASSETS, "gif-mobile", slug + ".gif")
        p_poster = os.path.join(ASSETS, "poster", slug + ".jpg")
        p_prev   = os.path.join(ASSETS, "preview", slug + ".mp4")
        p_mp4    = os.path.join(ASSETS, "mp4", slug + ".mp4")

        # 1. The download: byte-identical original.
        if FORCE or not os.path.exists(p_gif):
            shutil.copy2(src, p_gif)
        size = os.path.getsize(p_gif)
        if size > DESKTOP_CAP:
            problems.append(f"{slug}: {size/1e6:.1f}MB exceeds X desktop cap")

        # 2. Mobile variant, only where the original blows the 5MB cap.
        has_mobile = False
        if size > MOBILE_CAP:
            if FORCE or not os.path.exists(p_mobile):
                fit, w, fps = shrink_gif(src, p_mobile, MOBILE_CAP)
                if not fit:
                    problems.append(f"{slug}: could not shrink under 5MB for mobile")
            has_mobile = os.path.exists(p_mobile) and os.path.getsize(p_mobile) <= MOBILE_CAP

        # 3. Poster.
        if FORCE or not os.path.exists(p_poster):
            if not make_poster(src, p_poster):
                problems.append(f"{slug}: poster generation failed")

        # 4+5. Motion. Prefer the pristine wave original over the lossy GIF.
        motion_src = find_source_mp4(it["src"]) or src
        from_gif = motion_src == src
        if FORCE or not os.path.exists(p_prev):
            ok, err = make_mp4(motion_src, p_prev, 480, 30)
            if not ok:
                problems.append(f"{slug}: preview mp4 failed -- {err.strip()[:120]}")
        if FORCE or not os.path.exists(p_mp4):
            ok, err = make_mp4(motion_src, p_mp4, 720, 23)
            if not ok:
                problems.append(f"{slug}: download mp4 failed -- {err.strip()[:120]}")

        rec = {
            "slug": slug, "title": it["title"], "alt": it["alt"],
            "reaction": it["reaction"], "source": it["source"],
            "branded": it["branded"], "tags": it.get("tags", []),
            "sizeBytes": size, "hasMobile": has_mobile,
            "mp4FromGif": from_gif, "new": it.get("new", False),
        }
        if it.get("credit"):
            rec["credit"] = it["credit"]
        out_records.append(rec)
        print(f"[{n:>2}/{len(items)}] {slug:<32} {size/1e6:>5.1f}MB"
              f"{'  +mobile' if has_mobile else ''}{'  (mp4 from gif)' if from_gif else ''}")

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
