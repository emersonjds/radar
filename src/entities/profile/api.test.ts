import { beforeEach, describe, expect, it } from "vitest";
import { resetDb } from "@/shared/lib/storage/db";
import { verifyPassword } from "@/shared/lib/auth/password";
import { fetchProfileWithHash } from "./api";
import { createProfile, updateProfile } from "./api";

describe("profile update", () => {
  beforeEach(async () => {
    await resetDb();
  });

  it("changes name and role, keeping the id stable", async () => {
    const created = await createProfile({
      name: "Fulano",
      username: "fulano",
      role: "teacher",
      password: "senha123",
    });

    const updated = await updateProfile(created.id, { name: "Fulano Editado", role: "admin" });

    expect(updated.id).toBe(created.id);
    expect(updated.name).toBe("Fulano Editado");
    expect(updated.role).toBe("admin");
  });

  it("rejects a username already used by another profile", async () => {
    const primeiro = await createProfile({
      name: "Primeiro",
      username: "primeiro",
      role: "teacher",
      password: "senha123",
    });
    await createProfile({
      name: "Segundo",
      username: "segundo",
      role: "teacher",
      password: "senha123",
    });

    await expect(updateProfile(primeiro.id, { username: "segundo" })).rejects.toThrow();
  });

  it("rehashes the password when provided and keeps it when omitted", async () => {
    const created = await createProfile({
      name: "Ciclana",
      username: "ciclana",
      role: "teacher",
      password: "senha123",
    });

    await updateProfile(created.id, { name: "Ciclana II" });
    let stored = await fetchProfileWithHash("ciclana");
    expect(await verifyPassword("senha123", stored!.passwordHash)).toBe(true);

    await updateProfile(created.id, { password: "novasenha" });
    stored = await fetchProfileWithHash("ciclana");
    expect(await verifyPassword("novasenha", stored!.passwordHash)).toBe(true);
    expect(await verifyPassword("senha123", stored!.passwordHash)).toBe(false);
  });
});
