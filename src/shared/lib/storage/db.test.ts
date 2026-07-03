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

  it("seeds avaliacoes and notas", async () => {
    const avaliacoes = await readCollection<{ id: string }>("avaliacoes");
    const notas = await readCollection<{ id: string }>("notas");
    expect(avaliacoes.length).toBeGreaterThan(0);
    expect(notas.length).toBeGreaterThan(0);
  });

  it("tolerates a collection missing from a persisted blob", async () => {
    // blob antigo sem as coleções novas não pode quebrar a leitura
    await mutateCollection("turmas", (rows) => rows);
    await expect(readCollection("avaliacoes")).resolves.toBeInstanceOf(Array);
  });

  it("discards a stale radar.db.v1 blob and reseeds", async () => {
    window.localStorage.setItem(
      "radar.db.v1",
      JSON.stringify({ perfis: [{ id: "professor-1", nome: "Carla Professora" }] }),
    );
    const turmas = await readCollection<Turma>("turmas");
    expect(turmas.length).toBeGreaterThan(0);
    expect(window.localStorage.getItem("radar.db.v1")).toBeNull();
  });
});
