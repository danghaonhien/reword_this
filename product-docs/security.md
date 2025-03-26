# security.md — Reword This

## 🔐 Privacy & Security Principles
1. **No Data Storage** — Reword This does not store any user content or metadata on external servers.
2. **Local-Only Processing (when possible)** — Rewrites and streaks are stored locally in the browser using LocalStorage or IndexedDB.
3. **API Security** — All calls to OpenAI are routed via a secure serverless proxy with:
   - No logging
   - Rate-limiting
   - API key obfuscation
4. **Zero Analytics by Default** — No Google Analytics, Hotjar, etc. unless explicitly opted in.
5. **GDPR-Friendly** — We don’t store PII. No need for cookie banners or consent.

---

## 🧱 Architecture Overview
- **Frontend:** Chrome Extension (React + Manifest V3)
- **Secure API Proxy:** Optional Vercel or Netlify function that:
  - Takes `{text, tone}`
  - Passes to OpenAI securely
  - Returns rewritten text
- **Storage:**
  - LocalStorage for XP, streaks
  - Optional: encrypted local storage for custom tone history

---

## 🧼 Security Checklist
- [x] No plain API keys in frontend code
- [x] All network requests use HTTPS
- [x] Only minimal data sent in requests
- [x] No raw input stored anywhere
- [x] Use CORS policy on serverless proxy
- [x] Use environment variables on build (e.g., VITE_OPENAI_KEY)

---

## 🔄 Optional User Actions
- [ ] Export local data (XP, tone history) as JSON
- [ ] Clear all local data button
- [ ] Manual opt-in telemetry (for improving tone suggestions)

---

## 🚨 Breach Protocol (If Ever Needed)
- Immediate API key revocation
- Notify users via in-app alert
- Release patch + security log

---

Security is king. We build with user trust in mind. 🛡️

