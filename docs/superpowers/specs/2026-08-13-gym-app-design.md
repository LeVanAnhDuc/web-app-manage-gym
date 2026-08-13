# Spec thiết kế — App quản lý tập gym cá nhân

**Ngày:** 2026-08-13
**Trạng thái:** Chờ người dùng duyệt
**Thư mục dự án:** `D:\DeleteByDuc\app-mana-gym` (greenfield)

## 1. Tổng quan

Web app cá nhân giúp một người tập gym tự quản lý toàn bộ việc tập luyện: lịch tập, bài tập, log từng set tại phòng gym, và kế hoạch ăn tự áp dụng theo loại ngày (tập tạ / cardio / rest).

Điểm khác biệt so với các app hiện có (Hevy, Strong, Jefit, Boostcamp, Fitbod, MyFitnessPal): **nối trực tiếp lịch tập với chế độ ăn** — lịch hôm nay là ngày nào thì trang chủ tự hiển thị kế hoạch ăn của loại ngày đó. Không app phổ biến nào làm trọn tính năng này (kết luận từ khảo sát thị trường 2025–2026).

**Người dùng:** một người (chủ app). Không có hệ thống nhiều vai trò, không social.
**Ngôn ngữ:** UI tiếng Việt, tên bài tập tiếng Anh (theo cách gọi phổ biến của người tập).
**Thiết bị chính:** điện thoại tại phòng gym (mobile-first, PWA); desktop để lên kế hoạch.

## 2. Phạm vi tính năng

### MVP (Phase 1)
1. **Thư viện bài tập** — nhập sẵn 800+ bài từ free-exercise-db (public domain); search theo tên, filter theo nhóm cơ và dụng cụ; trang chi tiết có ảnh + hướng dẫn từng bước; tạo bài tập tùy chỉnh.
2. **Giáo án (routine)** — tạo lịch tập gồm các ngày trong tuần; mỗi ngày có loại ngày (STRENGTH / CARDIO / REST), tên, và danh sách bài tập với set × rep mục tiêu, thời gian nghỉ; một routine active tại một thời điểm.
3. **Lịch tuần** — xem 7 ngày: ngày nào tập gì, loại ngày, trạng thái hoàn thành; xem lại buổi tập cũ.
4. **Log buổi tập** (màn hình quan trọng nhất, mobile-first) — bảng set với cột "Trước" hiển thị kết quả buổi gần nhất; nhập kg/rep, tick hoàn thành từng set; rest timer tự chạy sau mỗi set; loại set warm-up/normal/failure; thêm set/bài ngoài kế hoạch; tóm tắt khi hoàn thành (tổng volume, thời lượng); badge PR khi vượt kỷ lục (định nghĩa PR: mức tạ lớn nhất từng log cho bài đó với reps ≥ 1; set warm-up không tính).
5. **Kế hoạch ăn theo loại ngày** — mỗi loại ngày một kế hoạch: mục tiêu calo/protein/carb/fat + danh sách bữa ăn mẫu (tên, mô tả món, calo ước tính); trang "Hôm nay" tự hiển thị kế hoạch đúng loại ngày. Không log từng món ăn, không cần database thực phẩm.

### Phase 2 (sau MVP)
6. Biểu đồ tiến bộ theo bài (mức tạ, volume, ước tính 1RM), lịch sử PR.
7. Superset, plate calculator, ghi chú theo bài tập.
8. Số đo cơ thể (cân nặng, vòng đo) + biểu đồ.

### Ngoài phạm vi (quyết định rõ, không làm)
Social feed; AI sinh giáo án; log món ăn kiểu MyFitnessPal; muscle recovery map; app đồng hồ; hệ thống nhiều người dùng.

## 3. Kiến trúc

- **Framework:** Next.js (App Router) + TypeScript.
- **UI:** Tailwind CSS + shadcn/ui; PWA manifest để cài lên màn hình chính điện thoại.
- **Database:** Postgres trên Neon (free tier); ORM **Prisma**.
- **Mutations:** Server Actions, validate bằng Zod.
- **Auth:** Auth.js, một tài khoản duy nhất (credentials trong biến môi trường) — chặn truy cập lạ, không cần luồng đăng ký.
- **Deploy:** Vercel free tier, auto-deploy từ GitHub.
- **Dữ liệu bài tập:** script seed đọc JSON của [free-exercise-db](https://github.com/yuhonas/free-exercise-db) (public domain) nạp vào bảng Exercise; ảnh dùng URL GitHub raw.

### Cấu trúc module (theo tính năng)
```
src/
  app/            # routes: (dashboard)/, workouts/, exercises/, routines/, nutrition/
  features/
    exercises/    # UI + actions + queries thư viện bài tập
    routines/     # builder giáo án
    workouts/     # log buổi tập, rest timer
    nutrition/    # kế hoạch ăn theo loại ngày
    dashboard/    # trang Hôm nay, lịch tuần
  lib/            # prisma client, auth, utils chung
prisma/           # schema + seed free-exercise-db
```
Mỗi feature tự chứa UI, server actions, queries; giao tiếp qua data model chung — hiểu và test độc lập được từng phần.

## 4. Mô hình dữ liệu

```prisma
enum DayType { STRENGTH CARDIO REST }
enum SetType { WARMUP NORMAL FAILURE }
enum SessionStatus { IN_PROGRESS COMPLETED }

model Exercise {
  id               String   @id @default(cuid())
  name             String                    // tiếng Anh, vd. "Barbell Bench Press"
  primaryMuscles   String[]
  secondaryMuscles String[]
  equipment        String?
  level            String?
  instructions     String[]                  // hướng dẫn từng bước
  images           String[]                  // URL ảnh
  isCustom         Boolean  @default(false)
}

model Routine {
  id       String  @id @default(cuid())
  name     String                            // vd. "PPL 6 ngày"
  isActive Boolean @default(false)           // chỉ 1 active
  days     RoutineDay[]
}

model RoutineDay {
  id        String  @id @default(cuid())
  routineId String
  weekday   Int                              // 0=CN … 6=T7
  name      String                           // vd. "Push A"
  dayType   DayType                          // khóa nối sang MealPlan
  exercises RoutineExercise[]
}

model RoutineExercise {
  id           String @id @default(cuid())
  routineDayId String
  exerciseId   String
  order        Int
  targetSets   Int
  targetReps   String                        // "8-12"
  restSeconds  Int    @default(90)
  note         String?
}

model WorkoutSession {
  id           String        @id @default(cuid())
  date         DateTime
  routineDayId String?                       // null nếu tập tự do
  status       SessionStatus
  note         String?
  sets         WorkoutSet[]
}

model WorkoutSet {
  id         String  @id @default(cuid())
  sessionId  String
  exerciseId String
  setNumber  Int
  type       SetType @default(NORMAL)
  weightKg   Float?
  reps       Int?
  completedAt DateTime?
}

model MealPlan {
  id             String  @id @default(cuid())
  dayType        DayType @unique              // mỗi loại ngày 1 kế hoạch
  targetCalories Int
  proteinG       Int
  carbsG         Int
  fatG           Int
  meals          Meal[]
}

model Meal {
  id          String @id @default(cuid())
  mealPlanId  String
  order       Int
  name        String                          // "Bữa sáng"
  description String                          // món ăn
  calories    Int?
}
```

**Luồng cốt lõi:** trang Hôm nay → tìm `RoutineDay` của routine active theo thứ hôm nay → hiện buổi tập + `MealPlan` theo `dayType`. "Bắt đầu tập" → tạo `WorkoutSession`, sinh hàng set trống từ `RoutineExercise`; mỗi ô hiển thị giá trị set tương ứng của session gần nhất có cùng bài tập.

## 5. Màn hình

Điều hướng: bottom tab bar — **Hôm nay · Lịch · Bài tập · Dinh dưỡng · Thêm** (tab "Thêm" chứa: quản lý giáo án, đăng xuất, và các mục Phase 2 sau này như số đo cơ thể).

1. **Hôm nay** — banner loại ngày (mã màu bánh tạ), thẻ buổi tập (danh sách bài + set×rep, nút "Bắt đầu tập"), thẻ dinh dưỡng (macro + các bữa). Ngày REST: chỉ kế hoạch ăn + lời nhắc nghỉ.
2. **Log buổi tập** — bảng set [Set | Trước | Kg | Rep | ✓]; rest timer "bánh tạ cạn dần" dock đáy màn hình với +30s/Bỏ qua; badge PR vàng; "Hoàn thành buổi tập" → màn tóm tắt.
3. **Lịch tuần** — 7 ngày, tên + loại ngày + trạng thái ✓; bấm ngày cũ xem chi tiết session.
4. **Thư viện bài tập** — search + chip filter (nhóm cơ, dụng cụ); item: tên, nhóm cơ, lần tập gần nhất, PR; chi tiết: ảnh + hướng dẫn + lịch sử.
5. **Giáo án** — danh sách routine (1 active); builder: thêm ngày → loại ngày → thêm bài (search từ thư viện) → set×rep mục tiêu, sắp thứ tự.
6. **Dinh dưỡng** — segmented control 3 loại ngày (đỏ/xanh/trắng); chỉnh mục tiêu macro + thanh tỷ lệ P/C/F; danh sách bữa mẫu chỉnh trực tiếp.

## 6. Design system (đã duyệt qua mockup)

Mockup đã duyệt tại `.superdesign/design_iterations/` (theme sáng "Chalk", các file 02–05; 01 là bản tối không dùng).

**Màu (light "Chalk"):**
| Token | Giá trị | Dùng cho |
|---|---|---|
| bg | `#EFEDE7` | nền app (giấy phấn ấm) |
| panel | `#FFFFFF` | thẻ/card |
| panel2 | `#F4F2EC` | ô nhập, khối phụ |
| line | `#DCD8CF` | viền |
| ink | `#1D2127` | chữ chính |
| muted | `#6E7681` | chữ phụ |
| red | `#CC3A30` | ngày tập tạ, CTA chính, accent |
| blue | `#3A6FC4` | ngày cardio |
| yellow | `#C99A22` | rest timer, badge PR |
| green | `#3E8A5F` | hoàn thành/success |

**Chữ ký thiết kế:** mã màu loại ngày lấy từ màu bánh tạ thi đấu (đỏ 25kg = tập tạ, xanh 20kg = cardio, trắng = rest) dùng nhất quán; rest timer là vòng tròn "bánh tạ" cạn dần.

**Typography:** hiển thị/số liệu — Barlow Condensed (600/700, uppercase, tracking rộng); body — Be Vietnam Pro (hỗ trợ tiếng Việt đầy đủ). Cả hai có trên Google Fonts với subset vietnamese.

## 7. Xử lý lỗi

- **Mất mạng khi đang log** (rủi ro thực tế ở phòng gym): autosave từng set ngay khi tick ✓; nếu request fail → giữ trong state + localStorage, tự retry, hiện badge "chưa đồng bộ". Không làm offline mode đầy đủ ở MVP.
- **Validate:** Zod ở mọi server action (kg ≥ 0, rep nguyên dương, macro ≥ 0…); lỗi hiển thị toast tiếng Việt, nêu rõ cách sửa.
- **Routine không có ngày cho hôm nay:** trang Hôm nay hiển thị trạng thái trống có hướng dẫn ("Hôm nay chưa có lịch — thêm ngày vào giáo án hoặc tập tự do").

## 8. Kiểm thử

- **TDD** theo quy trình superpowers cho mọi logic.
- **Vitest** (unit): tính toán "kết quả buổi trước", tổng volume, phát hiện PR, map dayType→MealPlan, parser seed free-exercise-db.
- **Integration:** server actions chạy trên test database.
- **Playwright** (smoke): luồng chính — đăng nhập → bắt đầu buổi tập → log set → hoàn thành → thấy trên lịch.

## 9. Nguồn dữ liệu & tham chiếu

- Bài tập: free-exercise-db — https://github.com/yuhonas/free-exercise-db (Unlicense/public domain, 800+ bài, JSON + ảnh).
- Dự phòng nếu cần nhiều bài hơn: wger API (CC-BY-SA), ExerciseDB OSS (~1.300 bài, GIF).
- Khảo sát tính năng: Hevy, Strong, Jefit, Boostcamp, Fitbod, MyFitnessPal, MacroFactor, RP Diet (08/2026) — kết luận chính: baseline = log set + prev values + rest timer + thư viện có filter + PR; khoảng trống thị trường = nối lịch tập với chế độ ăn theo loại ngày.
