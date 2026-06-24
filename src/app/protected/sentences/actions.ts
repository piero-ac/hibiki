"use server";

import { OpenAI, toFile } from "openai";
import { createClient } from "@/lib/supabase/server";

const openai = new OpenAI();

export interface PronunciationResult {
	success: boolean;
	message: string;
	receivedText?: string;
	score?: number;
}

function cleanJapaneseText(text: string): string {
	if (!text) return "";
	return text
		.replace(/[\u3001\u3002\uFF0C\uFF0E\uFF1F\uFF01,.\?!]/g, "")
		.replace(/\s+/g, "");
}

export async function checkPronunciation(
	formData: FormData,
	expectedText: string,
	expectedKana: string,
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
				message: "Unauthorized. Please log in to save attempts.",
			};
		}

		const audioFile = formData.get("audio") as File;

		if (!audioFile) {
			return { success: false, message: "No audio file found." };
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

		const normalizedUser = cleanJapaneseText(userTranscript);
		const normalizedExpected = cleanJapaneseText(expectedText);

		const isPerfect = normalizedUser === normalizedExpected;
		const calculatedScore = isPerfect ? 100 : 0;

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
				message: `Graded, but failed to save history: ${dbError.message}`,
				receivedText: userTranscript,
				score: calculatedScore,
			};
		}

		if (isPerfect) {
			return {
				success: true,
				message: `Perfect match! Your pronunciation is spot on. 🎉`,
				receivedText: userTranscript,
				score: calculatedScore,
			};
		} else {
			return {
				success: true,
				message: `Close! Whisper heard: "${userTranscript}". Expected: "${expectedText}"`,
				receivedText: userTranscript,
				score: calculatedScore,
			};
		}
	} catch (error) {
		if (error instanceof Error) {
			console.error("Error inside Whisper grading pipeline:", error);
			return {
				success: false,
				message: error.message,
			};
		}

		return {
			success: false,
			message: "An error occurred.",
		};
	}
}
