import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function PreviousAttemptsCard({
	attempts,
}: {
	attempts: {
		id: string;
		accuracy_score: number | null;
		created_at: string | null;
	}[];
}) {
	return (
		<Card className="h-fit shadow-sm lg:sticky lg:top-4">
			<CardHeader>
				<CardTitle className="text-base">Previous attempts</CardTitle>
				<CardDescription>
					{attempts.length
						? "Your last attempts for this sentence."
						: "No attempts yet for this sentence."}
				</CardDescription>
			</CardHeader>

			<CardContent>
				{!attempts.length ? (
					<p className="rounded-xl border bg-muted/40 p-4 text-sm text-muted-foreground">
						Try this sentence once to start tracking progress.
					</p>
				) : (
					<div className="space-y-1">
						{attempts.map((attempt) => {
							const score = Math.round(attempt.accuracy_score ?? 0);

							return (
								<div
									key={attempt.id}
									className="flex items-center justify-between rounded-lg px-3 py-2 transition-colors hover:bg-muted/50"
								>
									<div className="flex items-center gap-3">
										<span className="h-2 w-2 rounded-full bg-primary" />
										<div>
											<p className="text-sm font-semibold">{score}%</p>
											<p className="text-xs text-muted-foreground">
												{formatAttemptDate(attempt.created_at)}
											</p>
										</div>
									</div>

									<Badge variant="outline" className="text-xs">
										{getScoreLabel(score)}
									</Badge>
								</div>
							);
						})}
					</div>
				)}
			</CardContent>
		</Card>
	);
}

function formatAttemptDate(date: string | null) {
	if (!date) return "Unknown date";

	return new Intl.DateTimeFormat("en-US", {
		month: "short",
		day: "numeric",
	}).format(new Date(date));
}

function getScoreLabel(score: number) {
	if (score >= 95) return "Excellent";
	if (score >= 85) return "Great";
	if (score >= 70) return "Good";
	if (score >= 50) return "Practice";
	return "Retry";
}
