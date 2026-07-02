import { describe, expect, it } from "vitest";
import type { Presenca } from "@/entities/presenca/model";
import {
  alunosEmRisco,
  contarFaltas,
  taxaFrequencia,
  tendenciaAbsenteismo,
} from "./model";

function presenca(status: Presenca["status"], id = "x"): Presenca {
  return { id, chamadaId: "c1", alunoId: "a1", status };
}

describe("taxaFrequencia", () => {
  it("counts presente and atrasado as present", () => {
    const rows = [presenca("presente"), presenca("atrasado"), presenca("ausente")];
    expect(taxaFrequencia(rows)).toBe(67);
  });

  it("returns 0 with no records", () => {
    expect(taxaFrequencia([])).toBe(0);
  });

  it("justificado does not count as present", () => {
    expect(taxaFrequencia([presenca("presente"), presenca("justificado")])).toBe(50);
  });
});

describe("contarFaltas", () => {
  it("counts only ausente", () => {
    const rows = [presenca("ausente"), presenca("ausente"), presenca("atrasado")];
    expect(contarFaltas(rows)).toBe(2);
  });
});

describe("alunosEmRisco", () => {
  it("returns students at/above the threshold, worst first", () => {
    const map = new Map<string, Presenca[]>([
      ["a1", [presenca("ausente"), presenca("ausente"), presenca("ausente")]],
      ["a2", [presenca("ausente"), presenca("presente")]],
      ["a3", [presenca("presente")]],
    ]);
    const risco = alunosEmRisco(map, 2);
    expect(risco.map((r) => r.alunoId)).toEqual(["a1"]);
    expect(risco[0].faltas).toBe(3);
  });
});

describe("tendenciaAbsenteismo", () => {
  it("computes absence rate per date, chronological", () => {
    const pontos = tendenciaAbsenteismo([
      { data: "2026-06-18", status: "ausente" },
      { data: "2026-06-18", status: "presente" },
      { data: "2026-06-16", status: "presente" },
    ]);
    expect(pontos).toEqual([
      { data: "2026-06-16", taxaFalta: 0 },
      { data: "2026-06-18", taxaFalta: 50 },
    ]);
  });
});
