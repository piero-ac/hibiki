"use server";

export interface PronunciationResult {
	success: boolean;
	message: string;
	receivedText?: string; // Optional: only present when success is true
}

export async function checkPronunciation(
	formData: FormData,
	expectedText: string,
): Promise<PronunciationResult> {
	try {
		const audioFile = formData.get("audio") as File;

		if (!audioFile) {
			return { success: false, message: "No audio file found." };
		}

		const arrayBuffer = await audioFile.arrayBuffer();
		const buffer = Buffer.from(arrayBuffer);

		console.log("Received audio:", audioFile.name, "Size:", buffer.length);
		return {
			success: true,
			message: `Received audio: ${audioFile.name} size: ${buffer.length}`,
			receivedText: expectedText,
		};
	} catch (error) {
		console.error("Error processing audio:", error);
		return { success: false, message: "Server error" };
	}
}
