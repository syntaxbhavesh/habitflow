# HabitFlow AI

A calm, AI-assisted habit tracker built with Next.js. Track daily habits, review consistency, and ask an AI coach to turn progress into practical next steps.

## Stack
- Next.js App Router + TypeScript
- Tailwind CSS
- Browser local storage for a zero-setup demo
- Optional AI coach endpoint (OpenAI-compatible or Gemini)
- Optional Supabase SQL schema for future account sync

## Run locally
```bash
npm install
cp .env.example .env.local
npm run dev
```
Open http://localhost:3000.

## AI setup
Set `AI_PROVIDER` to `openai` or `gemini` and provide the matching server-side API key. Never put provider secrets in a `NEXT_PUBLIC_*` variable. The app remains usable without an AI key; the coach then shows a setup message.

## Deploy
Import this repository into Vercel. Use the default Next.js settings. Add AI environment variables in Vercel if you want the coach enabled.

## Data & privacy
The starter stores habits and check-ins in the current browser's local storage. Clearing browser data removes this local demo data. The optional SQL migration is a starting point for Supabase; authentication and cloud sync must be wired before treating it as a multi-device account system.

## Scripts
- `npm run dev` — development server
- `npm run build` — production build
- `npm run lint` — ESLint
