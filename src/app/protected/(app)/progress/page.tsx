import { CircleAlert } from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { getLearnerProgress } from "@/lib/progress";
import ProgressOverview from "@/components/progress/progress-overview";
import RecentActivity from "@/components/progress/recent-activity";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

export default async function ProgressPage() {
  const supabase = await createClient();
  const progress = await getLearnerProgress(supabase).catch(() => null);

  if (!progress) {
    return (
      <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        <Empty className="rounded-2xl border bg-card p-8 sm:p-12">
          <EmptyHeader>
            <EmptyMedia
              variant="icon"
              className="size-12 rounded-full bg-destructive/10 text-destructive"
            >
              <CircleAlert />
            </EmptyMedia>
            <EmptyTitle>Couldn&apos;t load your progress</EmptyTitle>
            <EmptyDescription>
              Something went wrong loading your Activity. Try again in a moment.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      </div>
    );
  }

  // Scores are hidden for now, so only Activity is shown.
  const { activity } = progress;

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      <div className="space-y-8 sm:space-y-10">
        <div>
          <h1 className="text-3xl sm:text-4xl">Progress</h1>
          <p className="mt-2 text-sm text-muted-foreground sm:text-base">
            Track your Japanese shadowing practice over time.
          </p>
        </div>
        <ProgressOverview activity={activity} />
        <RecentActivity attempts={activity.recentShadowingAttempts} />
      </div>
    </div>
  );
}
