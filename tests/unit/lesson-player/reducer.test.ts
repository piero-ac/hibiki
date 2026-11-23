import { describe, expect, it } from "vitest";
import {
  initialPlayerState,
  playerReducer,
  type PlayerState,
  type Recording,
} from "@/lib/lesson-player/reducer";

const recording: Recording = {
  blob: new Blob(["recording-1"], { type: "audio/webm" }),
  url: "blob:recording-1",
};

const recorded: PlayerState = { status: "recorded", recording, error: null };
const graded: PlayerState = {
  status: "graded",
  recording,
  result: { accuracyScore: 92, transcript: "今日は良い天気です" },
};

describe("playerReducer", () => {
  it("starts idle with no error", () => {
    expect(initialPlayerState).toEqual({ status: "idle", error: null });
  });

  it("starts a three second countdown when recording is requested", () => {
    expect(
      playerReducer(
        { status: "idle", error: "Microphone access denied." },
        { type: "recordRequested" },
      ),
    ).toEqual({ status: "countdown", secondsLeft: 3 });
  });

  it("counts down one second per tick", () => {
    expect(
      playerReducer(
        { status: "countdown", secondsLeft: 3 },
        { type: "countdownTicked" },
      ),
    ).toEqual({ status: "countdown", secondsLeft: 2 });
  });

  it("starts recording when the countdown runs out", () => {
    expect(
      playerReducer(
        { status: "countdown", secondsLeft: 1 },
        { type: "countdownTicked" },
      ),
    ).toEqual({ status: "recording" });
  });

  it("returns to idle with an error when the microphone can't be used", () => {
    expect(
      playerReducer({ status: "recording" }, { type: "captureFailed" }),
    ).toEqual({ status: "idle", error: "Microphone access denied." });
  });

  it("holds the Recording once recording finishes", () => {
    expect(
      playerReducer(
        { status: "recording" },
        { type: "recordingFinished", recording },
      ),
    ).toEqual(recorded);
  });

  it("re-recording from recorded clears the previous Recording", () => {
    expect(playerReducer(recorded, { type: "recordRequested" })).toEqual({
      status: "countdown",
      secondsLeft: 3,
    });
  });

  it("re-recording from graded clears the previous Recording and result", () => {
    expect(playerReducer(graded, { type: "recordRequested" })).toEqual({
      status: "countdown",
      secondsLeft: 3,
    });
  });

  it("starts grading the Recording and clears a previous grading error", () => {
    expect(
      playerReducer(
        { ...recorded, error: "Grading engine returned a processing error." },
        { type: "gradingStarted" },
      ),
    ).toEqual({ status: "grading", recording });
  });

  it("holds the grading result once it arrives", () => {
    expect(
      playerReducer(
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
      playerReducer(
        { status: "grading", recording },
        { type: "gradingFailed", error: "Sentence could not be found." },
      ),
    ).toEqual({ ...recorded, error: "Sentence could not be found." });
  });

  describe("ignores actions that don't apply", () => {
    const cases: Array<[PlayerState, Parameters<typeof playerReducer>[1]]> = [
      [{ status: "countdown", secondsLeft: 2 }, { type: "recordRequested" }],
      [{ status: "recording" }, { type: "recordRequested" }],
      [{ status: "grading", recording }, { type: "recordRequested" }],
      [initialPlayerState, { type: "countdownTicked" }],
      [initialPlayerState, { type: "recordingFinished", recording }],
      [initialPlayerState, { type: "captureFailed" }],
      [initialPlayerState, { type: "gradingStarted" }],
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
      expect(playerReducer(state, action)).toBe(state);
    });
  });
});
