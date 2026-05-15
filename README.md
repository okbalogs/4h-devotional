# Editorial Devotion

A Progressive Web App for ECWA members to practise the **4H quiet-time framework** — Hear, Heed, Hold, Help — with a personalised daily Bible verse, journalled reflections, and a full devotional archive.

---

## Features

### Core
- **Daily personalised verse** — each user gets a different verse every day based on how long they've been on the app (journey days), fetched from `bible-api.com` and cached in Supabase + localStorage
- **4H Entry form** — guided journalling across four quadrants (Hear · Heed · Hold · Help) with a lingering-thought banner
- **Devotional archive** — calendar view with entry markers, completion rate, and a feed of past entries
- **Entry detail** — full read-back of any saved entry with delete support

### Auth
- Email/password signup with full name capture and password confirmation
- Google OAuth (avatar auto-seeded to profile)
- Forgot password → email link → `/reset-password` in-app flow

### Settings
- Bible translation preference (KJV · WEB · ASV) — changes which translation the verse API fetches
- Profile name, church/denomination
- Toggle preferences: daily reminders, weekly summary, public profile, community prayers
- Reminder time picker
- All preferences persisted to Supabase `profiles` table

### PWA / Offline
- Installable (Web App Manifest + Service Worker)
- Verse cached in localStorage — loads instantly with no network
- Entry saved offline to localStorage queue when no internet
- Auto-syncs queued entries to Supabase when connection is restored

### Mobile
- Sidebar collapses to a fixed bottom tab bar on screens ≤ 768px
- Floating `+` action button for new entries on mobile
- Entry hero and quadrant grid reflow for narrow screens

---

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16.2.3 (App Router) |
| UI | React 19.2.4 + Tailwind CSS v4 |
| Backend / Auth / DB | Supabase (`@supabase/supabase-js` v2) |
| Bible API | `bible-api.com` (free, no key required) |

---

## Getting Started

### 1. Clone and install

```bash
git clone <repo-url>
cd 4h-devotion-tracker
npm install
```

### 2. Environment variables

Create `.env.local` at the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Database setup

Run the following in your Supabase **SQL Editor** in order:

```sql
-- Entries
create table entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null default '',
  scripture_reference text not null default '',
  hear text not null default '',
  heed text not null default '',
  hold text not null default '',
  help text not null default '',
  lingering_thought text not null default '',
  created_at timestamptz default now()
);
alter table entries enable row level security;
create policy "users can manage their own entries"
  on entries for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Profiles
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  avatar_url text,
  bible_version text not null default 'web',
  church text not null default '',
  reminders_enabled boolean not null default true,
  public_profile boolean not null default false,
  weekly_summary boolean not null default true,
  community_prayers boolean not null default false,
  reminder_time text not null default '06:00',
  updated_at timestamptz default now()
);
alter table profiles enable row level security;
create policy "users can manage their own profile"
  on profiles for all
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Auto-create profile on signup (seeds Google avatar if OAuth)
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, avatar_url)
  values (new.id, new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- Daily verse cache
create table user_verses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  journey_day int not null,
  verse_reference text not null,
  verse_text text not null,
  bible_version text not null default 'web',
  fetched_at timestamptz default now(),
  unique(user_id, journey_day)
);
alter table user_verses enable row level security;
create policy "users can manage their own verses"
  on user_verses for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
```

### 4. PWA icons

Add your app icons to `public/icons/`:
- `icon-192.png` — 192 × 192 px
- `icon-512.png` — 512 × 512 px

### 5. Run

```bash
npm run dev      # development server → http://localhost:3000
npm run build    # production build
npm run lint     # ESLint
```

---

## Project Structure

```
src/
├── app/
│   ├── (protected)/        # Auth-gated routes — layout adds Sidebar
│   │   ├── today/          # Daily verse + journey day dashboard
│   │   ├── history/        # Calendar + entry archive
│   │   ├── entry/
│   │   │   ├── new/        # New 4H entry form
│   │   │   └── [id]/       # Entry detail / read-back
│   │   └── settings/       # Profile, preferences, security
│   ├── signin/             # Sign in
│   ├── signup/             # Sign up
│   ├── forgot-password/    # Request reset email
│   ├── reset-password/     # Set new password (from email link)
│   └── page.jsx            # Public landing page
├── components/
│   ├── ShellWrapper.jsx    # Picks correct shell per route + auth guard
│   ├── Sidebar.jsx         # Protected app nav (bottom tab bar on mobile)
│   ├── Navbar.jsx          # Public nav (auth-aware)
│   ├── Footer.jsx          # Public footer
│   └── PwaRegistration.jsx # Registers SW + syncs offline queue on reconnect
├── context/
│   └── AuthContext.jsx     # Supabase auth state + helpers
└── utils/
    ├── supabase.js         # Shared Supabase client
    ├── dailyVerse.js       # Journey-day calc, verse fetch, localStorage + Supabase cache
    └── offlineStorage.js   # localStorage helpers for verse cache + offline entry queue
public/
├── manifest.json           # PWA manifest
├── sw.js                   # Service worker
└── icons/                  # PWA icons (add your own)
```

---

## How the Daily Verse Works

1. **Journey day** is computed as `(today − signup date) + 1`, so each user's schedule is personal.
2. A curated pool of 100 devotional verse references cycles in order (`journeyDay % 100`).
3. On the first visit to a new day the app fetches **7 days at once** from `bible-api.com` in the user's chosen translation (KJV / WEB / ASV) and stores them in Supabase.
4. The verse is also written to `localStorage` so it loads instantly on subsequent visits — including offline.

## How Offline Sync Works

1. When **Save Entry** is pressed with no network, the entry is written to a `pending_entries` array in `localStorage`.
2. The page shows *"Saved offline — will sync when connected."*
3. `PwaRegistration` listens for the browser's `online` event; when it fires, every pending entry is replayed against Supabase and removed from the queue.
