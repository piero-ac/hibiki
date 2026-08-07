export const MAX_AUDIO_SIZE_BYTES = 1 * 1024 * 1024;

export type AllowedAudioMimeType = "audio/webm" | "audio/mp4";
type AudioExtension = "webm" | "m4a";

export type AudioValidationResult =
  | {
      success: true;
      file: File;
      mimeType: AllowedAudioMimeType;
      extension: AudioExtension;
    }
  | {
      success: false;
      code: "missing" | "empty" | "too_large" | "unsupported_type";
      error: string;
    };

const ALLOWED_AUDIO_TYPES: ReadonlySet<string> = new Set([
  "audio/webm",
  "audio/mp4",
]);

export function validateAudioUpload(
  value: FormDataEntryValue | null,
): AudioValidationResult {
  if (!(value instanceof File)) {
    return {
      success: false,
      code: "missing",
      error: "No audio file was provided.",
    };
  }

  if (value.size === 0) {
    return {
      success: false,
      code: "empty",
      error: "The audio recording is empty.",
    };
  }

  if (value.size > MAX_AUDIO_SIZE_BYTES) {
    return {
      success: false,
      code: "too_large",
      error: "The audio recording is too large.",
    };
  }

  const mimeType = value.type.split(";")[0].toLowerCase();

  if (!isAllowedAudioType(mimeType)) {
    return {
      success: false,
      code: "unsupported_type",
      error: "Unsupported audio format.",
    };
  }

  return {
    success: true,
    file: value,
    mimeType,
    extension: mimeType === "audio/mp4" ? "m4a" : "webm",
  };
}

function isAllowedAudioType(value: string): value is AllowedAudioMimeType {
  return ALLOWED_AUDIO_TYPES.has(value);
}
