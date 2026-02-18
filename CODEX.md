# CODEX — Project Spec (Short)

## What This App Is
EduDocs Market is a Next.js 15 (App Router) prototype for a Tunisian education document marketplace.
It includes a marketing landing page plus three role dashboards: student, teacher, admin.
All content is currently mocked/static UI for product/design work.

## Tech Stack
- Next.js 15 + React 18 (App Router in `src/app`).
- Tailwind CSS for styling, with custom design tokens in `src/app/globals.css`.
- Radix UI Dialog + custom UI components in `src/components/ui/*`.
- Framer Motion for auth modal transitions.
- Supabase client utilities included but not wired to real auth/data yet.

## Routes (App Router)
- `/` marketing page (hero + CTA). Auth modal opens from header or CTA.
- `/student` student dashboard (mock catalog + filters).
- `/teacher` teacher studio dashboard (mock stats + uploads).
- `/admin` admin dashboard (mock stats + tickets).
- `/auth/student` and `/auth/teacher` redirect to `/?auth=...` (client-side).
- `/auth/admin` shows an admin login card (mocked).

## Auth & Access Control (Mocked)
- This app does **not** implement real auth yet.
- Auth is simulated by setting cookies:
  - `edudocs_auth=1`
  - `edudocs_role=student|teacher|admin`
- `src/middleware.ts` guards `/student`, `/teacher`, `/admin` and redirects to `/auth/{role}` if cookies don’t match.
- `AuthModal` calls `onConnect` and the homepage sets the cookies + routes to the role.

## Supabase (Not Fully Integrated)
- Supabase helpers exist in `src/lib/supabase/*`.
- Expected env vars:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `logSupabaseConfig()` only logs presence of env vars; no live auth or data is hooked up.

## Data & Content
- All data on dashboards is hard-coded in component files.
- No API routes, database models, or server actions are defined.

## Styling & UI Notes
- Global typography uses Manrope + Space Grotesk.
- Design tokens are CSS variables in `:root` (see `globals.css`).
- UI primitives live in `src/components/ui/*` and are used throughout pages.

## Guardrails (Avoid Hallucination)
- Assume **no backend**: no real authentication, payments, uploads, or DB logic yet.
- Any “stats”, “documents”, “revenues”, etc. are mock values.
- Supabase is present only as setup scaffolding.
- Routing is App Router only; no Pages Router usage.
