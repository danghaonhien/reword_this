# README.md — Reword This (Chrome Extension)

## Overview
Reword This is a minimalist Chrome Extension that uses AI to rewrite selected text into various tones (e.g., persuasive, clear, friendly). Built with React + GPT API for performance, privacy, and UX simplicity.

---

## 💻 Tech Stack
- React (Vite or CRA)
- GPT-4 via OpenAI API (or Claude)
- Chrome Extension APIs
- LocalStorage for streak/XPs
- Shadcn/ui (for UI components)

---

## 🧱 Folder Structure
```
reword-this-extension/
├── public/
├── src/
│   ├── components/
│   ├── pages/
│   ├── utils/
│   ├── hooks/
│   ├── prompts/
│   └── manifest.json
├── README.md
├── prompts.md
├── security.md
├── pricing.md
├── PRD.md
```

---

## ✅ Step-by-Step Setup (for Engineers)

### 1. Clone & Install
```bash
git clone https://github.com/yourname/reword-this-extension
cd reword-this-extension
npm install
```

### 2. Add OpenAI Key
Create a `.env` file:
```
VITE_OPENAI_KEY=your-key-here
```

### 3. Local Dev (UI only)
```bash
npm run dev
```

### 4. Build Chrome Extension
```bash
npm run build
```
Copy contents from `dist/` into Chrome’s `chrome://extensions` → Load unpacked.

### 5. Context Menu
Set up background script to detect right-click → open popup window with the selected text passed to it.

### 6. Core Logic
- `Textarea` takes input
- User selects tone or clicks Surprise
- Request sent to `/rewrite` with `{text, tone}`
- Response shown in Result panel

### 7. Gamification (XP & Streaks)
- Save streak and XP in LocalStorage
- Add XP after every successful rewrite
- Reset streak if no rewrite within 24h

### 8. Privacy
- No user data stored externally
- Prompts + rewrites handled client-side only or via secure API proxy

---

## 🧪 Testing
- [ ] Text rewriting works in all tones
- [ ] Surprise Me button returns varied outputs
- [ ] XP and streaks increment correctly
- [ ] No network calls contain raw text in logs

---

## 🚀 Ready for Launch When
- [ ] Chrome Extension build approved
- [ ] Prompt tests pass
- [ ] Pricing flow built
- [ ] README + Docs complete

---

Let’s ship it! ✨

