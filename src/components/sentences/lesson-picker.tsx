"use client";

import Link from "next/link";
import { useState, useSyncExternalStore } from "react";
import { ArrowRight, SearchX, Shuffle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerTitle,
} from "@/components/ui/drawer";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  JLPT_LEVELS,
  LESSON_STATUS_LABELS,
  filterCatalogue,
  listCategories,
  type CatalogueEntry,
  type CatalogueFilters,
  type LessonStatus,
} from "@/lib/lesson-catalogue";
import { cn } from "@/lib/utils";

const LESSON_STATUSES = Object.keys(LESSON_STATUS_LABELS) as LessonStatus[];

const STATUS_BADGE_VARIANT = {
  new: "secondary",
  shadowed: "accent-2",
  "shadowed-3-plus": "accent-2",
} as const satisfies Record<LessonStatus, string>;

// Matches Tailwind's `lg` breakpoint, where the preview sits beside the list.
const DESKTOP_QUERY = "(min-width: 64rem)";

function subscribeToDesktop(onChange: () => void) {
  const query = window.matchMedia(DESKTOP_QUERY);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

function useIsDesktop() {
  return useSyncExternalStore(
    subscribeToDesktop,
    () => window.matchMedia(DESKTOP_QUERY).matches,
    () => false,
  );
}

function categoryLabel(category: string) {
  return category === "daily_conversation" ? "Conversation" : category;
}

type LessonPickerProps = {
  catalogue: CatalogueEntry[];
  /** False when the Shadowing Attempt counts couldn't be loaded. */
  statusesAvailable: boolean;
};

export function LessonPicker({
  catalogue,
  statusesAvailable,
}: LessonPickerProps) {
  const [filters, setFilters] = useState<CatalogueFilters>({
    jlptLevel: "all",
    category: "all",
    status: "all",
  });
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const isDesktop = useIsDesktop();

  const { entries, count } = filterCatalogue(catalogue, filters);
  const categories = listCategories(catalogue);
  const selected =
    entries.find((entry) => entry.lesson.id === selectedId) ?? entries[0];

  function setFilter<K extends keyof CatalogueFilters>(
    key: K,
    value: CatalogueFilters[K] | "",
  ) {
    // A single ToggleGroup sends "" when the pressed item is pressed again.
    if (value) setFilters((current) => ({ ...current, [key]: value }));
  }

  function select(id: string) {
    setSelectedId(id);
    if (!isDesktop) setDrawerOpen(true);
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-5 px-5 py-6 sm:px-6 lg:gap-6 lg:px-9 lg:py-8">
      <div className="flex flex-wrap items-end gap-4">
        <div className="mr-auto flex flex-col gap-1">
          <h1 className="text-3xl lg:text-4xl">Pick a Lesson</h1>
          <p className="text-sm text-neutral-800 sm:text-base">
            One Sentence, seven Steps, about five minutes.
          </p>
        </div>

        <Button asChild variant="secondary" shape="pill" size="lg">
          <Link href="/protected/sentences/random">
            <Shuffle />
            Surprise me
          </Link>
        </Button>
      </div>

      <div className="flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-center lg:gap-3.5">
        <ToggleGroup
          type="single"
          spacing={0}
          value={filters.jlptLevel}
          onValueChange={(value) =>
            setFilter("jlptLevel", value as CatalogueFilters["jlptLevel"])
          }
          aria-label="JLPT Level"
          className="w-full overflow-hidden rounded-full border border-border bg-neutral-100 lg:w-fit"
        >
          {(["all", ...JLPT_LEVELS] as const).map((level) => (
            <ToggleGroupItem
              key={level}
              value={level}
              className="h-10 flex-1 border-border font-semibold not-first:border-l data-[state=on]:bg-primary data-[state=on]:text-primary-foreground data-[state=on]:hover:bg-accent-600 lg:flex-none lg:px-4"
            >
              {level === "all" ? "All" : level}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>

        <ToggleGroup
          type="single"
          variant="outline"
          value={filters.category}
          onValueChange={(value) => setFilter("category", value)}
          aria-label="Category"
          className="-mx-5 w-auto max-w-none overflow-x-auto px-5 pb-1 sm:-mx-6 sm:px-6 lg:mx-0 lg:flex-wrap lg:overflow-visible lg:px-0 lg:pb-0"
        >
          {["all", ...categories].map((category) => (
            <ToggleGroupItem
              key={category}
              value={category}
              className="h-10 font-semibold data-[state=on]:border-accent-2-600 data-[state=on]:bg-accent-2-600 data-[state=on]:text-background data-[state=on]:hover:bg-accent-2-700"
            >
              {category === "all" ? "All" : categoryLabel(category)}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>

        <Select
          value={filters.status}
          onValueChange={(value) =>
            setFilter("status", value as CatalogueFilters["status"])
          }
          disabled={!statusesAvailable}
        >
          <SelectTrigger
            aria-label="Lesson Status"
            className="w-full font-semibold data-[size=default]:h-10 sm:w-52 lg:ml-auto"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Any Lesson Status</SelectItem>
            {LESSON_STATUSES.map((status) => (
              <SelectItem key={status} value={status}>
                {LESSON_STATUS_LABELS[status]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {!statusesAvailable && (
        <p className="text-sm text-muted-foreground">
          Your Lesson history couldn&apos;t be loaded, but every Lesson is still
          here.
        </p>
      )}

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_400px]">
        <div className="flex flex-col gap-1.5">
          <p
            aria-live="polite"
            className="px-1.5 pb-1 text-sm text-muted-foreground"
          >
            {count === 1 ? "1 Lesson" : `${count} Lessons`}
          </p>

          {count === 0 ? (
            <Empty className="border border-border">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <SearchX />
                </EmptyMedia>
                <EmptyTitle>No Lessons match these filters</EmptyTitle>
                <EmptyDescription>
                  Try another JLPT Level, Category or Lesson Status.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            <ul className="-mx-2 flex flex-col gap-1 sm:mx-0">
              {entries.map((entry) => (
                <li key={entry.lesson.id}>
                  <LessonRow
                    entry={entry}
                    selected={entry === selected}
                    onSelect={() => select(entry.lesson.id)}
                  />
                </li>
              ))}
            </ul>
          )}
        </div>

        {selected && (
          <aside
            aria-label="Lesson preview"
            className="sticky top-24 hidden overflow-hidden rounded-3xl bg-card p-7 shadow-sm lg:block"
          >
            <LessonPreview entry={selected} />
          </aside>
        )}
      </div>

      <Drawer open={drawerOpen && !isDesktop} onOpenChange={setDrawerOpen}>
        <DrawerContent>
          <DrawerTitle className="sr-only">Lesson preview</DrawerTitle>
          <DrawerDescription className="sr-only">
            The selected Lesson and a button to start it.
          </DrawerDescription>
          <div className="overflow-y-auto px-4 pt-2 pb-4">
            {selected && <LessonPreview entry={selected} />}
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  );
}

function LessonTags({ entry }: { entry: CatalogueEntry }) {
  const { jlptLevel, category } = entry.lesson;
  return (
    <>
      <Badge variant="accent" className="font-semibold">
        {jlptLevel}
      </Badge>
      {category && (
        <Badge variant="accent-2" className="font-semibold">
          {categoryLabel(category)}
        </Badge>
      )}
    </>
  );
}

function LessonRow({
  entry,
  selected,
  onSelect,
}: {
  entry: CatalogueEntry;
  selected: boolean;
  onSelect: () => void;
}) {
  const { lesson, status } = entry;
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-current={selected ? "true" : undefined}
      className={cn(
        "flex w-full flex-col gap-2 rounded-xl p-3 text-left transition-colors hover:bg-card focus-visible:outline-2 focus-visible:outline-ring sm:rounded-3xl sm:px-4.5 sm:py-3.5",
        selected && "bg-card lg:shadow-md",
      )}
    >
      <span className="line-clamp-2 font-japanese text-body leading-normal font-bold sm:text-lead">
        {lesson.sentence}
      </span>
      <span className="hidden truncate text-sm text-muted-foreground sm:block">
        {lesson.translation}
      </span>
      <span className="flex flex-wrap items-center gap-1.5">
        <LessonTags entry={entry} />
        {status && (
          <Badge
            variant={STATUS_BADGE_VARIANT[status]}
            className="ml-auto font-semibold"
          >
            {LESSON_STATUS_LABELS[status]}
          </Badge>
        )}
      </span>
    </button>
  );
}

function lessonHistory(shadowingAttemptCount: number | null) {
  if (shadowingAttemptCount === null) return null;
  if (shadowingAttemptCount === 0) {
    return "New to you. Start with the Slow Round.";
  }
  return `You've shadowed this ${shadowingAttemptCount}×.`;
}

const ROUNDS = [
  { name: "Slow Round", steps: "Steps 1–3", dots: 3, color: "bg-accent-2-500" },
  {
    name: "Natural Round",
    steps: "Steps 4–6",
    dots: 3,
    color: "bg-primary",
  },
  { name: "Final Recording", steps: "Step 7", dots: 1, color: "bg-foreground" },
];

function LessonPreview({ entry }: { entry: CatalogueEntry }) {
  const { lesson, shadowingAttemptCount } = entry;
  const history = lessonHistory(shadowingAttemptCount);

  return (
    <div className="relative flex flex-col gap-4.5">
      <span
        aria-hidden
        className="pointer-events-none absolute -top-[98px] -right-[98px] hidden size-45 rounded-full bg-accent-2-200 opacity-60 lg:block"
      />

      <div className="relative flex flex-wrap gap-1.5">
        <LessonTags entry={entry} />
      </div>

      <div className="relative flex flex-col gap-1.5">
        <p className="font-japanese text-xl leading-normal font-bold text-pretty lg:text-2xl">
          {lesson.sentence}
        </p>
        <p className="font-japanese text-sm leading-relaxed text-muted-foreground">
          {lesson.kana}
        </p>
        <p className="text-sm text-pretty text-neutral-800 lg:text-body">
          {lesson.translation}
        </p>
      </div>

      <div className="flex flex-col gap-2.5 rounded-3xl bg-background px-4.5 py-4">
        {ROUNDS.map((round) => (
          <div key={round.name} className="flex items-center gap-2.5 text-sm">
            <span aria-hidden className="flex gap-1">
              {Array.from({ length: round.dots }, (_, index) => (
                <span
                  key={index}
                  className={cn("size-3.5 rounded-full", round.color)}
                />
              ))}
            </span>
            <strong>{round.name}</strong>
            <span className="text-muted-foreground">{round.steps}</span>
          </div>
        ))}
        <p className="text-xs text-muted-foreground">7 Steps · about 5 min</p>
      </div>

      {history && <p className="text-sm text-neutral-800">{history}</p>}

      <Button asChild shape="pill" size="lg" className="h-13 text-base">
        <Link href={`/protected/sentences/${lesson.id}`}>
          Start shadowing
          <ArrowRight />
        </Link>
      </Button>
    </div>
  );
}
