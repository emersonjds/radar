import { expect, test } from "@playwright/test";

test.describe("chamada", () => {
  test("salvar chamada", async ({ page }) => {
    await page.goto("/chamada");

    await page.getByRole("button", { name: "Marcar todos como presente" }).click();
    await page.getByRole("button", { name: "Salvar chamada" }).click();

    await expect(page.getByText("Chamada salva")).toBeVisible();

    await page.screenshot({ path: "e2e/chamada/evidencias/chamada-salva.png", fullPage: true });
  });

  test("prefill mantém status salvo ao reabrir a chamada", async ({ page }) => {
    await page.goto("/chamada");

    await page.getByRole("button", { name: "Marcar todos como presente" }).click();
    await page.getByRole("button", { name: "Salvar chamada" }).click();
    await expect(page.getByText("Chamada salva")).toBeVisible();

    await page.reload();

    const linhas = page.locator('[aria-label^="Status de presença de"]');
    await expect(linhas.first()).toBeVisible();
    const total = await linhas.count();
    expect(total).toBeGreaterThan(0);
    for (let indice = 0; indice < total; indice += 1) {
      await expect(linhas.nth(indice).getByRole("button", { name: "Presente" })).toHaveAttribute(
        "aria-pressed",
        "true",
      );
    }

    await page.screenshot({ path: "e2e/chamada/evidencias/chamada-prefill.png", fullPage: true });
  });
});
