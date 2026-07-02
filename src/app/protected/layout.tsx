import { AppNavbar } from "@/components/app/app-navbar";
import { createClient } from "@/lib/supabase/server";
import { isDemoUser } from "@/lib/demo";

export default async function ProtectedLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const supabase = await createClient();

	const {
		data: { user },
	} = await supabase.auth.getUser();
	return (
		<div className="flex min-h-screen flex-col bg-background text-foreground">
			<AppNavbar isDemoUser={isDemoUser(user?.email)} />

			<main className="flex-1">{children}</main>

			<footer className="border-t py-8 text-center text-xs text-muted-foreground">
				© {new Date().getFullYear()} Hibiki
			</footer>
		</div>
	);
}
