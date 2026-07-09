import type { Page } from "@playwright/test";

export type PersonaLabel = "Administrador" | "Professor" | "Coordenador";

export async function login(page: Page, persona: PersonaLabel) {
  await page.goto("/login");
  await page.getByLabel("Entrar como").selectOption({ label: persona });
  await page.getByRole("button", { name: "Entrar" }).click();
  await page.waitForURL("/");
}

export function sidebar(page: Page) {
  return page.getByRole("navigation", { name: "Navegação principal" });
}
