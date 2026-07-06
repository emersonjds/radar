import { describe, expect, it } from "vitest";
import { computeAgeAt } from "./age";

describe("computeAgeAt", () => {
  it("returns whole years already completed at the reference date", () => {
    expect(computeAgeAt("2010-06-01", "2026-07-05")).toBe(16);
  });

  it("does not count a birthday that has not happened yet in the reference year", () => {
    expect(computeAgeAt("2010-08-01", "2026-07-05")).toBe(15);
  });

  it("counts the birthday itself as the transition day", () => {
    expect(computeAgeAt("2010-07-05", "2026-07-05")).toBe(16);
  });
});
