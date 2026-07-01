import { Button } from "@/components/ui/button";
import {
	Card,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

type Sentence = {
	id: string;
	japanese_text: string;
	english_text?: string | null;
	jlpt_level?: string | null;
	category?: string | null;
};

export type SentenceProgress = {
	sentence_id: string | null;
	average_score: number | null;
	attempt_count: number | null;
};

export default function SentenceCard({
	sentence,
	progress,
}: {
	sentence: Sentence;
	progress?: SentenceProgress;
}) {
	return (
		<Card className="flex flex-col shadow-sm transition-all hover:-translate-y-1 hover:shadow-md">
			<CardHeader className="space-y-3">
				<div className="flex flex-wrap items-center gap-2">
					{sentence.jlpt_level && (
						<Badge variant="secondary">{sentence.jlpt_level}</Badge>
					)}

					{sentence.category && (
						<Badge variant="outline">
							{sentence.category === "daily_conversation"
								? "Conversation"
								: sentence.category}
						</Badge>
					)}

					{progress ? (
						<Badge variant="default" className="ml-auto">
							Avg {Math.round(progress.average_score ?? 0)}% ·{" "}
							{progress.attempt_count ?? 0} attempts
						</Badge>
					) : (
						<Badge variant="outline" className="ml-auto">
							Not attempted
						</Badge>
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
