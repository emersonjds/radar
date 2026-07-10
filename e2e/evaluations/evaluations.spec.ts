import { expect, test } from "@playwright/test";
import { login, sidebar } from "../helpers";

test.describe("teacher grades flow", () => {
  test("teacher creates an evaluation and enters a grade", async ({ page }) => {
    await login(page, "Professor");
    await sidebar(page).getByRole("link", { name: "Notas", exact: true }).click();

    await page.getByRole("button", { name: /—/ }).first().click();
    await expect(page.getByRole("heading", { name: "Avaliações" })).toBeVisible();

    await page.getByRole("button", { name: "Nova avaliação" }).click();
    await page.getByLabel("Nome").fill("P2");
    await page.getByLabel("Data").fill("2026-07-10");
    await page.getByRole("button", { name: "Salvar" }).click();
    await expect(page.getByText("P2")).toBeVisible();
    await page.screenshot({
      path: "e2e/evaluations/evidencias/avaliacao-criada.png",
      fullPage: true,
    });

    const card = page.locator("li", { hasText: "P2" });
    await card.getByRole("button", { name: "Lançar notas" }).click();
    const firstScore = card.getByRole("spinbutton").first();
    await firstScore.fill("9.5");
    await firstScore.blur();
    await expect(firstScore).toHaveValue("9.5");
    await page.screenshot({ path: "e2e/evaluations/evidencias/nota-lancada.png", fullPage: true });
  });

  test("excluir avaliação pede confirmação e cancelar preserva a avaliação", async ({ page }) => {
    await login(page, "Professor");
    await sidebar(page).getByRole("link", { name: "Notas", exact: true }).click();
    await page.getByRole("button", { name: /—/ }).first().click();

    await page.getByRole("button", { name: "Nova avaliação" }).click();
    await page.getByLabel("Nome").fill("P3");
    await page.getByLabel("Data").fill("2026-07-11");
    await page.getByRole("button", { name: "Salvar" }).click();
    await expect(page.getByText("P3")).toBeVisible();

    const card = page.locator("li", { hasText: "P3" });

    let aviso = "";
    page.once("dialog", (dialog) => {
      aviso = dialog.message();
      return dialog.dismiss();
    });
    await card.getByRole("button", { name: "Excluir P3" }).click();
    expect(aviso).toContain("As notas lançadas nela serão apagadas");
    await expect(page.getByText("P3")).toBeVisible();

    page.once("dialog", (dialog) => dialog.accept());
    await card.getByRole("button", { name: "Excluir P3" }).click();
    await expect(page.getByText("P3")).toHaveCount(0);
  });
});
