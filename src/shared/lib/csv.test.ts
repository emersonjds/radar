import { describe, expect, it } from "vitest";
import { toCsv } from "./csv";

describe("toCsv", () => {
  it("junta cabeçalho e linhas com ';' e CRLF", () => {
    const csv = toCsv(["Aluno", "Nota"], [["Marcus", "7,4"], ["Elena", "8,1"]]);
    expect(csv).toBe("Aluno;Nota\r\nMarcus;7,4\r\nElena;8,1");
  });

  it("escapa valores com ';', aspas e quebra de linha", () => {
    const csv = toCsv(["Nome"], [['Silva; "Jr"']]);
    expect(csv).toBe('Nome\r\n"Silva; ""Jr"""');
  });
});
