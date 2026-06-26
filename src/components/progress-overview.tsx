import { SectionHeader } from "@/components/app/section-header";
import { StatCard } from "@/components/app/stat-card";

type ProgressOverviewProps = {
	totalAttempts: number;
	averageScore: number | null;
	sentencesPracticed: number;
	daysPracticed: number;
};

export default function ProgressOverview({
	totalAttempts,
	averageScore,
	sentencesPracticed,
	daysPracticed,
}: ProgressOverviewProps) {
	return (
		<section className="space-y-5 sm:space-y-6">
			<SectionHeader
				title="Progress Overview"
				description="A quick snapshot of your shadowing practice."
			/>

			<div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
				<StatCard label="Total Attempts" value={totalAttempts} emoji="🎯" />
				<StatCard
					label="Average Score"
					value={averageScore !== null ? `${averageScore}%` : "—"}
					emoji="📈"
				/>
				<StatCard
					label="Sentences Practiced"
					value={sentencesPracticed}
					emoji="📚"
				/>
				<StatCard label="Days Practiced" value={daysPracticed} emoji="🔥" />
			</div>
		</section>
	);
}
