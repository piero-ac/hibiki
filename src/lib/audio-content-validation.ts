import { parseBuffer } from "music-metadata";
import type { AllowedAudioMimeType } from "@/lib/audio-validation";

export const MIN_AUDIO_DURATION_SECONDS = 0.25;
export const MAX_AUDIO_DURATION_SECONDS = 35;

type AudioContentValidationResult =
  | {
      success: true;
      bytes: Uint8Array;
      durationSeconds: number;
    }
  | {
      success: false;
      code: "invalid_content" | "too_short" | "too_long";
      error: string;
    };

const MP4_BRAND_PATTERN = /^(m4a|m4b|mp4[12]|isom|iso\d+|qt)$/i;

export async function validateAudioContent(
  file: File,
  expectedMimeType: AllowedAudioMimeType,
): Promise<AudioContentValidationResult> {
  try {
    const bytes = new Uint8Array(await file.arrayBuffer());

    // Do not pass the client-provided MIME type here. Let the parser identify
    // the format from the actual bytes.
    const metadata = await parseBuffer(bytes, undefined, {
      duration: true,
      skipCovers: true,
    });

    const { container, duration, hasAudio, hasVideo, numberOfChannels } =
      metadata.format;

    const containerMatches = matchesExpectedContainer(
      container,
      expectedMimeType,
    );

    const hasSupportedChannelCount =
      numberOfChannels !== undefined &&
      numberOfChannels >= 1 &&
      numberOfChannels <= 2;

    if (
      hasAudio !== true ||
      hasVideo === true ||
      !hasSupportedChannelCount ||
      !containerMatches
    ) {
      return {
        success: false,
        code: "invalid_content",
        error: "The audio recording is corrupt or unsupported.",
      };
    }

    if (duration === undefined || !Number.isFinite(duration)) {
      return {
        success: false,
        code: "invalid_content",
        error: "The audio recording duration could not be verified.",
      };
    }

    if (duration < MIN_AUDIO_DURATION_SECONDS) {
      return {
        success: false,
        code: "too_short",
        error: "The audio recording is too short.",
      };
    }

    if (duration > MAX_AUDIO_DURATION_SECONDS) {
      return {
        success: false,
        code: "too_long",
        error: "The audio recording is too long.",
      };
    }

    return {
      success: true,
      bytes,
      durationSeconds: duration,
    };
  } catch {
    return {
      success: false,
      code: "invalid_content",
      error: "The audio recording is corrupt or unsupported.",
    };
  }
}

function matchesExpectedContainer(
  container: string | undefined,
  expectedMimeType: AllowedAudioMimeType,
): boolean {
  if (!container) {
    return false;
  }

  if (expectedMimeType === "audio/webm") {
    return container.toLowerCase() === "ebml/webm";
  }

  return container.split("/").some((brand) => MP4_BRAND_PATTERN.test(brand));
}
