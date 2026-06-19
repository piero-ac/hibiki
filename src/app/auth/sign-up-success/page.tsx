export default function Page() {
	return (
		<div className="flex min-h-screen w-full items-center justify-center p-6 md:p-10 bg-zinc-50 dark:bg-zinc-950">
			<div className="w-full max-w-sm">
				<div className="flex flex-col gap-6">
					<div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-sm overflow-hidden">
						<div className="p-6 pb-4">
							<h2 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
								Thank you for signing up!
							</h2>
							<p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
								Check your email to confirm
							</p>
						</div>
						<div className="p-6 pt-0">
							<p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
								You&apos;ve successfully signed up. Please check your email to
								confirm your account before signing in.
							</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
