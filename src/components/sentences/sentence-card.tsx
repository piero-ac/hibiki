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
import {
  LESSON_STATUS_LABELS,
  type CatalogueEntry,
} from "@/lib/lesson-catalogue";

export default function SentenceCard({ entry }: { entry: CatalogueEntry }) {
  const { lesson, status, shadowingAttemptCount } = entry;

  return (
    <Card className="flex flex-col shadow-sm transition-all hover:-translate-y-1 hover:shadow-md">
      <CardHeader className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          {lesson.jlptLevel && (
            <Badge variant="secondary">{lesson.jlptLevel}</Badge>
          )}

          {lesson.category && (
            <Badge variant="outline">
              {lesson.category === "daily_conversation"
                ? "Conversation"
                : lesson.category}
            </Badge>
          )}

          {status && (
            <Badge
              variant={status === "new" ? "outline" : "default"}
              className="ml-auto"
              title={`Shadowed ${shadowingAttemptCount} ${
                shadowingAttemptCount === 1 ? "time" : "times"
              }`}
            >
              {LESSON_STATUS_LABELS[status]}
            </Badge>
          )}
        </div>

        <CardTitle className="line-clamp-3 font-japanese text-xl leading-relaxed">
          {lesson.sentence}
        </CardTitle>

        {lesson.translation && (
          <CardDescription className="line-clamp-2 leading-6">
            {lesson.translation}
          </CardDescription>
        )}
      </CardHeader>

      <CardFooter className="mt-auto">
        <Button asChild variant="outline" className="w-full">
          <Link href={`/protected/sentences/${lesson.id}`}>
            Practice Shadowing
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
