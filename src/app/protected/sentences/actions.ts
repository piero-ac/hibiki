"use server";

import { OpenAI, toFile } from "openai";
import { createClient } from "@/lib/supabase/server";
import { calculateSimilarityScore } from "@/lib/scoring";

const openai = new OpenAI();

export interface PronunciationResult {
	success: boolean;
	receivedText?: string;
	score?: number;
	error?: string;
}

export async function checkPronunciation(
	formData: FormData,
	expectedText: string,
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

		const audioFile = formData.get("audio") as File;

		if (!audioFile) {
			return { success: false, error: "No audio file found." };
		}

		const arrayBuffer = await audioFile.arrayBuffer();
		const buffer = Buffer.from(arrayBuffer);

		const virtualFile = await toFile(buffer, "recording.webm", {
			type: "audio/webm",
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
			sentence_id: sentenceId,
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
				error: error.message,
			};
		}

		return {
			success: false,
			error: "An error occurred.",
		};
	}
}
