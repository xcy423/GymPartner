# 🏋️ GymPartner

A private gym accountability and reward app built for two. Log your sessions, grow your streak multiplier, and redeem real rewards when you hit your goals — together.

---

## What it is

GymPartner is a couple-focused habit tracker where both people log their gym sessions with photo proof, earn points through a streak multiplier system, and redeem rewards that the partner approves. No public leaderboards, no strangers — just the two of you keeping each other accountable.

---

## Features

- **Session logging** — check-in and check-out with photo proof, minimum 1 hour tracked
- **Streak multiplier** — grows ×0.2 each consecutive successful week, caps at ×3.0, resets on a missed week
- **Points system** — 3 sessions/week = 100 pts × multiplier · 5 sessions = 250 pts × multiplier
- **Partner view** — see your partner's streak, progress, and session history in read-only mode
- **Reward vouchers** — 3 reward tiers (200 / 1000 / 2000 pts), partner approves with their approval code
- **Dynamic color identity** — logged-in user is always blue, partner is always gold (swaps on login)
- **Calendar history** — monthly view with color-coded session states per user

---

## Tech stack

| Layer | Tool |
|---|---|
| Frontend | React + TypeScript (Vite) |
| Styling | Tailwind CSS + shadcn/ui |
| Backend | Supabase (Auth + Postgres + Storage) |
| Photos | Supabase Storage (`gym-proofs` bucket) |

---

## Getting started

### 1. Clone the repo

```bash
git clone https://github.com/xcy423/GymPartner.git
cd GymPartner
```

### 2. Install dependencies

```bash
npm install
# or
pnpm install
```

### 3. Set up environment variables

Create a `.env.local` file in the root:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

Get both values from your Supabase dashboard → **Settings → API**.

### 4. Run the dev server

```bash
npm run dev
```

---

## Project structure

```
GymPartner/
├── src/
│   ├── app/          # Pages and route components
│   ├── imports/      # Shared utilities and Supabase client
│   └── styles/       # Global styles and Tailwind config
├── guidelines/       # Design system and component guidelines
├── index.html
├── vite.config.ts
└── package.json
```

---

## Design system

Color, spacing, radius, typography, and component tokens are documented in [`guidelines/Guidelines.md`](./guidelines/Guidelines.md).

**Color identity rule:** the logged-in user is always rendered in blue (`#6EA4BB`), their partner always in gold (`#D4A843`). These roles swap on login — no color is permanently tied to a username.

**Palette (Lucario):**

| Token | Hex | Use |
|---|---|---|
| Primary blue | `#6EA4BB` | Self / actions / progress |
| Gold | `#D4A843` | Partner / rewards / points |
| Red | `#C04C4B` | Errors / danger |
| Green | `#5A9E6E` | Completed sessions / success |
| Background | `#FFFFFF` | App background |

---

## Database

Managed by Supabase. Schema includes:

- `profiles` — user accounts, points, multiplier, streak, approval code, partner link
- `gym_sessions` — check-in/check-out records with photo URLs and duration
- `rewards_catalog` — the 3 reward tiers (pre-seeded)
- `redemption_requests` — reward requests and partner approvals

Row Level Security is enabled on all tables. Each user can only read their own data and their linked partner's data.

---

## Reward flow

1. User earns enough points → **Request** button activates
2. User taps request → status becomes **pending**
3. Partner sees an approval card on their Rewards tab
4. Partner enters their approval code → reward marked **approved**, points deducted immediately

---

*Built with 💙 for two.*
