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
