import type { Metadata, Viewport } from "next";
import "./globals.css";
import BottomNav from "./components/BottomNav";

export const metadata: Metadata = {
  title: "Daily Assistant",
  description: "タスクキュー管理アシスタント",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja" className="h-full">
      <body className="h-full bg-[#0f0f0f] text-[#e5e5e5] antialiased">
        <div className="min-h-full">{children}</div>
        <BottomNav />
      </body>
    </html>
  );
}
