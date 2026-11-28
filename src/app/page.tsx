import Link from "next/link";
import { Suspense } from "react";
import { ArrowRight, Play } from "lucide-react";
import { LogoutButton } from "@/components/auth/logout-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PUBLIC_SIGN_UP_ENABLED } from "@/lib/auth/sign-up";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/server";

// Landing (mockups 5a mobile, 5b desktop). The mockups' "Grading when you
// want it" panel is left out on purpose: Accuracy Scores stay hidden.

const START_HREF = PUBLIC_SIGN_UP_ENABLED ? "/auth/sign-up" : "/auth/login";

// Decorative waveform under the sample Sentence: the first bars are "played".
const WAVEFORM_PLAYED = [8, 14, 14, 10, 10, 9, 14, 22, 26, 23, 12, 18, 30, 34];
const WAVEFORM_AHEAD = [
  28, 14, 15, 23, 24, 18, 11, 9, 9, 13, 16, 14, 11, 22, 30, 30, 21, 10, 24, 32,
];

const STEP_CIRCLES = [
  { step: 1, className: "bg-accent-2-500" },
  { step: 2, className: "bg-accent-2-500" },
  { step: 3, className: "bg-accent-2-500" },
  { step: 4, className: "bg-primary" },
  { step: 5, className: "bg-primary" },
  { step: 6, className: "bg-primary" },
  { step: 7, className: "bg-foreground" },
];

const heading = "leading-[1.12] tracking-[-0.015em]";

export default function Landing() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-background">
      <span
        aria-hidden
        className="absolute top-10 -right-20 size-55 rounded-full bg-accent-2-200 opacity-60 lg:-top-30 lg:-right-30 lg:size-130 lg:opacity-55"
      />
      <span
        aria-hidden
        className="absolute top-105 right-105 hidden size-30 rounded-full bg-accent-200 opacity-60 lg:block"
      />

      <div className="relative mx-auto max-w-300">
        <header className="flex items-center gap-2 px-5 py-4.5 lg:gap-5 lg:px-12 lg:py-5.5">
          <Link
            href="/"
            className="mr-auto font-heading text-[22px] lg:text-[26px]"
          >
            Hibiki
            <span className="ml-1.5 font-japanese text-base text-primary lg:text-xl">
              響
            </span>
          </Link>
          <Suspense fallback={null}>
            <HeaderActions />
          </Suspense>
        </header>

        <section className="grid gap-7 px-5 pt-5 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:items-center lg:gap-14 lg:px-12 lg:pt-15 lg:pb-18">
          <div className="flex flex-col gap-3.5 lg:gap-5">
            <h1
              className={cn(
                heading,
                "text-display lg:text-6xl lg:leading-[1.05]",
              )}
            >
              Speak Japanese the way it sounds.
            </h1>
            <p className="max-w-130 text-base text-pretty text-neutral-800 lg:text-lg">
              Hibiki is shadowing practice for Japanese learners. Listen to a
              native speaker, speak along, and get your pronunciation closer
              every day. Lessons span every JLPT level, with a focus on N2 and
              N1.
            </p>
            <div className="flex flex-col gap-2.5 lg:flex-row">
              <Button
                asChild
                size="lg"
                shape="pill"
                className="h-13.5 text-lead lg:px-6.5"
              >
                <Link href={START_HREF}>
                  {PUBLIC_SIGN_UP_ENABLED
                    ? "Start shadowing free"
                    : "Start shadowing"}
                  <ArrowRight data-icon="inline-end" />
                </Link>
              </Button>
              {PUBLIC_SIGN_UP_ENABLED && (
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  shape="pill"
                  className="hidden h-13.5 bg-transparent text-lead lg:inline-flex lg:px-5.5"
                >
                  <Link href="/auth/login">Log in</Link>
                </Button>
              )}
            </div>
          </div>

          <SamplePreview />
        </section>

        <section className="flex flex-col gap-3.5 px-5 pt-10 lg:max-w-[calc(55%+24px)] lg:gap-4 lg:px-12 lg:pt-0 lg:pb-16">
          <h2 className={cn(heading, "text-headline lg:text-[32px]")}>
            Seven Steps per Lesson
          </h2>
          <ol
            aria-label="The seven Steps"
            className="flex flex-wrap items-center gap-3 lg:gap-4"
          >
            {STEP_CIRCLES.map(({ step, className }) => (
              <li
                key={step}
                className={cn(
                  "grid size-9 place-items-center rounded-full font-heading text-[14.4px] text-background lg:size-12 lg:text-[19.2px]",
                  className,
                )}
              >
                {step}
              </li>
            ))}
          </ol>
          <div className="flex flex-col gap-2.5 text-body lg:text-base">
            <p>
              <strong>Slow Round, Steps 1–3.</strong> Listen with the Sentence,
              kana and translation on screen, shadow while reading, then shadow
              with the text hidden.
            </p>
            <p>
              <strong>Natural Round, Steps 4–6.</strong> The same three Steps at
              native speed.
            </p>
            <p>
              <strong>Final Recording, Step 7.</strong> Record yourself, play it
              back with the speaker, and Mark Done.
            </p>
          </div>
        </section>

        <section className="mx-4 mt-10 mb-4 flex flex-col gap-3 rounded-card bg-accent-2-100 px-5 py-6 lg:mx-12 lg:mt-0 lg:mb-12 lg:flex-row lg:items-center lg:gap-6 lg:rounded-4xl lg:px-10 lg:py-9">
          <h3
            className={cn(heading, "text-[25px] text-accent-2-900 lg:mr-auto")}
          >
            Your first Lesson takes about five minutes.
          </h3>
          <Button
            asChild
            size="lg"
            shape="pill"
            className="h-13 text-base lg:h-13.5 lg:px-6.5 lg:text-lead"
          >
            <Link href={START_HREF}>
              {PUBLIC_SIGN_UP_ENABLED ? "Create an account" : "Log in"}
            </Link>
          </Button>
        </section>
      </div>
    </main>
  );
}

async function HeaderActions() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();

  if (data?.claims) {
    return (
      <>
        <LogoutButton />
        <Button asChild size="sm" shape="pill" className="h-11 px-5 text-body">
          <Link href="/protected">Open Hibiki</Link>
        </Button>
      </>
    );
  }

  return (
    <>
      <Button
        asChild
        variant="ghost"
        shape="pill"
        className="h-11 px-3 text-body text-accent-700"
      >
        <Link href="/auth/login">Log in</Link>
      </Button>
      {PUBLIC_SIGN_UP_ENABLED && (
        <Button
          asChild
          shape="pill"
          className="hidden h-11 px-5 text-body lg:inline-flex"
        >
          <Link href="/auth/sign-up">Sign up</Link>
        </Button>
      )}
    </>
  );
}

// A static picture of the Lesson player in Step 1, not a working player.
function SamplePreview() {
  return (
    <figure
      aria-label="A Lesson in Step 1, Listen"
      className="-mx-1 flex flex-col gap-3 rounded-card bg-card p-5 shadow-md lg:mx-0 lg:p-7"
    >
      <div className="flex items-center gap-1.5">
        <Badge variant="accent">N3</Badge>
        <Badge variant="accent-2">Travel</Badge>
        <span className="ml-auto text-xs text-neutral-700">
          Step 1 · Listen
        </span>
      </div>
      <p
        lang="ja"
        className="font-japanese text-[19px] leading-normal font-bold text-pretty lg:text-2xl"
      >
        終電にぎりぎり間に合うと思って走ったんですが、ホームに着いた瞬間にドアが閉まってしまって…
      </p>
      <figcaption className="text-caption text-neutral-800">
        I ran because I thought I could just make the last train…
      </figcaption>
      <div aria-hidden className="flex items-center gap-3">
        <span className="grid size-12 flex-none place-items-center rounded-full bg-primary text-background">
          <Play className="size-5" />
        </span>
        <span className="flex h-9 flex-1 items-center gap-0.5">
          {WAVEFORM_PLAYED.map((height, i) => (
            <span
              key={`played-${i}`}
              className="flex-1 rounded-full bg-primary"
              style={{ height }}
            />
          ))}
          {WAVEFORM_AHEAD.map((height, i) => (
            <span
              key={`ahead-${i}`}
              className="flex-1 rounded-full bg-neutral-400"
              style={{ height }}
            />
          ))}
        </span>
      </div>
    </figure>
  );
}
