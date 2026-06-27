import Link from "next/link";
import { Suspense } from "react";
import { Separator } from "@/components/ui/separator";
import { AuthButton } from "@/components/auth-button";

type AppNavbarProps = {
	email?: string | null;
};

export function AppNavbar({ email }: AppNavbarProps) {
	return (
		<header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
			<div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
				<div className="flex items-center gap-6">
					<Link href="/protected" className="text-lg font-bold tracking-tight">
						Hibiki
					</Link>

					<nav className="hidden items-center gap-4 sm:flex">
						<Link
							href="/protected/sentences"
							className="text-sm text-muted-foreground transition-colors hover:text-foreground"
						>
							Practice
						</Link>

						<Link
							href="/protected/progress"
							className="text-sm text-muted-foreground transition-colors hover:text-foreground"
						>
							Progress
						</Link>
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

			<div className="border-t sm:hidden">
				<nav className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-2">
					<Link
						href="/protected/sentences"
						className="text-sm text-muted-foreground hover:text-foreground"
					>
						Practice
					</Link>

					<Separator orientation="vertical" className="h-4" />

					<Link
						href="/protected/progress"
						className="text-sm text-muted-foreground hover:text-foreground"
					>
						Progress
					</Link>
				</nav>
			</div>
		</header>
	);
}
