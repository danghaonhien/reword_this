# Product Requirements Document (PRD)

## Product Name
**Reword This** — Chrome Extension for AI-Powered Text Rewriting

## Purpose
Empower professionals, writers, and non-native English speakers to rephrase any selected text instantly in various tones (clarity, friendly, persuasive, etc.), directly from their browser, with a focus on speed, simplicity, and privacy.

## Problem Statement
Rewriting content to fit different tones or communication goals (formal, persuasive, clear, etc.) is time-consuming and mentally taxing. Existing tools like Grammarly and Wordtune are often bloated, expensive, or focus too much on grammar instead of intent.

## Target Users
- Job seekers rewriting resumes or cover letters
- Founders and freelancers writing emails, landing page copy
- ESL users polishing writing tone
- Writers and students needing clarity and tone shifts

## User Pain Points
- Lack of quick tone-switching tools inside existing workflows
- Tools that collect user data or feel invasive
- Overly complex or expensive solutions for simple needs

## Goals
### User Goals
- Reword content in different tones instantly
- Keep private data secure
- Enjoy the process (gamification, fun)

### Business Goals
- Validate product-market fit with a free tier
- Convert users with premium tone options and unlimited use
- Keep development simple and maintainable by a solo team

## Key Features (MVP)
1. **Highlight + Right Click to Reword** via Chrome context menu
2. **Tone Selector UI** (Clarity, Friendly, Persuasive, etc.)
3. **“Surprise Me” Mode** — Random tone rewriter
4. **Gamified XP and Streak System**
5. **Side-by-side Rewrite Battle View**
6. **Local Custom Tone Builder** (via reference writing sample)
7. **All data stored locally or encrypted – no server-side logs**

## User Flows
1. User highlights text → Right-click → Select "Reword This"
2. Extension popup opens with pre-filled text
3. User selects tone or clicks "Surprise Me"
4. Rewritten text is shown, with copy and replace options
5. XP added + streak continued

## Metrics for Success
- Daily Active Users (DAU)
- Rewrites per session
- Free → Premium conversion rate
- User retention after 1 week
- Bounce rate post-install

## Timeline (MVP)
Week 1: UI + Core Rewrite Engine
Week 2: Chrome Extension Shell + Context Menu
Week 3: Gamification + Prompt logic
Week 4: Privacy, testing, bug fixing, and soft launch

## Risks & Mitigations
- **Risk:** GPT outputs inconsistent results → Add manual tone fine-tuning
- **Risk:** Users concerned about data → Emphasize zero-log architecture
- **Risk:** Extension approval delays → Submit early and iterate in staging

