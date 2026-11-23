import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { getLearnerProgress, getLessonProgress } from "@/lib/progress";
import {
  createTestLearner,
  deleteTestLearners,
  getSeededLessons,
  seedAiGradingAttempts,
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
  it("returns empty Activity and no Scores for a new Learner", async () => {
    const learner = await createTestLearner();

    const progress = await getLearnerProgress(learner.client);

    expect(progress).toEqual({
      activity: { totalAttempts: 0, lessonsPracticed: 0, daysPracticed: 0 },
      scores: null,
    });
  });

  it("counts Activity and Scores from the Learner's AI Grading Attempts", async () => {
    const learner = await createTestLearner();
    await seedAiGradingAttempts(learner, [
      {
        lessonId: lessonA.id,
        accuracyScore: 80,
        transcript: "first try",
        createdAt: "2026-03-01T10:00:00Z",
      },
      {
        lessonId: lessonA.id,
        accuracyScore: 90,
        transcript: "second try",
        createdAt: "2026-03-02T10:00:00Z",
      },
      {
        lessonId: lessonB.id,
        accuracyScore: 61,
        createdAt: "2026-03-02T12:00:00Z",
      },
    ]);

    const progress = await getLearnerProgress(learner.client);

    expect(progress.activity).toEqual({
      totalAttempts: 3,
      lessonsPracticed: 2,
      daysPracticed: 2,
    });
    expect(progress.scores?.averageAccuracyScore).toBe(77);
    expect(progress.scores?.recentGradedAttempts).toEqual([
      {
        id: expect.any(String),
        accuracyScore: 61,
        transcript: null,
        gradedAt: new Date("2026-03-02T12:00:00Z"),
        lesson: lessonOf(lessonB),
      },
      {
        id: expect.any(String),
        accuracyScore: 90,
        transcript: "second try",
        gradedAt: new Date("2026-03-02T10:00:00Z"),
        lesson: lessonOf(lessonA),
      },
      {
        id: expect.any(String),
        accuracyScore: 80,
        transcript: "first try",
        gradedAt: new Date("2026-03-01T10:00:00Z"),
        lesson: lessonOf(lessonA),
      },
    ]);
  });

  it("ranks strongest and weakest Lessons once two Lessons are graded", async () => {
    const learner = await createTestLearner();
    await seedAiGradingAttempts(learner, [
      {
        lessonId: lessonA.id,
        accuracyScore: 80,
        createdAt: "2026-03-01T10:00:00Z",
      },
      {
        lessonId: lessonA.id,
        accuracyScore: 90,
        createdAt: "2026-03-02T10:00:00Z",
      },
      {
        lessonId: lessonB.id,
        accuracyScore: 61,
        createdAt: "2026-03-02T12:00:00Z",
      },
    ]);

    const progress = await getLearnerProgress(learner.client);

    const lessonAScore = {
      lesson: lessonOf(lessonA),
      averageAccuracyScore: 85,
      attemptCount: 2,
    };
    const lessonBScore = {
      lesson: lessonOf(lessonB),
      averageAccuracyScore: 61,
      attemptCount: 1,
    };
    expect(progress.scores?.lessonRanking).toEqual({
      strongest: [lessonAScore, lessonBScore],
      weakest: [lessonBScore, lessonAScore],
    });
  });

  it("doesn't rank Lessons when only one Lesson is graded", async () => {
    const learner = await createTestLearner();
    await seedAiGradingAttempts(learner, [
      {
        lessonId: lessonA.id,
        accuracyScore: 80,
        createdAt: "2026-03-01T10:00:00Z",
      },
      {
        lessonId: lessonA.id,
        accuracyScore: 70,
        createdAt: "2026-03-02T10:00:00Z",
      },
    ]);

    const progress = await getLearnerProgress(learner.client);

    expect(progress.scores?.averageAccuracyScore).toBe(75);
    expect(progress.scores?.lessonRanking).toBeNull();
  });
});

describe("getLessonProgress", () => {
  it("returns empty Activity and no Scores for a Lesson the Learner hasn't practiced", async () => {
    const learner = await createTestLearner();

    const progress = await getLessonProgress(learner.client, lessonA.id);

    expect(progress).toEqual({
      activity: { attemptCount: 0, lastAttemptedAt: null },
      scores: null,
    });
  });

  it("returns only this Lesson's attempts, newest first", async () => {
    const learner = await createTestLearner();
    await seedAiGradingAttempts(learner, [
      {
        lessonId: lessonA.id,
        accuracyScore: 80,
        createdAt: "2026-03-01T10:00:00Z",
      },
      {
        lessonId: lessonA.id,
        accuracyScore: 90,
        createdAt: "2026-03-02T10:00:00Z",
      },
      {
        lessonId: lessonB.id,
        accuracyScore: 61,
        createdAt: "2026-03-03T10:00:00Z",
      },
    ]);

    const progress = await getLessonProgress(learner.client, lessonA.id);

    expect(progress).toEqual({
      activity: {
        attemptCount: 2,
        lastAttemptedAt: new Date("2026-03-02T10:00:00Z"),
      },
      scores: {
        recentGradedAttempts: [
          {
            id: expect.any(String),
            accuracyScore: 90,
            gradedAt: new Date("2026-03-02T10:00:00Z"),
          },
          {
            id: expect.any(String),
            accuracyScore: 80,
            gradedAt: new Date("2026-03-01T10:00:00Z"),
          },
        ],
      },
    });
  });

  it("keeps only the five most recent Accuracy Scores", async () => {
    const learner = await createTestLearner();
    await seedAiGradingAttempts(
      learner,
      [50, 60, 70, 80, 90, 100].map((accuracyScore, day) => ({
        lessonId: lessonA.id,
        accuracyScore,
        createdAt: `2026-03-0${day + 1}T10:00:00Z`,
      })),
    );

    const progress = await getLessonProgress(learner.client, lessonA.id);

    expect(progress.activity.attemptCount).toBe(6);
    expect(
      progress.scores?.recentGradedAttempts.map((a) => a.accuracyScore),
    ).toEqual([100, 90, 80, 70, 60]);
  });
});

describe("one Learner's Progress", () => {
  it("never includes another Learner's attempts", async () => {
    const otherLearner = await createTestLearner();
    await seedAiGradingAttempts(otherLearner, [
      {
        lessonId: lessonA.id,
        accuracyScore: 95,
        createdAt: "2026-03-01T10:00:00Z",
      },
      {
        lessonId: lessonB.id,
        accuracyScore: 40,
        createdAt: "2026-03-02T10:00:00Z",
      },
    ]);
    const learner = await createTestLearner();
    await seedAiGradingAttempts(learner, [
      {
        lessonId: lessonB.id,
        accuracyScore: 70,
        createdAt: "2026-03-05T10:00:00Z",
      },
    ]);

    const learnerProgress = await getLearnerProgress(learner.client);
    const lessonAProgress = await getLessonProgress(learner.client, lessonA.id);
    const lessonBProgress = await getLessonProgress(learner.client, lessonB.id);

    expect(learnerProgress.activity).toEqual({
      totalAttempts: 1,
      lessonsPracticed: 1,
      daysPracticed: 1,
    });
    expect(learnerProgress.scores?.averageAccuracyScore).toBe(70);
    expect(
      learnerProgress.scores?.recentGradedAttempts.map((a) => a.accuracyScore),
    ).toEqual([70]);
    expect(lessonAProgress).toEqual({
      activity: { attemptCount: 0, lastAttemptedAt: null },
      scores: null,
    });
    expect(lessonBProgress.activity.attemptCount).toBe(1);
    expect(
      lessonBProgress.scores?.recentGradedAttempts.map((a) => a.accuracyScore),
    ).toEqual([70]);
  });
});
