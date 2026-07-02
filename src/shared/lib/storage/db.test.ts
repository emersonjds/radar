import { beforeEach, describe, expect, it } from "vitest";
import { mutateCollection, readCollection, resetDb } from "./db";

interface Turma {
  id: string;
  nome: string;
}

describe("storage db", () => {
  beforeEach(async () => {
    await resetDb();
  });

  it("seeds collections on first read", async () => {
    const turmas = await readCollection<Turma>("turmas");
    expect(turmas.length).toBeGreaterThan(0);
  });

  it("returns detached copies (mutating the result does not touch the store)", async () => {
    const first = await readCollection<Turma>("turmas");
    first[0].nome = "hacked";
    const second = await readCollection<Turma>("turmas");
    expect(second[0].nome).not.toBe("hacked");
  });

  it("persists mutations", async () => {
    await mutateCollection<Turma>("turmas", (rows) => [
      ...rows,
      { id: "nova", nome: "Nova Turma" },
    ]);
    const turmas = await readCollection<Turma>("turmas");
    expect(turmas.some((turma) => turma.id === "nova")).toBe(true);
  });
});
