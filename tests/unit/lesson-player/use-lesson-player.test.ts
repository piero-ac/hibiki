// @vitest-environment jsdom
import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  useLessonPlayer,
  type MarkDone,
} from "@/lib/lesson-player/use-lesson-player";
import { FakeLessonMedia } from "./fake-lesson-media";

let media: FakeLessonMedia;
let markDone: ReturnType<typeof vi.fn<MarkDone>>;

beforeEach(() => {
  vi.useFakeTimers();
  media = new FakeLessonMedia();
  markDone = vi.fn<MarkDone>(async () => ({ ok: true }));
});

afterEach(() => {
  vi.useRealTimers();
});

async function advance(ms: number) {
  await act(() => vi.advanceTimersByTimeAsync(ms));
}

async function makeRecording(result: {
  current: ReturnType<typeof useLessonPlayer>;
}) {
  act(() => result.current.record());
  await advance(3000);
  act(() => media.endNatural());
  await advance(600);
}

describe("useLessonPlayer", () => {
  it("counts down, then records while Natural plays quietly", async () => {
    const { result } = renderHook(() => useLessonPlayer({ media, markDone }));

    act(() => result.current.record());
    expect(result.current.state).toEqual({
      status: "countdown",
      secondsLeft: 3,
    });

    await advance(1000);
    expect(result.current.state).toEqual({
      status: "countdown",
      secondsLeft: 2,
    });

    await advance(1000);
    expect(result.current.state).toEqual({
      status: "countdown",
      secondsLeft: 1,
    });
    expect(media.capturing).toBe(false);

    await advance(1000);
    expect(result.current.state).toEqual({ status: "recording" });
    expect(media.capturing).toBe(true);
    expect(media.played).toEqual([{ speed: "natural", volume: 0.25 }]);
  });

  it("stops recording about 600 ms after Natural ends", async () => {
    const { result } = renderHook(() => useLessonPlayer({ media, markDone }));
    act(() => result.current.record());
    await advance(3000);

    act(() => media.endNatural());
    await advance(599);
    expect(result.current.state.status).toBe("recording");
    expect(media.capturing).toBe(true);

    await advance(1);
    expect(media.capturing).toBe(false);
    expect(result.current.state).toEqual({
      status: "recorded",
      recording: { blob: expect.any(Blob), url: "blob:recording-1" },
      error: null,
    });
  });

  it("ignores Natural ending when it isn't recording", async () => {
    const { result } = renderHook(() => useLessonPlayer({ media, markDone }));

    act(() => result.current.playNativeAudio("natural"));
    act(() => media.endNatural());
    await advance(1000);

    expect(result.current.state.status).toBe("idle");
    expect(media.played).toEqual([{ speed: "natural", volume: 1 }]);
  });

  it("puts the grading result in state", async () => {
    const grade = vi.fn(async () => ({
      ok: true as const,
      result: { accuracyScore: 88, transcript: "今日は良い天気です" },
    }));
    const { result } = renderHook(() =>
      useLessonPlayer({ media, grade, markDone }),
    );
    await makeRecording(result);

    expect(result.current.gradingAvailable).toBe(true);
    let submitted: Promise<void> | undefined;
    act(() => {
      submitted = result.current.submitForGrading();
    });
    expect(result.current.state.status).toBe("grading");

    await act(() => submitted);
    expect(grade).toHaveBeenCalledWith(
      expect.objectContaining({ url: "blob:recording-1" }),
    );
    expect(result.current.state).toMatchObject({
      status: "graded",
      result: { accuracyScore: 88, transcript: "今日は良い天気です" },
    });
  });

  it("shows the grading error and keeps the Recording", async () => {
    const grade = async () => ({
      ok: false as const,
      error: "Sentence could not be found.",
    });
    const { result } = renderHook(() =>
      useLessonPlayer({ media, grade, markDone }),
    );
    await makeRecording(result);

    await act(() => result.current.submitForGrading());

    expect(result.current.state).toMatchObject({
      status: "recorded",
      recording: { url: "blob:recording-1" },
      error: "Sentence could not be found.",
    });
  });

  it("reports a grading server it can't reach", async () => {
    const grade = async () => {
      throw new Error("network down");
    };
    vi.spyOn(console, "error").mockImplementation(() => {});
    const { result } = renderHook(() =>
      useLessonPlayer({ media, grade, markDone }),
    );
    await makeRecording(result);

    await act(() => result.current.submitForGrading());

    expect(result.current.state).toMatchObject({
      status: "recorded",
      error: "Failed to communicate with grading server.",
    });
  });

  it("makes grading unavailable when no grading is passed in", async () => {
    const { result } = renderHook(() => useLessonPlayer({ media, markDone }));
    await makeRecording(result);

    expect(result.current.gradingAvailable).toBe(false);
    await act(() => result.current.submitForGrading());
    expect(result.current.state.status).toBe("recorded");
  });

  it("re-recording throws away the previous Recording and result", async () => {
    const grade = async () => ({
      ok: true as const,
      result: { accuracyScore: 70, transcript: null },
    });
    const { result } = renderHook(() =>
      useLessonPlayer({ media, grade, markDone }),
    );
    await makeRecording(result);
    await act(() => result.current.submitForGrading());

    act(() => result.current.record());

    expect(result.current.state).toEqual({
      status: "countdown",
      secondsLeft: 3,
    });
    expect(media.discarded).toEqual([
      expect.objectContaining({ url: "blob:recording-1" }),
    ]);
  });

  it("returns to idle with an error when the microphone is denied", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    media.denyMicrophone();
    const { result } = renderHook(() => useLessonPlayer({ media, markDone }));

    act(() => result.current.record());
    await advance(3000);

    expect(result.current.state).toEqual({
      status: "idle",
      error: "Microphone access denied.",
    });
    expect(media.played).toEqual([]);
  });

  it("plays the Recording together with Natural", async () => {
    const { result } = renderHook(() => useLessonPlayer({ media, markDone }));
    await makeRecording(result);

    act(() => result.current.playBoth());

    expect(media.playedWithRecording).toEqual([
      expect.objectContaining({ url: "blob:recording-1" }),
    ]);
  });

  it("plays the Recording on its own", async () => {
    const { result } = renderHook(() => useLessonPlayer({ media, markDone }));
    await makeRecording(result);

    act(() => result.current.playRecording());

    expect(media.playedRecording).toEqual([
      expect.objectContaining({ url: "blob:recording-1" }),
    ]);
  });

  it("marks the Lesson done without a Recording, then allows it again", async () => {
    const { result } = renderHook(() => useLessonPlayer({ media, markDone }));

    await act(() => result.current.markDone());
    expect(markDone).toHaveBeenCalledTimes(1);
    expect(result.current.markDoneState).toEqual({ status: "done" });

    await act(() => result.current.markDone());
    expect(markDone).toHaveBeenCalledTimes(1);

    await advance(2000);
    expect(result.current.markDoneState).toEqual({
      status: "idle",
      error: null,
    });

    await act(() => result.current.markDone());
    expect(markDone).toHaveBeenCalledTimes(2);
  });

  it("makes Mark Done unavailable when none is passed in", async () => {
    const { result } = renderHook(() => useLessonPlayer({ media }));

    expect(result.current.markDoneAvailable).toBe(false);
    await act(() => result.current.markDone());
    expect(result.current.markDoneState).toEqual({
      status: "idle",
      error: null,
    });
  });

  it("makes Mark Done available when it's passed in", () => {
    const { result } = renderHook(() => useLessonPlayer({ media, markDone }));

    expect(result.current.markDoneAvailable).toBe(true);
  });

  it("saves once when Mark Done is pressed twice quickly", async () => {
    const { result } = renderHook(() => useLessonPlayer({ media, markDone }));

    await act(async () => {
      const first = result.current.markDone();
      const second = result.current.markDone();
      await Promise.all([first, second]);
    });

    expect(markDone).toHaveBeenCalledTimes(1);
  });

  it("shows the error when Mark Done can't be saved", async () => {
    markDone.mockResolvedValueOnce({ ok: false, error: "Couldn't save." });
    vi.spyOn(console, "error").mockImplementation(() => {});
    markDone.mockRejectedValueOnce(new Error("network down"));
    const { result } = renderHook(() => useLessonPlayer({ media, markDone }));

    await act(() => result.current.markDone());
    expect(result.current.markDoneState).toEqual({
      status: "idle",
      error: "Couldn't save.",
    });

    await act(() => result.current.markDone());
    expect(result.current.markDoneState).toEqual({
      status: "idle",
      error: "Couldn't mark this Lesson done. Please try again.",
    });
  });
});
