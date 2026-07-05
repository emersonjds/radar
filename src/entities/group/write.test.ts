import { beforeEach, describe, expect, it } from "vitest";
import { resetDb } from "@/shared/lib/storage/db";
import { createStudent } from "@/entities/student/api";
import { createAssignment, fetchAssignmentsByGroup } from "@/entities/assignment/api";
import { createGroup, deleteGroup, fetchGroups, updateGroup } from "./api";

describe("group writes (over the store)", () => {
  beforeEach(async () => {
    await resetDb();
  });

  it("creates and updates a group with a regente", async () => {
    const created = await createGroup({
      name: "Redação I",
      gradeLevel: "1ª série",
      shift: "afternoon",
      teacherId: "perfil-ricardo",
    });
    await updateGroup(created.id, { teacherId: "perfil-bruno" });
    const found = (await fetchGroups()).find((g) => g.id === created.id);
    expect(found?.teacherId).toBe("perfil-bruno");
  });

  it("deletes an empty group", async () => {
    const created = await createGroup({
      name: "Redação I",
      gradeLevel: "1ª série",
      shift: "afternoon",
      teacherId: "perfil-ricardo",
    });
    await deleteGroup(created.id);
    expect((await fetchGroups()).some((g) => g.id === created.id)).toBe(false);
  });

  it("refuses to delete a group that has students", async () => {
    const created = await createGroup({
      name: "Redação I",
      gradeLevel: "1ª série",
      shift: "afternoon",
      teacherId: "perfil-ricardo",
    });
    await createStudent({ name: "Aluno Teste", groupId: created.id });
    await expect(deleteGroup(created.id)).rejects.toThrow();
  });

  it("cascades lecionamentos when the group is deleted", async () => {
    const created = await createGroup({
      name: "Redação I",
      gradeLevel: "1ª série",
      shift: "afternoon",
      teacherId: "perfil-ricardo",
    });
    await createAssignment({
      groupId: created.id,
      subjectId: "materia-portugues",
      teacherId: "perfil-ricardo",
    });
    await deleteGroup(created.id);
    expect(await fetchAssignmentsByGroup(created.id)).toHaveLength(0);
    expect((await fetchGroups()).some((g) => g.id === created.id)).toBe(false);
  });
});
