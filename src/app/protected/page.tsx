import Link from "next/link";
import { redirect } from "next/navigation";
import {
	ArrowRight,
	BarChart3,
	BookOpenText,
	Headphones,
	Dices,
} from "lucide-react";

import { createClient } from "@/lib/supabase/server";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

import { PageContainer } from "@/components/app/page-container";
import ProgressOverview from "@/components/progress/progress-overview";

export default async function HomeDashboard() {
	const supabase = await createClient();

	const { data: claims, error: authError } = await supabase.auth.getClaims();

	if (authError || !claims?.claims) {
		redirect("/auth/login");
	}

	const { data: summary, error: summaryError } = await supabase
		.from("attempts_summary")
		.select("*")
		.single();

	if (summaryError || !summary) {
		return <div>Error loading dashboard.</div>;
	}

	return (
		<PageContainer>
			<div className="space-y-8">
				{/* Hero */}
				<Card>
					<CardHeader className="space-y-4">
						<Badge variant="secondary" className="w-fit">
							Hibiki Dashboard
						</Badge>

						<div>
							<CardTitle className="text-3xl sm:text-4xl">
								Welcome back.
							</CardTitle>

							<CardDescription className="mt-2 max-w-2xl text-base leading-7">
								Continue improving your Japanese pronunciation one shadowing
								session at a time.
							</CardDescription>
						</div>
					</CardHeader>

					<CardContent>
						<Button asChild size="lg">
							<Link href="/protected/sentences/random">
								<Dices className="mr-2 h-4 w-4" />
								Practice a Random Sentence
								<ArrowRight className="ml-2 h-4 w-4" />
							</Link>
						</Button>
					</CardContent>
				</Card>

				{/* Quick Actions */}
				<div className="grid gap-4 md:grid-cols-3">
					<ActionCard
						icon={<BookOpenText className="h-5 w-5" />}
						title="Practice Sentences"
						description="Browse all available N2 and N1 shadowing sentences."
						href="/protected/sentences"
						buttonText="Browse"
					/>

					<ActionCard
						icon={<BarChart3 className="h-5 w-5" />}
						title="Progress"
						description="Review your attempts, scores and practice history."
						href="/protected/progress"
						buttonText="View Progress"
					/>

					<ActionCard
						icon={<Headphones className="h-5 w-5" />}
						title="Continue Practicing"
						description="Pick another sentence and keep improving."
						href="/protected/sentences"
						buttonText="Continue"
					/>
				</div>

				{/* Snapshot */}
				<div className="space-y-4">
					<div>
						<h2 className="text-xl font-semibold">Quick Snapshot</h2>

						<p className="text-sm text-muted-foreground">
							A quick overview of your progress.
						</p>
					</div>

					<ProgressOverview
						totalAttempts={summary.total_attempts ?? 0}
						averageScore={summary.average_score}
						sentencesPracticed={summary.sentences_practiced ?? 0}
						daysPracticed={summary.days_practiced ?? 0}
					/>
				</div>
			</div>
		</PageContainer>
	);
}

function ActionCard({
	icon,
	title,
	description,
	href,
	buttonText,
}: {
	icon: React.ReactNode;
	title: string;
	description: string;
	href: string;
	buttonText: string;
}) {
	return (
		<Card className="flex flex-col transition-all hover:-translate-y-1 hover:shadow-md">
			<CardHeader>
				<div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
					{icon}
				</div>

				<CardTitle>{title}</CardTitle>

				<CardDescription>{description}</CardDescription>
			</CardHeader>

			<CardFooter className="mt-auto">
				<Button asChild variant="outline" className="w-full">
					<Link href={href}>{buttonText}</Link>
				</Button>
			</CardFooter>
		</Card>
	);
}
