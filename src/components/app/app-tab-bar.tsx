"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, ChartLine, House, type LucideIcon } from "lucide-react";
import { activeNavItem, APP_NAV_ITEMS, type AppNavItemId } from "@/lib/app-nav";
import { cn } from "@/lib/utils";

const ICONS: Record<AppNavItemId, LucideIcon> = {
  home: House,
  lessons: BookOpen,
  progress: ChartLine,
};

/**
 * Phone navigation in thumb reach: Home / Lessons / Progress, stuck to the
 * bottom of the screen. Hidden from `sm` up, where the header nav shows.
 */
export function AppTabBar() {
  const active = activeNavItem(usePathname());

  return (
    <nav
      aria-label="Main"
      className="sticky bottom-0 z-40 flex rounded-t-2xl bg-card px-3 pt-1 pb-[calc(1.125rem+env(safe-area-inset-bottom))] sm:hidden"
    >
      {APP_NAV_ITEMS.map(({ id, label, href }) => {
        const Icon = ICONS[id];
        const current = id === active;
        return (
          <Link
            key={id}
            href={href}
            aria-current={current ? "page" : undefined}
            className={cn(
              "flex min-h-13 flex-1 flex-col items-center justify-center gap-0.5 rounded-xl text-label",
              current ? "font-bold text-accent-700" : "text-neutral-700",
            )}
          >
            <Icon aria-hidden className="size-5" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
