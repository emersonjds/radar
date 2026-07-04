import { expect, test, type Page } from "@playwright/test";

async function loginAdmin(page: Page) {
  await page.goto("/login");
  await page.getByLabel("Usuário").fill("ana");
  await page.getByLabel("Senha").fill("admin123");
  await page.getByRole("button", { name: "Entrar" }).click();
}

test.use({ viewport: { width: 1280, height: 800 } });

test("ficha do aluno: perfil, stats e calendário", async ({ page }) => {
  await loginAdmin(page);
  await page.goto("/reports");

  await expect(page.getByRole("heading", { name: "Desempenho & Presença" })).toBeVisible({
    timeout: 15000,
  });
  await expect(page.getByRole("button", { name: "Baixar relatório PDF" })).toBeVisible();
  await expect(page.getByText("Resumo de presença")).toBeVisible();

  await page.screenshot({ path: "e2e/reports/evidencias/ficha-aluno.png", fullPage: true });
});
