import { distance } from "fastest-levenshtein";

export function calculateSimilarityScore(
	expected: string,
	actual: string,
): number {
	const normalizedExpected = normalizeJapaneseText(expected);
	const normalizedActual = normalizeJapaneseText(actual);

	const dist = distance(normalizedExpected, normalizedActual);
	const maxLength = Math.max(
		normalizedExpected.length,
		normalizedActual.length,
	);

	if (maxLength === 0) return 100;

	return Math.max(0, Math.round((1 - dist / maxLength) * 100));
}

export function normalizeJapaneseText(text: string): string {
	if (!text) return "";

	return text
		.normalize("NFKC")
		.replace(/[。、，．？！,.\?!]/g, "")
		.replace(/\s+/g, "")
		.trim();
}
