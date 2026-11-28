import Link from "next/link";
import { Suspense } from "react";
import { AuthButton } from "@/components/auth/auth-button";
import { APP_NAV_ITEMS } from "@/lib/app-nav";

type AppNavbarProps = {
  email?: string | null;
};

/** The app header. On phones the links move to `AppTabBar` at the bottom. */
export function AppNavbar({ email }: AppNavbarProps) {
  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-6">
          <Link href="/protected" className="font-heading text-lg">
            Hibiki
          </Link>

          <nav className="hidden items-center gap-4 sm:flex">
            {APP_NAV_ITEMS.map(({ id, label, href }) => (
              <Link
                key={id}
                href={href}
                className="text-sm text-muted-foreground transition-colors hover:text-primary"
              >
                {label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          {email && (
            <span className="hidden max-w-48 truncate text-sm text-muted-foreground md:block">
              {email}
            </span>
          )}

          <Suspense
            fallback={
              <span className="text-sm text-muted-foreground">Loading...</span>
            }
          >
            <AuthButton />
          </Suspense>
        </div>
      </div>
    </header>
  );
}
