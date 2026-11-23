import type { LessonMedia, Speed } from "@/lib/lesson-player/media";
import type { Recording } from "@/lib/lesson-player/reducer";

/**
 * In-memory LessonMedia. Tests trigger Natural "ended" with `endNatural()`
 * and control the microphone with `denyMicrophone()`.
 */
export class FakeLessonMedia implements LessonMedia {
  played: Array<{ speed: Speed; volume: number }> = [];
  playedWithRecording: Recording[] = [];
  discarded: Recording[] = [];
  capturing = false;
  private recordingCount = 0;
  private microphoneDenied = false;
  private naturalEndedListeners = new Set<() => void>();

  denyMicrophone() {
    this.microphoneDenied = true;
  }

  endNatural() {
    this.naturalEndedListeners.forEach((listener) => listener());
  }

  preload() {}

  play(speed: Speed, { volume }: { volume: number }) {
    this.played.push({ speed, volume });
  }

  stopPlayback() {}

  playWithRecording(recording: Recording) {
    this.playedWithRecording.push(recording);
  }

  onNaturalEnded(listener: () => void) {
    this.naturalEndedListeners.add(listener);
    return () => {
      this.naturalEndedListeners.delete(listener);
    };
  }

  async startCapture() {
    if (this.microphoneDenied) throw new Error("NotAllowedError");
    this.capturing = true;
  }

  async stopCapture(): Promise<Recording> {
    this.capturing = false;
    this.recordingCount += 1;
    return {
      blob: new Blob([`recording-${this.recordingCount}`], {
        type: "audio/webm",
      }),
      url: `blob:recording-${this.recordingCount}`,
    };
  }

  discard(recording: Recording) {
    this.discarded.push(recording);
  }

  dispose() {}
}
