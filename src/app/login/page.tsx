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
