import { SectionHeader } from "@/components/app/section-header";
import { StatCard } from "@/components/app/stat-card";
import type { LearnerProgress } from "@/lib/progress";

export default function ProgressOverview({
  activity,
}: {
  activity: LearnerProgress["activity"];
}) {
  return (
    <section className="space-y-5 sm:space-y-6">
      <SectionHeader
        title="Progress Overview"
        description="A quick snapshot of your shadowing practice."
      />

      <div className="grid gap-3 sm:grid-cols-3">
        <StatCard
          label="Lessons Completed"
          value={activity.lessonsCompleted}
          emoji="🎯"
        />
        <StatCard
          label="Lessons Practiced"
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
