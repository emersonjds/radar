import { describe, it, expect } from "vitest";
import { montarRegistrosIniciais, toggleStatus } from "./model";

it("defaults everyone to presente", () => {
  const r = montarRegistrosIniciais([{ id: "a1", nome: "Ana" } as never]);
  expect(r[0]).toEqual({ alunoId: "a1", status: "presente" });
});
it("sets one aluno status immutably", () => {
  const r = montarRegistrosIniciais([{ id: "a1" } as never, { id: "a2" } as never]);
  const out = toggleStatus(r, "a2", "ausente");
  expect(out.find((x) => x.alunoId === "a2")!.status).toBe("ausente");
  expect(r[1].status).toBe("presente");
});
