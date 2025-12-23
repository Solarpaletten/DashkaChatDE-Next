# DashkaChat v1.0.0 — Initial Stable Release

**Release Date:** 2025-12-23

## 🎉 Highlights

First stable release of DashkaChat — a real-time translation platform with voice and text support.

## ✨ Features

### Core
- Custom Node.js server with WebSocket support
- Next.js 14 App Router architecture
- TypeScript throughout

### Translation
- Text-to-text translation (10 languages)
- Voice-to-voice pipeline (Whisper → GPT → TTS)
- Language auto-detection

### Real-time
- WebSocket rooms for multi-user sessions
- Live translation broadcasting
- Connection status indicators

### API
- `GET /api/health` — Health check
- `GET /api/languages` — Language list
- `POST /api/translation` — Text translation
- `POST /api/voice` — Voice translation

### UI
- Responsive dashboard (Desktop/Tablet/Mobile)
- Voice recording with Web Speech API
- Translation history panel

## 🛠 Tech Stack

- Next.js 14.2.0
- WebSocket (ws 8.17.0)
- OpenAI API (Whisper, GPT-4o-mini, TTS)
- Tailwind CSS 3.4.3
- TypeScript 5.4.0

## 📋 Requirements

- Node.js 18+
- OpenAI API Key

## 🚀 Quick Start
```bash
git clone https://github.com/Solarpaletten/DashkaChatDE-Next.git
cd DashkaChatDE-Next
npm install
cp .env.example .env.local  # Add your OPENAI_API_KEY
npm run dev
```

## 👥 Team SOLAR

- Leanid (Architect)
- Dashka (Coordinator)
- Claude (Engineer)

---

**Full Changelog:** Initial release