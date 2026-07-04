import { beforeEach, describe, expect, it } from "vitest";
import { resetDb } from "@/shared/lib/storage/db";
import { createStudent, deleteStudent, fetchStudents, updateStudent } from "./api";

describe("student CRUD (integration, over the store)", () => {
  beforeEach(async () => {
    await resetDb();
  });

  it("creates a student with an auto-assigned enrollment", async () => {
    const antes = await fetchStudents();
    const novo = await createStudent({ name: "Aluno Teste", groupId: "turma-mat-b" });

    expect(novo.enrollment).toMatch(/^EDU-2026-\d+$/);
    expect(novo.active).toBe(true);
    expect(antes.some((student) => student.enrollment === novo.enrollment)).toBe(false);

    const depois = await fetchStudents();
    expect(depois).toHaveLength(antes.length + 1);
  });

  it("updates name, group and active", async () => {
    const novo = await createStudent({ name: "Antes", groupId: "turma-mat-b" });
    await updateStudent(novo.id, { name: "Depois", active: false });

    const atual = (await fetchStudents()).find((student) => student.id === novo.id);
    expect(atual?.name).toBe("Depois");
    expect(atual?.active).toBe(false);
  });

  it("deletes a student", async () => {
    const novo = await createStudent({ name: "Remover", groupId: "turma-mat-b" });
    await deleteStudent(novo.id);
    expect((await fetchStudents()).some((student) => student.id === novo.id)).toBe(false);
  });
});
