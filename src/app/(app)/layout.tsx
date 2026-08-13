import { TabBar } from "@/components/tab-bar";

export const dynamic = "force-dynamic";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto min-h-screen max-w-lg pb-24">
      {children}
      <TabBar />
    </div>
  );
}
