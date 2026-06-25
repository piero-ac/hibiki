import { Database } from "@/types/database.types";

type RecentAttemptsProps = {
	attempts: Database["public"]["Views"]["recent_attempts"]["Row"][];
	hasError: boolean;
};

export default function RecentAttempts({
	attempts,
	hasError,
}: RecentAttemptsProps) {
	if (hasError) {
		return (
			<section>
				<h2 className="text-lg font-semibold">Recent Attempts</h2>
				<p className="text-sm text-red-400">
					Unable to load your recent attempts.
				</p>
			</section>
		);
	}

	return (
		<section className="space-y-4">
			<div>
				<h2 className="text-lg font-semibold text-white">Recent Attempts</h2>
				<p className="text-sm text-zinc-400">
					Your latest pronunciation practice sessions.
				</p>
			</div>

			{attempts.length === 0 ? (
				<div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6 text-center">
					<p className="text-zinc-400">
						You haven&apos;t completed any shadowing attempts yet.
					</p>
				</div>
			) : (
				<div className="space-y-3">
					{attempts.map((attempt) => (
						<div
							key={attempt.id}
							className="rounded-xl border border-zinc-800 bg-zinc-900 p-4"
						>
							<div className="flex items-center justify-between">
								<p className="text-lg font-bold text-emerald-300">
									{attempt.accuracy_score}%
								</p>

								<span className="text-xs text-zinc-500">
									{attempt.created_at
										? new Date(attempt.created_at).toLocaleDateString()
										: "Unknown Date"}
								</span>
							</div>

							<p className="mt-3 font-medium text-white">
								{attempt.japanese_text}
							</p>

							<p className="mt-2 text-sm text-zinc-400">Whisper heard:</p>

							<p className="text-sm text-zinc-300">
								{attempt.user_audio_transcript}
							</p>

							<div className="mt-3 flex gap-2">
								<span className="rounded bg-zinc-800 px-2 py-1 text-xs text-zinc-300">
									{attempt.jlpt_level}
								</span>

								<span className="rounded bg-zinc-800 px-2 py-1 text-xs text-zinc-300">
									{attempt.category ?? "General"}
								</span>
							</div>
						</div>
					))}
				</div>
			)}
		</section>
	);
}
