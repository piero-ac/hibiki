import { afterAll, beforeAll, describe, expect, it } from "vitest";
import {
  getLearnerProgress,
  getLessonProgress,
  recordShadowingAttempt,
} from "@/lib/progress";
import {
  createTestLearner,
  deleteTestLearners,
  getSeededLessons,
  seedAiGradingAttempts,
  seedShadowingAttempts,
} from "./test-learners";

type SeededLesson = Awaited<ReturnType<typeof getSeededLessons>>[number];

let lessonA: SeededLesson;
let lessonB: SeededLesson;

beforeAll(async () => {
  [lessonA, lessonB] = await getSeededLessons();
});

afterAll(deleteTestLearners);

function lessonOf(lesson: SeededLesson) {
  return {
    id: lesson.id,
    sentence: lesson.japanese_text,
    jlptLevel: lesson.jlpt_level,
    category: lesson.category,
  };
}

describe("getLearnerProgress", () => {
  it("returns empty Activity for a new Learner", async () => {
    const learner = await createTestLearner();

    const progress = await getLearnerProgress(learner.client);

    expect(progress).toEqual({
      activity: {
        lessonsCompleted: 0,
        lessonsPracticed: 0,
        daysPracticed: 0,
        recentShadowingAttempts: [],
      },
    });
  });

  it("counts Activity from the Learner's Shadowing Attempts", async () => {
    const learner = await createTestLearner();
    await seedShadowingAttempts(learner, [
      { lessonId: lessonA.id, completedAt: "2026-03-01T09:00:00Z" },
      { lessonId: lessonA.id, completedAt: "2026-03-01T18:00:00Z" },
      { lessonId: lessonB.id, completedAt: "2026-03-02T09:00:00Z" },
    ]);

    const progress = await getLearnerProgress(learner.client);

    expect(progress.activity).toEqual({
      lessonsCompleted: 3,
      lessonsPracticed: 2,
      daysPracticed: 2,
      recentShadowingAttempts: [
        {
          id: expect.any(String),
          completedAt: new Date("2026-03-02T09:00:00Z"),
          lesson: lessonOf(lessonB),
        },
        {
          id: expect.any(String),
          completedAt: new Date("2026-03-01T18:00:00Z"),
          lesson: lessonOf(lessonA),
        },
        {
          id: expect.any(String),
          completedAt: new Date("2026-03-01T09:00:00Z"),
          lesson: lessonOf(lessonA),
        },
      ],
    });
  });

  it("counts a recorded Shadowing Attempt as Activity", async () => {
    const learner = await createTestLearner();
    await recordShadowingAttempt(learner.client, lessonA.id);

    const progress = await getLearnerProgress(learner.client);

    expect(progress.activity).toMatchObject({
      lessonsCompleted: 1,
      lessonsPracticed: 1,
      daysPracticed: 1,
    });
    expect(progress.activity.recentShadowingAttempts).toEqual([
      {
        id: expect.any(String),
        completedAt: expect.any(Date),
        lesson: lessonOf(lessonA),
      },
    ]);
  });

  it("doesn't count AI Grading Attempts as Activity", async () => {
    const learner = await createTestLearner();
    await seedAiGradingAttempts(learner, [
      {
        lessonId: lessonA.id,
        accuracyScore: 80,
        createdAt: "2026-03-01T10:00:00Z",
      },
    ]);

    const progress = await getLearnerProgress(learner.client);

    expect(progress).toEqual({
      activity: {
        lessonsCompleted: 0,
        lessonsPracticed: 0,
        daysPracticed: 0,
        recentShadowingAttempts: [],
      },
    });
  });
});

describe("getLessonProgress", () => {
  it("returns empty Activity for a Lesson the Learner hasn't practiced", async () => {
    const learner = await createTestLearner();

    const progress = await getLessonProgress(learner.client, lessonA.id);

    expect(progress).toEqual({
      activity: { shadowingAttemptCount: 0, lastDoneAt: null },
    });
  });

  it("counts a recorded Shadowing Attempt as Activity", async () => {
    const learner = await createTestLearner();
    const before = new Date();

    await recordShadowingAttempt(learner.client, lessonA.id);
    const progress = await getLessonProgress(learner.client, lessonA.id);

    expect(progress.activity.shadowingAttemptCount).toBe(1);
    expect(progress.activity.lastDoneAt).toBeInstanceOf(Date);
    expect(progress.activity.lastDoneAt!.getTime()).toBeGreaterThanOrEqual(
      before.getTime() - 5_000,
    );
  });

  it("counts each repeat Shadowing Attempt and keeps the latest date", async () => {
    const learner = await createTestLearner();

    await recordShadowingAttempt(learner.client, lessonA.id);
    const first = await getLessonProgress(learner.client, lessonA.id);
    await recordShadowingAttempt(learner.client, lessonA.id);
    await recordShadowingAttempt(learner.client, lessonB.id);
    const progress = await getLessonProgress(learner.client, lessonA.id);

    expect(progress.activity.shadowingAttemptCount).toBe(2);
    expect(progress.activity.lastDoneAt!.getTime()).toBeGreaterThanOrEqual(
      first.activity.lastDoneAt!.getTime(),
    );
  });

  it("doesn't count AI Grading Attempts as Lesson Activity", async () => {
    const learner = await createTestLearner();
    await seedAiGradingAttempts(learner, [
      {
        lessonId: lessonA.id,
        accuracyScore: 80,
        createdAt: "2026-03-01T10:00:00Z",
      },
    ]);

    const progress = await getLessonProgress(learner.client, lessonA.id);

    expect(progress).toEqual({
      activity: { shadowingAttemptCount: 0, lastDoneAt: null },
    });
  });
});

describe("one Learner's Progress", () => {
  it("never includes another Learner's Shadowing Attempts", async () => {
    const otherLearner = await createTestLearner();
    await recordShadowingAttempt(otherLearner.client, lessonA.id);
    await recordShadowingAttempt(otherLearner.client, lessonA.id);
    const learner = await createTestLearner();
    await recordShadowingAttempt(learner.client, lessonA.id);

    const learnerProgress = await getLessonProgress(learner.client, lessonA.id);
    const otherProgress = await getLessonProgress(
      otherLearner.client,
      lessonA.id,
    );
    const learnerActivity = (await getLearnerProgress(learner.client)).activity;

    expect(learnerProgress.activity.shadowingAttemptCount).toBe(1);
    expect(otherProgress.activity.shadowingAttemptCount).toBe(2);
    expect(learnerActivity.lessonsCompleted).toBe(1);
    expect(learnerActivity.recentShadowingAttempts).toHaveLength(1);
  });

  it("refuses to record a Shadowing Attempt without a signed-in Learner", async () => {
    const learner = await createTestLearner();
    await learner.client.auth.signOut();

    await expect(
      recordShadowingAttempt(learner.client, lessonA.id),
    ).rejects.toThrow("Only a signed-in Learner can Mark Done.");
  });
});
