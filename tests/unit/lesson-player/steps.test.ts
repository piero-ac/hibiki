import { describe, expect, it } from "vitest";
import {
  initialLessonState,
  lessonReducer,
  type LessonAction,
  type LessonState,
} from "@/lib/lesson-player/reducer";
import { getStep } from "@/lib/lesson-player/steps";

function run(actions: LessonAction[], from = initialLessonState) {
  return actions.reduce(lessonReducer, from);
}

const next: LessonAction = { type: "next" };
const previous: LessonAction = { type: "previous" };
const goTo = (step: number): LessonAction => ({ type: "goTo", step });

describe("Step movement", () => {
  it("starts at Step 1 with nothing beyond it reached", () => {
    expect(initialLessonState).toMatchObject({ step: 1, furthestStep: 1 });
  });

  it("moves forward one Step at a time", () => {
    expect(run([next])).toMatchObject({ step: 2, furthestStep: 2 });
    expect(run([next, next, next])).toMatchObject({
      step: 4,
      furthestStep: 4,
    });
  });

  it("stops at the Final Recording", () => {
    const atFinal = run(Array(6).fill(next));
    expect(atFinal).toMatchObject({ step: 7, furthestStep: 7 });
    expect(lessonReducer(atFinal, next)).toBe(atFinal);
  });

  it("can't skip ahead beyond the furthest Step reached", () => {
    const atThree = run([next, next]);
    expect(lessonReducer(atThree, goTo(4))).toBe(atThree);
    expect(lessonReducer(atThree, goTo(7))).toBe(atThree);
  });

  it("goes back one Step, but not before Step 1", () => {
    expect(run([next, next, previous])).toMatchObject({
      step: 2,
      furthestStep: 3,
    });
    expect(lessonReducer(initialLessonState, previous)).toBe(
      initialLessonState,
    );
  });

  it("jumps back to any Step reached, then forward again up to the furthest", () => {
    const atFive = run([next, next, next, next]);
    const backAtTwo = lessonReducer(atFive, goTo(2));
    expect(backAtTwo).toMatchObject({ step: 2, furthestStep: 5 });
    expect(lessonReducer(backAtTwo, goTo(5))).toMatchObject({
      step: 5,
      furthestStep: 5,
    });
  });

  it("moving forward after going back doesn't lose the furthest Step", () => {
    expect(run([next, next, next, goTo(1), next])).toMatchObject({
      step: 2,
      furthestStep: 4,
    });
  });

  it("ignores Steps that don't exist", () => {
    const atFinal: LessonState = run(Array(6).fill(next));
    expect(lessonReducer(atFinal, goTo(0))).toBe(atFinal);
    expect(lessonReducer(atFinal, goTo(8))).toBe(atFinal);
  });
});

describe("what each Step plays and shows", () => {
  const all = { sentence: true, kana: true, translation: true };
  const transcript = { sentence: true, kana: true, translation: false };
  const none = { sentence: false, kana: false, translation: false };

  it.each([
    [1, "listen", "slow", "slow", all, false, false],
    [2, "shadowWithTranscript", "slow", "slow", transcript, true, false],
    [3, "shadowWithoutTranscript", "slow", "slow", none, true, false],
    [4, "listen", "natural", "natural", all, false, false],
    [5, "shadowWithTranscript", "natural", "natural", transcript, true, false],
    [6, "shadowWithoutTranscript", "natural", "natural", none, true, false],
    [7, "finalRecording", null, "natural", none, true, true],
  ] as const)(
    "Step %i is %s",
    (number, type, round, speed, shows, countdown, records) => {
      expect(getStep(number)).toEqual({
        number,
        type,
        round,
        speed,
        shows,
        countdown,
        records,
      });
    },
  );
});

describe("playing Native Audio in Steps 1–6", () => {
  const play: LessonAction = { type: "playRequested" };
  const tick: LessonAction = { type: "playCountdownTicked" };

  it("starts with no countdown", () => {
    expect(initialLessonState.playback).toEqual({ status: "idle" });
  });

  it("plays straight away in Listen, with no countdown", () => {
    expect(run([play]).playback).toEqual({ status: "idle" });
    expect(run([next, next, next, play]).playback).toEqual({ status: "idle" });
  });

  it.each([2, 3, 5, 6])("counts down 3-2-1 before playing in Step %i", (n) => {
    const atStep = run(Array(n - 1).fill(next));
    expect(run([play], atStep).playback).toEqual({
      status: "countdown",
      secondsLeft: 3,
    });
    expect(run([play, tick], atStep).playback).toEqual({
      status: "countdown",
      secondsLeft: 2,
    });
    expect(run([play, tick, tick, tick], atStep).playback).toEqual({
      status: "idle",
    });
  });

  it("runs the countdown again on every replay", () => {
    expect(run([next, play, tick, tick, tick, play]).playback).toEqual({
      status: "countdown",
      secondsLeft: 3,
    });
  });

  it("ignores Play while a countdown is running", () => {
    const counting = run([next, play, tick]);
    expect(lessonReducer(counting, play)).toBe(counting);
  });

  it("cancels the countdown when the Learner changes Step", () => {
    expect(run([next, play, next]).playback).toEqual({ status: "idle" });
    expect(run([next, play, previous]).playback).toEqual({ status: "idle" });
    expect(run([next, play, goTo(1)]).playback).toEqual({ status: "idle" });
  });

  it("has no plain Play in the Final Recording", () => {
    const atFinal = run(Array(6).fill(next));
    expect(lessonReducer(atFinal, play)).toBe(atFinal);
  });
});

describe("the Final Recording within the Lesson", () => {
  const record: LessonAction = { type: "recordRequested" };
  const tick: LessonAction = { type: "countdownTicked" };
  const recording = {
    blob: new Blob(["recording-1"], { type: "audio/webm" }),
    url: "blob:recording-1",
  };
  const finished: LessonAction = { type: "recordingFinished", recording };
  const atFinal = run(Array(6).fill(next));

  it("starts with no Recording", () => {
    expect(initialLessonState.finalRecording).toEqual({
      status: "idle",
      error: null,
    });
  });

  it.each([1, 2, 3, 4, 5, 6])("can't record in Step %i", (n) => {
    const atStep = run(Array(n - 1).fill(next));
    expect(lessonReducer(atStep, record)).toBe(atStep);
  });

  it("records in Step 7", () => {
    expect(run([record], atFinal).finalRecording).toEqual({
      status: "countdown",
      secondsLeft: 3,
    });
  });

  it("can't change Step while counting down or recording", () => {
    const counting = run([record], atFinal);
    const capturing = run([record, tick, tick, tick], atFinal);
    expect(capturing.finalRecording).toEqual({ status: "recording" });

    for (const busy of [counting, capturing]) {
      expect(lessonReducer(busy, previous)).toBe(busy);
      expect(lessonReducer(busy, goTo(1))).toBe(busy);
      expect(lessonReducer(busy, { type: "restart" })).toBe(busy);
    }
  });

  it("keeps the Recording when the Learner goes back and returns", () => {
    expect(
      run([record, tick, tick, tick, finished, goTo(3), goTo(7)], atFinal),
    ).toMatchObject({
      step: 7,
      finalRecording: { status: "recorded", recording },
    });
  });

  it("can't restart while the Recording is being graded", () => {
    const grading = run(
      [record, tick, tick, tick, finished, { type: "gradingStarted" }],
      atFinal,
    );
    expect(lessonReducer(grading, { type: "restart" })).toBe(grading);
  });

  it("restart returns to Step 1 as a fresh run", () => {
    expect(
      run([record, tick, tick, tick, finished, { type: "restart" }], atFinal),
    ).toEqual(initialLessonState);
  });
});
