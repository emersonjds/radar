import { describe, expect, it } from "vitest";
import type { Evaluation } from "@/entities/evaluation/model";
import type { EvaluationGrade } from "@/entities/evaluation-grade/model";
import { deriveSubjectGrades } from "./derive";

const evaluations: Evaluation[] = [
  {
    id: "e1",
    groupId: "g1",
    subjectId: "math",
    name: "P1",
    type: "exam",
    date: "2026-06-20",
    weight: 3,
  },
  {
    id: "e2",
    groupId: "g1",
    subjectId: "math",
    name: "T1",
    type: "homework",
    date: "2026-06-27",
    weight: 1,
  },
  {
    id: "e3",
    groupId: "g1",
    subjectId: "hist",
    name: "P1",
    type: "exam",
    date: "2026-06-20",
    weight: 1,
  },
];

describe("deriveSubjectGrades", () => {
  it("computes a weight-weighted average per (student, subject)", () => {
    const eg: EvaluationGrade[] = [
      { id: "a", evaluationId: "e1", studentId: "s1", score: 8 },
      { id: "b", evaluationId: "e2", studentId: "s1", score: 4 },
    ];
    const derived = deriveSubjectGrades(evaluations, eg);
    expect(derived).toEqual([
      { id: "derived-s1-math", studentId: "s1", subjectId: "math", score: 7 },
    ]);
  });

  it("ignores pending (null) grades and omits subjects with no scores", () => {
    const eg: EvaluationGrade[] = [
      { id: "a", evaluationId: "e1", studentId: "s1", score: null },
      { id: "b", evaluationId: "e3", studentId: "s1", score: 6 },
    ];
    const derived = deriveSubjectGrades(evaluations, eg);
    expect(derived).toEqual([
      { id: "derived-s1-hist", studentId: "s1", subjectId: "hist", score: 6 },
    ]);
  });

  it("restricts the output when studentIds is provided", () => {
    const eg: EvaluationGrade[] = [
      { id: "a", evaluationId: "e1", studentId: "s1", score: 8 },
      { id: "b", evaluationId: "e1", studentId: "s2", score: 5 },
    ];
    const derived = deriveSubjectGrades(evaluations, eg, ["s2"]);
    expect(derived).toEqual([
      { id: "derived-s2-math", studentId: "s2", subjectId: "math", score: 5 },
    ]);
  });
});
