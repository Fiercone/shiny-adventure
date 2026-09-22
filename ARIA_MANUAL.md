# Aria — Complete Manual (v0.1)

## What Aria Is
A continuous personal AI companion that runs fully client-side.
One identity (not a roster of agents). Inspired by *Her*, Jarvis, Friday.
Honest about not being sentient. Keys and memory stay on your device.

## Quick Start
```bash
cd aria
npm install
npm run dev
```
Open http://localhost:5173

## Architecture
- Frontend: HTML/CSS/JS (Vite)
- Shell: Tauri 2 (Windows first, Android later)
- Providers: Claude (direct), Gemini (direct), OpenRouter (GPT, DeepSeek, Grok, Fusion, …)

## Key Files
| File | Purpose |
|------|---------|
| `src/js/main.js` | App entry, chat loop, onboarding |
| `src/js/memory.js` | Personality + memory extraction |
| `src/js/router.js` | Model routing |
| `src/js/voice.js` | Web Speech (upgrade path for ElevenLabs) |
| `src/js/reminders.js` | Simple local reminders |
| `src/js/providers/*` | Claude / Gemini / OpenRouter clients |
| `src/js/config.js` | localStorage keys & settings |

## Features
- Intelligent routing with visible tags (`claude · strategic`, etc.)
- Persistent memory note + automatic extraction (you approve before save)
- Voice input/output (free Web Speech)
- Reminders (“remind me in 20 minutes…”)
- First-run onboarding
- Settings panel for keys / memory / voice

## Commands
- `update memory` or `review memory` → propose memory update
- `remind me … in X minutes/hours` → local reminder

## Privacy
Everything local. No backend. Keys only sent to the provider you chose.

## Roadmap
1. Real usage polish
2. Tauri Windows build
3. Better TTS (ElevenLabs)
4. Android target
5. Richer proactivity

## Design Rules
1. One identity
2. Client-side first
3. User owns memory (approval required)
4. Free-first
5. Voice is core
6. Honest about nature
7. Transparent routing
