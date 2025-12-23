# DashkaChat

Real-time voice and text translation platform with WebSocket support for multi-user rooms.

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![Next.js](https://img.shields.io/badge/Next.js-14-black)
![License](https://img.shields.io/badge/license-MIT-green)

## Overview

DashkaChat is a full-stack translation application that enables real-time voice-to-voice and text-to-text translation between multiple languages. Built for scenarios like business meetings, customer support, and cross-language collaboration.

### Key Features

- 🎤 **Voice Translation** — Speech-to-text → Translation → Text-to-speech pipeline
- 💬 **Text Translation** — Instant text translation with 10+ language support
- 🔌 **Real-time Rooms** — WebSocket-based rooms for multi-user sessions
- 🌍 **Multi-language** — EN, RU, DE, PL, FR, ES, CS, LT, LV, NO
- 📱 **Responsive UI** — Desktop, tablet, and mobile layouts

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 14 (App Router) |
| Server | Custom Node.js server |
| Real-time | WebSocket (ws) |
| AI Services | OpenAI Whisper, GPT-4o-mini, TTS |
| Styling | Tailwind CSS |
| Language | TypeScript |

## Architecture
```
DashkaChatDE-Next/
├── server.ts              # Custom server (HTTP + WebSocket)
├── app/
│   ├── api/
│   │   ├── health/        # GET  /api/health
│   │   ├── languages/     # GET  /api/languages
│   │   ├── translation/   # POST /api/translation
│   │   └── voice/         # POST /api/voice
│   └── (dashboard)/       # Frontend pages
├── lib/
│   └── websocket/
│       ├── index.ts       # WebSocket server setup
│       ├── handlers.ts    # Message handlers (rooms, translation)
│       ├── clientManager.ts
│       └── logger.ts
├── services/
│   ├── translationService.ts   # GPT-4o-mini translation
│   ├── whisperService.ts       # Speech-to-text
│   └── textToSpeechService.ts  # OpenAI TTS
├── hooks/
│   └── useTranslator.ts   # Frontend translation hook
└── components/
    └── dashboard/         # UI components
```

## Environment Variables

Create `.env.local` in project root:
```env
# Required
OPENAI_API_KEY=sk-your-openai-api-key

# Server
PORT=3000
HOSTNAME=localhost
NODE_ENV=development

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:3000

# Optional
DEEPL_API_KEY=
LOG_LEVEL=debug
```

## Local Development
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Server will be available at:
# HTTP:  http://localhost:3000
# WS:    ws://localhost:3000/ws
```

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/health` | GET | Health check |
| `/api/languages` | GET | List supported languages |
| `/api/languages` | POST | Detect language |
| `/api/translation` | POST | Translate text |
| `/api/voice` | POST | Voice translation (multipart/form-data) |

### Example: Text Translation
```bash
curl -X POST http://localhost:3000/api/translation \
  -H "Content-Type: application/json" \
  -d '{"text":"Hello world","source_language":"EN","target_language":"DE"}'
```

### WebSocket Events
```javascript
// Connect
const ws = new WebSocket('ws://localhost:3000/ws');

// Join room
ws.send(JSON.stringify({ type: 'join_room', room: 'DE', username: 'User1' }));

// Send translation
ws.send(JSON.stringify({ 
  type: 'translation', 
  original: 'Привет', 
  translation: 'Hallo',
  from: 'RU',
  to: 'DE'
}));
```

## Production Deployment

### Important Notes

⚠️ **Custom Server Required** — This project uses a custom Node.js server for WebSocket support. Standard Vercel deployment (serverless) will not work for WebSocket functionality.

### Recommended Deployment Options

1. **VPS/Docker** (Recommended)
   - Full control over WebSocket connections
   - Use `npm run start` for production

2. **Railway / Render**
   - Supports long-running Node processes
   - WebSocket-friendly

3. **Vercel + External WebSocket**
   - Deploy Next.js to Vercel (API + Frontend)
   - Deploy WebSocket server separately (Render/Fly.io)

### Production Build
```bash
npm run build
npm run start
```

## Project Status

- [x] **Phase 1** — Backend Core (API, WebSocket, Services)
- [ ] **Phase 2** — Frontend Integration & Testing
- [ ] **Phase 3** — Production Hardening

## Contributing

Built by **Team SOLAR**

- **Leanid** — Architect
- **Dashka** — Senior Coordinator  
- **Claude** — Engineer

## License

MIT

---

## 🇷🇺 Краткое описание

DashkaChat — платформа для голосового и текстового перевода в реальном времени с поддержкой комнат через WebSocket. Поддерживает 10+ языков, включая RU, DE, EN, PL.
```bash
npm install
npm run dev
# http://localhost:3000
```

# DashkaChat — Next.js Architecture

Real-time translation chat application built with Next.js App Router.

## 🏗️ Architecture

### Идея
Full-stack TypeScript приложение на Next.js App Router с custom server для WebSocket поддержки.

### Почему так
1. **Единый стек** — один язык, общие типы frontend ↔ backend
2. **App Router** — современный подход, React Server Components
3. **Custom Server** — необходим для WebSocket (real-time перевод)
4. **Модульность** — чёткое разделение ответственности

## 📁 Структура

```
DashkaChatDE-Next/
├── app/                    # Next.js App Router
│   ├── api/               # API Routes
│   │   ├── health/        # GET /api/health
│   │   ├── languages/     # GET /api/languages
│   │   ├── translation/   # POST /api/translation
│   │   └── voice/         # POST /api/voice, /api/voice/tts
│   └── (dashboard)/       # Dashboard pages
├── components/            # React components
│   ├── dashboard/        # Dashboard-specific
│   └── ui/               # Reusable UI
├── lib/                   # Shared utilities
│   └── websocket/        # WebSocket server logic
├── services/             # Business logic
│   ├── whisperService    # Speech-to-Text
│   ├── translationService # Translation
│   └── textToSpeechService # Text-to-Speech
├── types/                 # TypeScript types
├── config/               # Configuration
│   └── languages/        # i18n configs
├── server.ts             # Custom server (WebSocket!)
└── middleware.ts         # Edge middleware
```

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Development
npm run dev

# Production build
npm run build
npm run start
```

## ⚙️ Environment Variables

Copy `.env.example` to `.env.local` and fill in your API keys:

```bash
cp .env.example .env.local
```

Required:
- `OPENAI_API_KEY` — for Whisper STT
- `DEEPL_API_KEY` — for translation (or other provider)

## 🔌 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/health` | GET | Health check |
| `/api/languages` | GET | List supported languages |
| `/api/translation` | POST | Translate text |
| `/api/voice` | POST | Speech-to-text (Whisper) |
| `/api/voice/tts` | POST | Text-to-speech |

WebSocket: `ws://localhost:3000/ws`

## 🛠️ Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **WebSocket:** ws (via custom server)
- **Runtime:** Node.js 18+

## ⚠️ Deployment Notes

- **Vercel:** ❌ Not recommended (no WebSocket, read-only filesystem)
- **VPS/Docker:** ✅ Recommended
- **Railway:** ✅ Works well

## 📝 Migration Status

- [x] Skeleton structure
- [ ] API routes implementation
- [ ] WebSocket handlers
- [ ] UI components migration
- [ ] Services integration
- [ ] Testing

---

Built with ☀️ by Team SOLAR

git commit -m "fix: move tailwind to dependencies"
