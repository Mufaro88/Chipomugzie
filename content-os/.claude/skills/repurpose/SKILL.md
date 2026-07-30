---
name: repurpose
description: Turn one long-form asset into content for every platform, in my voice. Use when I say "repurpose", "repurpose this", "make posts from this", or drop a file in inbox/ and ask for content.
---

# Repurpose skill

Turn one long-form asset (a script, transcript, essay, or voice-memo dump)
into platform-native content for every channel, written in my voice.

## Steps

1. **Find the asset.**
   - If I gave a file path, use it.
   - Otherwise use the newest file in `inbox/`.
   - If `inbox/` is empty, ask me for the content.

2. **Load context** (read these first):
   - `context/brand-voice.md` — match my voice exactly.
   - `context/platforms.md` — the format rules for each platform.
   - `context/icp.md` — who each piece is for.

3. **Generate one file per platform** listed in `platforms.md`. For each,
   follow that platform's rules precisely:
   - X thread, LinkedIn post, Instagram reel script (3 hooks), TikTok script
     (3 hooks), YouTube Short, YouTube long (titles + thumbnail concept +
     outline), newsletter (5 subject lines + body), community post.

4. **Save the output.** Create `repurpose/<asset-name>/` and write one markdown
   file per platform (e.g. `x.md`, `linkedin.md`, `instagram.md`, `tiktok.md`,
   `youtube-short.md`, `youtube-long.md`, `newsletter.md`, `community.md`).

5. **Update the dashboard.** Regenerate `dashboard.html` at the repo root so
   every output is visible and copy-pasteable, grouped by platform. Each card
   has a copy button. Dark mode, clean, one page.

6. **Report** a short summary: what was created, and flag the 2-3 strongest
   pieces.

## Optional add-ons (only if I ask)
- Thumbnail: use Canva or HiggsField, save to `assets/`.
- Short video: use the HiggsField shorts studio from the reel/short script.
- Post to TikTok: HiggsField can publish directly.

## Voice rules (always)
- No em-dashes. No generic AI slop. Real, specific examples only.
- Give hook options where the platform rewards a strong hook.
- If I correct a piece, offer to save the lesson into `context/brand-voice.md`
  so it's applied next time.
