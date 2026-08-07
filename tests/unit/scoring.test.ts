import { describe, expect, it } from "vitest";
import { calculateSimilarityScore, normalizeJapaneseText } from "@/lib/scoring";

describe("normalizeJapaneseText", () => {
  it("returns an empty string for empty input", () => {
    expect(normalizeJapaneseText("")).toBe("");
  });

  it("removes Japanese and ASCII punctuation", () => {
    expect(normalizeJapaneseText("。、，．？！,.?!")).toBe("");
  });

  it("removes spaces, tabs, and line breaks", () => {
    expect(normalizeJapaneseText("今日は\t良い\n天気 です")).toBe(
      "今日は良い天気です",
    );
  });

  it("normalizes full-width Latin characters and numbers", () => {
    expect(normalizeJapaneseText("ＡＢＣ１２３")).toBe("ABC123");
  });

  it("normalizes half-width katakana", () => {
    expect(normalizeJapaneseText("ｶﾀｶﾅ")).toBe("カタカナ");
  });
});

describe("calculateSimilarityScore", () => {
  it("returns 100 for identical text", () => {
    expect(calculateSimilarityScore("日本語", "日本語")).toBe(100);
  });

  it("ignores supported punctuation and whitespace differences", () => {
    expect(
      calculateSimilarityScore("今日は、良い天気です。", "今日は 良い天気です"),
    ).toBe(100);
  });

  it("scores compatibility-equivalent Unicode text as identical", () => {
    expect(calculateSimilarityScore("カタカナ１２３", "ｶﾀｶﾅ123")).toBe(100);
  });

  it("returns 100 when both values are empty", () => {
    expect(calculateSimilarityScore("", "")).toBe(100);
  });

  it("returns 0 when only one value is empty", () => {
    expect(calculateSimilarityScore("日本語", "")).toBe(0);
    expect(calculateSimilarityScore("", "日本語")).toBe(0);
  });

  it("returns a rounded score for a partial match", () => {
    expect(calculateSimilarityScore("日本語", "日本")).toBe(67);
  });

  it("returns 0 for completely different text of equal length", () => {
    expect(calculateSimilarityScore("猫", "犬")).toBe(0);
  });
});
