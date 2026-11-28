import { AppNavbar } from "@/components/app/app-navbar";
import { AppTabBar } from "@/components/app/app-tab-bar";

// Every signed-in page except the Lesson player, which has its own top bar
// and mobile tray so that each exit can confirm before leaving (see (lesson)/).
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <AppNavbar />

      <main className="flex-1">{children}</main>

      <footer className="border-t py-8 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Hibiki
      </footer>

      {/* Last in the column and sticky, so it never covers page content. */}
      <AppTabBar />
    </div>
  );
}
