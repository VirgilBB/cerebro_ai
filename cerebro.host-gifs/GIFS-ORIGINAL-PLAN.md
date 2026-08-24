# Plan — Original XPR reaction GIFs

Goal: a reaction-GIF set Cerebro fully owns, so it can pass GIPHY brand review and land
in X's GIF picker. The existing 78-gif library stays as-is at cerebro.host/gifs; this is
a parallel, original set.

## Why not face-swap the existing memes

Replacing Fry's head with the astronaut does **not** make the clip original. The
animation, framing, timing, staging and character underneath are still the rights
holder's. It is a derivative work — and an unauthorised modification is a worse
position than a straight repost, not a better one. GIPHY's rule is explicit: *no
derivative works from content you do not own.* A face-swap fails it.

## What works instead

Recreate the **reaction**, not the clip. "Someone thrusting cash at the screen" is an
idea; ideas are not copyrightable. Only Futurama's particular expression of it is. An
original animation of the Cerebro astronaut holding out cash is fully owned, passes
review, and does the same job in a reply.

So: rebuild the reaction *vocabulary*, shot for shot, in the Cerebro visual language.

## The design problem to solve first

**A sealed helmet cannot emote.** Reaction GIFs live on facial expression, and most of
the existing 81 originals hide the face behind a reflective visor. Three ways round it,
in order of preference:

1. **Clear visor, lit from inside** so the face reads. Several existing clips already do
   this (`helmet-fire`, `cloak-alien`) — make it the house style.
2. **Body language + props** — shrug, double-take, slow clap, cash fan, popcorn tub.
   Reads at 480px even with no face.
3. **Text overlay** in the existing XPR style, as reinforcement not a crutch.

Whichever is used, it has to read at **480x480 in a timeline**. Test every candidate
scaled down before accepting it.

## Vocabulary to build

Mirrors the taxonomy already in `site/build/catalog.json`, so new gifs slot straight in.
Ordered by how often each is actually needed in a reply.

| Reaction | Shot |
|---|---|
| take-my-money | Astronaut thrusts a fan of cash at camera, XPR hologram behind |
| approval | Slow nod, visor clear, thumbs-up; subtle XPR glow |
| hype | Fist pump / power-up surge, XPR logo flaring |
| celebration | Confetti in zero-G, astronaut spinning, arms up |
| let-him-cook | Astronaut at a console/pan, focused, sparks; "let him cook" |
| confused | Head tilt, holographic question marks, shrug |
| popcorn | Astronaut eating popcorn, watching a screen, unbothered |
| cope | Slumped shoulders, single tear on the visor, chart dropping behind |
| gm | Astronaut waving from a station window, sunrise over Earth |
| lfg | Rocket launch behind, astronaut pointing up |

Ten covers most replies. Five is enough for the GIPHY application.

## Prompt pattern

Keep one character bible across every generation or the set will not read as a family.

> **Character:** a sleek white astronaut in a modern spacesuit, clear illuminated visor
> showing the face, subtle blue XPR Network insignia on the chest.
> **Style:** cinematic 3D render, dark space-station interior, cyan and violet neon
> accents, shallow depth of field, 24fps.
> **Shot:** [ACTION], centred, medium close-up, camera locked off.
> **Loop:** motion starts and ends in the same pose so it loops seamlessly.

Per-gif ACTION, e.g. take-my-money:
> holding out a thick fan of banknotes toward the camera with both hands, leaning in,
> eager expression, a glowing XPR Network hologram floating behind the shoulder

**Locked-off camera and matched start/end pose are the two things that make or break a
loop.** Drifting camera reads as a video clip, not a reaction.

## Tooling

The existing 81 originals are already AI-generated, so the pipeline exists. What matters
for this set:

- **Character consistency** — feed the same reference image every time. Without it the
  astronaut drifts and the set stops reading as one brand.
- **No third-party watermark.** 4 of the 81 have `watermarked` in the filename; a free-tier
  watermark disqualifies the clip for GIPHY. Paid tier or re-render.
- **2–4 seconds** per clip. Long clips make heavy GIFs and weak loops.
- Deliver **1280x720 or square 1080x1080**, 24fps, then downscale in the pipeline.

## Pipeline — already built, no new code

1. Convert to GIF, or keep the MP4 as the wave master
2. Drop the `.gif` into `live gifs/`
3. Add a `catalog.json` record — `reaction`, `source`, `alt` are mandatory
4. `python3 site/build/build-assets.py && python3 site/build/build-pages.py`
5. `npx wrangler@4.123.0 pages deploy site --project-name xpr-gifs --branch main`

Set `"source": "cerebro"` for these so the grid can filter originals from memes.

## Sequence

1. Generate 5 originals from the vocabulary above (take-my-money, approval, hype,
   celebration, let-him-cook)
2. Clear the meme gifs off `giphy.com/channel/cerebroai` — right now they argue against
   the application
3. Upload the 5 originals plus the 8 already staged in `giphy-application/`
4. Re-apply for a **Brand** channel (not Creator): custom domain `cerebro.host`, public
   social `@Cerebro_Agent`
5. On approval, they are in GIPHY search and therefore in X's picker
6. Keep adding to the vocabulary; the memes stay on cerebro.host/gifs

## What this does and does not fix

Fixes: original gifs in X's picker, one tap, animated, for everyone. The real Tenor
replacement.

Does not fix: the 78 memes. Those can never pass GIPHY review under anyone's name. They
stay a download-and-attach library, which is what cerebro.host/gifs already is.
