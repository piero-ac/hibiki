import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import ShadowingPlayer from "@/components/practice/shadowing-client-player";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import PreviousAttemptsCard from "@/components/practice/practice-attempt-card";
import { createClient } from "@/lib/supabase/server";

interface PageProps {
	params: Promise<{ id: string }>;
}

export default async function ShadowingPage({ params }: PageProps) {
	const { id } = await params;
	const supabase = await createClient();

	const { data: sentence, error } = await supabase
		.from("sentences")
		.select("*")
		.eq("id", id)
		.single();

	if (error || !sentence) {
		return (
			<main className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-background p-6 text-foreground">
				<Card className="w-full max-w-md text-center">
					<CardHeader>
						<CardTitle>Sentence not found</CardTitle>
					</CardHeader>
					<CardContent>
						<Button asChild variant="outline">
							<Link href="/protected/sentences">Back to sentences</Link>
						</Button>
					</CardContent>
				</Card>
			</main>
		);
	}

	const { data: recentAttempts } = await supabase
		.from("attempts")
		.select("id, accuracy_score, created_at")
		.eq("sentence_id", id)
		.order("created_at", { ascending: false })
		.limit(5);

	return (
		<main className="min-h-[calc(100vh-4rem)] bg-background px-4 py-4 text-foreground sm:px-6 lg:px-8">
			<section className="mx-auto flex w-full max-w-7xl flex-col">
				<div className="mb-3 flex items-center justify-between">
					<Button asChild variant="ghost" size="sm">
						<Link href="/protected/sentences">
							<ArrowLeft className="mr-2 h-4 w-4" />
							Sentences
						</Link>
					</Button>
				</div>

				<div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px] xl:grid-cols-[minmax(0,1fr)_360px]">
					<Card className="flex min-h-[calc(100vh-7rem)] flex-col shadow-sm">
						<CardHeader className="space-y-3 text-center">
							<div className="flex items-center justify-center gap-2">
								{sentence.jlpt_level && (
									<Badge variant="secondary">{sentence.jlpt_level}</Badge>
								)}

								{sentence.category && (
									<Badge variant="outline">{sentence.category}</Badge>
								)}
							</div>

							<CardTitle className="mx-auto max-w-4xl text-3xl font-bold leading-relaxed tracking-tight sm:text-4xl lg:text-5xl">
								{sentence.japanese_text}
							</CardTitle>

							{sentence.english_translation && (
								<p className="mx-auto max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
									{sentence.english_translation}
								</p>
							)}
						</CardHeader>

						<CardContent className="flex flex-1 items-center justify-center">
							<ShadowingPlayer
								originalAudioUrl={sentence.audio_prompt_url}
								expectedText={sentence.japanese_text}
								sentenceId={sentence.id}
							/>
						</CardContent>
					</Card>

					<PreviousAttemptsCard attempts={recentAttempts ?? []} />
				</div>
			</section>
		</main>
	);
}
