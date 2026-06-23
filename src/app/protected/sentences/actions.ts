"use server";

import { OpenAI, toFile } from "openai";

const openai = new OpenAI();

export interface PronunciationResult {
	success: boolean;
	message: string;
	receivedText?: string;
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
): Promise<PronunciationResult> {
	try {
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

		if (normalizedUser === normalizedExpected) {
			return {
				success: true,
				message: `Perfect match! Your pronunciation is spot on. 🎉`,
				receivedText: userTranscript,
			};
		} else {
			return {
				success: true,
				message: `Close! Whisper heard: "${userTranscript}". Expected: "${expectedText}"`,
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
			message: "An error occurred.",
		};
	}
}
