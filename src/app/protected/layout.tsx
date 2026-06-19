import { AuthButton } from "@/components/auth-button";
import Link from "next/link";
import { Suspense } from "react";

export default function ProtectedLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<div className="min-h-screen flex flex-col bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50">
			{/* Sleek Navigation Bar */}
			<nav className="w-full border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 sticky top-0 z-50">
				<div className="max-w-5xl mx-auto flex justify-between items-center h-16 px-6">
					{/* Left Side: Brand Logo / Link */}
					<div className="flex items-center font-bold tracking-tight text-lg">
						<Link href="/" className="hover:opacity-80 transition-opacity">
							Hibiki
						</Link>
					</div>

					{/* Right Side: Dynamic Auth Buttons */}
					<div className="flex items-center gap-4">
						<Suspense
							fallback={
								<div className="text-sm text-zinc-400 font-medium">
									Loading session...
								</div>
							}
						>
							<AuthButton />
						</Suspense>
					</div>
				</div>
			</nav>

			{/* Main Content Area */}
			<main className="flex flex-1 w-full max-w-5xl mx-auto px-6 py-8">
				{children}
			</main>

			{/* Minimal Footer */}
			<footer className="w-full border-t border-zinc-200 dark:border-zinc-800 text-center text-xs text-zinc-400 py-12 bg-white dark:bg-zinc-900/30">
				<div className="max-w-5xl mx-auto px-6 flex flex-col sm:flex-row justify-between items-center gap-4">
					<p>© {new Date().getFullYear()} Hibiki. All rights reserved.</p>
					<p className="flex gap-2">
						Built with
						<span className="font-semibold text-zinc-600 dark:text-zinc-300">
							Next.js
						</span>
						&
						<span className="font-semibold text-zinc-600 dark:text-zinc-300">
							Supabase
						</span>
					</p>
				</div>
			</footer>
		</div>
	);
}
