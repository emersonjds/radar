import { expect, test } from "@playwright/test";
import { login } from "../helpers";

test.use({ viewport: { width: 1280, height: 800 } });

test("central de análise: panorama, recorte por turma e export CSV", async ({ page }) => {
  await login(page, "Administrador");
  await page.goto("/reports");

  await expect(page.getByRole("heading", { name: "Relatórios", exact: true })).toBeVisible({
    timeout: 15000,
  });
  await expect(page.getByRole("heading", { name: "Panorama — Todas as turmas" })).toBeVisible();
  const panorama = page.locator("section").filter({ hasText: "Panorama — Todas as turmas" });
  await expect(panorama.getByText("Nota média")).toBeVisible();
  await expect(panorama.getByText("Área forte")).toBeVisible();
  await expect(panorama.getByText("Média por área")).toBeVisible();

  // Linha de aluno traz nota e aptidão.
  const linhaMarcus = page.getByRole("row").filter({ hasText: "Marcus Thorne" });
  await expect(linhaMarcus).toContainText("Exatas");

  await page.screenshot({ path: "e2e/reports/evidencias/central-relatorios.png", fullPage: true });

  // Recorte por turma atualiza o panorama.
  await page.getByLabel("Selecionar turma").selectOption({ label: "Matemática Avançada II" });
  await expect(
    page.getByRole("heading", { name: "Panorama — Matemática Avançada II" }),
  ).toBeVisible();

  // Export CSV baixa de verdade.
  const [download] = await Promise.all([
    page.waitForEvent("download"),
    page.getByRole("button", { name: "Exportar CSV" }).click(),
  ]);
  expect(download.suggestedFilename()).toContain(".csv");
});

test("ficha do aluno traz frequência e bloco acadêmico com aptidão", async ({ page }) => {
  await login(page, "Administrador");
  await page.goto("/reports");

  const linhaMarcus = page.getByRole("row").filter({ hasText: "Marcus Thorne" });
  await linhaMarcus.getByRole("link", { name: "Abrir relatório de Marcus Thorne" }).click();

  await expect(page.getByRole("heading", { name: "Desempenho & Presença" })).toBeVisible();
  await expect(page.getByText("Resumo de presença")).toBeVisible();

  // Bloco acadêmico novo.
  await expect(page.getByRole("heading", { name: "Desempenho acadêmico" })).toBeVisible();
  await expect(page.getByText("Aptidão: Exatas")).toBeVisible();
  await expect(page.getByText("Notas por matéria")).toBeVisible();

  // Breadcrumb reflete o caminho.
  const trilha = page.getByRole("navigation", { name: "Trilha de navegação" });
  await expect(trilha.getByRole("link", { name: "Relatórios" })).toBeVisible();
  await expect(trilha.getByText("Marcus Thorne")).toBeVisible();

  await page.screenshot({ path: "e2e/reports/evidencias/ficha-aluno.png", fullPage: true });
});
