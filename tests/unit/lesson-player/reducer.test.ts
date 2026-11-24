import { describe, expect, it } from "vitest";
import {
  initialLessonState,
  initialMarkDoneState,
  lessonReducer,
  markDoneReducer,
  type FinalRecordingState,
  type LessonAction,
  type MarkDoneState,
  type Recording,
} from "@/lib/lesson-player/reducer";

/** Apply an action to the Final Recording while the Learner is in Step 7. */
function finalRecording(state: FinalRecordingState, action: LessonAction) {
  return lessonReducer(
    { ...initialLessonState, step: 7, furthestStep: 7, finalRecording: state },
    action,
  ).finalRecording;
}

const initialFinalRecordingState = initialLessonState.finalRecording;

const recording: Recording = {
  blob: new Blob(["recording-1"], { type: "audio/webm" }),
  url: "blob:recording-1",
};

const recorded: FinalRecordingState = {
  status: "recorded",
  recording,
  error: null,
};
const graded: FinalRecordingState = {
  status: "graded",
  recording,
  result: { accuracyScore: 92, transcript: "今日は良い天気です" },
};

describe("Final Recording", () => {
  it("starts idle with no error", () => {
    expect(initialFinalRecordingState).toEqual({ status: "idle", error: null });
  });

  it("starts a three second countdown when recording is requested", () => {
    expect(
      finalRecording(
        { status: "idle", error: "Microphone access denied." },
        { type: "recordRequested" },
      ),
    ).toEqual({ status: "countdown", secondsLeft: 3 });
  });

  it("counts down one second per tick", () => {
    expect(
      finalRecording(
        { status: "countdown", secondsLeft: 3 },
        { type: "countdownTicked" },
      ),
    ).toEqual({ status: "countdown", secondsLeft: 2 });
  });

  it("starts recording when the countdown runs out", () => {
    expect(
      finalRecording(
        { status: "countdown", secondsLeft: 1 },
        { type: "countdownTicked" },
      ),
    ).toEqual({ status: "recording" });
  });

  it("returns to idle with an error when the microphone can't be used", () => {
    expect(
      finalRecording({ status: "recording" }, { type: "captureFailed" }),
    ).toEqual({ status: "idle", error: "Microphone access denied." });
  });

  it("holds the Recording once recording finishes", () => {
    expect(
      finalRecording(
        { status: "recording" },
        { type: "recordingFinished", recording },
      ),
    ).toEqual(recorded);
  });

  it("re-recording from recorded clears the previous Recording", () => {
    expect(finalRecording(recorded, { type: "recordRequested" })).toEqual({
      status: "countdown",
      secondsLeft: 3,
    });
  });

  it("re-recording from graded clears the previous Recording and result", () => {
    expect(finalRecording(graded, { type: "recordRequested" })).toEqual({
      status: "countdown",
      secondsLeft: 3,
    });
  });

  it("starts grading the Recording and clears a previous grading error", () => {
    expect(
      finalRecording(
        { ...recorded, error: "Grading engine returned a processing error." },
        { type: "gradingStarted" },
      ),
    ).toEqual({ status: "grading", recording });
  });

  it("holds the grading result once it arrives", () => {
    expect(
      finalRecording(
        { status: "grading", recording },
        {
          type: "gradingSucceeded",
          result: { accuracyScore: 92, transcript: "今日は良い天気です" },
        },
      ),
    ).toEqual(graded);
  });

  it("keeps the Recording and shows the error when grading fails", () => {
    expect(
      finalRecording(
        { status: "grading", recording },
        { type: "gradingFailed", error: "Sentence could not be found." },
      ),
    ).toEqual({ ...recorded, error: "Sentence could not be found." });
  });

  describe("ignores actions that don't apply", () => {
    const cases: Array<[FinalRecordingState, LessonAction]> = [
      [{ status: "countdown", secondsLeft: 2 }, { type: "recordRequested" }],
      [{ status: "recording" }, { type: "recordRequested" }],
      [{ status: "grading", recording }, { type: "recordRequested" }],
      [initialFinalRecordingState, { type: "countdownTicked" }],
      [initialFinalRecordingState, { type: "recordingFinished", recording }],
      [initialFinalRecordingState, { type: "captureFailed" }],
      [initialFinalRecordingState, { type: "gradingStarted" }],
      [graded, { type: "gradingStarted" }],
      [
        recorded,
        {
          type: "gradingSucceeded",
          result: { accuracyScore: 1, transcript: null },
        },
      ],
      [recorded, { type: "gradingFailed", error: "x" }],
    ];

    it.each(cases)("from %o on %o", (state, action) => {
      expect(finalRecording(state, action)).toBe(state);
    });
  });
});

describe("markDoneReducer", () => {
  it("saves the Shadowing Attempt when Mark Done is pressed", () => {
    expect(initialMarkDoneState).toEqual({ status: "idle", error: null });
    expect(
      markDoneReducer(initialMarkDoneState, { type: "markDoneRequested" }),
    ).toEqual({ status: "saving" });
  });

  it("shows the Marked done confirmation once it's saved", () => {
    expect(
      markDoneReducer({ status: "saving" }, { type: "markDoneSucceeded" }),
    ).toEqual({ status: "done" });
  });

  it("can be pressed again once the confirmation has passed", () => {
    const again = markDoneReducer(
      { status: "done" },
      { type: "confirmationEnded" },
    );

    expect(again).toEqual({ status: "idle", error: null });
    expect(markDoneReducer(again, { type: "markDoneRequested" })).toEqual({
      status: "saving",
    });
  });

  it("shows an error and allows another try when saving fails", () => {
    const failed = markDoneReducer(
      { status: "saving" },
      { type: "markDoneFailed", error: "Couldn't save." },
    );

    expect(failed).toEqual({ status: "idle", error: "Couldn't save." });
    expect(markDoneReducer(failed, { type: "markDoneRequested" })).toEqual({
      status: "saving",
    });
  });

  it("clears the confirmation and any error on restart", () => {
    expect(markDoneReducer({ status: "done" }, { type: "restarted" })).toEqual(
      initialMarkDoneState,
    );
    expect(
      markDoneReducer(
        { status: "idle", error: "Couldn't save." },
        { type: "restarted" },
      ),
    ).toEqual(initialMarkDoneState);
  });

  describe("ignores actions that don't apply", () => {
    const cases: Array<[MarkDoneState, Parameters<typeof markDoneReducer>[1]]> =
      [
        [{ status: "saving" }, { type: "markDoneRequested" }],
        [{ status: "done" }, { type: "markDoneRequested" }],
        [initialMarkDoneState, { type: "markDoneSucceeded" }],
        [{ status: "done" }, { type: "markDoneFailed", error: "x" }],
        [{ status: "saving" }, { type: "confirmationEnded" }],
        [{ status: "saving" }, { type: "restarted" }],
      ];

    it.each(cases)("from %o on %o", (state, action) => {
      expect(markDoneReducer(state, action)).toBe(state);
    });
  });
});
