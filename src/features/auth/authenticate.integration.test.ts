import { beforeEach, describe, expect, it } from "vitest";
import { resetDb } from "@/shared/lib/storage/db";
import { createProfile, fetchProfiles, setProfileActive } from "@/entities/profile/api";
import { authenticate } from "./authenticate";

describe("profile management + auth (integration, over the store)", () => {
  beforeEach(async () => {
    await resetDb();
  });

  it("logs in a seeded profile and rejects wrong credentials", async () => {
    expect(await authenticate("ricardo", "prof123")).not.toBeNull();
    expect(await authenticate("ricardo", "errada")).toBeNull();
    expect(await authenticate("fantasma", "prof123")).toBeNull();
  });

  it("creates a profile that can then log in", async () => {
    const criado = await createProfile({
      name: "Novo Coordenador",
      username: "NovoCoord",
      email: "novo@radar.escola",
      role: "coordinator",
      password: "segredo123",
    });
    expect(criado.role).toBe("coordinator");
    expect(criado.username).toBe("novocoord"); // normalized lowercase

    const logado = await authenticate("novocoord", "segredo123");
    expect(logado?.id).toBe(criado.id);
  });

  it("rejects a duplicate username", async () => {
    await expect(
      createProfile({
        name: "Outra Ana",
        username: "ana",
        email: "outra@radar.escola",
        role: "admin",
        password: "segredo123",
      }),
    ).rejects.toThrow(/já está em uso/);
  });

  it("rejects a password shorter than the minimum", async () => {
    await expect(
      createProfile({
        name: "Senha Curta",
        username: "curto",
        email: "curto@radar.escola",
        role: "teacher",
        password: "123",
      }),
    ).rejects.toThrow(/pelo menos 6/);
  });

  it("blocks login for a deactivated profile", async () => {
    const [ricardo] = (await fetchProfiles()).filter((profile) => profile.username === "ricardo");
    await setProfileActive(ricardo.id, false);
    expect(await authenticate("ricardo", "prof123")).toBeNull();
  });
});
