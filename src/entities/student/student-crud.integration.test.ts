import { beforeEach, describe, expect, it } from "vitest";
import { resetDb } from "@/shared/lib/storage/db";
import { createStudent, deleteStudent, fetchStudents, updateStudent } from "./api";

const ficha = {
  name: "Aluno Teste",
  birthDate: "2012-05-10",
  guardianName: "Responsável Teste",
  guardianPhone: "(11) 91234-5678",
};

describe("student CRUD (integration, over the store)", () => {
  beforeEach(async () => {
    await resetDb();
  });

  it("creates a student with the ficha (no group needed)", async () => {
    const antes = await fetchStudents();
    const novo = await createStudent(ficha);

    expect(novo.id).toBeTruthy();
    expect(novo.active).toBe(true);
    expect(novo.name).toBe(ficha.name);
    expect(novo.birthDate).toBe(ficha.birthDate);
    expect(novo.guardianName).toBe(ficha.guardianName);
    expect(novo.guardianPhone).toBe(ficha.guardianPhone);

    const depois = await fetchStudents();
    expect(depois).toHaveLength(antes.length + 1);
  });

  it("updates ficha fields and active flag", async () => {
    const novo = await createStudent({ ...ficha, name: "Antes" });
    await updateStudent(novo.id, {
      name: "Depois",
      guardianPhone: "(11) 99999-0000",
      active: false,
    });

    const atual = (await fetchStudents()).find((student) => student.id === novo.id);
    expect(atual?.name).toBe("Depois");
    expect(atual?.guardianPhone).toBe("(11) 99999-0000");
    expect(atual?.active).toBe(false);
  });

  it("deletes a student", async () => {
    const novo = await createStudent({ ...ficha, name: "Remover" });
    await deleteStudent(novo.id);
    expect((await fetchStudents()).some((student) => student.id === novo.id)).toBe(false);
  });
});
