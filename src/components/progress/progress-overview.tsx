import { SectionHeader } from "@/components/app/section-header";
import { StatCard } from "@/components/app/stat-card";
import type { LearnerProgress } from "@/lib/progress";

export default function ProgressOverview({
  progress: { activity, scores },
}: {
  progress: LearnerProgress;
}) {
  return (
    <section className="space-y-5 sm:space-y-6">
      <SectionHeader
        title="Progress Overview"
        description="A quick snapshot of your shadowing practice."
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Attempts"
          value={activity.totalAttempts}
          emoji="🎯"
        />
        <StatCard
          label="Average Score"
          value={scores ? `${scores.averageAccuracyScore}%` : "0%"}
          emoji="📈"
        />
        <StatCard
          label="Sentences Practiced"
          value={activity.lessonsPracticed}
          emoji="📚"
        />
        <StatCard
          label="Days Practiced"
          value={activity.daysPracticed}
          emoji="🔥"
        />
      </div>
    </section>
  );
}
