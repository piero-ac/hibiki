"use client";

import { Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getStep, STEP_COUNT, type StepNumber } from "@/lib/lesson-player";
import { cn } from "@/lib/utils";
import { STEP_NAMES } from "./step-copy";

type TrailStepStatus = "done" | "current" | "reached" | "locked";

interface StepTrailProps {
  current: StepNumber;
  /** After Mark Done every Step is ticked and none can be chosen. */
  complete: boolean;
  /** From the player: whether a Step can be gone to right now. */
  canGoTo: (step: number) => boolean;
  onSelect: (step: number) => void;
}

const STEP_NUMBERS = Array.from(
  { length: STEP_COUNT },
  (_, index) => (index + 1) as StepNumber,
);

/**
 * The seven Steps, grouped into the Slow Round, the Natural Round and Final.
 * Numbered circles on desktop, a segmented bar on phones (ADR 0002).
 */
export function StepTrail(props: StepTrailProps) {
  const steps = STEP_NUMBERS.map((number) => ({
    number,
    name: STEP_NAMES[getStep(number).type],
    status: trailStatus(number, props),
    enabled: !props.complete && props.canGoTo(number),
  }));

  return (
    <nav aria-label="Lesson Steps">
      <ol className="flex items-center gap-1.5 md:hidden">
        {steps.map((step) => (
          <li
            key={step.number}
            className={step.status === "current" ? "flex-[2.2]" : "flex-1"}
          >
            <Button
              onClick={() => props.onSelect(step.number)}
              disabled={!step.enabled}
              aria-label={`Step ${step.number}: ${step.name}`}
              aria-current={step.status === "current" ? "step" : undefined}
              variant="ghost"
              shape="pill"
              className="h-6 w-full p-0 hover:bg-transparent active:bg-transparent disabled:opacity-100"
            >
              <span
                className={cn(
                  "h-3 w-full rounded-full transition-colors",
                  SEGMENT_CLASSES[step.status],
                )}
              />
            </Button>
          </li>
        ))}
      </ol>
      <div
        aria-hidden
        className="flex justify-between pt-1 text-label text-neutral-700 md:hidden"
      >
        <span>Slow Round</span>
        <span>Natural Round</span>
        <span>Final</span>
      </div>

      <ol className="hidden grid-cols-7 gap-y-3 md:grid">
        <li aria-hidden className="col-span-3 flex justify-center">
          <Badge variant="accent-2" className="font-semibold">
            Slow Round
          </Badge>
        </li>
        <li aria-hidden className="col-span-3 flex justify-center">
          <Badge variant="accent" className="font-semibold">
            Natural Round
          </Badge>
        </li>
        <li aria-hidden className="flex justify-center">
          <Badge variant="secondary" className="font-semibold">
            Final
          </Badge>
        </li>
        {steps.map((step) => (
          <li
            key={step.number}
            className="relative flex flex-col items-center gap-2"
          >
            {step.number < STEP_COUNT && (
              <span
                aria-hidden
                className={cn(
                  "absolute top-[21px] right-[calc(-50%+30px)] left-[calc(50%+30px)] h-1 rounded-full",
                  step.status === "done" ? "bg-accent-2-500" : "bg-neutral-300",
                )}
              />
            )}
            <Button
              onClick={() => props.onSelect(step.number)}
              disabled={!step.enabled}
              aria-label={`Step ${step.number}: ${step.name}`}
              aria-current={step.status === "current" ? "step" : undefined}
              shape="pill"
              className={cn(
                "size-[46px] p-0 font-heading text-lg disabled:opacity-100 [&_svg:not([class*='size-'])]:size-5",
                CIRCLE_CLASSES[step.status],
              )}
            >
              {step.status === "done" ? <Check aria-hidden /> : step.number}
            </Button>
            <span
              aria-hidden
              className={cn(
                "max-w-28 text-center text-xs leading-tight text-balance",
                step.status === "current"
                  ? "font-bold text-foreground"
                  : "text-neutral-700",
              )}
            >
              {step.name}
            </span>
          </li>
        ))}
      </ol>
    </nav>
  );
}

function trailStatus(
  number: StepNumber,
  { current, complete, canGoTo }: StepTrailProps,
): TrailStepStatus {
  if (complete || number < current) return "done";
  if (number === current) return "current";
  return canGoTo(number) ? "reached" : "locked";
}

const SEGMENT_CLASSES: Record<TrailStepStatus, string> = {
  done: "bg-accent-2-500",
  current: "bg-primary ring-4 ring-accent-200",
  reached: "bg-accent-2-200",
  locked: "bg-neutral-300",
};

const CIRCLE_CLASSES: Record<TrailStepStatus, string> = {
  done: "bg-accent-2-500 text-primary-foreground hover:bg-accent-2-600 active:bg-accent-2-700",
  current: "bg-primary text-primary-foreground ring-6 ring-accent-200",
  reached:
    "bg-accent-2-200 text-accent-2-800 hover:bg-accent-2-300 active:bg-accent-2-400",
  locked: "bg-neutral-100 text-neutral-600",
};
