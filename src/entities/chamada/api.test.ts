import { describe, it, expect, beforeEach } from "vitest";
import { resetDb, loadDb } from "@/shared/lib/store/db";
import { abrirOuObterChamada } from "./api";

describe("abrirOuObterChamada", () => {
  beforeEach(() => {
    resetDb();
  });

  it("is idempotent for the same turma and date", async () => {
    const primeira = await abrirOuObterChamada("turma-1", "2026-07-01", "professor-1");
    const segunda = await abrirOuObterChamada("turma-1", "2026-07-01", "professor-1");

    expect(segunda.id).toBe(primeira.id);
    const db = loadDb();
    const rows = db.chamadas.filter((chamada) => chamada.turmaId === "turma-1" && chamada.data === "2026-07-01");
    expect(rows).toHaveLength(1);
  });
});
