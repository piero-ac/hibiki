import { describe, expect, it } from "vitest";
import { buildCatalogue, type CatalogueLesson } from "@/lib/lesson-catalogue";
import { suggestNewLesson } from "@/lib/lesson-catalogue/suggest";

function lesson(id: string, jlptLevel: string): CatalogueLesson {
  return {
    id,
    sentence: `文${id}`,
    kana: `ぶん${id}`,
    translation: `Sentence ${id}`,
    jlptLevel,
    category: "travel",
  };
}

describe("suggestNewLesson", () => {
  it("suggests the first New Lesson", () => {
    const catalogue = buildCatalogue(
      [lesson("a", "N3"), lesson("b", "N3")],
      new Map(),
    );

    expect(suggestNewLesson(catalogue)?.lesson.id).toBe("a");
  });

  it("skips Lessons the Learner has already shadowed", () => {
    const catalogue = buildCatalogue(
      [lesson("a", "N3"), lesson("b", "N3"), lesson("c", "N3")],
      new Map([
        ["a", 1],
        ["b", 4],
      ]),
    );

    expect(suggestNewLesson(catalogue)?.lesson.id).toBe("c");
  });

  it("prefers the easiest JLPT Level, from N5 to N1", () => {
    const catalogue = buildCatalogue(
      [lesson("n1", "N1"), lesson("n2", "N2"), lesson("n4", "N4")],
      new Map(),
    );

    expect(suggestNewLesson(catalogue)?.lesson.id).toBe("n4");
  });

  it("suggests nothing once every Lesson has been shadowed", () => {
    const catalogue = buildCatalogue([lesson("a", "N3")], new Map([["a", 1]]));

    expect(suggestNewLesson(catalogue)).toBeNull();
  });

  it("suggests nothing when the Shadowing Attempt counts are unavailable", () => {
    const catalogue = buildCatalogue([lesson("a", "N3")], null);

    expect(suggestNewLesson(catalogue)).toBeNull();
  });
});
