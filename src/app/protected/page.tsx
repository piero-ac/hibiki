import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowRight,
  BarChart3,
  BookOpenText,
  Headphones,
  Dices,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getLearnerProgress } from "@/lib/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import ActionCard from "@/components/dashboard/action-card";

import { PageContainer } from "@/components/app/page-container";
import ProgressOverview from "@/components/progress/progress-overview";
import NoActivityYet from "@/components/progress/no-activity-yet";

export default async function HomeDashboard() {
  const supabase = await createClient();

  const { data: claims, error: authError } = await supabase.auth.getClaims();

  if (authError || !claims?.claims) {
    redirect("/auth/login");
  }

  const progress = await getLearnerProgress(supabase).catch(() => null);

  if (!progress) {
    return <div>Error loading dashboard.</div>;
  }

  return (
    <PageContainer>
      <div className="space-y-8">
        {/* Hero */}
        <Card>
          <CardHeader className="space-y-4">
            <Badge variant="secondary" className="w-fit">
              Hibiki Dashboard
            </Badge>

            <div>
              <CardTitle className="text-3xl sm:text-4xl">
                Welcome back.
              </CardTitle>

              <CardDescription className="mt-2 max-w-2xl text-base leading-7">
                Continue improving your Japanese pronunciation one shadowing
                session at a time.
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent>
            <Button asChild size="lg">
              <Link href="/protected/sentences/random">
                <Dices className="mr-2 h-4 w-4" />
                Practice a Random Sentence
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid gap-4 md:grid-cols-3">
          <ActionCard
            icon={<BookOpenText className="h-5 w-5" />}
            title="Practice Sentences"
            description="Browse all available N2 and N1 shadowing sentences."
            href="/protected/sentences"
            buttonText="Browse"
          />

          <ActionCard
            icon={<BarChart3 className="h-5 w-5" />}
            title="Progress"
            description="Review the Lessons you have completed and your practice history."
            href="/protected/progress"
            buttonText="View Progress"
          />

          <ActionCard
            icon={<Headphones className="h-5 w-5" />}
            title="Continue Practicing"
            description="Pick another sentence and keep improving."
            href="/protected/sentences"
            buttonText="Continue"
          />
        </div>

        {/* Snapshot */}
        <div className="space-y-4">
          <ProgressOverview activity={progress.activity} />
          {progress.activity.lessonsCompleted === 0 && <NoActivityYet />}
        </div>
      </div>
    </PageContainer>
  );
}
