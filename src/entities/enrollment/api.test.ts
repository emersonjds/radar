import { beforeEach, describe, expect, it } from "vitest";
import { resetDb } from "@/shared/lib/storage/db";
import {
  enrollStudent,
  fetchEnrollmentsByGroup,
  fetchEnrollmentsByStudent,
  unenrollStudent,
} from "./api";

describe("enrollment api (over the store)", () => {
  beforeEach(async () => {
    await resetDb();
  });

  it("enrolls a student in an aula", async () => {
    const enrollment = await enrollStudent({ studentId: "s-new", groupId: "turma-mat-b" });
    expect(enrollment.active).toBe(true);
    const list = await fetchEnrollmentsByGroup("turma-mat-b");
    expect(list.some((row) => row.studentId === "s-new")).toBe(true);
  });

  it("does not duplicate on repeated enroll", async () => {
    await enrollStudent({ studentId: "s-new", groupId: "turma-mat-b" });
    await enrollStudent({ studentId: "s-new", groupId: "turma-mat-b" });
    const list = await fetchEnrollmentsByStudent("s-new");
    expect(list.filter((row) => row.groupId === "turma-mat-b")).toHaveLength(1);
  });

  it("soft-removes with unenroll and reactivates with a new enroll", async () => {
    await enrollStudent({ studentId: "s-new", groupId: "turma-mat-b" });
    await unenrollStudent({ studentId: "s-new", groupId: "turma-mat-b" });
    const afterUnenroll = await fetchEnrollmentsByStudent("s-new");
    expect(afterUnenroll[0].active).toBe(false);

    await enrollStudent({ studentId: "s-new", groupId: "turma-mat-b" });
    const afterReenroll = await fetchEnrollmentsByStudent("s-new");
    expect(afterReenroll[0].active).toBe(true);
    expect(afterReenroll).toHaveLength(1);
  });
});
