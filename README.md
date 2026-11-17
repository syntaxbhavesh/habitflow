# HabitFlow AI

A calm, responsive habit tracker with AI habit ideas, an AI progress coach, goals, journaling, insights, reminders and data export.

## Stack
- Next.js App Router + TypeScript + Tailwind CSS
- Local-first browser storage (works without external services)
- Optional Supabase Auth + Postgres cloud sync with row-level security
- Server-side OpenAI or Gemini integrations

## Run locally
```bash
npm install
cp .env.example .env.local
npm run dev
```
Open http://localhost:3000.

## Enable AI
Set `AI_PROVIDER=openai` and `OPENAI_API_KEY`, or `AI_PROVIDER=gemini` and `GEMINI_API_KEY`. These are server-only environment variables. Do not expose provider keys using a `NEXT_PUBLIC_` prefix.

## Enable accounts and cloud sync
1. Create a Supabase project.
2. In its SQL Editor, run `supabase/migrations/0001_initial_schema.sql`.
3. In Supabase Auth settings, enable Email provider and configure the allowed site/redirect URLs for your local and production domains.
4. Add `NEXT_PUBLIC_SUPABASE_URL=https://zpmppsbhyaxjhewcitbd.supabase.co` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` (the project's publishable key) to local `.env.local` and Vercel. These two values are already configured in the linked Vercel project for Production, Preview and Development.
5. In Supabase → Authentication → URL Configuration, set **Site URL** to `https://habitflow-syntaxbhavesh.vercel.app` and add that URL plus `http://localhost:3000/**` to **Redirect URLs**. Add your eventual custom domain there too. Email/password signup passes the current app origin as its confirmation redirect.
6. In Supabase → Authentication → Providers → Email, choose whether email confirmation is required. For real users, keep confirmation enabled and configure SMTP before launch; the default email service is rate-limited.
7. Redeploy Vercel after changing environment variables. The app then shows email/password sign-in and syncs habits, check-ins, goals and journal entries to the signed-in user's RLS-protected rows.

Without those two Supabase values, the app remains in local-only mode. Existing local browser data is retained. Cloud sync is enabled only after a user signs in.

## Deploy to Vercel
Import `syntaxbhavesh/habitflow` with the default Next.js settings. Add the environment variables above in Project Settings → Environment Variables, then redeploy.

## Privacy
- AI provider secrets are read only by server routes.
- Supabase's public anon key is intended for browser use; database access is protected by RLS policies scoped to `auth.uid()`.
- Local data stays in the browser until cloud sync is configured and a user signs in.
- Export a JSON backup from Settings before clearing browser data.

## Scripts
- `npm run dev` — local development
- `npm run build` — production build
- `npm run lint` — ESLint
