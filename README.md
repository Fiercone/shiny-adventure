# Aria — Personal AI Operating System

One continuous AI presence. Client-side. Windows + Android first.

## Quick start

```bash
cd aria
npm install
npm run dev
```

Open http://localhost:5173

## Full documentation

See **[ARIA_MANUAL.md](./ARIA_MANUAL.md)** for the complete guide:
architecture, memory, voice, routing, onboarding, privacy, roadmap.

## Structure

```
aria/
├── src/
│   ├── index.html
│   ├── css/main.css
│   └── js/
│       ├── main.js
│       ├── config.js
│       ├── memory.js
│       ├── router.js
│       ├── voice.js
│       ├── reminders.js
│       ├── ui.js
│       └── providers/
│           ├── claude.js
│           ├── gemini.js
│           └── openrouter.js
└── src-tauri/          # Tauri 2 (Windows first)
```

## Current features

- One coherent identity (Aria)
- Intelligent routing (Claude / Gemini / OpenRouter → GPT, DeepSeek, Grok, Fusion)
- Persistent memory note + approved automatic extraction
- Voice input + output (Web Speech API)
- Simple reminders
- First-run onboarding
- Fully client-side (keys stay local)
