"use server";

import { OpenAI, toFile } from "openai";
import { createClient } from "@/lib/supabase/server";
import { calculateSimilarityScore } from "@/lib/scoring";
import { isDemoUser } from "@/lib/demo";
import { serverEnv } from "@/lib/server-env";

const MAX_AUDIO_SIZE_BYTES = 1 * 1024 * 1024; // 1 MB

const ALLOWED_AUDIO_TYPES = new Set(["audio/webm", "audio/mp4"]);

const openai = new OpenAI({
  apiKey: serverEnv.openaiApiKey,
});

export interface PronunciationResult {
  success: boolean;
  receivedText?: string;
  score?: number;
  error?: string;
}

export async function checkPronunciation(
  formData: FormData,
  sentenceId: string,
): Promise<PronunciationResult> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return {
        success: false,
        error: "Unauthorized. Please log in to save attempts.",
      };
    }

    if (isDemoUser(user.email)) {
      return {
        success: false,
        error: "AI Grading is disabled in Demo Mode.",
      };
    }

    const { data: sentence, error: sentenceError } = await supabase
      .from("sentences")
      .select("id, japanese_text")
      .eq("id", sentenceId)
      .single();

    if (sentenceError || !sentence) {
      return {
        success: false,
        error: "Sentence could not be found.",
      };
    }

    const expectedText = sentence.japanese_text;

    const audioFile = formData.get("audio");

    if (!(audioFile instanceof File)) {
      return { success: false, error: "No audio file was provided." };
    }

    if (audioFile.size === 0) {
      return { success: false, error: "The audio recording is empty." };
    }

    if (audioFile.size > MAX_AUDIO_SIZE_BYTES) {
      return {
        success: false,
        error: "The audio recording is too large.",
      };
    }

    const mimeType = audioFile.type.split(";")[0].toLowerCase();

    if (!ALLOWED_AUDIO_TYPES.has(mimeType)) {
      return {
        success: false,
        error: "Unsupported audio format.",
      };
    }

    const arrayBuffer = await audioFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const extension = mimeType === "audio/mp4" ? "m4a" : "webm";

    const virtualFile = await toFile(buffer, `recording.${extension}`, {
      type: mimeType,
    });

    const transcription = await openai.audio.transcriptions.create({
      file: virtualFile,
      model: "whisper-1",
      language: "ja",
      prompt: expectedText,
    });

    const userTranscript = transcription.text;

    const calculatedScore = calculateSimilarityScore(
      expectedText,
      userTranscript,
    );

    const { error: dbError } = await supabase.from("attempts").insert({
      user_id: user.id,
      sentence_id: sentence.id,
      accuracy_score: calculatedScore,
      user_audio_transcript: userTranscript,
    });

    if (dbError) {
      console.error("Supabase saving error:", dbError);
      return {
        success: true,
        receivedText: userTranscript,
        score: calculatedScore,
        error: "Graded successfully, but could not save attempt.",
      };
    }
    return {
      success: true,
      receivedText: userTranscript,
      score: calculatedScore,
    };
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error inside Whisper grading pipeline:", error);
      return {
        success: false,
        error: "We couldn't grade this attempt. Please try again.",
      };
    }

    return {
      success: false,
      error: "An error occurred.",
    };
  }
}
