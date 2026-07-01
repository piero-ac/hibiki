"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function SignUpForm({
	className,
	...props
}: React.ComponentPropsWithoutRef<"div">) {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [repeatPassword, setRepeatPassword] = useState("");
	const [error, setError] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const router = useRouter();

	const handleSignUp = async (e: React.FormEvent) => {
		e.preventDefault();
		const supabase = createClient();
		setIsLoading(true);
		setError(null);

		if (password !== repeatPassword) {
			setError("Passwords do not match");
			setIsLoading(false);
			return;
		}

		try {
			const { error } = await supabase.auth.signUp({
				email,
				password,
				options: {
					emailRedirectTo: `${window.location.origin}/protected`,
				},
			});
			if (error) throw error;
			router.push("/auth/sign-up-success");
		} catch (error: unknown) {
			setError(error instanceof Error ? error.message : "An error occurred");
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div
			className={`w-full max-w-md mx-auto p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-sm ${className}`}
			{...props}
		>
			<form onSubmit={handleSignUp} className="flex flex-col gap-4">
				<div>
					<h2 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
						Create your Hibiki Account
					</h2>
					<p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
						Enter your details below to get started.
					</p>
				</div>

				<div className="flex flex-col gap-1.5">
					<label
						htmlFor="email"
						className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
					>
						Email Address
					</label>
					<input
						id="email"
						type="email"
						value={email}
						onChange={(e) => setEmail(e.target.value)}
						required
						placeholder="you@example.com"
						className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-zinc-950 dark:focus:ring-zinc-300 focus:border-transparent transition-all"
					/>
				</div>

				<div className="flex flex-col gap-1.5">
					<label
						htmlFor="password"
						className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
					>
						Password
					</label>
					<input
						id="password"
						type="password"
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						required
						placeholder="••••••••"
						className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-zinc-950 dark:focus:ring-zinc-300 focus:border-transparent transition-all"
					/>
				</div>

				<div className="flex flex-col gap-1.5">
					<label
						htmlFor="repeatPassword"
						className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
					>
						Confirm Password
					</label>
					<input
						id="repeatPassword"
						type="password"
						value={repeatPassword}
						onChange={(e) => setRepeatPassword(e.target.value)}
						required
						placeholder="••••••••"
						className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-zinc-950 dark:focus:ring-zinc-300 focus:border-transparent transition-all"
					/>
				</div>

				{error && (
					<div className="text-sm font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 p-2.5 rounded-lg border border-red-200 dark:border-red-900/50">
						{error}
					</div>
				)}

				<button
					type="submit"
					disabled={isLoading}
					className="w-full mt-2 bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-50 dark:hover:bg-zinc-200 text-zinc-50 dark:text-zinc-900 font-medium text-sm py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
				>
					{isLoading ? "Creating account..." : "Sign Up"}
				</button>
			</form>
		</div>
	);
}
