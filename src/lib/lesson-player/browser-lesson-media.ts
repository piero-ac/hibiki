import type { LessonMedia, Speed } from "./media";
import type { Recording } from "./reducer";

/** How loud Natural plays under the Recording in Play Both. */
const PLAY_BOTH_NATURAL_VOLUME = 0.05;

interface Capture {
  recorder: MediaRecorder;
  stream: MediaStream;
  chunks: Blob[];
  mimeType: string;
}

/**
 * LessonMedia backed by HTMLAudioElement and MediaRecorder. Audio elements are
 * created lazily, so this is safe to construct during server rendering.
 */
export function createBrowserLessonMedia(nativeAudio: {
  naturalUrl: string;
  slowUrl: string | null;
}): LessonMedia {
  let players: Record<Speed, HTMLAudioElement | null> | null = null;
  let recordingPlayer: HTMLAudioElement | null = null;
  let endPlayBoth: (() => void) | null = null;
  let capture: Capture | null = null;
  const naturalEndedListeners = new Set<() => void>();
  const recordingUrls = new Set<string>();

  function getPlayers() {
    if (!players) {
      const natural = new Audio(nativeAudio.naturalUrl);
      natural.addEventListener("ended", () =>
        naturalEndedListeners.forEach((listener) => listener()),
      );
      players = {
        natural,
        slow: nativeAudio.slowUrl ? new Audio(nativeAudio.slowUrl) : null,
      };
    }
    return players;
  }

  function playFromStart(element: HTMLAudioElement) {
    element.currentTime = 0;
    element.play().catch((error) => console.error(error));
  }

  function stopPlayback() {
    endPlayBoth?.();
    if (!players) return;
    players.natural?.pause();
    players.slow?.pause();
    recordingPlayer?.pause();
  }

  function releaseCapture() {
    capture?.stream.getTracks().forEach((track) => track.stop());
    capture = null;
  }

  return {
    preload() {
      getPlayers();
    },

    play(speed, { volume }) {
      endPlayBoth?.();
      const current = getPlayers();
      const other = speed === "natural" ? current.slow : current.natural;
      other?.pause();

      const element = current[speed];
      if (!element) return;
      element.volume = volume;
      playFromStart(element);
    },

    stopPlayback,

    setRecordingPlayer(element) {
      endPlayBoth?.();
      recordingPlayer = element;
    },

    playWithRecording(recording) {
      const { natural, slow } = getPlayers();
      if (!natural) return;
      slow?.pause();
      endPlayBoth?.();

      recordingPlayer ??= new Audio(recording.url);
      const player = recordingPlayer;

      // When the Recording pauses or ends, Natural stops with it and returns
      // to full volume.
      const listening = new AbortController();
      endPlayBoth = () => {
        listening.abort();
        endPlayBoth = null;
        natural.pause();
        natural.volume = 1;
      };
      player.addEventListener("pause", () => endPlayBoth?.(), {
        signal: listening.signal,
      });
      player.addEventListener("ended", () => endPlayBoth?.(), {
        signal: listening.signal,
      });

      natural.volume = PLAY_BOTH_NATURAL_VOLUME;
      playFromStart(natural);
      playFromStart(player);
    },

    onNaturalEnded(listener) {
      naturalEndedListeners.add(listener);
      return () => {
        naturalEndedListeners.delete(listener);
      };
    },

    async startCapture() {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
        },
      });
      const mimeType = MediaRecorder.isTypeSupported("audio/webm")
        ? "audio/webm"
        : "audio/mp4";
      const recorder = new MediaRecorder(stream, {
        mimeType,
        audioBitsPerSecond: 96_000,
      });
      const chunks: Blob[] = [];
      recorder.addEventListener("dataavailable", (event) => {
        if (event.data.size > 0) chunks.push(event.data);
      });

      capture = { recorder, stream, chunks, mimeType };
      recorder.start();
    },

    stopCapture() {
      const current = capture;
      if (!current) {
        return Promise.reject(new Error("No recording in progress."));
      }

      return new Promise<Recording>((resolve, reject) => {
        current.recorder.addEventListener(
          "error",
          () => {
            releaseCapture();
            reject(new Error("The recording failed."));
          },
          { once: true },
        );
        current.recorder.addEventListener(
          "stop",
          () => {
            releaseCapture();
            const blob = new Blob(current.chunks, { type: current.mimeType });
            const url = URL.createObjectURL(blob);
            recordingUrls.add(url);
            resolve({ blob, url });
          },
          { once: true },
        );
        current.recorder.stop();
      });
    },

    discard(recording) {
      URL.revokeObjectURL(recording.url);
      recordingUrls.delete(recording.url);
    },

    dispose() {
      stopPlayback();
      if (capture?.recorder.state === "recording") capture.recorder.stop();
      releaseCapture();
      recordingUrls.forEach((url) => URL.revokeObjectURL(url));
      recordingUrls.clear();
      players = null;
    },
  };
}
