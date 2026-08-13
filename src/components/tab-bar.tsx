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
