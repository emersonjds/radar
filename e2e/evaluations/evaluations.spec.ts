import { expect, test, type Page } from "@playwright/test";

async function login(page: Page, user: string, password: string) {
  await page.goto("/login");
  await page.getByLabel("Usuário").fill(user);
  await page.getByLabel("Senha").fill(password);
  await page.getByRole("button", { name: "Entrar" }).click();
}

function sidebar(page: Page) {
  return page.getByRole("navigation", { name: "Navegação principal" });
}

test.describe("teacher grades flow", () => {
  test("teacher creates an evaluation and enters a grade", async ({ page }) => {
    await login(page, "ricardo", "prof123");
    await sidebar(page).getByRole("link", { name: "Notas", exact: true }).click();

    await page.getByRole("button", { name: /—/ }).first().click();
    await expect(page.getByRole("heading", { name: "Avaliações" })).toBeVisible();

    await page.getByRole("button", { name: "Nova avaliação" }).click();
    await page.getByLabel("Nome").fill("P2");
    await page.getByLabel("Data").fill("2026-07-10");
    await page.getByRole("button", { name: "Salvar" }).click();
    await expect(page.getByText("P2")).toBeVisible();
    await page.screenshot({ path: "e2e/evaluations/evidencias/avaliacao-criada.png", fullPage: true });

    const card = page.locator("li", { hasText: "P2" });
    await card.getByRole("button", { name: "Lançar notas" }).click();
    const firstScore = card.getByRole("spinbutton").first();
    await firstScore.fill("9.5");
    await firstScore.blur();
    await expect(firstScore).toHaveValue("9.5");
    await page.screenshot({ path: "e2e/evaluations/evidencias/nota-lancada.png", fullPage: true });
  });
});
