import { BookOpenIcon } from "@phosphor-icons/react/dist/ssr";
import { EmptyState } from "@/components/app/empty-state";

/** Shown in place of Activity for a Learner with no Shadowing Attempts. */
export default function NoActivityYet() {
  return (
    <EmptyState
      icon={<BookOpenIcon className="h-10 w-10" />}
      title="No Lessons completed yet"
      description="Work through a Lesson and press Mark Done in the Final Recording step. Your practice will show up here."
    />
  );
}
