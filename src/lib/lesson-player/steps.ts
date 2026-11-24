import type { Speed } from "./media";

export type StepNumber = 1 | 2 | 3 | 4 | 5 | 6 | 7;

export const STEP_COUNT = 7;

type StepType =
  | "listen"
  | "shadowWithTranscript"
  | "shadowWithoutTranscript"
  | "finalRecording";

/** Steps 1–3 are the Slow Round and 4–6 the Natural Round; 7 is in neither. */
type Round = Speed | null;

export interface Step {
  number: StepNumber;
  type: StepType;
  round: Round;
  /** Which Native Audio the Step plays. */
  speed: Speed;
  shows: { sentence: boolean; kana: boolean; translation: boolean };
  /** Whether Play (or Record) runs a 3-2-1 countdown first. */
  countdown: boolean;
  /** Only the Final Recording uses the microphone. */
  records: boolean;
}

const SHOWS = {
  all: { sentence: true, kana: true, translation: true },
  transcript: { sentence: true, kana: true, translation: false },
  none: { sentence: false, kana: false, translation: false },
};

function roundSteps(round: Speed, first: StepNumber): Step[] {
  const base = { round, speed: round, records: false };
  return [
    {
      ...base,
      number: first,
      type: "listen",
      shows: SHOWS.all,
      countdown: false,
    },
    {
      ...base,
      number: (first + 1) as StepNumber,
      type: "shadowWithTranscript",
      shows: SHOWS.transcript,
      countdown: true,
    },
    {
      ...base,
      number: (first + 2) as StepNumber,
      type: "shadowWithoutTranscript",
      shows: SHOWS.none,
      countdown: true,
    },
  ];
}

const STEPS: readonly Step[] = [
  ...roundSteps("slow", 1),
  ...roundSteps("natural", 4),
  {
    number: 7,
    type: "finalRecording",
    round: null,
    speed: "natural",
    shows: SHOWS.none,
    countdown: true,
    records: true,
  },
];

export function getStep(step: StepNumber): Step {
  return STEPS[step - 1];
}
