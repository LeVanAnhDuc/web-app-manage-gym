# Manage Gym — a personal training log built around the week you actually train

A single-user gym tracker: define your weekly routine once, and each day the app
opens on what you are supposed to train, what to eat for that kind of day, and
the session you left half-finished. Next.js 16, Prisma 7, Auth.js.

It is deliberately for one person. Sign-in checks a single `APP_EMAIL` /
`APP_PASSWORD` pair from the environment, so there is no registration, no user
table, and nothing to share.

## Features

- **Today's screen**
  - Opens on the routine day matching today's weekday, with its exercises in
    order and their target sets, reps and rest time
  - Shows the meal plan for that *kind* of day — strength, cardio or rest — so
    what to eat follows what you are training rather than the calendar
  - An unfinished session is offered back to you instead of being abandoned:
    resume the one in progress rather than starting a second

- **Weekly routines**
  - Build a routine as seven weekday slots, each one strength, cardio or rest,
    with its own name
  - Add exercises to a day with a target set count, a rep range (e.g. "8-12"),
    a rest interval and a note
  - Several routines can exist, exactly one is active, and the active one drives
    today's screen and the calendar

- **Logging a workout**
  - Log each set as weight and reps, marked warm-up, normal or to failure
  - **A rest timer that survives the tab**: it counts to a wall-clock deadline
    rather than ticking a counter down, so backgrounding the app does not stall
    it; +30s extends the deadline, and it vibrates when it reaches zero
  - **Set logging survives a dropped connection**: a set saved while offline
    queues in localStorage and flushes when the connection returns, keyed by
    session, exercise and set number so a re-save replaces rather than
    duplicates

- **Weekly calendar**
  - The current Monday-to-Sunday week, each day dotted by its type, with the
    planned day name and a link to the session logged against it
  - **Day boundaries are Vietnam time**, not the server's: a session logged at
    11pm belongs to that day, not to tomorrow

- **Exercise library**
  - A seeded catalogue with primary and secondary muscles, equipment, level,
    instructions and images
  - Search and browse it, and add your own custom exercises alongside the seeded
    ones

- **Nutrition plans**
  - One meal plan per day type, with a calorie target and protein / carb / fat
    grams
  - Macros are converted to calories at 4/4/9 and shown as percentages, so a
    plan whose macros do not add up to its stated target is visible rather than
    quietly wrong
  - Meals within a plan are ordered, named, described, and optionally carry
    their own calorie figure

- **Installable, and guarded**
  - A web app manifest, so it installs to the home screen and opens without
    browser furniture
  - Every server action calls `requireOwner()` on its first line. A Server
    Action is its own HTTP endpoint, so protecting the layout does not protect
    it

## Tech Stack

- **Framework**: Next.js 16 (App Router, Server Actions), React, TypeScript
- **Database**: PostgreSQL via Prisma 7 — local Docker or Neon
- **Auth**: Auth.js (NextAuth) with a credentials provider, single owner
- **Styling**: Tailwind CSS
- **Testing**: Vitest (23 unit tests), Playwright (smoke spec)

## Running

**Requires**: Node.js 20+, and PostgreSQL — either a local Docker instance or
Neon (serverless Postgres).

Create a `.env` at the project root:

```
DATABASE_URL="postgresql://user:password@host:5432/dbname"
AUTH_SECRET="a long random string, used to encrypt the session"
APP_EMAIL="the one email address that can sign in"
APP_PASSWORD="its password"
```

Then:

```bash
npm i
npx prisma migrate dev
npx prisma db seed
npm run dev
```

Open http://localhost:3000 and sign in with `APP_EMAIL` / `APP_PASSWORD`.

Unit tests:

```bash
npm test
```

End-to-end (Playwright needs the environment loaded, since sign-in reads it):

```bash
bash -c 'set -a; source .env; set +a; npx playwright test'
```

### Deploy (Vercel)

1. Set `DATABASE_URL`, `AUTH_SECRET`, `APP_EMAIL` and `APP_PASSWORD` in the
   Vercel project settings.
2. Run `npx prisma migrate deploy` to apply migrations to the production
   database.
3. Run `npx prisma db seed` to seed the initial exercise catalogue.
4. Deploy as a normal Next.js app — Vercel runs `npm run build` itself.

## Project structure

```
src/
├── app/
│   ├── (app)/              signed-in pages: today, calendar, exercises,
│   │                       nutrition, workouts, more/routines
│   ├── login/              sign-in page
│   ├── api/auth/           Auth.js route handler
│   └── manifest.ts         web app manifest (Next.js metadata route)
├── features/
│   ├── dashboard/queries.ts    today's routine day, meal plan, open session
│   ├── routines/               routine builder, weekday and day-type labels
│   ├── workouts/               set logging, rest timer, offline pending queue
│   ├── exercises/              catalogue queries, parsing, custom exercises
│   └── nutrition/macros.ts     macro-to-calorie conversion and percentages
├── components/            shared UI
├── lib/
│   ├── db.ts              Prisma client
│   ├── date.ts, week.ts   weekday and week boundaries in Vietnam time
│   └── require-owner.ts   the guard every server action calls first
└── auth.ts                Auth.js configuration

prisma/schema.prisma       Exercise · Routine · RoutineDay · RoutineExercise ·
                           WorkoutSession · WorkoutSet · MealPlan · Meal
e2e/smoke.spec.ts          Playwright smoke test
```

---

**The interface is in Vietnamese.**
