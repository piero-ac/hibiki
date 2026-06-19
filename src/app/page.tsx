import Link from "next/link";
import { Suspense } from "react";
import { AuthButton } from "@/components/auth-button";

export default function Home() {
	return (
		<main className="min-h-screen flex flex-col bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50">
			{/* Navigation Header */}
			<nav className="w-full border-b border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm sticky top-0 z-50">
				<div className="max-w-5xl mx-auto flex justify-between items-center h-16 px-6 text-sm">
					<div className="flex gap-2 items-center font-bold tracking-tight text-lg">
						<Link href="/" className="hover:opacity-80 transition-opacity">
							Hibiki
						</Link>
					</div>

					{/* Dynamically swaps login links for user badge using Suspense */}
					<Suspense
						fallback={<div className="text-sm text-zinc-400">Loading...</div>}
					>
						<AuthButton />
					</Suspense>
				</div>
			</nav>

			{/* Hero Section */}
			<div className="flex-1 flex flex-col items-center justify-center max-w-3xl mx-auto px-6 text-center py-20 md:py-32">
				<span className="text-xs font-semibold uppercase tracking-widest text-zinc-500 dark:text-zinc-400 px-3 py-1 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-full mb-6 animate-fade-in">
					Project Platform
				</span>

				<h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-tight">
					Welcome to{" "}
					<span className="text-transparent bg-clip-text bg-linear-to-r from-zinc-950 via-zinc-600 to-zinc-900 dark:from-zinc-50 dark:via-zinc-400 dark:to-zinc-200">
						Hibiki
					</span>
				</h1>

				<p className="mt-6 text-base sm:text-lg text-zinc-600 dark:text-zinc-400 max-w-xl leading-relaxed">
					A full-stack, modular application built with Next.js and Supabase.
					Security, speed, and clean code working in perfect resonance.
				</p>

				<div className="mt-10 flex flex-col sm:flex-row gap-4 w-full sm:w-auto justify-center">
					<Link
						href="/login"
						className="bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-50 dark:hover:bg-zinc-200 text-zinc-50 dark:text-zinc-900 font-medium py-3 px-8 rounded-lg transition-all shadow-sm hover:shadow text-center"
					>
						Enter Platform
					</Link>
					<a
						href="https://github.com"
						target="_blank"
						rel="noopener noreferrer"
						className="border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-700 dark:text-zinc-300 font-medium py-3 px-8 rounded-lg transition-colors text-center"
					>
						Documentation
					</a>
				</div>
			</div>
		</main>
	);
}
