import { BookOpen, Flame, Target, type LucideIcon } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card";
import type { LearnerProgress } from "@/lib/progress";

export default function ProgressOverview({
  activity,
}: {
  activity: LearnerProgress["activity"];
}) {
  const stats: { label: string; value: number; icon: LucideIcon }[] = [
    {
      label: "Shadowing Attempts",
      value: activity.lessonsCompleted,
      icon: Target,
    },
    {
      label: "Lessons Shadowed",
      value: activity.lessonsPracticed,
      icon: BookOpen,
    },
    { label: "Days Practiced", value: activity.daysPracticed, icon: Flame },
  ];

  return (
    <section className="space-y-5 sm:space-y-6">
      <div className="space-y-1 sm:space-y-2">
        <h2 className="text-xl sm:text-2xl">Progress Overview</h2>
        <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
          A quick snapshot of your shadowing practice.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {stats.map(({ label, value, icon: Icon }) => (
          <Card key={label} className="shadow-sm">
            <CardHeader>
              <CardDescription className="flex items-center gap-2 font-medium">
                <span className="flex size-8 items-center justify-center rounded-full bg-accent-100 text-accent-700">
                  <Icon className="size-4" aria-hidden />
                </span>
                {label}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="font-heading text-4xl text-foreground sm:text-5xl">
                {value}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
