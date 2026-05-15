# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

```bash
npm run dev      # Start dev server on http://localhost:3000
npm run build    # Production build
npm run lint     # ESLint (Next.js config, no test runner configured)
```

No test framework is set up — there are no tests to run.

## Stack

- **Next.js 16.2.3** with App Router — see AGENTS.md note about breaking changes
- **React 19.2.4**
- **Tailwind CSS v4** (uses `@tailwindcss/postcss`, not the v3 `tailwind.config.js` pattern)
- **Supabase** (`@supabase/supabase-js`) for auth and data
- **Path alias**: `@/` resolves to `./src/`

Required env vars (see `.env.local`): `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Architecture

### Two layout zones

`ShellWrapper` ([src/components/ShellWrapper.jsx](src/components/ShellWrapper.jsx)) is mounted in the root layout and controls which shell renders:

- **Public pages** (landing, marketing, explore, etc.) — render with `<Navbar>` + `<Footer>`
- **Auth pages** (`/signin`, `/signup`, `/forgot-password`) — render children directly (pages own their full layout)
- **Protected pages** (`/today`, `/history`, `/settings`, `/entry`) — render children directly; the `(protected)` route group provides a `<Sidebar>` via its own layout

`ShellWrapper` also enforces auth: unauthenticated users hitting a protected route are redirected to `/signin`.

### Route groups

```
src/app/
  (protected)/          # Auth-gated; layout adds <Sidebar>
    today/              # Devotional dashboard
    history/            # Calendar + entry feed archive
    settings/
    entry/
      new/              # New 4H entry form
      [id]/             # View existing entry
  signin/ signup/ forgot-password/   # Auth flows (own layouts)
  page.jsx              # Public landing page
  layout.jsx            # Root layout: fonts, AuthProvider, ShellWrapper
```

### Auth

`AuthContext` ([src/context/AuthContext.jsx](src/context/AuthContext.jsx)) is a client-side React context wrapping the entire app. It exposes `user`, `loading`, `login`, `signup`, `loginWithGoogle`, `logout`, and `resetPassword`. All auth operations go through `supabase.auth.*`. The Supabase client is a shared singleton at [src/utils/supabase.js](src/utils/supabase.js).

### The 4H framework

The app's core domain is the ECWA 4H quiet-time method. Each devotional entry has four quadrants:
1. **Hear (Head)** — what does the scripture say?
2. **Heed (Heart)** — emotional/conviction reflection
3. **Hold (Hands)** — action steps
4. **Help (Others)** — extending the truth to others

The new-entry page ([src/app/(protected)/entry/new/page.jsx](src/app/(protected)/entry/new/page.jsx)) is the primary UI for this — currently static/UI-only with no Supabase writes yet.
