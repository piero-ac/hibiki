import type { Step } from "@/lib/lesson-player";

export const STEP_NAMES: Record<Step["type"], string> = {
  listen: "Listen",
  shadowWithTranscript: "Shadow with Transcript",
  shadowWithoutTranscript: "Shadow without Transcript",
  finalRecording: "Final Recording",
};

export const STEP_TIPS: Record<Step["type"], string> = {
  listen:
    "Listen and read along. Notice where the pitch rises and falls, and where the speaker pauses.",
  shadowWithTranscript:
    "Speak along with the speaker, a half-beat behind, reading the Sentence as you go. Nothing is recorded.",
  shadowWithoutTranscript:
    "The text is hidden. Follow the sound alone and match its rhythm. Nothing is recorded.",
  finalRecording:
    "Shadow the Natural Native Audio one last time while recording, then play it back against the speaker.",
};

/** "Slow Round · Step 2", or "Final · Step 7". */
export function stepKicker(step: Step): string {
  const round =
    step.round === "slow"
      ? "Slow Round"
      : step.round === "natural"
        ? "Natural Round"
        : "Final";
  return `${round} · Step ${step.number}`;
}
