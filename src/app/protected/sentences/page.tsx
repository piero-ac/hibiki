import Link from "next/link";
import { ArrowRight, BookOpenText } from "lucide-react";

import { PageContainer } from "@/components/app/page-container";
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
import { createClient } from "@/lib/supabase/server";

export default async function Sentences() {
	const supabase = await createClient();

	const { data: sentences, error } = await supabase
		.from("sentences")
		.select("*")
		.order("jlpt_level", { ascending: true })
		.order("category", { ascending: true });

	if (error) {
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
							<SentenceCard key={sentence.id} sentence={sentence} />
						))}
					</div>
				)}
			</div>
		</PageContainer>
	);
}

function SentenceCard({
	sentence,
}: {
	sentence: {
		id: string;
		japanese_text: string;
		english_text?: string | null;
		jlpt_level?: string | null;
		category?: string | null;
	};
}) {
	return (
		<Card className="flex flex-col shadow-sm transition-all hover:-translate-y-1 hover:shadow-md">
			<CardHeader className="space-y-3">
				<div className="flex flex-wrap gap-2">
					{sentence.jlpt_level && (
						<Badge variant="secondary">{sentence.jlpt_level}</Badge>
					)}

					{sentence.category && (
						<Badge variant="outline">{sentence.category}</Badge>
					)}
				</div>

				<CardTitle className="line-clamp-3 text-xl leading-relaxed">
					{sentence.japanese_text}
				</CardTitle>

				{sentence.english_text && (
					<CardDescription className="line-clamp-2 leading-6">
						{sentence.english_text}
					</CardDescription>
				)}
			</CardHeader>

			<CardFooter className="mt-auto">
				<Button asChild variant="outline" className="w-full">
					<Link href={`/protected/sentences/${sentence.id}`}>
						Practice Shadowing
						<ArrowRight className="ml-2 h-4 w-4" />
					</Link>
				</Button>
			</CardFooter>
		</Card>
	);
}
