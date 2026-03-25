"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { href: "/", label: "ホーム", icon: "🏠" },
  { href: "/projects", label: "プロジェクト", icon: "📋" },
  { href: "/command", label: "指示", icon: "✏️" },
  { href: "/queue", label: "キュー", icon: "📂" },
];

export default function BottomNav() {
  const pathname = usePathname();

  // ログイン画面ではナビを表示しない
  if (pathname === "/login") {
    return null;
  }

  return (
    <nav className="bottom-nav">
      {tabs.map((tab) => {
        const isActive =
          tab.href === "/" ? pathname === "/" : pathname.startsWith(tab.href);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`flex flex-1 flex-col items-center justify-center gap-1 text-xs transition-colors ${
              isActive
                ? "text-blue-400"
                : "text-gray-500 hover:text-gray-300"
            }`}
          >
            <span className="text-xl leading-none">{tab.icon}</span>
            <span className="leading-none">{tab.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
