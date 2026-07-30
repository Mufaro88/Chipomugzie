# Content OS

One brain, every channel. Drop a long-form asset in `inbox/`, press one button
(the `repurpose` skill), and get platform-native content for X, LinkedIn,
Instagram, TikTok, YouTube, your newsletter, and your community — in your voice.

## The one-time setup
1. Fill in `context/about.md` and `context/icp.md` (or ask Claude to interview
   you out loud and fill them in for you).
2. Paste your past content into `voice/`, then run the **voice-analysis** skill
   to generate `context/brand-voice.md`.

## The daily loop (the "button")
1. Drop a long-form `.md` file in `inbox/`.
2. Run the **repurpose** skill.
3. Review everything in `dashboard.html`, copy, and post.

## Using this in Claude Cowork
This folder is version-controlled in git. To use it in Cowork:
1. Clone this repo to your computer.
2. In Cowork, open the `content-os/` folder.
3. Your context + skills load automatically. `/repurpose` is your button.

Because it lives in git, nothing gets lost, and you can open it in Cowork,
Claude Code, or any harness and keep working.

## Folders
- `context/` — who you are (loads every session)
- `voice/`   — your past content (trains your voice)
- `inbox/`   — drop long-form here
- `repurpose/` — outputs, per asset, per platform
- `assets/`  — generated thumbnails / images / videos
- `.claude/skills/` — your buttons (repurpose, voice-analysis)
