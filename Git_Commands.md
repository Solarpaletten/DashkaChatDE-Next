# Убедиться что всё закоммичено
git status
git add .
git commit -m "Release v1.0.0 - Initial Stable Release"

# Создать tag
git tag -a v1.0.0 -m "DashkaChat v1.0.0 - Initial Stable Release"

# Пушить в репозиторий
git push origin main
git push origin v1.0.0

# Проверить tag
git tag -l
```

---

## 3. Vercel Deployment Guide

### ⚠️ CRITICAL: Vercel Limitations

| Feature | Vercel Support |
|---------|----------------|
| Next.js App Router | ✅ Full |
| API Routes | ✅ Full |
| Custom Server (`server.ts`) | ❌ No |
| Persistent WebSocket | ❌ No |
| Long-running processes | ❌ No |

**Вердикт:** Полный деплой в Vercel **невозможен** из-за WebSocket.

---

### Рекомендация: Hybrid Deployment
```
┌─────────────────┐     ┌─────────────────┐
│     VERCEL      │     │  RENDER/FLY.IO  │
│  (Frontend +    │────▶│  (WebSocket     │
│   API Routes)   │     │   Server)       │
└─────────────────┘     └─────────────────┘
```

---

### Option A: Full VPS/Render (Recommended)

**Почему:** Один сервер, WebSocket работает, проще деплой.

#### Render.com Setup

1. **Создать Web Service** на render.com
2. **Settings:**
```
   Build Command: npm install && npm run build
   Start Command: npm run start
```
3. **Environment Variables:**
```
   OPENAI_API_KEY=sk-...
   NODE_ENV=production
   PORT=10000
   NEXT_PUBLIC_API_URL=https://your-app.onrender.com

4. Health Check Path: /api/health