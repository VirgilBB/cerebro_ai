#!/usr/bin/env python3
"""
Upload the original Cerebro clips to the GIPHY channel.

Run a dry run first:   python3 giphy-upload.py
Actually upload:       python3 giphy-upload.py --go

Notes on the GIPHY API:
  - `tags` CAN be set at upload time. `title` CANNOT -- there is no title param,
    and no edit endpoint exists, so titles must be set by hand in the web UI.
  - There is no delete endpoint either. A bad upload can only be removed manually.
    That is why this defaults to a dry run.
  - astro-celebrate is deliberately absent: it is already live on the channel as
    viYleY3wh2LYo3fZjt.
"""
import os, sys, json, subprocess

HERE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(HERE, "giphy-application")
SOURCE_URL = "https://cerebro.host/gifs"

# HARD RULE (user): every upload must carry "xpr" and "xpr network" tags.
# REQUIRED_TAGS is prepended automatically, so per-file tags below need only add
# what is specific to that clip. Tags drive discoverability -- untagged uploads do
# not surface in search even once the channel is verified.
REQUIRED_TAGS = "xpr,xpr network"

UPLOADS = {
    "cloak-alien.mp4": "alien,space,sci fi,astronaut,cerebro",
    "alien-scan.mp4":  "scan,alien,space,technology,astronaut,cerebro",
    "astro-holo.mp4":  "hologram,astronaut,space,technology,cerebro",
}

# Already live on the channel -- do NOT re-upload, there is no delete endpoint.
UPLOADED = {
    "analyze-xpr.mp4":        "S4SnAhJLQlAIT2nyl7",
    "dark-matter.mp4":        "6TTuOupLuJxhD8NYjI",
    "gravitational-pull.mp4": "xOo9IgrHJExo1LPA9U",
    "helmet-fire.mp4":        "9TxAbcVX6POtjhM2aI",
    "desk-rockest.mp4":       "0OmVHA7OfmdM5Tt2aT",
    "astro-celebrate.mp4":    "viYleY3wh2LYo3fZjt",
}

def main():
    go = "--go" in sys.argv
    key = None
    envp = os.path.join(HERE, ".env")
    if os.path.exists(envp):
        for line in open(envp):
            if line.startswith("GIPHY_API_KEY="):
                key = line.split("=", 1)[1].strip()
    if not key:
        sys.exit("GIPHY_API_KEY not found in .env")

    print(f"{'UPLOADING' if go else 'DRY RUN -- nothing will be uploaded'}\n")
    ok = fail = 0
    for name, tags in UPLOADS.items():
        path = os.path.join(SRC, name)
        if not os.path.exists(path):
            print(f"  MISSING  {name}")
            fail += 1
            continue
        tags = f"{REQUIRED_TAGS},{tags}"
        mb = os.path.getsize(path) / 1e6
        print(f"  {name:<26} {mb:>5.1f}MB   tags: {tags}")
        if not go:
            continue
        r = subprocess.run([
            "curl", "-s", "-X", "POST", "https://upload.giphy.com/v1/gifs",
            "-F", f"api_key={key}",
            "-F", f"file=@{path}",
            "-F", f"tags={tags}",
            "-F", f"source_post_url={SOURCE_URL}",
        ], capture_output=True, text=True)
        try:
            resp = json.loads(r.stdout)
            gid = (resp.get("data") or {}).get("id")
            status = (resp.get("meta") or {}).get("status")
            if gid:
                print(f"      -> OK  id={gid}  https://giphy.com/gifs/{gid}")
                ok += 1
            else:
                print(f"      -> FAILED  status={status}  {r.stdout[:200]}")
                fail += 1
        except Exception:
            print(f"      -> UNPARSEABLE  {r.stdout[:200]}")
            fail += 1

    if go:
        print(f"\nuploaded {ok}, failed {fail}")
        print("\nNEXT: set a title on each in the web UI -- the API cannot do it.")
    else:
        print(f"\n{len(UPLOADS)} files ready. Re-run with --go to upload.")

if __name__ == "__main__":
    main()
