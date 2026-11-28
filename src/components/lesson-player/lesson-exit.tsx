import Link from "next/link";
import type { ComponentProps } from "react";
import { Button } from "@/components/ui/button";

export const LESSONS_HREF = "/protected/sentences";
export const HOME_HREF = "/protected";

type LessonExitProps = Omit<ComponentProps<typeof Button>, "asChild"> & {
  href: string;
};

/**
 * Every way out of the Lesson player goes through here, so leaving can be
 * intercepted in one place.
 */
export function LessonExit({
  href,
  children,
  ...buttonProps
}: LessonExitProps) {
  return (
    <Button asChild {...buttonProps}>
      <Link href={href}>{children}</Link>
    </Button>
  );
}
