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
  await expect(page.getByText("Barbell Bench Press").first()).toBeVisible();
});
