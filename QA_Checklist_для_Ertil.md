# DashkaChat v1.0.0 — QA Checklist

**Tester:** Ertil  
**Version:** v1.0.0  
**Date:** ___________

---

## 🔌 API Endpoints

- [ ] `GET /api/health` returns `{"status":"healthy"}`
- [ ] `GET /api/languages` returns 10 languages
- [ ] `POST /api/translation` translates RU→DE correctly
- [ ] `POST /api/translation` translates EN→RU correctly
- [ ] `POST /api/translation` handles empty text (400 error)
- [ ] `POST /api/translation` caches repeated requests

---

## 🔗 WebSocket

- [ ] Connect to `ws://localhost:3000/ws`
- [ ] Receive `welcome` message with `client_id`
- [ ] `join_room` creates/joins room
- [ ] `translation` broadcasts to room members
- [ ] `leave_room` removes from room
- [ ] Disconnect cleans up client

---

## 🎤 Voice Features

- [ ] Microphone permission prompt appears
- [ ] Recording starts (red indicator)
- [ ] Speech recognized in Russian
- [ ] Speech recognized in German
- [ ] Recording stops correctly
- [ ] Auto-translation after recording (auto mode)

---

## 💬 Text Translation

- [ ] Input text field works
- [ ] Paste button works
- [ ] Translate button sends request
- [ ] Translation appears in output panel
- [ ] Copy button copies result
- [ ] Clear button resets both panels

---

## 🏠 Rooms

- [ ] Room join modal opens
- [ ] Can create room with code + username
- [ ] Status shows "Connected to room"
- [ ] Translation shared with room partner
- [ ] Partner receives translation in real-time

---

## 📱 Responsive UI

- [ ] Desktop layout (1200px+)
- [ ] Tablet layout (768px-1199px)
- [ ] Mobile layout (<768px)
- [ ] All buttons accessible on mobile
- [ ] Scrolling works in translation panels

---

## 🌐 Browser Compatibility

- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile Chrome
- [ ] Mobile Safari

---

## ⚠️ Error Handling

- [ ] No API key → graceful error message
- [ ] Network offline → shows connection error
- [ ] WebSocket disconnect → shows status
- [ ] Invalid language → returns error
- [ ] Empty audio → handles gracefully

---

## 🔒 Security

- [ ] API key not exposed in frontend
- [ ] No console errors in production
- [ ] CORS headers present on API
- [ ] WebSocket validates messages

---

## 📝 Notes

_Space for tester comments:_
```
```

---

## ✅ Sign-off

- [ ] All critical tests passed
- [ ] All major tests passed
- [ ] Known issues documented

**Tester Signature:** ___________  
**Date:** ___________