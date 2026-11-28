export type AppNavItemId = "home" | "lessons" | "progress";

export type AppNavItem = { id: AppNavItemId; label: string; href: string };

/** The app's top-level navigation, in display order. */
export const APP_NAV_ITEMS: readonly AppNavItem[] = [
  { id: "home", label: "Home", href: "/protected" },
  { id: "lessons", label: "Lessons", href: "/protected/sentences" },
  { id: "progress", label: "Progress", href: "/protected/progress" },
];

/**
 * The navigation item a path belongs to: Home only on Home itself, the
 * others on their page and anything below it. Null outside the app.
 */
export function activeNavItem(pathname: string): AppNavItemId | null {
  const match = APP_NAV_ITEMS.find(({ id, href }) =>
    id === "home"
      ? pathname === href
      : pathname === href || pathname.startsWith(`${href}/`),
  );
  return match?.id ?? null;
}
