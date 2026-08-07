import { beforeEach, describe, expect, it, vi } from "vitest";
import { parseBuffer } from "music-metadata";
import type { IAudioMetadata, IFormat } from "music-metadata";
import {
  MAX_AUDIO_DURATION_SECONDS,
  MIN_AUDIO_DURATION_SECONDS,
  validateAudioContent,
} from "@/lib/audio-content-validation";

vi.mock("music-metadata", () => ({
  parseBuffer: vi.fn(),
}));

const mockedParseBuffer = vi.mocked(parseBuffer);

function createFile(type = "audio/webm") {
  return new File([new Uint8Array([1, 2, 3])], "recording", {
    type,
  });
}

function createMetadata(format: Partial<IFormat>): IAudioMetadata {
  return {
    format: {
      trackInfo: [],
      tagTypes: [],
      ...format,
    },
    common: {
      track: {
        no: null,
        of: null,
      },
      disk: {
        no: null,
        of: null,
      },
      movementIndex: {
        no: null,
        of: null,
      },
    },
    native: {},
    quality: {
      warnings: [],
    },
  };
}
beforeEach(() => {
  mockedParseBuffer.mockReset();
});

describe("validateAudioContent", () => {
  it("accepts WebM Opus audio", async () => {
    mockedParseBuffer.mockResolvedValue(
      createMetadata({
        container: "EBML/webm",
        codec: "OPUS",
        duration: 20,
        numberOfChannels: 1,
        hasAudio: true,
        hasVideo: false,
      }),
    );

    await expect(
      validateAudioContent(createFile(), "audio/webm"),
    ).resolves.toMatchObject({
      success: true,
      durationSeconds: 20,
    });
  });

  it("accepts MP4 audio", async () => {
    mockedParseBuffer.mockResolvedValue(
      createMetadata({
        container: "M4A/isom/mp42",
        codec: "MPEG-4/AAC",
        duration: 20,
        numberOfChannels: 1,
        hasAudio: true,
        hasVideo: false,
      }),
    );

    await expect(
      validateAudioContent(createFile("audio/mp4"), "audio/mp4"),
    ).resolves.toMatchObject({
      success: true,
    });
  });

  it("rejects a MIME and container mismatch", async () => {
    mockedParseBuffer.mockResolvedValue(
      createMetadata({
        container: "EBML/webm",
        duration: 20,
        numberOfChannels: 1,
        hasAudio: true,
        hasVideo: false,
      }),
    );

    await expect(
      validateAudioContent(createFile("audio/mp4"), "audio/mp4"),
    ).resolves.toMatchObject({
      success: false,
      code: "invalid_content",
    });
  });

  it("rejects recordings containing video", async () => {
    mockedParseBuffer.mockResolvedValue(
      createMetadata({
        container: "EBML/webm",
        duration: 20,
        numberOfChannels: 1,
        hasAudio: true,
        hasVideo: true,
      }),
    );

    await expect(
      validateAudioContent(createFile(), "audio/webm"),
    ).resolves.toMatchObject({
      success: false,
      code: "invalid_content",
    });
  });

  it("rejects recordings exceeding the duration limit", async () => {
    mockedParseBuffer.mockResolvedValue(
      createMetadata({
        container: "EBML/webm",
        duration: MAX_AUDIO_DURATION_SECONDS + 1,
        numberOfChannels: 1,
        hasAudio: true,
        hasVideo: false,
      }),
    );

    await expect(
      validateAudioContent(createFile(), "audio/webm"),
    ).resolves.toMatchObject({
      success: false,
      code: "too_long",
    });
  });

  it("rejects recordings below the minimum duration", async () => {
    mockedParseBuffer.mockResolvedValue(
      createMetadata({
        container: "EBML/webm",
        duration: MIN_AUDIO_DURATION_SECONDS - 0.01,
        numberOfChannels: 1,
        hasAudio: true,
        hasVideo: false,
      }),
    );

    await expect(
      validateAudioContent(createFile(), "audio/webm"),
    ).resolves.toMatchObject({
      success: false,
      code: "too_short",
    });
  });

  it("rejects recordings with a missing duration", async () => {
    mockedParseBuffer.mockResolvedValue(
      createMetadata({
        container: "EBML/webm",
        numberOfChannels: 1,
        hasAudio: true,
        hasVideo: false,
      }),
    );

    await expect(
      validateAudioContent(createFile(), "audio/webm"),
    ).resolves.toMatchObject({
      success: false,
      code: "invalid_content",
    });
  });

  it("rejects recordings without an audio track", async () => {
    mockedParseBuffer.mockResolvedValue(
      createMetadata({
        container: "EBML/webm",
        duration: 20,
        numberOfChannels: 1,
        hasAudio: false,
        hasVideo: false,
      }),
    );

    await expect(
      validateAudioContent(createFile(), "audio/webm"),
    ).resolves.toMatchObject({
      success: false,
      code: "invalid_content",
    });
  });

  it("rejects recordings with more than two audio channels", async () => {
    mockedParseBuffer.mockResolvedValue(
      createMetadata({
        container: "EBML/webm",
        duration: 20,
        numberOfChannels: 3,
        hasAudio: true,
        hasVideo: false,
      }),
    );

    await expect(
      validateAudioContent(createFile(), "audio/webm"),
    ).resolves.toMatchObject({
      success: false,
      code: "invalid_content",
    });
  });

  it("rejects content the parser cannot read", async () => {
    mockedParseBuffer.mockRejectedValue(new Error("Invalid audio"));

    await expect(
      validateAudioContent(createFile(), "audio/webm"),
    ).resolves.toMatchObject({
      success: false,
      code: "invalid_content",
    });
  });
});
