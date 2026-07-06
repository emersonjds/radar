import { beforeEach, describe, expect, it } from "vitest";
import { waitFor } from "@testing-library/react";
import { resetDb } from "@/shared/lib/storage/db";
import { renderHookWithQuery } from "@/test/react-query";
import { fetchEnrollmentsByGroup } from "@/entities/enrollment/api";
import { useStudentsByGroup } from "./queries";

describe("useStudentsByGroup (integration, over the store)", () => {
  beforeEach(async () => {
    await resetDb();
  });

  it("returns only students enrolled in the requested aula", async () => {
    const { result } = renderHookWithQuery(() => useStudentsByGroup("turma-mat-b"));

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    const students = result.current.data ?? [];
    expect(students.length).toBeGreaterThan(0);

    const enrollments = await fetchEnrollmentsByGroup("turma-mat-b");
    const enrolledIds = new Set(enrollments.filter((row) => row.active).map((row) => row.studentId));
    expect(students.every((student) => enrolledIds.has(student.id))).toBe(true);
  });
});
