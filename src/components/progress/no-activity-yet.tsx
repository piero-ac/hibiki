import { BookOpen } from "lucide-react";

import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

/** Shown in place of Activity for a Learner with no Shadowing Attempts. */
export default function NoActivityYet() {
  return (
    <Empty className="rounded-2xl border bg-card p-8 sm:p-12">
      <EmptyHeader>
        <EmptyMedia
          variant="icon"
          className="size-12 rounded-full bg-accent-100 text-accent-700"
        >
          <BookOpen />
        </EmptyMedia>
        <EmptyTitle>No Lessons completed yet</EmptyTitle>
        <EmptyDescription>
          Work through a Lesson and press Mark Done in the Final Recording step.
          Your practice will show up here.
        </EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
}
