import { auth } from "@/auth";

export async function requireOwner() {
  const session = await auth();
  if (!session?.user) throw new Error("Chưa đăng nhập");
}
