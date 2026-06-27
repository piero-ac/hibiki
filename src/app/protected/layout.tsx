import { AppNavbar } from "@/components/app/app-navbar";

export default function ProtectedLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<div className="flex min-h-screen flex-col bg-background text-foreground">
			<AppNavbar />

			<main className="flex-1">{children}</main>

			<footer className="border-t py-8 text-center text-xs text-muted-foreground">
				© {new Date().getFullYear()} Hibiki
			</footer>
		</div>
	);
}
