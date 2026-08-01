import { describe, expect, it } from "vitest";
import { MAX_AUDIO_SIZE_BYTES, validateAudioUpload } from "./audio-validation";

function createAudioFile(
  size: number,
  type = "audio/webm",
  name = "recording.webm",
) {
  return new File([new Uint8Array(size)], name, { type });
}

describe("validateAudioUpload", () => {
  it("rejects a missing file", () => {
    expect(validateAudioUpload(null)).toMatchObject({
      success: false,
      code: "missing",
    });
  });

  it("rejects a non-file form value", () => {
    expect(validateAudioUpload("not a file")).toMatchObject({
      success: false,
      code: "missing",
    });
  });

  it("rejects an empty file", () => {
    expect(validateAudioUpload(createAudioFile(0))).toMatchObject({
      success: false,
      code: "empty",
    });
  });

  it("accepts a WebM file at the size limit", () => {
    expect(
      validateAudioUpload(createAudioFile(MAX_AUDIO_SIZE_BYTES)),
    ).toMatchObject({
      success: true,
      mimeType: "audio/webm",
      extension: "webm",
    });
  });

  it("rejects a file larger than the size limit", () => {
    expect(
      validateAudioUpload(createAudioFile(MAX_AUDIO_SIZE_BYTES + 1)),
    ).toMatchObject({
      success: false,
      code: "too_large",
    });
  });

  it("accepts a WebM MIME type containing a codec", () => {
    expect(
      validateAudioUpload(createAudioFile(500, "audio/webm;codecs=opus")),
    ).toMatchObject({
      success: true,
      mimeType: "audio/webm",
      extension: "webm",
    });
  });

  it("accepts MP4 audio and uses an M4A extension", () => {
    expect(
      validateAudioUpload(createAudioFile(500, "audio/mp4", "recording.m4a")),
    ).toMatchObject({
      success: true,
      mimeType: "audio/mp4",
      extension: "m4a",
    });
  });

  it("rejects unsupported MIME types", () => {
    expect(
      validateAudioUpload(createAudioFile(500, "audio/mpeg", "recording.mp3")),
    ).toMatchObject({
      success: false,
      code: "unsupported_type",
    });
  });
});
