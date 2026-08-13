# Gym App

Ứng dụng theo dõi tập luyện cá nhân (personal gym tracker) — Next.js 16, Prisma 7, Auth.js.

## Yêu cầu

- Node.js 20+
- PostgreSQL: chạy Docker Postgres cục bộ hoặc dùng Neon (serverless Postgres)

## Cài đặt

Tạo file `.env` ở gốc project với các biến sau:

```
DATABASE_URL="postgresql://user:password@host:5432/dbname"
AUTH_SECRET="chuỗi ngẫu nhiên dài, dùng để mã hoá session"
APP_EMAIL="email đăng nhập duy nhất của bạn"
APP_PASSWORD="mật khẩu đăng nhập"
```

Sau đó chạy:

```bash
npm i
npx prisma migrate dev
npx prisma db seed
npm run dev
```

Mở http://localhost:3000 và đăng nhập bằng `APP_EMAIL` / `APP_PASSWORD`.

## Test

```bash
npm test
```

## E2E

```bash
bash -c 'set -a; source .env; set +a; npx playwright test'
```

## Deploy (Vercel)

1. Set các biến môi trường (`DATABASE_URL`, `AUTH_SECRET`, `APP_EMAIL`, `APP_PASSWORD`) trong Vercel project settings.
2. Chạy `npx prisma migrate deploy` để áp migration lên database production.
3. Chạy `npx prisma db seed` để seed dữ liệu bài tập ban đầu.
4. Deploy như một app Next.js bình thường (`npm run build` được Vercel tự chạy).
