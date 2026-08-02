import { expect, test, type Page } from "@playwright/test";

async function login(page: Page, usuario: string) {
  await page.goto("/login");
  await page.getByLabel("Perfil").selectOption(usuario);
  await page.getByRole("button", { name: "Entrar" }).click();
}

test.describe("painel admin", () => {
  test.use({ viewport: { width: 1280, height: 900 } });

  test("KPIs e gráficos ApexCharts renderizam", async ({ page }) => {
    await login(page, "ana");
    await expect(page.getByText("Total de alunos")).toBeVisible();
    await expect(page.getByText("Total de professores")).toBeVisible();
    await expect(page.getByText("Frequência geral")).toBeVisible();
    await expect(page.getByText("Frequência por aula")).toBeVisible();
    await expect(page.getByText("Tendência de frequência")).toBeVisible();
    await expect(page.locator(".apexcharts-canvas")).toHaveCount(2, { timeout: 15000 });
    await page.screenshot({ path: "e2e/dashboard/evidencias/painel-admin.png", fullPage: true });
  });
});

test.describe("painel coordenação", () => {
  test.use({ viewport: { width: 375, height: 812 } });

  test("coordenador vê o painel", async ({ page }) => {
    await login(page, "carla");

    await expect(page.getByText("Total de alunos")).toBeVisible();
    await expect(page.locator(".apexcharts-canvas").first()).toBeVisible({ timeout: 15000 });

    await page.screenshot({ path: "e2e/dashboard/evidencias/painel-coordenacao-mobile.png", fullPage: true });
  });
});
