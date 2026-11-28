import { describe, expect, it } from "vitest";
import {
  buildCatalogue,
  filterCatalogue,
  groupByJlptLevel,
  type CatalogueLesson,
} from "@/lib/lesson-catalogue";

function lesson(
  id: string,
  overrides: Partial<CatalogueLesson> = {},
): CatalogueLesson {
  return {
    id,
    sentence: `文${id}`,
    kana: `ぶん${id}`,
    translation: `Sentence ${id}`,
    jlptLevel: "N3",
    category: "travel",
    ...overrides,
  };
}

function statusFor(count: number | undefined) {
  const counts = new Map<string, number>();
  if (count !== undefined) counts.set("a", count);
  return buildCatalogue([lesson("a")], counts)[0].status;
}

describe("Lesson Status", () => {
  it("is New with no Shadowing Attempts", () => {
    expect(statusFor(0)).toBe("new");
  });

  it("is New for a Lesson absent from the counts", () => {
    expect(statusFor(undefined)).toBe("new");
  });

  it("is Shadowed with one or two Shadowing Attempts", () => {
    expect(statusFor(1)).toBe("shadowed");
    expect(statusFor(2)).toBe("shadowed");
  });

  it("is Shadowed 3×+ with three or more Shadowing Attempts", () => {
    expect(statusFor(3)).toBe("shadowed-3-plus");
    expect(statusFor(12)).toBe("shadowed-3-plus");
  });

  it("carries the Shadowing Attempt count alongside the status", () => {
    const [entry] = buildCatalogue([lesson("a")], new Map([["a", 2]]));
    expect(entry.shadowingAttemptCount).toBe(2);
  });

  it("is unknown for every Lesson when the counts are unavailable", () => {
    const catalogue = buildCatalogue([lesson("a"), lesson("b")], null);

    expect(catalogue).toEqual([
      { lesson: lesson("a"), status: null, shadowingAttemptCount: null },
      { lesson: lesson("b"), status: null, shadowingAttemptCount: null },
    ]);
  });
});

describe("groupByJlptLevel", () => {
  it("groups Lessons from N5 to N1, leaving out levels with no Lessons", () => {
    const catalogue = buildCatalogue(
      [
        lesson("n1-a", { jlptLevel: "N1" }),
        lesson("n5-a", { jlptLevel: "N5" }),
        lesson("n3-a", { jlptLevel: "N3" }),
        lesson("n1-b", { jlptLevel: "N1" }),
      ],
      new Map(),
    );

    const groups = groupByJlptLevel(catalogue).map((group) => ({
      jlptLevel: group.jlptLevel,
      ids: group.entries.map((entry) => entry.lesson.id),
    }));

    expect(groups).toEqual([
      { jlptLevel: "N5", ids: ["n5-a"] },
      { jlptLevel: "N3", ids: ["n3-a"] },
      { jlptLevel: "N1", ids: ["n1-a", "n1-b"] },
    ]);
  });

  it("has no groups for no Lessons", () => {
    expect(groupByJlptLevel([])).toEqual([]);
  });
});

describe("filterCatalogue", () => {
  const catalogue = buildCatalogue(
    [
      lesson("n5-travel-new", { jlptLevel: "N5", category: "travel" }),
      lesson("n5-work-shadowed", { jlptLevel: "N5", category: "work" }),
      lesson("n2-travel-shadowed", { jlptLevel: "N2", category: "travel" }),
      lesson("n2-travel-3x", { jlptLevel: "N2", category: "travel" }),
      lesson("n2-uncategorised-new", { jlptLevel: "N2", category: null }),
    ],
    new Map([
      ["n5-work-shadowed", 1],
      ["n2-travel-shadowed", 2],
      ["n2-travel-3x", 3],
    ]),
  );

  function ids(result: { entries: { lesson: { id: string } }[] }) {
    return result.entries.map((entry) => entry.lesson.id);
  }

  it("keeps every Lesson when each filter is All, which is the default", () => {
    const everything = [
      "n5-travel-new",
      "n5-work-shadowed",
      "n2-travel-shadowed",
      "n2-travel-3x",
      "n2-uncategorised-new",
    ];

    expect(ids(filterCatalogue(catalogue))).toEqual(everything);
    expect(
      ids(
        filterCatalogue(catalogue, {
          jlptLevel: "all",
          category: "all",
          status: "all",
        }),
      ),
    ).toEqual(everything);
  });

  it("counts the matching Lessons", () => {
    expect(filterCatalogue(catalogue).count).toBe(5);
    expect(filterCatalogue(catalogue, { jlptLevel: "N5" }).count).toBe(2);
  });

  it("filters by JLPT Level", () => {
    expect(ids(filterCatalogue(catalogue, { jlptLevel: "N5" }))).toEqual([
      "n5-travel-new",
      "n5-work-shadowed",
    ]);
  });

  it("filters by Category", () => {
    expect(ids(filterCatalogue(catalogue, { category: "work" }))).toEqual([
      "n5-work-shadowed",
    ]);
  });

  it("filters by Lesson Status", () => {
    expect(ids(filterCatalogue(catalogue, { status: "new" }))).toEqual([
      "n5-travel-new",
      "n2-uncategorised-new",
    ]);
    expect(ids(filterCatalogue(catalogue, { status: "shadowed" }))).toEqual([
      "n5-work-shadowed",
      "n2-travel-shadowed",
    ]);
    expect(
      ids(filterCatalogue(catalogue, { status: "shadowed-3-plus" })),
    ).toEqual(["n2-travel-3x"]);
  });

  it("combines filters with AND", () => {
    expect(
      ids(
        filterCatalogue(catalogue, {
          jlptLevel: "N2",
          category: "travel",
          status: "shadowed",
        }),
      ),
    ).toEqual(["n2-travel-shadowed"]);
  });

  it("is empty with a count of 0 when no Lesson matches", () => {
    expect(
      filterCatalogue(catalogue, {
        jlptLevel: "N5",
        status: "shadowed-3-plus",
      }),
    ).toEqual({ entries: [], count: 0 });
  });

  it("matches no Lesson by status when the counts are unavailable", () => {
    const unknown = buildCatalogue([lesson("a"), lesson("b")], null);

    expect(filterCatalogue(unknown, { status: "new" }).count).toBe(0);
    expect(filterCatalogue(unknown).count).toBe(2);
  });
});
