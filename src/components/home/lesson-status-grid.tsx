import Link from "next/link";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import {
  LESSON_STATUS_LABELS,
  type CatalogueEntry,
  type JlptLevelGroup,
  type LessonStatus,
} from "@/lib/lesson-catalogue";

const STATUS_DOT: Record<LessonStatus, string> = {
  new: "bg-neutral-300",
  shadowed: "bg-accent-2-300",
  "shadowed-3-plus": "bg-accent-2-700",
};

/** Uncoloured, for when the Shadowing Attempt counts couldn't be loaded. */
const UNKNOWN_DOT = "border-2 border-neutral-400";

function shadowedCount(group: JlptLevelGroup) {
  return group.entries.filter(
    (entry) =>
      entry.status === "shadowed" || entry.status === "shadowed-3-plus",
  ).length;
}

function LessonDot({ entry, index }: { entry: CatalogueEntry; index: number }) {
  const { lesson, status } = entry;
  const label = `${lesson.jlptLevel} Lesson ${index + 1}${
    status ? `, ${LESSON_STATUS_LABELS[status]}` : ""
  }: ${lesson.sentence}`;

  return (
    <Link
      href={`/protected/sentences/${lesson.id}`}
      // Hundreds of cells: don't prefetch every Lesson as the grid scrolls in.
      prefetch={false}
      aria-label={label}
      title={label}
      className={cn(
        "aspect-square rounded-full transition-transform hover:scale-125 hover:ring-2 hover:ring-primary active:scale-110",
        status ? STATUS_DOT[status] : UNKNOWN_DOT,
      )}
    />
  );
}

function DotGrid({ entries }: { entries: CatalogueEntry[] }) {
  return (
    <div className="grid grid-cols-10 gap-1">
      {entries.map((entry, index) => (
        <LessonDot key={entry.lesson.id} entry={entry} index={index} />
      ))}
    </div>
  );
}

function LevelCount({
  group,
  statusesKnown,
}: {
  group: JlptLevelGroup;
  statusesKnown: boolean;
}) {
  return (
    <span className="text-[13px] text-muted-foreground tabular-nums">
      {statusesKnown
        ? `${shadowedCount(group)}/${group.entries.length}`
        : group.entries.length}
    </span>
  );
}

function Legend() {
  return (
    <ul className="flex flex-wrap gap-x-3.5 gap-y-1 text-xs text-muted-foreground">
      {(Object.keys(STATUS_DOT) as LessonStatus[]).map((status) => (
        <li key={status} className="flex items-center gap-1.5">
          <span
            aria-hidden
            className={cn("size-2.5 rounded-full", STATUS_DOT[status])}
          />
          {LESSON_STATUS_LABELS[status]}
        </li>
      ))}
    </ul>
  );
}

/**
 * Every Lesson, grouped by JLPT Level, one cell per Lesson coloured by its
 * Lesson Status. An Accordion per level on phones; a row of level cards on
 * desktop.
 */
export function LessonStatusGrid({ groups }: { groups: JlptLevelGroup[] }) {
  const statusesKnown = groups.some((group) =>
    group.entries.some((entry) => entry.status !== null),
  );

  return (
    <section
      aria-labelledby="lessons-by-level"
      className="flex flex-col gap-3 md:gap-3.5"
    >
      <div className="flex flex-col gap-2 px-1 md:flex-row md:items-baseline md:gap-4 md:px-0">
        <h2 id="lessons-by-level" className="text-[19px] md:text-2xl">
          Lessons by level
        </h2>
        {statusesKnown ? (
          <div className="md:ml-auto">
            <Legend />
          </div>
        ) : (
          <p className="text-xs text-muted-foreground md:ml-auto">
            Your Lesson history couldn&apos;t be loaded, so Lessons aren&apos;t
            coloured by status.
          </p>
        )}
      </div>

      {/* Phone: one Accordion item per JLPT Level. */}
      <Accordion type="multiple" className="rounded-none border-0 md:hidden">
        {groups.map((group) => (
          <AccordionItem
            key={group.jlptLevel}
            value={group.jlptLevel}
            className="border-0 data-open:bg-transparent"
          >
            <AccordionTrigger className="min-h-13 items-center gap-3.5 px-1 py-2 hover:no-underline">
              <span className="w-10 font-heading text-lg">
                {group.jlptLevel}
              </span>
              {statusesKnown ? (
                <Progress
                  aria-label={`${group.jlptLevel} Lessons shadowed`}
                  value={(shadowedCount(group) / group.entries.length) * 100}
                  className="h-2.5 flex-1 bg-neutral-300 **:data-[slot=progress-indicator]:bg-accent-2-600"
                />
              ) : (
                <span className="flex-1" />
              )}
              <span className="w-12 text-right">
                <LevelCount group={group} statusesKnown={statusesKnown} />
              </span>
            </AccordionTrigger>
            <AccordionContent className="px-1 pt-1 pb-4">
              <DotGrid entries={group.entries} />
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      {/* Desktop: a card per JLPT Level, side by side. */}
      <div className="hidden grid-cols-5 gap-3.5 md:grid">
        {groups.map((group) => (
          <div
            key={group.jlptLevel}
            className="flex flex-col gap-3 rounded-2xl bg-card px-4.5 pt-4.5 pb-5 transition-shadow hover:shadow-md"
          >
            <div className="flex items-baseline justify-between">
              <h3 className="text-[30px] leading-none">{group.jlptLevel}</h3>
              <LevelCount group={group} statusesKnown={statusesKnown} />
            </div>
            <DotGrid entries={group.entries} />
          </div>
        ))}
      </div>
    </section>
  );
}
