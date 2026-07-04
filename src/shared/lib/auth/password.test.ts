import { describe, expect, it } from "vitest";
import { hashPassword, verifyPassword } from "./password";

describe("password hashing (demo SHA-256)", () => {
  it("hashes a password to the known SHA-256 hex digest", async () => {
    expect(await hashPassword("admin123")).toBe(
      "240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9",
    );
  });

  it("is deterministic — same input, same hash", async () => {
    expect(await hashPassword("prof123")).toBe(await hashPassword("prof123"));
  });

  it("verifies a matching password and rejects a wrong one", async () => {
    const hash = await hashPassword("coord123");
    expect(await verifyPassword("coord123", hash)).toBe(true);
    expect(await verifyPassword("errada", hash)).toBe(false);
  });
});
