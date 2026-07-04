import { beforeEach, describe, expect, it } from "vitest";
import { resetDb } from "@/shared/lib/storage/db";
import { fetchSubjects } from "./api";

describe("subject api", () => {
  beforeEach(async () => {
    await resetDb();
  });

  it("seed traz 8 matérias, 2 por área", async () => {
    const subjects = await fetchSubjects();
    expect(subjects).toHaveLength(8);
    const porArea = new Map<string, number>();
    for (const subject of subjects) {
      porArea.set(subject.area, (porArea.get(subject.area) ?? 0) + 1);
    }
    expect([...porArea.values()]).toEqual([2, 2, 2, 2]);
  });
});
