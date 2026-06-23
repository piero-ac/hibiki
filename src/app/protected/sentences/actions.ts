"use server";

import { OpenAI, toFile } from "openai";

const openai = new OpenAI();

export interface PronunciationResult {
	success: boolean;
	message: string;
	receivedText?: string;
}

export async function checkPronunciation(
	formData: FormData,
	expectedText: string,
	expectedKana: string,
): Promise<PronunciationResult> {
	try {
		const audioFile = formData.get("audio") as File;

		if (!audioFile) {
			return { success: false, message: "No audio file found." };
		}

		const arrayBuffer = await audioFile.arrayBuffer();
		const buffer = Buffer.from(arrayBuffer);

		// 1. Convert the raw server Buffer into a virtual file object Whisper can read
		const virtualFile = await toFile(buffer, "recording.webm", {
			type: "audio/webm",
		});

		const transcription = await openai.audio.transcriptions.create({
			file: virtualFile,
			model: "whisper-1",
			language: "ja",
		});

		const userTranscript = transcription.text;
		console.log("Whisper Transcript:", userTranscript);

		if (userTranscript === expectedText) {
			return {
				success: true,
				message: `Perfect! Whisper matched your speech exactly.`,
				receivedText: userTranscript,
			};
		} else {
			return {
				success: true,
				message: `Whisper heard: "${userTranscript}". Expected: "${expectedText}"`,
				receivedText: userTranscript,
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
			message: "An error occurred while communicating with Whisper.",
		};
	}
}
