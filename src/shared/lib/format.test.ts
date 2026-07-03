import { describe, expect, it } from "vitest";
import { formatDate, formatDateLong, formatPercent } from "./format";

describe("format", () => {
  it("formats ISO date as dd/mm/yyyy", () => {
    expect(formatDate("2026-07-02")).toBe("02/07/2026");
  });

  it("formats ISO date in full pt-BR without timezone drift", () => {
    expect(formatDateLong("2026-07-02")).toBe("2 de julho de 2026");
  });

  it("formats percentual", () => {
    expect(formatPercent(92)).toBe("92%");
  });
});
