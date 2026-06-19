import { Suspense } from "react";

async function ErrorContent({
	searchParams,
}: {
	searchParams: Promise<{ error: string }>;
}) {
	const params = await searchParams;

	return (
		<>
			{params?.error ? (
				<p className="text-sm text-zinc-500 dark:text-zinc-400 font-mono bg-zinc-50 dark:bg-zinc-950 p-3 rounded-lg border border-zinc-100 dark:border-zinc-900 overflow-x-auto">
					Code error: {params.error}
				</p>
			) : (
				<p className="text-sm text-zinc-500 dark:text-zinc-400">
					An unspecified error occurred.
				</p>
			)}
		</>
	);
}

export default function Page({
	searchParams,
}: {
	searchParams: Promise<{ error: string }>;
}) {
	return (
		<div className="flex min-h-screen w-full items-center justify-center p-6 md:p-10 bg-zinc-50 dark:bg-zinc-950">
			<div className="w-full max-w-sm">
				<div className="flex flex-col gap-6">
					{/* Replaced <Card> with native Tailwind div containers */}
					<div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-sm overflow-hidden">
						{/* Card Header */}
						<div className="p-6 pb-4">
							<h2 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
								Sorry, something went wrong.
							</h2>
						</div>

						{/* Card Content */}
						<div className="p-6 pt-0">
							<Suspense
								fallback={
									<p className="text-sm text-zinc-400">
										Loading error details...
									</p>
								}
							>
								<ErrorContent searchParams={searchParams} />
							</Suspense>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
