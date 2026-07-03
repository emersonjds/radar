import { beforeEach, describe, expect, it } from "vitest";
import { resetDb } from "@/shared/lib/storage/db";
import { createAssessment, fetchAssessmentsByGroup } from "./api";

describe("assessment api", () => {
  beforeEach(async () => {
    await resetDb();
  });

  it("is unique per (group, name, date) — creating twice does not duplicate", async () => {
    const input = {
      groupId: "group-mat-b",
      name: "Prova Única",
      date: "2026-07-10",
      weight: 2,
      teacherId: "profile-ricardo",
    };
    await createAssessment(input);
    await createAssessment(input);
    const assessments = await fetchAssessmentsByGroup("group-mat-b");
    const criadas = assessments.filter((assessment) => assessment.date === "2026-07-10");
    expect(criadas).toHaveLength(1);
  });

  it("slugs accented names into a stable deterministic id", async () => {
    const criada = await createAssessment({
      groupId: "group-mat-b",
      name: "Avaliação de Ciências",
      date: "2026-07-11",
      weight: 1,
      teacherId: "profile-ricardo",
    });
    expect(criada.id).toBe("assessment-group-mat-b-avaliacao-de-ciencias-2026-07-11");
  });

  it("rejects peso outside 1..3", async () => {
    await expect(
      createAssessment({
        groupId: "group-mat-b",
        name: "Prova",
        date: "2026-07-10",
        weight: 0,
        teacherId: "profile-ricardo",
      }),
    ).rejects.toThrow();
  });
});
