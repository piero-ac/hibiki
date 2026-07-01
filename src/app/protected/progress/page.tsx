import { createClient } from "@/lib/supabase/server";
import ProgressOverview from "@/components/progress/progress-overview";
import RecentAttempts from "@/components/progress/recent-attempts";
import SentencePerformance from "@/components/progress/sentence-performance";
import { PageContainer } from "@/components/app/page-container";

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
		<PageContainer>
			<div className="space-y-8 sm:space-y-10">
				<div>
					<h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
						Progress
					</h1>
					<p className="mt-2 text-sm text-muted-foreground sm:text-base">
						Track your Japanese shadowing practice over time.
					</p>
				</div>
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
		</PageContainer>
	);
}
