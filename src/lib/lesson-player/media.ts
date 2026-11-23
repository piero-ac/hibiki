import type { Recording } from "./reducer";

export type Speed = "slow" | "natural";

/**
 * Everything the Lesson player needs from the browser: Native Audio playback
 * and microphone capture. Swapped for a fake in tests.
 */
export interface LessonMedia {
  /** Start buffering Native Audio. Safe to call again after `dispose`. */
  preload(): void;
  /** Play one speed from the start, pausing the other. */
  play(speed: Speed, options: { volume: number }): void;
  stopPlayback(): void;
  /** Play the Recording together with quiet Natural Native Audio. */
  playWithRecording(recording: Recording): void;
  /** Returns an unsubscribe function. */
  onNaturalEnded(listener: () => void): () => void;
  /** Resolves once the microphone is capturing; rejects if it can't be used. */
  startCapture(): Promise<void>;
  stopCapture(): Promise<Recording>;
  /** Throw a Recording away; it is never stored (ADR 0001). */
  discard(recording: Recording): void;
  /** Stop everything and release browser resources. */
  dispose(): void;
}
