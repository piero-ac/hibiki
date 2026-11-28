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

function renderAtFinalRecording() {
  const rendered = renderHook(() => useLessonPlayer({ media, markDone }));
  while (rendered.result.current.state.step < 7) {
    act(() => rendered.result.current.next());
  }
  return rendered;
}

describe("useLessonPlayer: Lesson shadowed", () => {
  it("is shadowed once Mark Done is saved, and stays so after the confirmation", async () => {
    const { result } = renderAtFinalRecording();
    expect(result.current.lessonShadowed).toBe(false);

    await act(() => result.current.markDone());
    expect(result.current.lessonShadowed).toBe(true);

    await act(() => vi.advanceTimersByTimeAsync(2000));
    expect(result.current.lessonShadowed).toBe(true);
  });

  it("isn't shadowed when Mark Done can't be saved", async () => {
    markDone.mockResolvedValueOnce({ ok: false, error: "Couldn't save." });
    const { result } = renderAtFinalRecording();

    await act(() => result.current.markDone());

    expect(result.current.lessonShadowed).toBe(false);
  });

  it("restart starts a fresh run that isn't shadowed", async () => {
    const { result } = renderAtFinalRecording();
    await act(() => result.current.markDone());

    act(() => result.current.restart());

    expect(result.current.lessonShadowed).toBe(false);
    expect(result.current.state.step).toBe(1);
  });
});

describe("useLessonPlayer: which Steps the trail can go to", () => {
  it("allows only Steps already reached, other than the current one", () => {
    const { result } = renderHook(() => useLessonPlayer({ media, markDone }));
    expect(result.current.canGoTo(1)).toBe(false);
    expect(result.current.canGoTo(2)).toBe(false);

    act(() => result.current.next());
    act(() => result.current.next());
    act(() => result.current.next());
    act(() => result.current.goTo(2));

    expect(result.current.canGoTo(1)).toBe(true);
    expect(result.current.canGoTo(2)).toBe(false);
    expect(result.current.canGoTo(4)).toBe(true);
    expect(result.current.canGoTo(5)).toBe(false);
  });

  it("allows no Step while recording", () => {
    const { result } = renderAtFinalRecording();

    act(() => result.current.record());

    expect(result.current.canGoTo(6)).toBe(false);
  });
});

describe("useLessonPlayer: leave confirmation", () => {
  it("isn't needed on a fresh Lesson, and is once the Learner reaches Step 2", () => {
    const { result } = renderHook(() => useLessonPlayer({ media, markDone }));
    expect(result.current.needsLeaveConfirmation).toBe(false);

    act(() => result.current.next());

    expect(result.current.needsLeaveConfirmation).toBe(true);
  });

  it("is still needed after going back to Step 1 from a later Step", () => {
    const { result } = renderHook(() => useLessonPlayer({ media, markDone }));
    act(() => result.current.next());
    act(() => result.current.next());

    act(() => result.current.goTo(1));

    expect(result.current.state.step).toBe(1);
    expect(result.current.needsLeaveConfirmation).toBe(true);
  });

  it("is needed in the Final Recording without a Recording", () => {
    const { result } = renderAtFinalRecording();

    expect(result.current.needsLeaveConfirmation).toBe(true);
  });

  it("is needed in the Final Recording with a Recording", async () => {
    const { result } = renderAtFinalRecording();

    act(() => result.current.record());
    await act(() => vi.advanceTimersByTimeAsync(3000));
    act(() => media.endNatural());
    await act(() => vi.advanceTimersByTimeAsync(600));

    expect(result.current.state.finalRecording.status).toBe("recorded");
    expect(result.current.needsLeaveConfirmation).toBe(true);
  });

  it("isn't needed once Mark Done is saved, since nothing would be lost", async () => {
    const { result } = renderAtFinalRecording();

    await act(() => result.current.markDone());

    expect(result.current.lessonShadowed).toBe(true);
    expect(result.current.needsLeaveConfirmation).toBe(false);
  });
});
