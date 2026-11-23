import { createClient } from "@/lib/supabase/server";
import { getLearnerProgress } from "@/lib/progress";
import ProgressOverview from "@/components/progress/progress-overview";
import RecentAttempts from "@/components/progress/recent-attempts";
import SentencePerformance from "@/components/progress/sentence-performance";
import { PageContainer } from "@/components/app/page-container";

export default async function ProgressPage() {
  const supabase = await createClient();
  const progress = await getLearnerProgress(supabase).catch(() => null);

  if (!progress) {
    return <div>Error loading progress overview stats. </div>;
  }

  const { scores } = progress;

  return (
    <PageContainer>
      <div className="space-y-8 sm:space-y-10">
        <div>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Progress
          </h1>
          <p className="mt-2 text-sm text-muted-foreground sm:text-base">
            Track your Japanese shadowing practice over time.
          </p>
        </div>
        <ProgressOverview progress={progress} />
        {scores?.lessonRanking && (
          <SentencePerformance
            weakest={scores.lessonRanking.weakest}
            strongest={scores.lessonRanking.strongest}
          />
        )}
        <RecentAttempts attempts={scores?.recentGradedAttempts ?? []} />
      </div>
    </PageContainer>
  );
}
