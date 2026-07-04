import { expect, test, type Page } from "@playwright/test";

async function loginAdmin(page: Page) {
  await page.goto("/login");
  await page.getByLabel("Usuário").fill("ana");
  await page.getByLabel("Senha").fill("admin123");
  await page.getByRole("button", { name: "Entrar" }).click();
}

test.use({ viewport: { width: 1280, height: 800 } });

test("relatórios lista alunos e abre a ficha ao clicar", async ({ page }) => {
  await loginAdmin(page);
  await page.goto("/reports");

  await expect(page.getByRole("heading", { name: "Relatórios", exact: true })).toBeVisible({
    timeout: 15000,
  });
  const linha = page.getByRole("row").filter({ hasText: "Marcus Thorne" });
  await expect(linha).toBeVisible();

  await page.screenshot({ path: "e2e/reports/evidencias/lista-relatorios.png", fullPage: true });

  await linha.getByRole("link", { name: "Abrir relatório de Marcus Thorne" }).click();

  await expect(page.getByRole("heading", { name: "Desempenho & Presença" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Baixar relatório PDF" })).toBeVisible();
  await expect(page.getByText("Resumo de presença")).toBeVisible();

  // Breadcrumb reflete o caminho até a ficha.
  const trilha = page.getByRole("navigation", { name: "Trilha de navegação" });
  await expect(trilha.getByRole("link", { name: "Relatórios" })).toBeVisible();
  await expect(trilha.getByText("Marcus Thorne")).toBeVisible();

  await page.screenshot({ path: "e2e/reports/evidencias/ficha-aluno.png", fullPage: true });
});
