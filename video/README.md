# PANENKA — Launch Video (Remotion)

1-minute launch trailer for **PANENKA**. Composition lives in `src/`, rendered via Remotion.

- **Output:** 1920 × 1080, 30 fps, 60 s.
- **Theme:** matches the brand — deep navy `#050714`, gold `#FFC940`, cyan `#00E5FF`, magenta `#FF1F8B`.
- **Fonts:** Chakra Petch (display) + JetBrains Mono — same as the website.
- **Music:** `public/launch_music.mp3` — 60s cinematic trailer score generated via ElevenLabs.

## Quick start

```powershell
cd D:\Tools\okx\video
pnpm install              # one-time
pnpm dev                  # opens Remotion Studio at http://localhost:3000
```

In Remotion Studio:
- Scrub the timeline.
- Edit any `src/scenes/*.tsx` file — it hot-reloads instantly.
- Tweak `defaultProps.clips` in the right sidebar to wire in your real game footage.

## Adding your game clips

1. Drop your captured clips (any browser-decodable mp4 / webm) into `public/clips/`.
   ```
   public/clips/
     ├─ create-match.mp4
     ├─ lock-in.mp4
     ├─ goal-celebration.mp4
     └─ victory-claim.mp4
   ```
2. Open `src/Root.tsx` and update the `clips` array:
   ```tsx
   defaultProps={{
     clips: [
       "clips/create-match.mp4",
       "clips/lock-in.mp4",
       "clips/goal-celebration.mp4",
       "clips/victory-claim.mp4",
     ],
   }}
   ```
3. Each slot is **~6.25 s** — the `<Video>` component scales/crops to fit (`objectFit: cover`). Trim your captures to that length or longer.
4. Set any slot to `null` to keep the styled placeholder (useful if you only have 2 clips ready).

The lower-third caption per slot is configured in `src/scenes/Gameplay.tsx → SLOT_META`. Captions today read: `CREATE A MATCH`, `LOCK IN YOUR MOVE`, `GOAL.`, `WINNER TAKES THE POT`. Edit those if your clips show different beats.

## Scene structure

| # | Scene             | Duration  | File                          |
|---|-------------------|-----------|-------------------------------|
| 1 | Opener (logo)     | 0:00–0:08 | `src/scenes/Opener.tsx`       |
| 2 | Hook (kinetic)    | 0:08–0:18 | `src/scenes/Hook.tsx`         |
| 3 | Concept (matrix)  | 0:18–0:25 | `src/scenes/Concept.tsx`      |
| 4 | Gameplay (clips)  | 0:25–0:50 | `src/scenes/Gameplay.tsx`     |
| 5 | End screen        | 0:50–1:00 | `src/scenes/EndScreen.tsx`    |

The end screen is also registered as a separate composition (`EndCard`) so you can render it as a still image for the YouTube/X end frame.

## Render

```powershell
pnpm render                # → out/panenka-launch.mp4   (uses ./public/launch_music.mp3)
pnpm still                 # → out/end-card.png         (final end-screen still)
```

`pnpm render` outputs an H.264 mp4. First render takes a couple of minutes (Chromium spin-up + 1800 frames). Repeat renders use a Chromium cache and are faster.

## Regenerating the music

If you want a different track, re-run the ElevenLabs Music API:

```powershell
$key = (Get-Content ..\contracts\.env | Select-String '^ELEVEN_LABS_API_KEY=').ToString().Split('=')[1]
curl -X POST "https://api.elevenlabs.io/v1/music" `
  -H "xi-api-key: $key" -H "Content-Type: application/json" `
  -d '{"prompt": "<your prompt>", "music_length_ms": 60000, "output_format": "mp3_44100_128"}' `
  --output public/launch_music.mp3
```

Prompt template that worked well: *"An energetic modern sports-game launch trailer score. Cinematic build-up from soft synth pads with steady stadium-clap rhythm, layering punchy electronic drums and a bright melodic synth lead. Mid-track a heroic gold-themed motif lifts in, climaxing around 45s. Dark navy neon aesthetic. Instrumental, no vocals. 90–100 BPM."*

## Folder layout

```
video/
├─ public/
│  ├─ panenka.png            ← square logo (Opener)
│  ├─ panenka_lockup.png     ← horizontal lockup (EndScreen)
│  ├─ launch_music.mp3       ← background track (60s)
│  └─ clips/                 ← drop your game footage here
├─ src/
│  ├─ index.ts               ← registerRoot
│  ├─ Root.tsx               ← Composition registration + defaultProps
│  ├─ Launch.tsx             ← orchestrator: Series of 5 scenes + Audio
│  ├─ theme.ts               ← colors, fps, scene durations
│  └─ scenes/
│     ├─ Opener.tsx
│     ├─ Hook.tsx
│     ├─ Concept.tsx
│     ├─ Gameplay.tsx
│     └─ EndScreen.tsx
├─ package.json
├─ tsconfig.json
├─ remotion.config.ts
└─ README.md
```

The whole `video/` directory is **gitignored at the repo root** — it's an internal tool, not part of the deployed app.
