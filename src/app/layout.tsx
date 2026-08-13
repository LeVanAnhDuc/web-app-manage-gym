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
