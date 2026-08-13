# Gym App MVP — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Web app cá nhân quản lý tập gym: thư viện bài tập, giáo án theo tuần, log set tại phòng gym, kế hoạch ăn tự áp dụng theo loại ngày.

**Architecture:** Next.js App Router full-stack; Prisma + Postgres; mọi mutation là Server Action validate bằng Zod; UI mobile-first theo mockup đã duyệt. Code chia theo feature (`src/features/*`), mỗi feature chứa queries + actions + components riêng. shadcn/ui chưa cần ở MVP — mockup là style tùy biến, dùng Tailwind thuần (YAGNI).

**Tech Stack:** Next.js 15 (App Router, TypeScript strict), Tailwind CSS v4, Prisma, Postgres, Auth.js (next-auth v5 beta), Zod, Vitest, Playwright.

**Spec:** `docs/superpowers/specs/2026-08-13-gym-app-design.md`

## Global Constraints

- Node ≥ 20. UI copy **tiếng Việt**; tên bài tập **tiếng Anh**.
- Theme sáng "Chalk" — token bắt buộc: bg `#EFEDE7`, panel `#FFFFFF`, panel2 `#F4F2EC`, line `#DCD8CF`, ink `#1D2127`, muted `#6E7681`, brand(đỏ/strength) `#CC3A30`, cardio(xanh) `#3A6FC4`, gold(timer/PR) `#C99A22`, ok(xanh lá) `#3E8A5F`.
- Font: Barlow Condensed (600/700, display/số liệu) + Be Vietnam Pro (400–700, body), subsets `["latin","vietnamese"]` qua `next/font/google`.
- Styling chi tiết bám mockup đã duyệt: `.superdesign/design_iterations/` (file 02–05; file 01 là bản tối, KHÔNG dùng).
- Đơn vị tạ: kg, input `step=0.5`. Timezone tính "hôm nay": `Asia/Ho_Chi_Minh`. Quy ước weekday: `0=CN … 6=T7`.
- Mọi server action validate bằng Zod và gọi `revalidatePath` cho route bị ảnh hưởng.
- Env vars: `DATABASE_URL`, `AUTH_SECRET`, `APP_EMAIL`, `APP_PASSWORD` (file `.env`, không commit).
- Mỗi bước "Run" chạy bằng Bash. Commit cuối mỗi task, message tiếng Việt theo conventional commits.

## File Structure (toàn dự án)

```
prisma/schema.prisma, prisma/seed.ts
src/app/layout.tsx, globals.css, manifest.ts, login/page.tsx
src/app/(app)/layout.tsx            # shell có TabBar, yêu cầu đăng nhập
src/app/(app)/page.tsx              # Hôm nay
src/app/(app)/calendar/page.tsx
src/app/(app)/exercises/page.tsx, exercises/[id]/page.tsx, exercises/new/page.tsx
src/app/(app)/nutrition/page.tsx
src/app/(app)/more/page.tsx, more/routines/page.tsx, more/routines/[id]/page.tsx,
src/app/(app)/more/routines/[id]/add/[dayId]/page.tsx
src/app/(app)/workouts/[id]/page.tsx
src/app/api/auth/[...nextauth]/route.ts
src/auth.ts, middleware.ts
src/lib/db.ts                       # Prisma singleton
src/lib/date.ts                     # weekdayInTz, startOfWeekMonday, weekDates
src/components/tab-bar.tsx
src/features/exercises/parse.ts, queries.ts, actions.ts
src/features/routines/actions.ts
src/features/nutrition/actions.ts, macros.ts
src/features/dashboard/queries.ts
src/features/workouts/logic.ts, actions.ts, queries.ts, pending.ts,
src/features/workouts/set-logger.tsx, rest-timer.tsx
e2e/smoke.spec.ts
```

---

### Task 1: Scaffold Next.js + theme Chalk + fonts

**Files:**
- Create: toàn bộ scaffold Next.js; sửa `src/app/globals.css`, `src/app/layout.tsx`, `.gitignore`

**Interfaces:**
- Produces: Tailwind classes `bg-bg bg-panel bg-panel2 border-line text-ink text-muted text-brand text-cardio text-gold text-ok font-display font-sans` dùng ở mọi task UI sau.

- [ ] **Step 1: Scaffold** (thư mục hiện tại không rỗng nên scaffold vào thư mục con rồi copy ra)

```bash
npx create-next-app@latest scaffold --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm --yes
cp -a scaffold/. .
rm -rf scaffold
printf '\n.env\n' >> .gitignore
```

- [ ] **Step 2: Theme tokens** — thay toàn bộ `src/app/globals.css`:

```css
@import "tailwindcss";

@theme {
  --color-bg: #EFEDE7;
  --color-panel: #FFFFFF;
  --color-panel2: #F4F2EC;
  --color-line: #DCD8CF;
  --color-ink: #1D2127;
  --color-muted: #6E7681;
  --color-brand: #CC3A30;
  --color-cardio: #3A6FC4;
  --color-gold: #C99A22;
  --color-ok: #3E8A5F;
  --font-display: var(--font-barlow), sans-serif;
  --font-sans: var(--font-bevietnam), sans-serif;
}

body {
  background: var(--color-bg);
  color: var(--color-ink);
}
```

- [ ] **Step 3: Fonts + layout** — thay toàn bộ `src/app/layout.tsx`:

```tsx
import type { Metadata, Viewport } from "next";
import { Barlow_Condensed, Be_Vietnam_Pro } from "next/font/google";
import "./globals.css";

const barlow = Barlow_Condensed({
  weight: ["600", "700"],
  subsets: ["latin", "vietnamese"],
  variable: "--font-barlow",
});
const beVietnam = Be_Vietnam_Pro({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin", "vietnamese"],
  variable: "--font-bevietnam",
});

export const metadata: Metadata = {
  title: "Gym của tôi",
  description: "Quản lý tập luyện và dinh dưỡng cá nhân",
};
export const viewport: Viewport = { themeColor: "#EFEDE7" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <body className={`${barlow.variable} ${beVietnam.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
```

Xóa nội dung mặc định của `src/app/page.tsx`, thay bằng:

```tsx
export default function Page() {
  return <h1 className="p-6 font-display text-3xl font-bold uppercase">Hôm nay</h1>;
}
```

- [ ] **Step 4: Verify**

Run: `npm run build`
Expected: build thành công, không lỗi TS.

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat: scaffold Next.js + theme Chalk + fonts tiếng Việt"
```

---

### Task 2: Prisma schema + database

**Files:**
- Create: `prisma/schema.prisma`, `src/lib/db.ts`, `.env`

**Interfaces:**
- Produces: Prisma models/enums đúng như dưới; `db` singleton import từ `@/lib/db`. Mọi task sau dùng đúng tên field này (`weightKg`, `targetReps: String`, `dayType`…).

- [ ] **Step 1: Cài Prisma**

```bash
npm i @prisma/client && npm i -D prisma tsx
npx prisma init
```

- [ ] **Step 2: Schema** — thay toàn bộ `prisma/schema.prisma`:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum DayType { STRENGTH CARDIO REST }
enum SetType { WARMUP NORMAL FAILURE }
enum SessionStatus { IN_PROGRESS COMPLETED }

model Exercise {
  id               String            @id @default(cuid())
  name             String
  primaryMuscles   String[]
  secondaryMuscles String[]
  equipment        String?
  level            String?
  instructions     String[]
  images           String[]
  isCustom         Boolean           @default(false)
  routineExercises RoutineExercise[]
  workoutSets      WorkoutSet[]
}

model Routine {
  id       String       @id @default(cuid())
  name     String
  isActive Boolean      @default(false)
  days     RoutineDay[]
}

model RoutineDay {
  id        String            @id @default(cuid())
  routine   Routine           @relation(fields: [routineId], references: [id], onDelete: Cascade)
  routineId String
  weekday   Int               // 0=CN … 6=T7
  name      String
  dayType   DayType
  exercises RoutineExercise[]
  sessions  WorkoutSession[]
  @@unique([routineId, weekday])
}

model RoutineExercise {
  id           String     @id @default(cuid())
  routineDay   RoutineDay @relation(fields: [routineDayId], references: [id], onDelete: Cascade)
  routineDayId String
  exercise     Exercise   @relation(fields: [exerciseId], references: [id])
  exerciseId   String
  order        Int
  targetSets   Int
  targetReps   String     // vd. "8-12"
  restSeconds  Int        @default(90)
  note         String?
}

model WorkoutSession {
  id           String        @id @default(cuid())
  date         DateTime      @default(now())
  routineDay   RoutineDay?   @relation(fields: [routineDayId], references: [id], onDelete: SetNull)
  routineDayId String?
  status       SessionStatus @default(IN_PROGRESS)
  note         String?
  sets         WorkoutSet[]
}

model WorkoutSet {
  id          String         @id @default(cuid())
  session     WorkoutSession @relation(fields: [sessionId], references: [id], onDelete: Cascade)
  sessionId   String
  exercise    Exercise       @relation(fields: [exerciseId], references: [id])
  exerciseId  String
  setNumber   Int
  type        SetType        @default(NORMAL)
  weightKg    Float?
  reps        Int?
  completedAt DateTime?
  @@unique([sessionId, exerciseId, setNumber])
}

model MealPlan {
  id             String  @id @default(cuid())
  dayType        DayType @unique
  targetCalories Int
  proteinG       Int
  carbsG         Int
  fatG           Int
  meals          Meal[]
}

model Meal {
  id          String   @id @default(cuid())
  mealPlan    MealPlan @relation(fields: [mealPlanId], references: [id], onDelete: Cascade)
  mealPlanId  String
  order       Int
  name        String
  description String
  calories    Int?
}
```

- [ ] **Step 3: Database.** Cần `DATABASE_URL` trong `.env`. Hai lựa chọn — hỏi người dùng nếu chưa có URL:
  - Local Docker: `docker run --name gym-pg -e POSTGRES_PASSWORD=postgres -p 5432:5432 -d postgres:16` rồi `DATABASE_URL="postgresql://postgres:postgres@localhost:5432/gym"`
  - Hoặc Neon free tier: người dùng tạo project tại neon.tech và dán connection string.

Run: `npx prisma migrate dev --name init`
Expected: migration tạo thành công, generate client.

- [ ] **Step 4: Prisma singleton** — `src/lib/db.ts`:

```ts
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };
export const db = globalForPrisma.prisma ?? new PrismaClient();
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
```

Run: `npx tsc --noEmit`
Expected: pass.

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat: Prisma schema + kết nối Postgres"
```

---

### Task 3: Vitest + seed dữ liệu (bài tập + meal plan mặc định)

**Files:**
- Create: `vitest.config.ts`, `src/features/exercises/parse.ts`, `src/features/exercises/parse.test.ts`, `prisma/seed.ts`
- Modify: `package.json`

**Interfaces:**
- Produces: `toExerciseData(raw: RawExercise)` trả object khớp model Exercise; DB có ≥800 Exercise và đúng 3 MealPlan (STRENGTH/CARDIO/REST).

- [ ] **Step 1: Cài Vitest** — `npm i -D vitest`; tạo `vitest.config.ts`:

```ts
import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  test: { include: ["src/**/*.test.ts"] },
  resolve: { alias: { "@": path.resolve(__dirname, "src") } },
});
```

Thêm script vào `package.json`: `"test": "vitest run"`.

- [ ] **Step 2: Failing test** — `src/features/exercises/parse.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { toExerciseData, type RawExercise } from "./parse";

const raw: RawExercise = {
  id: "Barbell_Bench_Press",
  name: "Barbell Bench Press",
  primaryMuscles: ["chest"],
  secondaryMuscles: ["triceps", "shoulders"],
  equipment: "barbell",
  level: "intermediate",
  instructions: ["Lie on the bench.", "Press the bar up."],
  images: ["Barbell_Bench_Press/0.jpg", "Barbell_Bench_Press/1.jpg"],
};

describe("toExerciseData", () => {
  it("map đúng field và tạo URL ảnh tuyệt đối", () => {
    const data = toExerciseData(raw);
    expect(data.name).toBe("Barbell Bench Press");
    expect(data.primaryMuscles).toEqual(["chest"]);
    expect(data.images[0]).toBe(
      "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Bench_Press/0.jpg"
    );
    expect(data.isCustom).toBe(false);
  });
  it("chịu được field null/thiếu", () => {
    const data = toExerciseData({ ...raw, equipment: null, images: undefined as unknown as string[] });
    expect(data.equipment).toBeNull();
    expect(data.images).toEqual([]);
  });
});
```

Run: `npm test` — Expected: FAIL (module `./parse` chưa tồn tại).

- [ ] **Step 3: Implement** — `src/features/exercises/parse.ts`:

```ts
export type RawExercise = {
  id: string;
  name: string;
  primaryMuscles: string[];
  secondaryMuscles: string[];
  equipment: string | null;
  level: string | null;
  instructions: string[];
  images: string[];
};

const IMAGE_BASE = "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/";

export function toExerciseData(raw: RawExercise) {
  return {
    name: raw.name,
    primaryMuscles: raw.primaryMuscles ?? [],
    secondaryMuscles: raw.secondaryMuscles ?? [],
    equipment: raw.equipment ?? null,
    level: raw.level ?? null,
    instructions: raw.instructions ?? [],
    images: (raw.images ?? []).map((p) => IMAGE_BASE + p),
    isCustom: false,
  };
}
```

Run: `npm test` — Expected: PASS.

- [ ] **Step 4: Seed script** — `prisma/seed.ts`:

```ts
import { PrismaClient } from "@prisma/client";
import { toExerciseData, type RawExercise } from "../src/features/exercises/parse";

const prisma = new PrismaClient();
const DATA_URL = "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/dist/exercises.json";

async function main() {
  const count = await prisma.exercise.count({ where: { isCustom: false } });
  if (count === 0) {
    const res = await fetch(DATA_URL);
    if (!res.ok) throw new Error(`Tải exercises.json thất bại: HTTP ${res.status}`);
    const raw: RawExercise[] = await res.json();
    await prisma.exercise.createMany({ data: raw.map(toExerciseData) });
    console.log(`Đã seed ${raw.length} bài tập.`);
  } else {
    console.log(`Đã có ${count} bài tập — bỏ qua.`);
  }
  const defaults = [
    { dayType: "STRENGTH", targetCalories: 2800, proteinG: 180, carbsG: 320, fatG: 80 },
    { dayType: "CARDIO", targetCalories: 2300, proteinG: 170, carbsG: 220, fatG: 70 },
    { dayType: "REST", targetCalories: 2100, proteinG: 170, carbsG: 180, fatG: 70 },
  ] as const;
  for (const d of defaults) {
    await prisma.mealPlan.upsert({ where: { dayType: d.dayType }, update: {}, create: d });
  }
  console.log("Meal plan mặc định sẵn sàng.");
}

main().finally(() => prisma.$disconnect());
```

Thêm vào `package.json` (top-level): `"prisma": { "seed": "tsx prisma/seed.ts" }`.

- [ ] **Step 5: Chạy seed + verify + commit**

Run: `npx prisma db seed`
Expected: in "Đã seed 8xx bài tập." và "Meal plan mặc định sẵn sàng."

Run: `npx tsx -e "import {PrismaClient} from '@prisma/client'; const p=new PrismaClient(); p.exercise.count().then(c=>{console.log('exercises:',c); return p.mealPlan.count()}).then(m=>{console.log('mealplans:',m); process.exit(0)})"`
Expected: `exercises: >=800`, `mealplans: 3`.

```bash
git add -A && git commit -m "feat: seed free-exercise-db + meal plan mặc định, cài Vitest"
```

---

### Task 4: Auth.js — một tài khoản, bảo vệ toàn app

**Files:**
- Create: `src/auth.ts`, `src/app/api/auth/[...nextauth]/route.ts`, `src/middleware.ts`, `src/app/login/page.tsx`
- Modify: `.env`

**Interfaces:**
- Produces: `auth`, `signIn`, `signOut` export từ `@/auth`. Mọi route ngoài `/login` yêu cầu đăng nhập.

- [ ] **Step 1: Cài + env**

```bash
npm i next-auth@beta
npx auth secret   # tự thêm AUTH_SECRET vào .env
```

Thêm vào `.env`: `APP_EMAIL="claudeai.fe@citynow.vn"` và `APP_PASSWORD="<người dùng tự đặt>"` (hỏi người dùng giá trị, không bịa).

- [ ] **Step 2: Config** — `src/auth.ts`:

```ts
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      credentials: { email: {}, password: {} },
      authorize: async (creds) => {
        if (
          creds?.email === process.env.APP_EMAIL &&
          creds?.password === process.env.APP_PASSWORD
        ) {
          return { id: "owner", email: String(creds.email) };
        }
        return null;
      },
    }),
  ],
  pages: { signIn: "/login" },
  callbacks: { authorized: ({ auth }) => !!auth?.user },
});
```

`src/app/api/auth/[...nextauth]/route.ts`:

```ts
import { handlers } from "@/auth";
export const { GET, POST } = handlers;
```

`src/middleware.ts`:

```ts
export { auth as middleware } from "@/auth";
export const config = {
  matcher: ["/((?!api/auth|login|_next/static|_next/image|favicon.ico|manifest.webmanifest|icon).*)"],
};
```

- [ ] **Step 3: Login page** — `src/app/login/page.tsx`:

```tsx
import { signIn } from "@/auth";
import { redirect } from "next/navigation";

export default function LoginPage() {
  async function login(formData: FormData) {
    "use server";
    try {
      await signIn("credentials", {
        email: formData.get("email"),
        password: formData.get("password"),
        redirect: false,
      });
    } catch {
      redirect("/login?error=1");
    }
    redirect("/");
  }
  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center gap-4 p-6">
      <h1 className="font-display text-4xl font-bold uppercase">Gym của tôi</h1>
      <form action={login} className="flex flex-col gap-3">
        <input name="email" type="email" required placeholder="Email"
          className="rounded-xl border border-line bg-panel px-4 py-3" />
        <input name="password" type="password" required placeholder="Mật khẩu"
          className="rounded-xl border border-line bg-panel px-4 py-3" />
        <button className="rounded-xl bg-brand py-3 font-display text-lg font-bold uppercase tracking-widest text-white">
          Đăng nhập
        </button>
      </form>
    </main>
  );
}
```

- [ ] **Step 4: Verify**

Run: `npm run build`
Expected: pass. Chạy `npm run dev` nền, `curl -s -o /dev/null -w "%{http_code} %{redirect_url}" http://localhost:3000/` — Expected: 307 redirect về `/login`.

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat: đăng nhập một tài khoản với Auth.js, bảo vệ toàn app"
```

---

### Task 5: App shell — bottom tab bar + 5 route

**Files:**
- Create: `src/components/tab-bar.tsx`, `src/app/(app)/layout.tsx`, `src/app/(app)/calendar/page.tsx`, `src/app/(app)/exercises/page.tsx`, `src/app/(app)/nutrition/page.tsx`, `src/app/(app)/more/page.tsx`
- Move: `src/app/page.tsx` → `src/app/(app)/page.tsx`

**Interfaces:**
- Produces: layout `(app)` bọc mọi trang chính; các page con chỉ cần render nội dung, đã có padding-bottom tránh tab bar.

- [ ] **Step 1: Icons + TabBar**

```bash
npm i lucide-react
```

`src/components/tab-bar.tsx`:

```tsx
"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, CalendarDays, Dumbbell, UtensilsCrossed, MoreHorizontal } from "lucide-react";

const tabs = [
  { href: "/", label: "Hôm nay", Icon: Home },
  { href: "/calendar", label: "Lịch", Icon: CalendarDays },
  { href: "/exercises", label: "Bài tập", Icon: Dumbbell },
  { href: "/nutrition", label: "Dinh dưỡng", Icon: UtensilsCrossed },
  { href: "/more", label: "Thêm", Icon: MoreHorizontal },
];

export function TabBar() {
  const path = usePathname();
  return (
    <nav className="fixed inset-x-0 bottom-0 z-10 flex border-t border-line bg-panel pb-[env(safe-area-inset-bottom)]">
      {tabs.map(({ href, label, Icon }) => {
        const active = href === "/" ? path === "/" : path.startsWith(href);
        return (
          <Link key={href} href={href}
            className={`flex flex-1 flex-col items-center gap-1 py-2.5 text-[10px] font-semibold ${active ? "text-brand" : "text-muted"}`}>
            <Icon size={22} strokeWidth={1.8} />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
```

- [ ] **Step 2: Layout nhóm (app)** — `src/app/(app)/layout.tsx`:

```tsx
import { TabBar } from "@/components/tab-bar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto min-h-screen max-w-lg pb-24">
      {children}
      <TabBar />
    </div>
  );
}
```

Di chuyển `src/app/page.tsx` vào `src/app/(app)/page.tsx`. Tạo 4 page còn lại, mỗi cái tạm thời:

```tsx
export default function Page() {
  return <h1 className="p-5 font-display text-3xl font-bold uppercase">Lịch</h1>;
}
```

(đổi tiêu đề tương ứng: "Lịch", "Bài tập", "Dinh dưỡng", "Thêm").

- [ ] **Step 3: Verify + commit**

Run: `npm run build` — Expected: pass, 5 route xuất hiện.

```bash
git add -A && git commit -m "feat: app shell với bottom tab bar 5 mục"
```

---

### Task 6: Thư viện bài tập — search, filter, chi tiết

**Files:**
- Create: `src/features/exercises/queries.ts`, `src/features/exercises/queries.test.ts`, `src/app/(app)/exercises/[id]/page.tsx`
- Modify: `src/app/(app)/exercises/page.tsx`, `next.config.ts`

**Interfaces:**
- Consumes: `db` (@/lib/db), model Exercise.
- Produces: `buildExerciseWhere(q, muscle, equipment)`, `MUSCLE_LABELS: Record<string,string>` (map tên cơ tiếng Anh → tiếng Việt) — Task 9 dùng lại trang search này.

- [ ] **Step 1: Failing test** — `src/features/exercises/queries.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { buildExerciseWhere } from "./queries";

describe("buildExerciseWhere", () => {
  it("rỗng khi không có filter", () => {
    expect(buildExerciseWhere(undefined, undefined, undefined)).toEqual({});
  });
  it("gộp đủ 3 điều kiện", () => {
    expect(buildExerciseWhere("bench", "chest", "barbell")).toEqual({
      name: { contains: "bench", mode: "insensitive" },
      primaryMuscles: { has: "chest" },
      equipment: "barbell",
    });
  });
});
```

Run: `npm test` — Expected: FAIL.

- [ ] **Step 2: Implement queries** — `src/features/exercises/queries.ts`:

```ts
import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";

export function buildExerciseWhere(q?: string, muscle?: string, equipment?: string) {
  const where: Prisma.ExerciseWhereInput = {};
  if (q) where.name = { contains: q, mode: "insensitive" };
  if (muscle) where.primaryMuscles = { has: muscle };
  if (equipment) where.equipment = equipment;
  return where;
}

export async function searchExercises(q?: string, muscle?: string, equipment?: string) {
  return db.exercise.findMany({
    where: buildExerciseWhere(q, muscle, equipment),
    orderBy: { name: "asc" },
    take: 50,
  });
}

export const MUSCLE_LABELS: Record<string, string> = {
  chest: "Ngực", lats: "Xô", "middle back": "Lưng giữa", "lower back": "Lưng dưới",
  traps: "Cầu vai", shoulders: "Vai", biceps: "Tay trước", triceps: "Tay sau",
  forearms: "Cẳng tay", abdominals: "Bụng", quadriceps: "Đùi trước",
  hamstrings: "Đùi sau", glutes: "Mông", calves: "Bắp chân", adductors: "Khép háng",
  abductors: "Dạng háng", neck: "Cổ",
};
export const EQUIPMENT_OPTIONS = ["barbell", "dumbbell", "cable", "machine", "body only", "kettlebells", "bands"];
export function muscleLabel(m: string) { return MUSCLE_LABELS[m] ?? m; }
```

Run: `npm test` — Expected: PASS.

- [ ] **Step 3: Trang danh sách** — thay `src/app/(app)/exercises/page.tsx`:

```tsx
import Link from "next/link";
import { searchExercises, MUSCLE_LABELS, EQUIPMENT_OPTIONS, muscleLabel } from "@/features/exercises/queries";

export default async function ExercisesPage({ searchParams }: { searchParams: Promise<{ q?: string; muscle?: string; equipment?: string }> }) {
  const { q, muscle, equipment } = await searchParams;
  const exercises = await searchExercises(q, muscle, equipment);
  const chip = (active: boolean) =>
    `shrink-0 rounded-full border px-3.5 py-2 text-xs font-semibold ${active ? "border-brand bg-brand text-white" : "border-line bg-panel text-muted"}`;
  const link = (p: Record<string, string | undefined>) => {
    const sp = new URLSearchParams();
    for (const [k, v] of Object.entries({ q, muscle, equipment, ...p })) if (v) sp.set(k, v);
    return `/exercises?${sp}`;
  };
  return (
    <main className="p-5">
      <h1 className="font-display text-3xl font-bold uppercase">Bài tập</h1>
      <form className="mt-3">
        {muscle && <input type="hidden" name="muscle" value={muscle} />}
        {equipment && <input type="hidden" name="equipment" value={equipment} />}
        <input name="q" defaultValue={q} placeholder="Tìm theo tên… (vd. bench press)"
          className="w-full rounded-xl border border-line bg-panel px-4 py-3 text-sm" />
      </form>
      <p className="mt-4 mb-2 font-display text-xs font-semibold uppercase tracking-widest text-muted">Nhóm cơ</p>
      <div className="flex gap-2 overflow-x-auto">
        <Link className={chip(!muscle)} href={link({ muscle: undefined })}>Tất cả</Link>
        {Object.keys(MUSCLE_LABELS).map((m) => (
          <Link key={m} className={chip(muscle === m)} href={link({ muscle: m })}>{muscleLabel(m)}</Link>
        ))}
      </div>
      <p className="mt-3 mb-2 font-display text-xs font-semibold uppercase tracking-widest text-muted">Dụng cụ</p>
      <div className="flex gap-2 overflow-x-auto">
        <Link className={chip(!equipment)} href={link({ equipment: undefined })}>Tất cả</Link>
        {EQUIPMENT_OPTIONS.map((e) => (
          <Link key={e} className={chip(equipment === e)} href={link({ equipment: e })}>{e}</Link>
        ))}
      </div>
      <ul className="mt-4 divide-y divide-line">
        {exercises.map((ex) => (
          <li key={ex.id}>
            <Link href={`/exercises/${ex.id}`} className="flex items-center gap-3 py-3">
              <div className="grid size-13 shrink-0 place-items-center rounded-xl border border-line bg-panel2 font-display font-bold text-muted">
                {ex.name.slice(0, 2).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{ex.name}</p>
                <p className="text-[11px] text-muted">
                  {ex.primaryMuscles.map(muscleLabel).join(", ")}{ex.equipment ? ` · ${ex.equipment}` : ""}
                </p>
              </div>
              <span className="text-muted">›</span>
            </Link>
          </li>
        ))}
        {exercises.length === 0 && <li className="py-8 text-center text-sm text-muted">Không tìm thấy bài tập nào — thử từ khóa khác.</li>}
      </ul>
      <Link href="/exercises/new" className="mt-3 block rounded-xl border border-dashed border-line py-3 text-center text-sm font-semibold text-muted">
        + Tạo bài tập tùy chỉnh
      </Link>
    </main>
  );
}
```

- [ ] **Step 4: Trang chi tiết** — `src/app/(app)/exercises/[id]/page.tsx` (cho phép ảnh GitHub trong `next.config.ts`: `images: { remotePatterns: [{ hostname: "raw.githubusercontent.com" }] }`):

```tsx
import Image from "next/image";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { muscleLabel } from "@/features/exercises/queries";

export default async function ExerciseDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const ex = await db.exercise.findUnique({ where: { id } });
  if (!ex) notFound();
  return (
    <main className="p-5">
      <h1 className="font-display text-2xl font-bold uppercase">{ex.name}</h1>
      <p className="mt-1 text-xs text-muted">
        {ex.primaryMuscles.map(muscleLabel).join(", ")}
        {ex.equipment ? ` · ${ex.equipment}` : ""}{ex.level ? ` · ${ex.level}` : ""}
      </p>
      <div className="mt-4 flex gap-3 overflow-x-auto">
        {ex.images.map((src) => (
          <Image key={src} src={src} alt={ex.name} width={280} height={190}
            className="rounded-xl border border-line bg-panel object-cover" />
        ))}
      </div>
      <h2 className="mt-5 font-display text-sm font-semibold uppercase tracking-widest text-muted">Hướng dẫn</h2>
      <ol className="mt-2 list-decimal space-y-2 pl-5 text-sm leading-relaxed">
        {ex.instructions.map((step, i) => <li key={i}>{step}</li>)}
      </ol>
    </main>
  );
}
```

- [ ] **Step 5: Verify + commit**

Run: `npm test && npm run build` — Expected: PASS cả hai.

```bash
git add -A && git commit -m "feat: thư viện bài tập với search, filter nhóm cơ/dụng cụ, trang chi tiết"
```

---

### Task 7: Tạo bài tập tùy chỉnh

**Files:**
- Create: `src/features/exercises/actions.ts`, `src/features/exercises/actions.test.ts`, `src/app/(app)/exercises/new/page.tsx`

**Interfaces:**
- Produces: `createExercise(formData)` server action; `createExerciseSchema` (Zod).

- [ ] **Step 1: Cài Zod + failing test**

```bash
npm i zod
```

`src/features/exercises/actions.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { createExerciseSchema } from "./actions";

describe("createExerciseSchema", () => {
  it("chấp nhận input hợp lệ", () => {
    const r = createExerciseSchema.safeParse({ name: "My Cable Fly", primaryMuscle: "chest", equipment: "cable", instructions: "Kéo cáp từ ngoài vào giữa." });
    expect(r.success).toBe(true);
  });
  it("từ chối tên rỗng", () => {
    expect(createExerciseSchema.safeParse({ name: "", primaryMuscle: "chest", equipment: "", instructions: "" }).success).toBe(false);
  });
});
```

Run: `npm test` — Expected: FAIL.

- [ ] **Step 2: Implement action** — `src/features/exercises/actions.ts`:

```ts
"use server";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";

export const createExerciseSchema = z.object({
  name: z.string().trim().min(1, "Tên bài tập không được để trống"),
  primaryMuscle: z.string().trim().min(1, "Chọn nhóm cơ chính"),
  equipment: z.string().trim(),
  instructions: z.string().trim(),
});

export async function createExercise(formData: FormData) {
  const parsed = createExerciseSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) redirect(`/exercises/new?error=${encodeURIComponent(parsed.error.issues[0].message)}`);
  const { name, primaryMuscle, equipment, instructions } = parsed.data;
  const ex = await db.exercise.create({
    data: {
      name,
      primaryMuscles: [primaryMuscle],
      equipment: equipment || null,
      instructions: instructions ? instructions.split("\n").filter(Boolean) : [],
      isCustom: true,
    },
  });
  revalidatePath("/exercises");
  redirect(`/exercises/${ex.id}`);
}
```

(Lưu ý: file có `"use server"` chỉ được export async function — tách schema sang cuối file không được; giải pháp: bỏ `"use server"` đầu file, thêm `"use server"` inline trong thân `createExercise`. Executor làm theo cách inline này.)

Run: `npm test` — Expected: PASS.

- [ ] **Step 3: Form page** — `src/app/(app)/exercises/new/page.tsx`:

```tsx
import { createExercise } from "@/features/exercises/actions";
import { MUSCLE_LABELS, EQUIPMENT_OPTIONS, muscleLabel } from "@/features/exercises/queries";

export default async function NewExercisePage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  const input = "w-full rounded-xl border border-line bg-panel px-4 py-3 text-sm";
  return (
    <main className="p-5">
      <h1 className="font-display text-3xl font-bold uppercase">Bài tập tùy chỉnh</h1>
      {error && <p className="mt-2 rounded-lg bg-brand/10 px-3 py-2 text-sm text-brand">{error}</p>}
      <form action={createExercise} className="mt-4 flex flex-col gap-3">
        <input name="name" placeholder="Tên bài (tiếng Anh, vd. Cable Fly)" className={input} />
        <select name="primaryMuscle" className={input} defaultValue="">
          <option value="" disabled>Nhóm cơ chính</option>
          {Object.keys(MUSCLE_LABELS).map((m) => <option key={m} value={m}>{muscleLabel(m)}</option>)}
        </select>
        <select name="equipment" className={input} defaultValue="">
          <option value="">Dụng cụ (tùy chọn)</option>
          {EQUIPMENT_OPTIONS.map((e) => <option key={e} value={e}>{e}</option>)}
        </select>
        <textarea name="instructions" rows={4} placeholder="Hướng dẫn — mỗi bước một dòng" className={input} />
        <button className="rounded-xl bg-brand py-3 font-display text-lg font-bold uppercase tracking-widest text-white">Lưu bài tập</button>
      </form>
    </main>
  );
}
```

- [ ] **Step 4: Verify + commit**

Run: `npm test && npm run build` — Expected: PASS.

```bash
git add -A && git commit -m "feat: tạo bài tập tùy chỉnh"
```

---

### Task 8: Giáo án — danh sách, tạo, kích hoạt

**Files:**
- Create: `src/features/routines/actions.ts`, `src/app/(app)/more/routines/page.tsx`
- Modify: `src/app/(app)/more/page.tsx`

**Interfaces:**
- Produces: actions `createRoutine`, `setActiveRoutine`, `deleteRoutine`; route `/more/routines`.

- [ ] **Step 1: Actions** — `src/features/routines/actions.ts`:

```ts
"use server";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";

const nameSchema = z.string().trim().min(1).max(80);

export async function createRoutine(formData: FormData) {
  const name = nameSchema.parse(formData.get("name"));
  const routine = await db.routine.create({ data: { name } });
  revalidatePath("/more/routines");
  redirect(`/more/routines/${routine.id}`);
}

export async function setActiveRoutine(formData: FormData) {
  const id = z.string().min(1).parse(formData.get("id"));
  await db.$transaction([
    db.routine.updateMany({ data: { isActive: false } }),
    db.routine.update({ where: { id }, data: { isActive: true } }),
  ]);
  revalidatePath("/more/routines");
  revalidatePath("/");
}

export async function deleteRoutine(formData: FormData) {
  const id = z.string().min(1).parse(formData.get("id"));
  await db.routine.delete({ where: { id } });
  revalidatePath("/more/routines");
  revalidatePath("/");
}
```

- [ ] **Step 2: Trang danh sách** — `src/app/(app)/more/routines/page.tsx`:

```tsx
import Link from "next/link";
import { db } from "@/lib/db";
import { createRoutine, setActiveRoutine, deleteRoutine } from "@/features/routines/actions";

export default async function RoutinesPage() {
  const routines = await db.routine.findMany({ include: { days: true }, orderBy: { name: "asc" } });
  return (
    <main className="p-5">
      <h1 className="font-display text-3xl font-bold uppercase">Giáo án</h1>
      <ul className="mt-4 space-y-3">
        {routines.map((r) => (
          <li key={r.id} className={`rounded-xl border bg-panel p-4 ${r.isActive ? "border-brand" : "border-line"}`}>
            <div className="flex items-center justify-between gap-2">
              <Link href={`/more/routines/${r.id}`} className="min-w-0">
                <p className="truncate font-semibold">{r.name}</p>
                <p className="text-xs text-muted">{r.days.length} ngày/tuần{r.isActive ? " · Đang dùng" : ""}</p>
              </Link>
              <div className="flex shrink-0 gap-2">
                {!r.isActive && (
                  <form action={setActiveRoutine}>
                    <input type="hidden" name="id" value={r.id} />
                    <button className="rounded-lg border border-line px-3 py-1.5 text-xs font-semibold">Kích hoạt</button>
                  </form>
                )}
                <form action={deleteRoutine}>
                  <input type="hidden" name="id" value={r.id} />
                  <button className="rounded-lg border border-line px-3 py-1.5 text-xs font-semibold text-brand">Xóa</button>
                </form>
              </div>
            </div>
          </li>
        ))}
      </ul>
      <form action={createRoutine} className="mt-4 flex gap-2">
        <input name="name" required placeholder="Tên giáo án mới (vd. PPL 6 ngày)"
          className="flex-1 rounded-xl border border-line bg-panel px-4 py-3 text-sm" />
        <button className="rounded-xl bg-brand px-4 font-display font-bold uppercase text-white">Tạo</button>
      </form>
    </main>
  );
}
```

- [ ] **Step 3: Trang Thêm** — thay `src/app/(app)/more/page.tsx`:

```tsx
import Link from "next/link";
import { signOut } from "@/auth";

export default function MorePage() {
  return (
    <main className="p-5">
      <h1 className="font-display text-3xl font-bold uppercase">Thêm</h1>
      <ul className="mt-4 divide-y divide-line rounded-xl border border-line bg-panel px-4">
        <li><Link href="/more/routines" className="block py-3.5 text-sm font-semibold">Quản lý giáo án ›</Link></li>
        <li>
          <form action={async () => { "use server"; await signOut({ redirectTo: "/login" }); }}>
            <button className="w-full py-3.5 text-left text-sm font-semibold text-brand">Đăng xuất</button>
          </form>
        </li>
      </ul>
    </main>
  );
}
```

- [ ] **Step 4: Verify + commit**

Run: `npm run build` — Expected: pass.

```bash
git add -A && git commit -m "feat: quản lý giáo án — tạo, kích hoạt, xóa"
```

---

### Task 9: Builder giáo án — ngày + bài tập

**Files:**
- Create: `src/features/routines/builder.ts`, `src/features/routines/builder.test.ts`, `src/app/(app)/more/routines/[id]/page.tsx`, `src/app/(app)/more/routines/[id]/add/[dayId]/page.tsx`
- Modify: `src/features/routines/actions.ts`

**Interfaces:**
- Consumes: `searchExercises`, `muscleLabel` (Task 6).
- Produces: actions `addRoutineDay`, `deleteRoutineDay`, `addExerciseToDay`, `removeRoutineExercise`, `moveRoutineExercise`; helper `nextOrder(orders: number[]): number`; `WEEKDAY_LABELS` (index 0=CN): `["Chủ nhật","Thứ 2","Thứ 3","Thứ 4","Thứ 5","Thứ 6","Thứ 7"]`; `DAY_TYPE_LABELS = { STRENGTH: "Tập tạ", CARDIO: "Cardio", REST: "Nghỉ" }`.

- [ ] **Step 1: Failing test** — `src/features/routines/builder.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { nextOrder } from "./builder";

describe("nextOrder", () => {
  it("trả 1 khi chưa có bài nào", () => expect(nextOrder([])).toBe(1));
  it("trả max+1", () => expect(nextOrder([1, 2, 5])).toBe(6));
});
```

Run: `npm test` — Expected: FAIL.

- [ ] **Step 2: Implement helper** — `src/features/routines/builder.ts`:

```ts
export function nextOrder(orders: number[]): number {
  return orders.length === 0 ? 1 : Math.max(...orders) + 1;
}
export const WEEKDAY_LABELS = ["Chủ nhật", "Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7"];
export const DAY_TYPE_LABELS = { STRENGTH: "Tập tạ", CARDIO: "Cardio", REST: "Nghỉ" } as const;
```

Run: `npm test` — Expected: PASS.

- [ ] **Step 3: Actions mới** — thêm vào `src/features/routines/actions.ts` (kèm import mới ở đầu file: `import { nextOrder } from "./builder";`):

```ts
const daySchema = z.object({
  routineId: z.string().min(1),
  weekday: z.coerce.number().int().min(0).max(6),
  name: z.string().trim().min(1).max(60),
  dayType: z.enum(["STRENGTH", "CARDIO", "REST"]),
});

export async function addRoutineDay(formData: FormData) {
  const d = daySchema.parse(Object.fromEntries(formData));
  await db.routineDay.create({ data: d });
  revalidatePath(`/more/routines/${d.routineId}`);
}

export async function deleteRoutineDay(formData: FormData) {
  const id = z.string().min(1).parse(formData.get("id"));
  const day = await db.routineDay.delete({ where: { id } });
  revalidatePath(`/more/routines/${day.routineId}`);
}

const addExSchema = z.object({
  routineId: z.string().min(1),
  routineDayId: z.string().min(1),
  exerciseId: z.string().min(1),
  targetSets: z.coerce.number().int().min(1).max(20),
  targetReps: z.string().trim().min(1).max(20),
  restSeconds: z.coerce.number().int().min(0).max(600),
});

export async function addExerciseToDay(formData: FormData) {
  const d = addExSchema.parse(Object.fromEntries(formData));
  const existing = await db.routineExercise.findMany({ where: { routineDayId: d.routineDayId }, select: { order: true } });
  await db.routineExercise.create({
    data: {
      routineDayId: d.routineDayId, exerciseId: d.exerciseId, targetSets: d.targetSets,
      targetReps: d.targetReps, restSeconds: d.restSeconds,
      order: nextOrder(existing.map((e) => e.order)),
    },
  });
  revalidatePath(`/more/routines/${d.routineId}`);
  redirect(`/more/routines/${d.routineId}`);
}

export async function removeRoutineExercise(formData: FormData) {
  const id = z.string().min(1).parse(formData.get("id"));
  const re = await db.routineExercise.delete({ where: { id }, include: { routineDay: true } });
  revalidatePath(`/more/routines/${re.routineDay.routineId}`);
}

export async function moveRoutineExercise(formData: FormData) {
  const id = z.string().min(1).parse(formData.get("id"));
  const dir = z.enum(["up", "down"]).parse(formData.get("dir"));
  const re = await db.routineExercise.findUniqueOrThrow({ where: { id }, include: { routineDay: true } });
  const neighbor = await db.routineExercise.findFirst({
    where: { routineDayId: re.routineDayId, order: dir === "up" ? { lt: re.order } : { gt: re.order } },
    orderBy: { order: dir === "up" ? "desc" : "asc" },
  });
  if (neighbor) {
    await db.$transaction([
      db.routineExercise.update({ where: { id: re.id }, data: { order: neighbor.order } }),
      db.routineExercise.update({ where: { id: neighbor.id }, data: { order: re.order } }),
    ]);
  }
  revalidatePath(`/more/routines/${re.routineDay.routineId}`);
}
```

- [ ] **Step 4: Trang builder** — `src/app/(app)/more/routines/[id]/page.tsx`:

```tsx
import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { addRoutineDay, deleteRoutineDay, removeRoutineExercise, moveRoutineExercise } from "@/features/routines/actions";
import { WEEKDAY_LABELS, DAY_TYPE_LABELS } from "@/features/routines/builder";

const DAY_COLOR = { STRENGTH: "bg-brand", CARDIO: "bg-cardio", REST: "bg-line" } as const;

export default async function RoutineBuilder({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const routine = await db.routine.findUnique({
    where: { id },
    include: { days: { orderBy: { weekday: "asc" }, include: { exercises: { orderBy: { order: "asc" }, include: { exercise: true } } } } },
  });
  if (!routine) notFound();
  const input = "rounded-xl border border-line bg-panel px-3 py-2.5 text-sm";
  return (
    <main className="p-5">
      <h1 className="font-display text-3xl font-bold uppercase">{routine.name}</h1>
      <div className="mt-4 space-y-4">
        {routine.days.map((day) => (
          <section key={day.id} className="overflow-hidden rounded-xl border border-line bg-panel">
            <header className="flex items-center gap-2 border-b border-line p-3">
              <span className={`size-3 rounded-full ${DAY_COLOR[day.dayType]}`} />
              <p className="flex-1 text-sm font-semibold">
                {WEEKDAY_LABELS[day.weekday]} — {day.name}
                <span className="ml-1 text-xs font-normal text-muted">({DAY_TYPE_LABELS[day.dayType]})</span>
              </p>
              <form action={deleteRoutineDay}>
                <input type="hidden" name="id" value={day.id} />
                <button className="text-xs font-semibold text-brand">Xóa ngày</button>
              </form>
            </header>
            <ul className="divide-y divide-line px-3">
              {day.exercises.map((re) => (
                <li key={re.id} className="flex items-center gap-2 py-2.5">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{re.exercise.name}</p>
                    <p className="text-xs text-muted">{re.targetSets}×{re.targetReps} · nghỉ {re.restSeconds}s</p>
                  </div>
                  <form action={moveRoutineExercise}><input type="hidden" name="id" value={re.id} /><input type="hidden" name="dir" value="up" /><button className="px-1.5 text-muted">↑</button></form>
                  <form action={moveRoutineExercise}><input type="hidden" name="id" value={re.id} /><input type="hidden" name="dir" value="down" /><button className="px-1.5 text-muted">↓</button></form>
                  <form action={removeRoutineExercise}><input type="hidden" name="id" value={re.id} /><button className="px-1.5 text-brand">✕</button></form>
                </li>
              ))}
            </ul>
            <Link href={`/more/routines/${routine.id}/add/${day.id}`}
              className="block border-t border-line p-3 text-center text-xs font-semibold text-muted">+ Thêm bài tập</Link>
          </section>
        ))}
      </div>
      <form action={addRoutineDay} className="mt-4 grid grid-cols-2 gap-2 rounded-xl border border-dashed border-line p-3">
        <input type="hidden" name="routineId" value={routine.id} />
        <select name="weekday" className={input} defaultValue="1">
          {WEEKDAY_LABELS.map((l, i) => <option key={i} value={i}>{l}</option>)}
        </select>
        <select name="dayType" className={input} defaultValue="STRENGTH">
          {Object.entries(DAY_TYPE_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
        <input name="name" required placeholder="Tên ngày (vd. Push A)" className={`${input} col-span-2`} />
        <button className="col-span-2 rounded-xl bg-brand py-2.5 font-display font-bold uppercase text-white">Thêm ngày</button>
      </form>
    </main>
  );
}
```

- [ ] **Step 5: Trang thêm bài vào ngày** — `src/app/(app)/more/routines/[id]/add/[dayId]/page.tsx`:

```tsx
import { searchExercises, muscleLabel } from "@/features/exercises/queries";
import { addExerciseToDay } from "@/features/routines/actions";

export default async function AddExercisePage({ params, searchParams }: {
  params: Promise<{ id: string; dayId: string }>;
  searchParams: Promise<{ q?: string }>;
}) {
  const { id, dayId } = await params;
  const { q } = await searchParams;
  const exercises = q ? await searchExercises(q) : [];
  const input = "rounded-lg border border-line bg-panel2 px-2 py-1.5 text-sm";
  return (
    <main className="p-5">
      <h1 className="font-display text-2xl font-bold uppercase">Thêm bài tập</h1>
      <form className="mt-3">
        <input name="q" defaultValue={q} autoFocus placeholder="Tìm theo tên…"
          className="w-full rounded-xl border border-line bg-panel px-4 py-3 text-sm" />
      </form>
      <ul className="mt-4 space-y-3">
        {exercises.map((ex) => (
          <li key={ex.id} className="rounded-xl border border-line bg-panel p-3">
            <p className="text-sm font-semibold">{ex.name}</p>
            <p className="text-xs text-muted">{ex.primaryMuscles.map(muscleLabel).join(", ")}</p>
            <form action={addExerciseToDay} className="mt-2 flex items-center gap-2">
              <input type="hidden" name="routineId" value={id} />
              <input type="hidden" name="routineDayId" value={dayId} />
              <input type="hidden" name="exerciseId" value={ex.id} />
              <input name="targetSets" type="number" defaultValue={3} min={1} className={`${input} w-16`} aria-label="Số set" />
              <span className="text-xs text-muted">set ×</span>
              <input name="targetReps" defaultValue="8-12" className={`${input} w-20`} aria-label="Rep mục tiêu" />
              <input name="restSeconds" type="number" defaultValue={90} step={15} className={`${input} w-20`} aria-label="Nghỉ (giây)" />
              <button className="ml-auto rounded-lg bg-brand px-3 py-1.5 text-xs font-bold text-white">Thêm</button>
            </form>
          </li>
        ))}
        {q && exercises.length === 0 && <li className="py-6 text-center text-sm text-muted">Không có kết quả cho "{q}".</li>}
      </ul>
    </main>
  );
}
```

- [ ] **Step 6: Verify + commit**

Run: `npm test && npm run build` — Expected: PASS.

```bash
git add -A && git commit -m "feat: builder giáo án — thêm ngày, thêm bài, sắp thứ tự"
```

---

### Task 10: Dinh dưỡng — mục tiêu macro + thực đơn theo loại ngày

**Files:**
- Create: `src/features/nutrition/macros.ts`, `src/features/nutrition/macros.test.ts`, `src/features/nutrition/actions.ts`
- Modify: `src/app/(app)/nutrition/page.tsx`

**Interfaces:**
- Consumes: `DAY_TYPE_LABELS` (Task 9), MealPlan/Meal đã seed (Task 3).
- Produces: `kcalFromMacros(p,c,f)`, `macroPercents(p,c,f)`; actions `updateMealPlan`, `addMeal`, `deleteMeal`.

- [ ] **Step 1: Failing test** — `src/features/nutrition/macros.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { kcalFromMacros, macroPercents } from "./macros";

describe("macros", () => {
  it("kcal = 4p + 4c + 9f", () => expect(kcalFromMacros(180, 320, 80)).toBe(2720));
  it("phần trăm cộng lại 100", () => {
    const { p, c, f } = macroPercents(180, 320, 80);
    expect(Math.round(p + c + f)).toBe(100);
  });
  it("về 0 khi toàn 0", () => expect(macroPercents(0, 0, 0)).toEqual({ p: 0, c: 0, f: 0 }));
});
```

Run: `npm test` — Expected: FAIL.

- [ ] **Step 2: Implement** — `src/features/nutrition/macros.ts`:

```ts
export function kcalFromMacros(proteinG: number, carbsG: number, fatG: number): number {
  return proteinG * 4 + carbsG * 4 + fatG * 9;
}
export function macroPercents(proteinG: number, carbsG: number, fatG: number) {
  const total = kcalFromMacros(proteinG, carbsG, fatG);
  if (total === 0) return { p: 0, c: 0, f: 0 };
  return { p: (proteinG * 4 / total) * 100, c: (carbsG * 4 / total) * 100, f: (fatG * 9 / total) * 100 };
}
```

Run: `npm test` — Expected: PASS.

- [ ] **Step 3: Actions** — `src/features/nutrition/actions.ts`:

```ts
"use server";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";

const planSchema = z.object({
  id: z.string().min(1),
  targetCalories: z.coerce.number().int().min(0).max(10000),
  proteinG: z.coerce.number().int().min(0).max(1000),
  carbsG: z.coerce.number().int().min(0).max(2000),
  fatG: z.coerce.number().int().min(0).max(500),
});

export async function updateMealPlan(formData: FormData) {
  const { id, ...data } = planSchema.parse(Object.fromEntries(formData));
  await db.mealPlan.update({ where: { id }, data });
  revalidatePath("/nutrition");
  revalidatePath("/");
}

const mealSchema = z.object({
  mealPlanId: z.string().min(1),
  name: z.string().trim().min(1).max(60),
  description: z.string().trim().min(1).max(300),
  calories: z.coerce.number().int().min(0).max(5000).optional(),
});

export async function addMeal(formData: FormData) {
  const d = mealSchema.parse(Object.fromEntries(formData));
  const count = await db.meal.count({ where: { mealPlanId: d.mealPlanId } });
  await db.meal.create({ data: { ...d, calories: d.calories ?? null, order: count + 1 } });
  revalidatePath("/nutrition");
  revalidatePath("/");
}

export async function deleteMeal(formData: FormData) {
  const id = z.string().min(1).parse(formData.get("id"));
  await db.meal.delete({ where: { id } });
  revalidatePath("/nutrition");
  revalidatePath("/");
}
```

- [ ] **Step 4: Trang Dinh dưỡng** — thay `src/app/(app)/nutrition/page.tsx`:

```tsx
import Link from "next/link";
import { db } from "@/lib/db";
import { kcalFromMacros, macroPercents } from "@/features/nutrition/macros";
import { updateMealPlan, addMeal, deleteMeal } from "@/features/nutrition/actions";
import { DAY_TYPE_LABELS } from "@/features/routines/builder";
import type { DayType } from "@prisma/client";

export default async function NutritionPage({ searchParams }: { searchParams: Promise<{ type?: string }> }) {
  const { type } = await searchParams;
  const dayType: DayType = type === "CARDIO" || type === "REST" ? type : "STRENGTH";
  const plan = await db.mealPlan.findUniqueOrThrow({
    where: { dayType },
    include: { meals: { orderBy: { order: "asc" } } },
  });
  const pct = macroPercents(plan.proteinG, plan.carbsG, plan.fatG);
  const input = "w-full rounded-lg border border-line bg-panel2 px-2 py-2 text-center font-display text-lg font-bold";
  const segColors: Record<DayType, string> = { STRENGTH: "border-brand", CARDIO: "border-cardio", REST: "border-line" };
  return (
    <main className="p-5">
      <h1 className="font-display text-3xl font-bold uppercase">Dinh dưỡng</h1>
      <p className="mt-1 text-xs text-muted">Kế hoạch ăn tự áp dụng theo loại ngày trong lịch tập</p>
      <div className="mt-4 flex gap-2">
        {(Object.keys(DAY_TYPE_LABELS) as DayType[]).map((t) => (
          <Link key={t} href={`/nutrition?type=${t}`}
            className={`flex-1 rounded-xl border-2 bg-panel py-2.5 text-center font-display text-sm font-bold uppercase tracking-wider ${dayType === t ? segColors[t] : "border-transparent text-muted"}`}>
            {DAY_TYPE_LABELS[t]}
          </Link>
        ))}
      </div>
      <section className="mt-4 rounded-xl border border-line bg-panel p-4">
        <h2 className="font-display text-sm font-semibold uppercase tracking-widest text-muted">Mục tiêu {DAY_TYPE_LABELS[dayType].toLowerCase()}</h2>
        <form action={updateMealPlan} className="mt-3">
          <input type="hidden" name="id" value={plan.id} />
          <div className="grid grid-cols-4 gap-2">
            <label className="text-center text-[10px] uppercase text-muted">Kcal<input name="targetCalories" type="number" defaultValue={plan.targetCalories} className={input} /></label>
            <label className="text-center text-[10px] uppercase text-muted">Protein<input name="proteinG" type="number" defaultValue={plan.proteinG} className={input} /></label>
            <label className="text-center text-[10px] uppercase text-muted">Carb<input name="carbsG" type="number" defaultValue={plan.carbsG} className={input} /></label>
            <label className="text-center text-[10px] uppercase text-muted">Fat<input name="fatG" type="number" defaultValue={plan.fatG} className={input} /></label>
          </div>
          <div className="mt-3 flex h-2.5 overflow-hidden rounded-full">
            <div style={{ width: `${pct.p}%` }} className="bg-ink" />
            <div style={{ width: `${pct.c}%` }} className="bg-cardio" />
            <div style={{ width: `${pct.f}%` }} className="bg-gold" />
          </div>
          <p className="mt-1 text-[11px] text-muted">Từ macro: ~{kcalFromMacros(plan.proteinG, plan.carbsG, plan.fatG)} kcal</p>
          <button className="mt-3 w-full rounded-xl border border-line py-2 text-sm font-semibold">Lưu mục tiêu</button>
        </form>
      </section>
      <section className="mt-4 rounded-xl border border-line bg-panel p-4">
        <h2 className="font-display text-sm font-semibold uppercase tracking-widest text-muted">Thực đơn mẫu</h2>
        <ul className="mt-1 divide-y divide-line">
          {plan.meals.map((m) => (
            <li key={m.id} className="flex items-center gap-3 py-3">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold">{m.name}</p>
                <p className="text-xs text-muted">{m.description}</p>
              </div>
              {m.calories != null && <span className="font-display font-semibold text-muted">{m.calories}</span>}
              <form action={deleteMeal}><input type="hidden" name="id" value={m.id} /><button className="text-brand">✕</button></form>
            </li>
          ))}
          {plan.meals.length === 0 && <li className="py-5 text-center text-sm text-muted">Chưa có bữa nào — thêm bữa đầu tiên bên dưới.</li>}
        </ul>
        <form action={addMeal} className="mt-2 grid grid-cols-[1fr_auto] gap-2">
          <input type="hidden" name="mealPlanId" value={plan.id} />
          <input name="name" required placeholder="Tên bữa (vd. Bữa sáng)" className="rounded-lg border border-line bg-panel2 px-3 py-2 text-sm" />
          <input name="calories" type="number" placeholder="kcal" className="w-20 rounded-lg border border-line bg-panel2 px-2 py-2 text-sm" />
          <input name="description" required placeholder="Món ăn (vd. Yến mạch, 3 trứng, chuối)" className="col-span-2 rounded-lg border border-line bg-panel2 px-3 py-2 text-sm" />
          <button className="col-span-2 rounded-lg bg-brand py-2 text-sm font-bold text-white">+ Thêm bữa</button>
        </form>
      </section>
      <p className="mt-3 text-center text-[11px] leading-relaxed text-muted">
        Ngày nào lịch tập là "{DAY_TYPE_LABELS[dayType]}", trang Hôm nay sẽ tự hiển thị kế hoạch này.
      </p>
    </main>
  );
}
```

- [ ] **Step 5: Verify + commit**

Run: `npm test && npm run build` — Expected: PASS.

```bash
git add -A && git commit -m "feat: trang dinh dưỡng — macro và thực đơn theo loại ngày"
```

---

### Task 11: Trang Hôm nay

**Files:**
- Create: `src/lib/date.ts`, `src/lib/date.test.ts`, `src/features/dashboard/queries.ts`
- Modify: `src/app/(app)/page.tsx`

**Interfaces:**
- Consumes: `DAY_TYPE_LABELS`, MealPlan queries.
- Produces: `weekdayInTz(date, tz): number` (0=CN); `getTodayContext()` trả `{ routine, day, dayType, mealPlan }` — Task 12 dùng `day` để start workout.

- [ ] **Step 1: Failing test** — `src/lib/date.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { weekdayInTz } from "./date";

describe("weekdayInTz", () => {
  // 2026-08-12T18:00Z = 2026-08-13 01:00 giờ VN (Thứ 5 = 4)
  it("dùng giờ VN, không dùng UTC", () => {
    expect(weekdayInTz(new Date("2026-08-12T18:00:00Z"))).toBe(4);
  });
  it("chủ nhật = 0", () => {
    expect(weekdayInTz(new Date("2026-08-16T03:00:00Z"))).toBe(0);
  });
});
```

Run: `npm test` — Expected: FAIL.

- [ ] **Step 2: Implement** — `src/lib/date.ts`:

```ts
const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function weekdayInTz(date: Date, timeZone = "Asia/Ho_Chi_Minh"): number {
  const name = new Intl.DateTimeFormat("en-US", { weekday: "short", timeZone }).format(date);
  return DAY_NAMES.indexOf(name);
}

export function formatDateVi(date: Date, timeZone = "Asia/Ho_Chi_Minh"): string {
  return new Intl.DateTimeFormat("vi-VN", { weekday: "long", day: "numeric", month: "long", timeZone }).format(date);
}
```

Run: `npm test` — Expected: PASS.

- [ ] **Step 3: Query** — `src/features/dashboard/queries.ts`:

```ts
import { db } from "@/lib/db";
import { weekdayInTz } from "@/lib/date";
import type { DayType } from "@prisma/client";

export async function getTodayContext(now = new Date()) {
  const weekday = weekdayInTz(now);
  const routine = await db.routine.findFirst({
    where: { isActive: true },
    include: {
      days: {
        where: { weekday },
        include: { exercises: { orderBy: { order: "asc" }, include: { exercise: true } } },
      },
    },
  });
  const day = routine?.days[0] ?? null;
  const dayType: DayType = day?.dayType ?? "REST";
  const mealPlan = await db.mealPlan.findUnique({
    where: { dayType },
    include: { meals: { orderBy: { order: "asc" } } },
  });
  return { routine, day, dayType, mealPlan };
}
```

- [ ] **Step 4: Trang Hôm nay** — thay `src/app/(app)/page.tsx` (nút "Bắt đầu tập" sẽ nối action ở Task 12, tạm render form trỏ tới `startWorkout` — nếu Task 12 chưa chạy, tạo stub `src/features/workouts/actions.ts` export async `startWorkout` ném `Error("Chưa cài đặt")`; Task 12 sẽ thay bằng bản thật):

```tsx
import { getTodayContext } from "@/features/dashboard/queries";
import { formatDateVi } from "@/lib/date";
import { DAY_TYPE_LABELS } from "@/features/routines/builder";
import { startWorkout } from "@/features/workouts/actions";
import Link from "next/link";

const BANNER = {
  STRENGTH: { rail: "bg-brand", plate: "bg-brand" },
  CARDIO: { rail: "bg-cardio", plate: "bg-cardio" },
  REST: { rail: "bg-line", plate: "bg-panel2" },
} as const;

export default async function TodayPage() {
  const { routine, day, dayType, mealPlan } = await getTodayContext();
  const b = BANNER[dayType];
  return (
    <main className="p-5">
      <p className="text-xs font-medium text-muted">{formatDateVi(new Date())}</p>
      <h1 className="font-display text-3xl font-bold uppercase">Hôm nay</h1>

      <div className="relative mt-4 flex items-center gap-3.5 overflow-hidden rounded-xl border border-line bg-panel p-4 pl-5">
        <span className={`absolute inset-y-0 left-0 w-1.5 ${b.rail}`} />
        <span className={`grid size-11 place-items-center rounded-full border-2 border-line ${b.plate}`}>
          <span className="size-3 rounded-full bg-bg" />
        </span>
        <div>
          <p className="font-display text-xl font-bold uppercase">{day ? `${day.name}` : "Ngày nghỉ"}</p>
          <p className="text-xs text-muted">
            {DAY_TYPE_LABELS[dayType]}{routine ? ` · ${routine.name}` : " · Chưa có giáo án active"}
          </p>
        </div>
      </div>

      {day && day.exercises.length > 0 && (
        <section className="mt-4 rounded-xl border border-line bg-panel p-4">
          <h2 className="flex justify-between font-display text-sm font-semibold uppercase tracking-widest text-muted">
            Buổi tập <span className="font-sans text-[11px] font-normal normal-case">{day.exercises.length} bài</span>
          </h2>
          <ul className="divide-y divide-line">
            {day.exercises.map((re) => (
              <li key={re.id} className="flex items-center justify-between py-2.5">
                <div>
                  <p className="text-sm font-semibold">{re.exercise.name}</p>
                  <p className="text-[11px] text-muted">{re.exercise.primaryMuscles.join(", ")}</p>
                </div>
                <span className="font-display text-lg font-semibold">{re.targetSets}×{re.targetReps}</span>
              </li>
            ))}
          </ul>
          <form action={startWorkout}>
            <input type="hidden" name="routineDayId" value={day.id} />
            <button className="mt-3 w-full rounded-xl bg-brand py-3.5 font-display text-lg font-bold uppercase tracking-widest text-white">
              Bắt đầu tập
            </button>
          </form>
        </section>
      )}
      {!day && (
        <p className="mt-4 rounded-xl border border-dashed border-line p-4 text-center text-sm text-muted">
          Hôm nay không có lịch tập. Nghỉ ngơi cho cơ phục hồi, hoặc <Link href="/more/routines" className="font-semibold text-brand">thêm ngày vào giáo án</Link>.
        </p>
      )}

      {mealPlan && (
        <section className="mt-4 rounded-xl border border-line bg-panel p-4">
          <h2 className="flex justify-between font-display text-sm font-semibold uppercase tracking-widest text-muted">
            Dinh dưỡng <span className="font-sans text-[11px] font-normal normal-case">kế hoạch {DAY_TYPE_LABELS[dayType].toLowerCase()}</span>
          </h2>
          <div className="mt-3 grid grid-cols-4 gap-2 text-center">
            {[[mealPlan.targetCalories, "kcal"], [mealPlan.proteinG, "protein g"], [mealPlan.carbsG, "carb g"], [mealPlan.fatG, "fat g"]].map(([v, l]) => (
              <div key={l} className="rounded-lg bg-panel2 py-2.5">
                <p className="font-display text-xl font-bold">{v}</p>
                <p className="text-[9px] uppercase tracking-wider text-muted">{l}</p>
              </div>
            ))}
          </div>
          <ul className="mt-1 divide-y divide-line">
            {mealPlan.meals.map((m) => (
              <li key={m.id} className="flex justify-between gap-3 py-2.5 text-[13px]">
                <span className="shrink-0 font-semibold">{m.name}</span>
                <span className="text-right text-muted">{m.description}{m.calories != null ? ` · ~${m.calories} kcal` : ""}</span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}
```

Stub tạm `src/features/workouts/actions.ts`:

```ts
"use server";
export async function startWorkout(formData: FormData) {
  void formData;
  throw new Error("Chưa cài đặt — Task 12 sẽ thay bản thật");
}
```

- [ ] **Step 5: Verify + commit**

Run: `npm test && npm run build` — Expected: PASS.

```bash
git add -A && git commit -m "feat: trang Hôm nay — buổi tập + kế hoạch ăn theo loại ngày"
```

---

### Task 12: Logic workout + actions start/save/finish

**Files:**
- Create: `src/features/workouts/logic.ts`, `src/features/workouts/logic.test.ts`, `src/features/workouts/queries.ts`
- Modify: `src/features/workouts/actions.ts` (thay stub)

**Interfaces:**
- Produces:
  - `totalVolumeKg(sets: {type, weightKg, reps, completedAt}[]): number`
  - `isNewPR(weightKg: number, reps: number, historyMaxKg: number | null): boolean`
  - actions: `startWorkout(formData)` (tạo session, redirect `/workouts/[id]`), `saveSet(input: SaveSetInput): Promise<{ isPR: boolean }>` (gọi từ client), `finishWorkout(formData)`, `addExerciseToSession(formData)`
  - queries: `getSessionDetail(id)`, `getPrevSets(exerciseId, excludeSessionId)`, `getHistoryMaxKg(exerciseId)`
  - type `SaveSetInput = { sessionId: string; exerciseId: string; setNumber: number; type: "WARMUP"|"NORMAL"|"FAILURE"; weightKg: number | null; reps: number | null }`

- [ ] **Step 1: Failing tests** — `src/features/workouts/logic.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { totalVolumeKg, isNewPR } from "./logic";

const done = new Date();
describe("totalVolumeKg", () => {
  it("cộng weight×reps của set đã hoàn thành, bỏ warm-up", () => {
    expect(totalVolumeKg([
      { type: "WARMUP", weightKg: 20, reps: 12, completedAt: done },
      { type: "NORMAL", weightKg: 80, reps: 10, completedAt: done },
      { type: "FAILURE", weightKg: 80, reps: 8, completedAt: done },
      { type: "NORMAL", weightKg: 80, reps: 10, completedAt: null },
    ])).toBe(1440);
  });
  it("0 khi không có set", () => expect(totalVolumeKg([])).toBe(0));
});

describe("isNewPR", () => {
  it("true khi vượt max cũ", () => expect(isNewPR(85, 5, 80)).toBe(true));
  it("false khi bằng max cũ", () => expect(isNewPR(80, 5, 80)).toBe(false));
  it("false khi reps < 1", () => expect(isNewPR(100, 0, 80)).toBe(false));
  it("true khi chưa có lịch sử và weight > 0", () => expect(isNewPR(60, 8, null)).toBe(true));
});
```

Run: `npm test` — Expected: FAIL.

- [ ] **Step 2: Implement logic** — `src/features/workouts/logic.ts`:

```ts
import type { SetType } from "@prisma/client";

export type LoggedSet = { type: SetType; weightKg: number | null; reps: number | null; completedAt: Date | null };

export function totalVolumeKg(sets: LoggedSet[]): number {
  return sets
    .filter((s) => s.completedAt && s.type !== "WARMUP" && s.weightKg != null && s.reps != null)
    .reduce((sum, s) => sum + (s.weightKg as number) * (s.reps as number), 0);
}

export function isNewPR(weightKg: number, reps: number, historyMaxKg: number | null): boolean {
  if (reps < 1) return false;
  return historyMaxKg == null ? weightKg > 0 : weightKg > historyMaxKg;
}
```

Run: `npm test` — Expected: PASS.

- [ ] **Step 3: Queries** — `src/features/workouts/queries.ts`:

```ts
import { db } from "@/lib/db";

export async function getSessionDetail(id: string) {
  return db.workoutSession.findUnique({
    where: { id },
    include: {
      sets: { orderBy: { setNumber: "asc" }, include: { exercise: true } },
      routineDay: { include: { exercises: { orderBy: { order: "asc" }, include: { exercise: true } } } },
    },
  });
}

export async function getPrevSets(exerciseId: string, excludeSessionId: string) {
  const last = await db.workoutSession.findFirst({
    where: { status: "COMPLETED", id: { not: excludeSessionId }, sets: { some: { exerciseId } } },
    orderBy: { date: "desc" },
    include: { sets: { where: { exerciseId }, orderBy: { setNumber: "asc" } } },
  });
  return last?.sets ?? [];
}

export async function getHistoryMaxKg(exerciseId: string) {
  const agg = await db.workoutSet.aggregate({
    where: { exerciseId, type: { not: "WARMUP" }, reps: { gte: 1 }, session: { status: "COMPLETED" } },
    _max: { weightKg: true },
  });
  return agg._max.weightKg;
}
```

- [ ] **Step 4: Actions thật** — thay toàn bộ `src/features/workouts/actions.ts`:

```ts
"use server";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { isNewPR } from "./logic";
import { getHistoryMaxKg } from "./queries";

export async function startWorkout(formData: FormData) {
  const routineDayId = z.string().min(1).nullable().parse(formData.get("routineDayId") || null);
  const session = await db.workoutSession.create({ data: { routineDayId } });
  redirect(`/workouts/${session.id}`);
}

const saveSetSchema = z.object({
  sessionId: z.string().min(1),
  exerciseId: z.string().min(1),
  setNumber: z.number().int().min(1).max(50),
  type: z.enum(["WARMUP", "NORMAL", "FAILURE"]),
  weightKg: z.number().min(0).max(1000).nullable(),
  reps: z.number().int().min(0).max(200).nullable(),
});
export type SaveSetInput = z.infer<typeof saveSetSchema>;

export async function saveSet(input: SaveSetInput): Promise<{ isPR: boolean }> {
  const d = saveSetSchema.parse(input);
  const historyMax = await getHistoryMaxKg(d.exerciseId);
  await db.workoutSet.upsert({
    where: { sessionId_exerciseId_setNumber: { sessionId: d.sessionId, exerciseId: d.exerciseId, setNumber: d.setNumber } },
    update: { type: d.type, weightKg: d.weightKg, reps: d.reps, completedAt: new Date() },
    create: { ...d, completedAt: new Date() },
  });
  const pr = d.type !== "WARMUP" && d.weightKg != null && d.reps != null && isNewPR(d.weightKg, d.reps, historyMax);
  return { isPR: pr };
}

export async function finishWorkout(formData: FormData) {
  const id = z.string().min(1).parse(formData.get("sessionId"));
  await db.workoutSession.update({ where: { id }, data: { status: "COMPLETED" } });
  revalidatePath("/");
  revalidatePath("/calendar");
  redirect(`/workouts/${id}`);
}

// Thêm bài ngoài kế hoạch giữa buổi tập: tạo set giữ chỗ (completedAt=null,
// totalVolumeKg bỏ qua) để bài xuất hiện trong SetLogger; tick set 1 sẽ upsert đè lên.
export async function addExerciseToSession(formData: FormData) {
  const sessionId = z.string().min(1).parse(formData.get("sessionId"));
  const exerciseId = z.string().min(1).parse(formData.get("exerciseId"));
  await db.workoutSet.upsert({
    where: { sessionId_exerciseId_setNumber: { sessionId, exerciseId, setNumber: 1 } },
    update: {},
    create: { sessionId, exerciseId, setNumber: 1, weightKg: null, reps: null, completedAt: null },
  });
  revalidatePath(`/workouts/${sessionId}`);
  redirect(`/workouts/${sessionId}`);
}
```

- [ ] **Step 5: Verify + commit**

Run: `npm test && npm run build` — Expected: PASS.

```bash
git add -A && git commit -m "feat: logic workout (volume, PR) + actions start/save/finish"
```

---

### Task 13: Màn hình log buổi tập

**Files:**
- Create: `src/features/workouts/set-logger.tsx`, `src/app/(app)/workouts/[id]/page.tsx`, `src/app/(app)/workouts/[id]/add/page.tsx`

**Interfaces:**
- Consumes: `getSessionDetail`, `getPrevSets`, `saveSet`, `finishWorkout`, `addExerciseToSession`, `totalVolumeKg` (Task 12); `searchExercises`, `muscleLabel` (Task 6).
- Produces: route `/workouts/[id]` — đang tập hiển thị SetLogger (kể cả bài thêm ngoài kế hoạch); đã COMPLETED hiển thị tóm tắt readonly (Task 15 link tới đây).

- [ ] **Step 1: Server page** — `src/app/(app)/workouts/[id]/page.tsx`:

```tsx
import Link from "next/link";
import { notFound } from "next/navigation";
import { getSessionDetail, getPrevSets } from "@/features/workouts/queries";
import { totalVolumeKg } from "@/features/workouts/logic";
import { finishWorkout } from "@/features/workouts/actions";
import { SetLogger, type ExercisePlan } from "@/features/workouts/set-logger";

export default async function WorkoutPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSessionDetail(id);
  if (!session) notFound();

  const planned = session.routineDay?.exercises ?? [];
  const toLogged = (exerciseId: string) =>
    session.sets
      .filter((s) => s.exerciseId === exerciseId && s.completedAt)
      .map((s) => ({ setNumber: s.setNumber, type: s.type, weightKg: s.weightKg, reps: s.reps }));
  const toPrev = async (exerciseId: string) =>
    (await getPrevSets(exerciseId, id)).map((s) => ({ setNumber: s.setNumber, weightKg: s.weightKg, reps: s.reps }));

  const planExercises: ExercisePlan[] = await Promise.all(
    planned.map(async (re) => ({
      exerciseId: re.exerciseId,
      name: re.exercise.name,
      targetSets: re.targetSets,
      targetReps: re.targetReps,
      restSeconds: re.restSeconds,
      prev: await toPrev(re.exerciseId),
      logged: toLogged(re.exerciseId),
    }))
  );
  // Bài thêm ngoài kế hoạch = có set trong session nhưng không thuộc routineDay
  const plannedIds = new Set(planned.map((re) => re.exerciseId));
  const extraIds = [...new Set(session.sets.filter((s) => !plannedIds.has(s.exerciseId)).map((s) => s.exerciseId))];
  const extraPlans: ExercisePlan[] = await Promise.all(
    extraIds.map(async (exerciseId) => ({
      exerciseId,
      name: session.sets.find((s) => s.exerciseId === exerciseId)!.exercise.name,
      targetSets: 3,
      targetReps: "8-12",
      restSeconds: 90,
      prev: await toPrev(exerciseId),
      logged: toLogged(exerciseId),
    }))
  );
  const plans = [...planExercises, ...extraPlans];

  if (session.status === "COMPLETED") {
    const volume = totalVolumeKg(session.sets);
    const doneSets = session.sets.filter((s) => s.completedAt).length;
    const lastDone = session.sets.reduce<Date | null>(
      (acc, s) => (s.completedAt && (!acc || s.completedAt > acc) ? s.completedAt : acc), null);
    const durationMin = lastDone ? Math.max(1, Math.round((lastDone.getTime() - session.date.getTime()) / 60000)) : 0;
    return (
      <main className="p-5">
        <h1 className="font-display text-3xl font-bold uppercase">{session.routineDay?.name ?? "Buổi tập"}</h1>
        <p className="mt-1 text-xs text-muted">{session.date.toLocaleDateString("vi-VN")} · Đã hoàn thành</p>
        <div className="mt-4 grid grid-cols-3 gap-2 text-center">
          <div className="rounded-xl border border-line bg-panel p-4">
            <p className="font-display text-3xl font-bold">{volume.toLocaleString("vi-VN")}</p>
            <p className="text-[10px] uppercase tracking-wider text-muted">Volume (kg)</p>
          </div>
          <div className="rounded-xl border border-line bg-panel p-4">
            <p className="font-display text-3xl font-bold">{doneSets}</p>
            <p className="text-[10px] uppercase tracking-wider text-muted">Set</p>
          </div>
          <div className="rounded-xl border border-line bg-panel p-4">
            <p className="font-display text-3xl font-bold">{durationMin}</p>
            <p className="text-[10px] uppercase tracking-wider text-muted">Phút</p>
          </div>
        </div>
        <ul className="mt-4 space-y-3">
          {plans.map((p) => (
            <li key={p.exerciseId} className="rounded-xl border border-line bg-panel p-4">
              <p className="text-sm font-semibold">{p.name}</p>
              <p className="mt-1 text-xs text-muted">
                {p.logged.map((s) => `${s.weightKg ?? 0}×${s.reps ?? 0}`).join(" · ") || "Không có set"}
              </p>
            </li>
          ))}
        </ul>
      </main>
    );
  }

  return (
    <main className="pb-5">
      <header className="flex items-center justify-between border-b border-line p-4">
        <div>
          <h1 className="font-display text-2xl font-bold uppercase">{session.routineDay?.name ?? "Tập tự do"}</h1>
          <p className="text-[11px] text-muted">{planned.length} bài theo kế hoạch</p>
        </div>
      </header>
      <SetLogger sessionId={id} plans={plans} />
      <div className="px-4">
        <Link href={`/workouts/${id}/add`}
          className="block rounded-xl border border-dashed border-line py-3 text-center text-xs font-semibold text-muted">
          + Thêm bài ngoài kế hoạch
        </Link>
      </div>
      <form action={finishWorkout} className="px-4">
        <input type="hidden" name="sessionId" value={id} />
        <button className="mt-2 w-full rounded-xl border border-brand py-3.5 font-display text-lg font-bold uppercase tracking-widest text-brand">
          Hoàn thành buổi tập
        </button>
      </form>
    </main>
  );
}
```

- [ ] **Step 2: SetLogger client component** — `src/features/workouts/set-logger.tsx`:

```tsx
"use client";
import { useState } from "react";
import { saveSet } from "./actions";
import { RestTimer } from "./rest-timer";

export type ExercisePlan = {
  exerciseId: string;
  name: string;
  targetSets: number;
  targetReps: string;
  restSeconds: number;
  prev: { setNumber: number; weightKg: number | null; reps: number | null }[];
  logged: { setNumber: number; type: "WARMUP" | "NORMAL" | "FAILURE"; weightKg: number | null; reps: number | null }[];
};

type SetKind = "WARMUP" | "NORMAL" | "FAILURE";
type RowState = { type: SetKind; weight: string; reps: string; done: boolean; isPR: boolean; pendingSync: boolean };

const NEXT_KIND: Record<SetKind, SetKind> = { NORMAL: "WARMUP", WARMUP: "FAILURE", FAILURE: "NORMAL" };

function initRows(plan: ExercisePlan): RowState[] {
  const n = Math.max(plan.targetSets, ...plan.logged.map((l) => l.setNumber), 0);
  return Array.from({ length: n }, (_, i) => {
    const logged = plan.logged.find((l) => l.setNumber === i + 1);
    return {
      type: logged?.type ?? "NORMAL",
      weight: logged?.weightKg != null ? String(logged.weightKg) : "",
      reps: logged?.reps != null ? String(logged.reps) : "",
      done: !!logged, isPR: false, pendingSync: false,
    };
  });
}

export function SetLogger({ sessionId, plans }: { sessionId: string; plans: ExercisePlan[] }) {
  const [rowsByEx, setRowsByEx] = useState<Record<string, RowState[]>>(
    () => Object.fromEntries(plans.map((p) => [p.exerciseId, initRows(p)]))
  );
  const [rest, setRest] = useState<{ seconds: number; runId: number; label: string } | null>(null);

  function update(exId: string, idx: number, patch: Partial<RowState>) {
    setRowsByEx((prev) => ({ ...prev, [exId]: prev[exId].map((r, i) => (i === idx ? { ...r, ...patch } : r)) }));
  }

  async function tick(plan: ExercisePlan, idx: number) {
    const row = rowsByEx[plan.exerciseId][idx];
    const weightKg = row.weight === "" ? null : Number(row.weight.replace(",", "."));
    const reps = row.reps === "" ? null : Number(row.reps);
    update(plan.exerciseId, idx, { done: true, pendingSync: true });
    setRest({ seconds: plan.restSeconds, runId: Date.now(), label: plan.name });
    const input = { sessionId, exerciseId: plan.exerciseId, setNumber: idx + 1, type: row.type, weightKg, reps };
    try {
      const { isPR } = await saveSet(input);
      update(plan.exerciseId, idx, { pendingSync: false, isPR });
    } catch {
      update(plan.exerciseId, idx, { pendingSync: true }); // giữ badge "chưa đồng bộ", retry ở Task 14
    }
  }

  function addSet(exId: string) {
    setRowsByEx((prev) => ({ ...prev, [exId]: [...prev[exId], { weight: "", reps: "", done: false, isPR: false, pendingSync: false }] }));
  }

  const cell = "w-16 rounded-lg border border-line bg-panel2 py-2 text-center font-display text-lg font-semibold";
  return (
    <div className="space-y-3 p-4">
      {plans.map((plan) => (
        <section key={plan.exerciseId} className="rounded-xl border border-line bg-panel p-3.5">
          <header className="flex items-baseline justify-between">
            <p className="text-sm font-bold">{plan.name}</p>
            <p className="text-[11px] text-muted">
              {plan.prev.length > 0
                ? `Buổi trước: ${plan.prev[0].weightKg ?? "-"} kg × ${plan.prev[0].reps ?? "-"}`
                : `Mục tiêu ${plan.targetSets}×${plan.targetReps}`}
            </p>
          </header>
          <table className="mt-2 w-full text-center text-sm">
            <thead>
              <tr className="border-b border-line font-display text-[11px] uppercase tracking-widest text-muted">
                <th className="py-1.5">Set</th><th>Trước</th><th>Kg</th><th>Rep</th><th></th>
              </tr>
            </thead>
            <tbody>
              {rowsByEx[plan.exerciseId].map((row, i) => {
                const prev = plan.prev.find((p) => p.setNumber === i + 1);
                return (
                  <tr key={i} className={`border-b border-line last:border-0 ${row.type === "WARMUP" ? "opacity-60" : ""}`}>
                    <td className="py-1.5">
                      <button onClick={() => update(plan.exerciseId, i, { type: NEXT_KIND[row.type] })}
                        aria-label={`Đổi loại set ${i + 1}`}
                        className={`font-display font-bold ${row.type === "WARMUP" ? "text-gold" : row.type === "FAILURE" ? "text-brand" : "text-muted"}`}>
                        {row.type === "WARMUP" ? "W" : row.type === "FAILURE" ? "F" : i + 1}
                      </button>
                    </td>
                    <td className="text-xs text-muted/70">{prev ? `${prev.weightKg ?? "-"}×${prev.reps ?? "-"}` : "—"}</td>
                    <td className="py-1.5">
                      <input inputMode="decimal" value={row.weight} aria-label={`Kg set ${i + 1}`}
                        onChange={(e) => update(plan.exerciseId, i, { weight: e.target.value })} className={cell} />
                    </td>
                    <td>
                      <input inputMode="numeric" value={row.reps} aria-label={`Rep set ${i + 1}`}
                        onChange={(e) => update(plan.exerciseId, i, { reps: e.target.value })} className={cell} />
                    </td>
                    <td>
                      <button onClick={() => tick(plan, i)} aria-label={`Hoàn thành set ${i + 1}`}
                        className={`grid size-8 place-items-center rounded-lg border font-bold ${
                          row.isPR ? "border-gold bg-gold text-white"
                          : row.done ? "border-ok bg-ok text-white"
                          : "border-line text-transparent"}`}>
                        {row.isPR ? "PR" : "✓"}
                      </button>
                      {row.pendingSync && <p className="text-[9px] text-gold">chưa đồng bộ</p>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <button onClick={() => addSet(plan.exerciseId)}
            className="mt-2 w-full rounded-lg border border-dashed border-line py-2 text-xs font-semibold text-muted">
            + Thêm set
          </button>
        </section>
      ))}
      {rest && <RestTimer key={rest.runId} seconds={rest.seconds} label={rest.label} onClose={() => setRest(null)} />}
    </div>
  );
}
```

(Task này compile được nhờ RestTimer bản tối thiểu ở Step 4; bản đầy đủ ở Task 14.)

- [ ] **Step 3: Trang thêm bài ngoài kế hoạch** — `src/app/(app)/workouts/[id]/add/page.tsx`:

```tsx
import { searchExercises, muscleLabel } from "@/features/exercises/queries";
import { addExerciseToSession } from "@/features/workouts/actions";

export default async function AddToSessionPage({ params, searchParams }: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ q?: string }>;
}) {
  const { id } = await params;
  const { q } = await searchParams;
  const exercises = q ? await searchExercises(q) : [];
  return (
    <main className="p-5">
      <h1 className="font-display text-2xl font-bold uppercase">Thêm bài ngoài kế hoạch</h1>
      <form className="mt-3">
        <input name="q" defaultValue={q} autoFocus placeholder="Tìm theo tên…"
          className="w-full rounded-xl border border-line bg-panel px-4 py-3 text-sm" />
      </form>
      <ul className="mt-4 divide-y divide-line">
        {exercises.map((ex) => (
          <li key={ex.id} className="flex items-center gap-3 py-3">
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">{ex.name}</p>
              <p className="text-xs text-muted">{ex.primaryMuscles.map(muscleLabel).join(", ")}</p>
            </div>
            <form action={addExerciseToSession}>
              <input type="hidden" name="sessionId" value={id} />
              <input type="hidden" name="exerciseId" value={ex.id} />
              <button className="rounded-lg bg-brand px-3 py-1.5 text-xs font-bold text-white">Thêm</button>
            </form>
          </li>
        ))}
        {q && exercises.length === 0 && <li className="py-6 text-center text-sm text-muted">Không có kết quả cho "{q}".</li>}
      </ul>
    </main>
  );
}
```

- [ ] **Step 4: RestTimer tối thiểu** — `src/features/workouts/rest-timer.tsx`:

```tsx
"use client";
import { useEffect, useState } from "react";

export function RestTimer({ seconds, label, onClose }: { seconds: number; label: string; onClose: () => void }) {
  const [left, setLeft] = useState(seconds);
  useEffect(() => {
    if (left <= 0) { navigator.vibrate?.(400); onClose(); return; }
    const t = setTimeout(() => setLeft((l) => l - 1), 1000);
    return () => clearTimeout(t);
  }, [left, onClose]);
  const mm = Math.floor(left / 60), ss = String(left % 60).padStart(2, "0");
  return (
    <div className="fixed inset-x-0 bottom-16 z-20 mx-auto flex max-w-lg items-center gap-3 border-t border-line bg-panel px-5 py-3">
      <div className="flex-1">
        <p className="font-display text-3xl font-bold">{mm}:{ss}</p>
        <p className="text-[11px] text-muted">Nghỉ giữa set · {label}</p>
      </div>
      <button onClick={() => setLeft((l) => l + 30)} className="rounded-lg border border-line bg-panel2 px-3.5 py-2.5 text-xs font-semibold">+30s</button>
      <button onClick={onClose} className="rounded-lg px-3 py-2.5 text-xs font-semibold text-muted">Bỏ qua</button>
    </div>
  );
}
```

- [ ] **Step 5: Verify + commit**

Run: `npm test && npm run build` — Expected: PASS.

```bash
git add -A && git commit -m "feat: màn hình log buổi tập — set table, prev values, PR badge, thêm bài ngoài kế hoạch, tóm tắt"
```

---

### Task 14: Rest timer nâng cấp + hàng đợi offline retry

**Files:**
- Create: `src/features/workouts/pending.ts`, `src/features/workouts/pending.test.ts`
- Modify: `src/features/workouts/rest-timer.tsx`, `src/features/workouts/set-logger.tsx`

**Interfaces:**
- Consumes: `SaveSetInput`, `saveSet` (Task 12).
- Produces: `enqueuePending(queue, item)`, `loadPending()`, `storePending(queue)` — key localStorage `"gym.pending-sets"`.

- [ ] **Step 1: Failing test** — `src/features/workouts/pending.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { enqueuePending } from "./pending";
import type { SaveSetInput } from "./actions";

const item = (setNumber: number, weightKg = 80): SaveSetInput =>
  ({ sessionId: "s1", exerciseId: "e1", setNumber, type: "NORMAL", weightKg, reps: 10 });

describe("enqueuePending", () => {
  it("thêm item mới", () => expect(enqueuePending([], item(1))).toHaveLength(1));
  it("ghi đè item cùng (session, exercise, setNumber)", () => {
    const q = enqueuePending([item(1, 80)], item(1, 85));
    expect(q).toHaveLength(1);
    expect(q[0].weightKg).toBe(85);
  });
  it("giữ item khác set", () => expect(enqueuePending([item(1)], item(2))).toHaveLength(2));
});
```

Run: `npm test` — Expected: FAIL.

- [ ] **Step 2: Implement** — `src/features/workouts/pending.ts`:

```ts
import type { SaveSetInput } from "./actions";

const KEY = "gym.pending-sets";

export function enqueuePending(queue: SaveSetInput[], item: SaveSetInput): SaveSetInput[] {
  return [
    ...queue.filter((q) => !(q.sessionId === item.sessionId && q.exerciseId === item.exerciseId && q.setNumber === item.setNumber)),
    item,
  ];
}

export function loadPending(): SaveSetInput[] {
  try { return JSON.parse(localStorage.getItem(KEY) ?? "[]"); } catch { return []; }
}

export function storePending(queue: SaveSetInput[]) {
  localStorage.setItem(KEY, JSON.stringify(queue));
}
```

Run: `npm test` — Expected: PASS.

- [ ] **Step 3: Nối vào SetLogger** — sửa hàm `tick` trong `set-logger.tsx`: khi `saveSet` throw, đưa input vào queue và lưu localStorage; thêm effect flush:

```tsx
// thêm import
import { enqueuePending, loadPending, storePending } from "./pending";
import { useEffect } from "react";

// trong catch của tick(), thay dòng update(...pendingSync: true...) bằng:
//   storePending(enqueuePending(loadPending(), input));
//   update(plan.exerciseId, idx, { pendingSync: true });
// với `input` là object đã truyền vào saveSet (khai báo const input trước khi gọi).

// thêm effect flush trong SetLogger:
useEffect(() => {
  async function flush() {
    const queue = loadPending();
    if (queue.length === 0) return;
    const remaining: typeof queue = [];
    for (const item of queue) {
      try { await saveSet(item); } catch { remaining.push(item); }
    }
    storePending(remaining);
    if (remaining.length === 0) {
      setRowsByEx((prev) => {
        const next = { ...prev };
        for (const ex of Object.keys(next)) next[ex] = next[ex].map((r) => ({ ...r, pendingSync: false }));
        return next;
      });
    }
  }
  const t = setInterval(flush, 15000);
  window.addEventListener("online", flush);
  return () => { clearInterval(t); window.removeEventListener("online", flush); };
}, [sessionId]);
```

- [ ] **Step 4: RestTimer vòng tròn "bánh tạ"** — thay phần JSX của `rest-timer.tsx`, thêm SVG progress (giữ logic đếm):

```tsx
const R = 26, C = 2 * Math.PI * R;
const progress = left / seconds; // 1 → 0
// trong JSX, trước <div className="flex-1">:
<div className="relative size-14">
  <svg width="56" height="56" viewBox="0 0 58 58" className="-rotate-90">
    <circle cx="29" cy="29" r={R} fill="none" strokeWidth="5" className="stroke-line" />
    <circle cx="29" cy="29" r={R} fill="none" strokeWidth="5" strokeLinecap="round"
      strokeDasharray={C} strokeDashoffset={C * (1 - progress)} className="stroke-gold" />
  </svg>
  <span className="absolute inset-0 grid place-items-center">
    <span className="block size-3 rounded-full border-2 border-line bg-bg" />
  </span>
</div>
```

- [ ] **Step 5: Verify + commit**

Run: `npm test && npm run build` — Expected: PASS.

```bash
git add -A && git commit -m "feat: rest timer bánh tạ + hàng đợi offline retry cho set"
```

---

### Task 15: Lịch tuần

**Files:**
- Create: `src/lib/week.ts`, `src/lib/week.test.ts`
- Modify: `src/app/(app)/calendar/page.tsx`

**Interfaces:**
- Consumes: `weekdayInTz`, `DAY_TYPE_LABELS`, `WEEKDAY_LABELS`, route `/workouts/[id]` (Task 13).
- Produces: `weekDates(now): Date[]` — 7 ngày Thứ 2→CN của tuần hiện tại (theo giờ VN).

- [ ] **Step 1: Failing test** — `src/lib/week.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { weekDates } from "./week";

describe("weekDates", () => {
  it("trả 7 ngày bắt đầu Thứ 2", () => {
    // 2026-08-13 (giờ VN) là Thứ 5 → tuần bắt đầu 2026-08-10 (Thứ 2)
    const days = weekDates(new Date("2026-08-13T03:00:00Z"));
    expect(days).toHaveLength(7);
    expect(days[0].toISOString().slice(0, 10)).toBe("2026-08-10");
    expect(days[6].toISOString().slice(0, 10)).toBe("2026-08-16");
  });
});
```

Run: `npm test` — Expected: FAIL.

- [ ] **Step 2: Implement** — `src/lib/week.ts`:

```ts
import { weekdayInTz } from "./date";

const DAY_MS = 86_400_000;

/** 7 ngày Thứ 2 → CN của tuần chứa `now` (mốc ngày theo giờ VN, giá trị Date ở 00:00 UTC của ngày đó). */
export function weekDates(now: Date): Date[] {
  const wd = weekdayInTz(now); // 0=CN…6=T7
  const offsetToMonday = wd === 0 ? 6 : wd - 1;
  const vnDateStr = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Ho_Chi_Minh" }).format(now); // YYYY-MM-DD
  const todayUtcMidnight = new Date(`${vnDateStr}T00:00:00Z`);
  const monday = new Date(todayUtcMidnight.getTime() - offsetToMonday * DAY_MS);
  return Array.from({ length: 7 }, (_, i) => new Date(monday.getTime() + i * DAY_MS));
}
```

Run: `npm test` — Expected: PASS.

- [ ] **Step 3: Trang Lịch** — thay `src/app/(app)/calendar/page.tsx`:

```tsx
import Link from "next/link";
import { db } from "@/lib/db";
import { weekDates } from "@/lib/week";
import { weekdayInTz } from "@/lib/date";
import { WEEKDAY_LABELS, DAY_TYPE_LABELS } from "@/features/routines/builder";

const DOT = { STRENGTH: "bg-brand", CARDIO: "bg-cardio", REST: "bg-line" } as const;

export default async function CalendarPage() {
  const now = new Date();
  const days = weekDates(now);
  const routine = await db.routine.findFirst({ where: { isActive: true }, include: { days: true } });
  const sessions = await db.workoutSession.findMany({
    where: { date: { gte: days[0], lt: new Date(days[6].getTime() + 86_400_000) } },
    orderBy: { date: "asc" },
  });
  const todayWd = weekdayInTz(now);
  return (
    <main className="p-5">
      <h1 className="font-display text-3xl font-bold uppercase">Lịch tuần</h1>
      <ul className="mt-4 space-y-2.5">
        {days.map((d) => {
          const wd = d.getUTCDay();
          const plan = routine?.days.find((rd) => rd.weekday === wd);
          const dayType = plan?.dayType ?? "REST";
          const session = sessions.find((s) => weekdayInTz(s.date) === wd && s.status === "COMPLETED");
          const isToday = wd === todayWd;
          return (
            <li key={d.toISOString()}
              className={`flex items-center gap-3 rounded-xl border bg-panel p-3.5 ${isToday ? "border-brand" : "border-line"}`}>
              <span className={`size-3 shrink-0 rounded-full ${DOT[dayType]}`} />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold">
                  {WEEKDAY_LABELS[wd]} <span className="font-normal text-muted">· {d.getUTCDate()}/{d.getUTCMonth() + 1}</span>
                </p>
                <p className="text-xs text-muted">{plan ? `${plan.name} · ${DAY_TYPE_LABELS[dayType]}` : "Nghỉ"}</p>
              </div>
              {session ? (
                <Link href={`/workouts/${session.id}`} className="rounded-lg bg-ok px-2.5 py-1.5 text-xs font-bold text-white">✓ Xem lại</Link>
              ) : (
                isToday && plan && <span className="text-xs font-semibold text-brand">Hôm nay</span>
              )}
            </li>
          );
        })}
      </ul>
    </main>
  );
}
```

- [ ] **Step 4: Verify + commit**

Run: `npm test && npm run build` — Expected: PASS.

```bash
git add -A && git commit -m "feat: lịch tuần với trạng thái hoàn thành và link xem lại"
```

---

### Task 16: PWA manifest + Playwright smoke test

**Files:**
- Create: `src/app/manifest.ts`, `public/icon.svg`, `playwright.config.ts`, `e2e/smoke.spec.ts`

**Interfaces:**
- Consumes: toàn bộ app; env `APP_EMAIL`, `APP_PASSWORD`.

- [ ] **Step 1: Manifest** — `src/app/manifest.ts`:

```ts
import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Gym của tôi",
    short_name: "Gym",
    description: "Quản lý tập luyện và dinh dưỡng cá nhân",
    start_url: "/",
    display: "standalone",
    background_color: "#EFEDE7",
    theme_color: "#EFEDE7",
    icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" }],
  };
}
```

`public/icon.svg` (bánh tạ đỏ):

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <rect width="512" height="512" rx="96" fill="#EFEDE7"/>
  <circle cx="256" cy="256" r="170" fill="#CC3A30"/>
  <circle cx="256" cy="256" r="150" fill="none" stroke="#A82D24" stroke-width="14"/>
  <circle cx="256" cy="256" r="46" fill="#EFEDE7"/>
</svg>
```

- [ ] **Step 2: Playwright**

```bash
npm i -D @playwright/test
npx playwright install chromium
```

`playwright.config.ts`:

```ts
import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "e2e",
  use: { baseURL: "http://localhost:3000" },
  webServer: { command: "npm run dev", url: "http://localhost:3000/login", reuseExistingServer: true },
});
```

`e2e/smoke.spec.ts`:

```ts
import { test, expect } from "@playwright/test";

test("đăng nhập → Hôm nay → tìm bài tập", async ({ page }) => {
  await page.goto("/login");
  await page.getByPlaceholder("Email").fill(process.env.APP_EMAIL!);
  await page.getByPlaceholder("Mật khẩu").fill(process.env.APP_PASSWORD!);
  await page.getByRole("button", { name: "Đăng nhập" }).click();
  await expect(page.getByRole("heading", { name: "Hôm nay" })).toBeVisible();

  await page.getByRole("link", { name: "Bài tập" }).click();
  await page.getByPlaceholder(/Tìm theo tên/).fill("bench press");
  await page.keyboard.press("Enter");
  await expect(page.getByText("Barbell Bench Press")).toBeVisible();
});
```

Thêm script `package.json`: `"e2e": "playwright test"`. Lưu ý: Playwright cần env từ `.env` — chạy qua `npx dotenv -e .env -- playwright test` hoặc export thủ công; đơn giản nhất: thêm `import "dotenv/config"` không có sẵn — dùng cách chạy: `bash -c 'set -a; source .env; set +a; npx playwright test'`.

- [ ] **Step 3: Chạy toàn bộ verify**

Run: `npm test && npm run build && bash -c 'set -a; source .env; set +a; npx playwright test'`
Expected: Vitest PASS, build PASS, e2e PASS.

- [ ] **Step 4: Commit**

```bash
git add -A && git commit -m "feat: PWA manifest + Playwright smoke test"
```

---

## Sau khi hoàn thành (không phải task code)

Deploy — cần người dùng thao tác tài khoản:
1. Push repo lên GitHub, import vào Vercel.
2. Tạo Neon project (nếu dev dùng Docker local) → lấy `DATABASE_URL` production.
3. Set env trên Vercel: `DATABASE_URL`, `AUTH_SECRET` (mới, khác local), `APP_EMAIL`, `APP_PASSWORD`.
4. `npx prisma migrate deploy` + `npx prisma db seed` trỏ vào DB production.
5. Mở app trên điện thoại → "Thêm vào màn hình chính" (PWA).
