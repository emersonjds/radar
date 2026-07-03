import { beforeEach, describe, expect, it } from "vitest";
import { waitFor } from "@testing-library/react";
import { resetDb } from "@/shared/lib/storage/db";
import { renderHookWithQuery } from "@/test/react-query";
import { useStudentsByGroup } from "./queries";

describe("useStudentsByGroup (integration, over the store)", () => {
  beforeEach(async () => {
    await resetDb();
  });

  it("returns only students from the requested group", async () => {
    const { result } = renderHookWithQuery(() => useStudentsByGroup("turma-mat-b"));

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    const students = result.current.data ?? [];
    expect(students.length).toBeGreaterThan(0);
    expect(students.every((student) => student.groupId === "turma-mat-b")).toBe(true);
  });
});
