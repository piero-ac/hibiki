import Link from "next/link";
import type { ComponentProps } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { STEP_COUNT } from "@/lib/lesson-player";

export const LESSONS_HREF = "/protected/sentences";
export const HOME_HREF = "/protected";

type LessonExitProps = Omit<ComponentProps<typeof Button>, "asChild"> & {
  href: string;
  /**
   * Set while leaving would throw away the Learner's place: the exit then
   * asks first. `step` is the Step the Learner is on.
   */
  confirm?: { step: number } | false;
};

/**
 * Every way out of the Lesson player goes through here, so leaving can be
 * intercepted in one place.
 */
export function LessonExit({
  href,
  confirm,
  children,
  ...buttonProps
}: LessonExitProps) {
  if (!confirm) {
    return (
      <Button asChild {...buttonProps}>
        <Link href={href}>{children}</Link>
      </Button>
    );
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button {...buttonProps}>{children}</Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Leave this Lesson?</AlertDialogTitle>
          <AlertDialogDescription>
            You&apos;re on Step {confirm.step} of {STEP_COUNT}. Steps
            aren&apos;t saved, so next time this Lesson starts again from Step
            1.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction variant="secondary" asChild>
            <Link href={href}>Leave Lesson</Link>
          </AlertDialogAction>
          <AlertDialogCancel variant="default">
            Keep shadowing
          </AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
