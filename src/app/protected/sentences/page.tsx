import { BookOpenText } from "lucide-react";
import { PageContainer } from "@/components/app/page-container";
import { Badge } from "@/components/ui/badge";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import SentenceCard, {
	type SentenceProgress,
} from "@/components/sentences/sentence-card";

export default async function Sentences() {
	const supabase = await createClient();

	const { data: sentences, error: sentencesError } = await supabase
		.from("sentences")
		.select("*")
		.order("jlpt_level", { ascending: true })
		.order("category", { ascending: true });

	if (sentencesError) {
		return (
			<PageContainer>
				<Card>
					<CardHeader>
						<CardTitle>Error loading sentences</CardTitle>
						<CardDescription>
							There was a problem loading your practice library.
						</CardDescription>
					</CardHeader>
				</Card>
			</PageContainer>
		);
	}

	const { data: sentenceProgress, error: sentenceProgressError } =
		await supabase
			.from("sentence_progress")
			.select("sentence_id, average_score, attempt_count");

	const progressBySentenceId = sentenceProgressError
		? new Map<string, SentenceProgress>()
		: new Map(
				sentenceProgress
					?.filter((progress) => progress.sentence_id !== null)
					.map((progress) => [progress.sentence_id as string, progress]) ?? [],
			);

	return (
		<PageContainer>
			<div className="space-y-8">
				<div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
					<div>
						<h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
							Practice Sentences
						</h1>
						<p className="mt-2 text-sm text-muted-foreground sm:text-base">
							Browse all available N2 and N1 shadowing exercises.
						</p>
					</div>

					<Badge variant="secondary" className="w-fit">
						{sentences?.length ?? 0} sentences
					</Badge>
				</div>

				{sentenceProgressError && (
					<Card className="border-dashed">
						<CardContent className="py-4 text-sm text-muted-foreground">
							Sentence progress could not be loaded, but your practice library
							is still available.
						</CardContent>
					</Card>
				)}

				{!sentences?.length ? (
					<Card>
						<CardContent className="flex flex-col items-center justify-center py-16 text-center">
							<div className="mb-4 rounded-full bg-muted p-4">
								<BookOpenText className="h-8 w-8 text-muted-foreground" />
							</div>

							<h2 className="text-xl font-semibold">No sentences found</h2>
							<p className="mt-2 max-w-md text-sm text-muted-foreground">
								Once sentences are added, they&apos;ll appear here for shadowing
								practice.
							</p>
						</CardContent>
					</Card>
				) : (
					<div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
						{sentences.map((sentence) => (
							<SentenceCard
								key={sentence.id}
								sentence={sentence}
								progress={progressBySentenceId.get(sentence.id)}
							/>
						))}
					</div>
				)}
			</div>
		</PageContainer>
	);
}
