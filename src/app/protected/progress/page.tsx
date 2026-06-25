import ProgressOverview from "@/components/progress-overview";
import RecentAttempts from "@/components/recent-attempts";
import SentencePerformance from "@/components/sentence-performance";
import { createClient } from "@/lib/supabase/server";

export default async function ProgressPage() {
	const supabase = await createClient();
	const { data: summary, error: progressOverviewError } = await supabase
		.from("attempts_summary")
		.select("*")
		.single();

	if (progressOverviewError || !summary) {
		return <div>Error loading progress overview stats. </div>;
	}

	const { total_attempts, average_score, sentences_practiced, days_practiced } =
		summary;

	const { data: recentAttempts, error: recentAttemptsError } = await supabase
		.from("recent_attempts")
		.select("*")
		.limit(10);

	const shouldShowSentencePerformance = (summary.sentences_practiced ?? 0) >= 2;

	const { data: strongestSentences, error: strongestSentencesError } =
		await supabase
			.from("sentence_progress")
			.select("*")
			.order("average_score", { ascending: false })
			.limit(5);

	const { data: weakestSentences, error: weakestSentencesError } =
		await supabase
			.from("sentence_progress")
			.select("*")
			.order("average_score", { ascending: true })
			.limit(5);

	return (
		<div className="mx-auto w-full max-w-6xl space-y-8 px-4 py-8">
			<ProgressOverview
				totalAttempts={total_attempts ?? 0}
				averageScore={average_score}
				sentencesPracticed={sentences_practiced ?? 0}
				daysPracticed={days_practiced ?? 0}
			/>
			{shouldShowSentencePerformance && (
				<SentencePerformance
					weakest={weakestSentences ?? []}
					strongest={strongestSentences ?? []}
					hasError={!!weakestSentencesError || !!strongestSentencesError}
				/>
			)}
			<RecentAttempts
				attempts={recentAttempts ?? []}
				hasError={!!recentAttemptsError}
			/>
		</div>
	);
}
