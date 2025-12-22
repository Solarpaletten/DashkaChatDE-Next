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
