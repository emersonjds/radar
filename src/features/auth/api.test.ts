import { describe, it, expect, beforeEach } from "vitest";
import { resetDb } from "@/shared/lib/store/db";
import { entrar, sessaoAtualId } from "./api";

describe("auth api", () => {
  beforeEach(() => {
    resetDb();
  });

  it("logs in a seeded admin by email and stores the session", async () => {
    const perfil = await entrar("admin@radar.escola");
    expect(perfil.papel).toBe("admin");
    expect(sessaoAtualId()).toBe(perfil.id);
  });

  it("rejects an email with no matching perfil", async () => {
    await expect(entrar("nope@x.com")).rejects.toThrow();
  });
});
