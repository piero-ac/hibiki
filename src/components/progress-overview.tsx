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
	const stats = [
		{
			label: "Total Attempts",
			value: totalAttempts,
		},
		{
			label: "Average Score",
			value: averageScore !== null ? `${averageScore}%` : "—",
		},
		{
			label: "Sentences Practiced",
			value: sentencesPracticed,
		},
		{
			label: "Days Practiced",
			value: daysPracticed,
		},
	];

	return (
		<section className="space-y-4">
			<div>
				<h2 className="text-lg font-semibold text-white">Progress Overview</h2>
				<p className="text-sm text-zinc-400">
					A quick snapshot of your shadowing practice.
				</p>
			</div>

			<div className="grid grid-cols-2 gap-3">
				{stats.map((stat) => (
					<div
						key={stat.label}
						className="rounded-xl border border-zinc-800 bg-zinc-900 p-4"
					>
						<p className="text-xs font-medium text-zinc-400">{stat.label}</p>
						<p className="mt-2 text-2xl font-bold text-white">{stat.value}</p>
					</div>
				))}
			</div>
		</section>
	);
}
