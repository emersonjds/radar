import { expect, test } from "@playwright/test";

test.describe("personas", () => {
  test("professor default", async ({ page }) => {
    await page.goto("/");

    const navegacao = page.getByRole("navigation", { name: "Navegação principal" });
    await expect(page.getByText("Bem-vindo, Prof. Ricardo")).toBeVisible();
    await expect(navegacao.getByRole("link", { name: "Chamada", exact: true })).toBeVisible();
    await expect(navegacao.getByRole("link", { name: "Relatórios", exact: true })).toHaveCount(0);

    await page.screenshot({ path: "e2e/personas/evidencias/professor-home.png", fullPage: true });
  });

  test("switch to coordenação", async ({ page }) => {
    await page.goto("/");

    await page.getByRole("group", { name: "Trocar de persona" }).getByRole("button", { name: "Coordenação" }).click();

    await expect(page.getByText("Total de alunos")).toBeVisible();
    await expect(page.getByRole("link", { name: "Relatórios" })).toBeVisible();

    await page.screenshot({ path: "e2e/personas/evidencias/admin-home.png", fullPage: true });
  });

  test("login as coordenação", async ({ page }) => {
    await page.goto("/login");

    await page.getByRole("button", { name: "Coordenação" }).click();
    await page.getByLabel("E-mail").fill("coordenacao@radar.escola");
    await page.getByLabel("Senha").fill("senha123");
    await page.getByRole("button", { name: "Entrar" }).click();

    await expect(page.getByText("Total de alunos")).toBeVisible();

    await page.screenshot({ path: "e2e/personas/evidencias/login-coordenacao.png", fullPage: true });
  });

  test("guard professor cannot access relatórios", async ({ page }) => {
    await page.goto("/relatorios");

    await expect(page).toHaveURL("/");
    await expect(page.getByText("Bem-vindo, Prof. Ricardo")).toBeVisible();

    await page.screenshot({ path: "e2e/personas/evidencias/guard-professor.png", fullPage: true });
  });

  test("guard admin cannot access chamada", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("group", { name: "Trocar de persona" }).getByRole("button", { name: "Coordenação" }).click();
    await expect(page.getByText("Total de alunos")).toBeVisible();

    await page.goto("/chamada");

    await expect(page).toHaveURL("/");
    await expect(page.getByText("Total de alunos")).toBeVisible();
  });
});
