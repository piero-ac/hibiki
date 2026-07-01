// components/sentence-performance.tsx

import { Database } from "@/types/database.types";

type SentenceProgress = Database["public"]["Views"]["sentence_progress"]["Row"];

interface SentencePerformanceProps {
	weakest: SentenceProgress[];
	strongest: SentenceProgress[];
	hasError: boolean;
}

export default function SentencePerformance({
	weakest,
	strongest,
	hasError,
}: SentencePerformanceProps) {
	if (hasError) {
		return (
			<section className="space-y-2">
				<h2 className="text-lg font-semibold text-white">
					Sentence Performance
				</h2>
				<p className="text-sm text-red-400">
					Unable to load sentence performance.
				</p>
			</section>
		);
	}
	return (
		<section className="space-y-4">
			<div>
				<h2 className="text-lg font-semibold text-white">
					Sentence Performance
				</h2>
				<p className="text-sm text-zinc-400">
					See which sentences need more practice and which ones you&:aposve
					mastered.
				</p>
			</div>

			<div className="grid gap-4 md:grid-cols-2">
				<PerformanceColumn title="Needs Practice" sentences={weakest} />

				<PerformanceColumn title="Strongest Sentences" sentences={strongest} />
			</div>
		</section>
	);
}

function PerformanceColumn({
	title,
	sentences,
}: {
	title: string;
	sentences: SentenceProgress[];
}) {
	return (
		<div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4">
			<h3 className="font-semibold text-white">{title}</h3>

			{sentences.length === 0 ? (
				<p className="mt-3 text-sm text-zinc-400">No sentence data yet.</p>
			) : (
				<div className="mt-4 space-y-3">
					{sentences.map((sentence) => (
						<div
							key={sentence.sentence_id!}
							className="rounded-lg border border-zinc-800 bg-zinc-950 p-3"
						>
							<p className="text-lg font-bold text-emerald-300">
								{sentence.average_score ?? 0}%
							</p>

							<p className="mt-2 text-sm font-medium text-white">
								{sentence.japanese_text ?? "Unknown sentence"}
							</p>

							<p className="mt-2 text-xs text-zinc-400">
								Attempts: {sentence.attempt_count ?? 0}
							</p>

							<div className="mt-3 flex gap-2">
								<span className="rounded bg-zinc-800 px-2 py-1 text-xs text-zinc-300">
									{sentence.jlpt_level ?? "—"}
								</span>

								<span className="rounded bg-zinc-800 px-2 py-1 text-xs text-zinc-300">
									{sentence.category ?? "General"}
								</span>
							</div>
						</div>
					))}
				</div>
			)}
		</div>
	);
}
