"use server";

export async function checkPronunciation(
	base64Audio: string,
	expectedText: string,
) {
	console.log("Server Action triggered for text:", expectedText);

	return {
		success: true,
		message: "Connection successful! Hello from the secure backend tunnel.",
		receivedText: expectedText,
	};
}
