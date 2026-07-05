import { beforeEach, describe, expect, it } from "vitest";
import { resetDb } from "@/shared/lib/storage/db";
import {
  createAssignment,
  deleteAssignment,
  fetchAssignmentsByGroup,
  fetchAssignmentsByTeacher,
  updateAssignmentTeacher,
} from "./api";

describe("assignment api (over the store)", () => {
  beforeEach(async () => {
    await resetDb();
  });

  it("creates an assignment for a group/subject/teacher", async () => {
    const created = await createAssignment({
      groupId: "turma-fis-a",
      subjectId: "materia-quimica",
      teacherId: "perfil-ricardo",
    });
    expect(created.id).toBeTruthy();
    const forGroup = await fetchAssignmentsByGroup("turma-fis-a");
    expect(forGroup.some((a) => a.subjectId === "materia-quimica")).toBe(true);
  });

  it("rejects a duplicate (group, subject)", async () => {
    await createAssignment({
      groupId: "turma-fis-a",
      subjectId: "materia-quimica",
      teacherId: "perfil-ricardo",
    });
    await expect(
      createAssignment({
        groupId: "turma-fis-a",
        subjectId: "materia-quimica",
        teacherId: "perfil-bruno",
      }),
    ).rejects.toThrow();
  });

  it("changes the teacher of an assignment", async () => {
    const created = await createAssignment({
      groupId: "turma-fis-a",
      subjectId: "materia-quimica",
      teacherId: "perfil-ricardo",
    });
    await updateAssignmentTeacher(created.id, "perfil-bruno");
    const forTeacher = await fetchAssignmentsByTeacher("perfil-bruno");
    expect(forTeacher.some((a) => a.id === created.id)).toBe(true);
  });

  it("deletes an assignment", async () => {
    const created = await createAssignment({
      groupId: "turma-fis-a",
      subjectId: "materia-quimica",
      teacherId: "perfil-ricardo",
    });
    await deleteAssignment(created.id);
    const forGroup = await fetchAssignmentsByGroup("turma-fis-a");
    expect(forGroup.some((a) => a.id === created.id)).toBe(false);
  });
});
