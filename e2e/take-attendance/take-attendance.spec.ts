import { expect, test } from "@playwright/test";

const MOBILE_VIEWPORT = { width: 375, height: 812 };
const DESKTOP_VIEWPORT = { width: 1280, height: 800 };

// Mobile navigates via the bottom tab bar ("Navegação inferior"); the desktop
// Sidebar ("Navegação principal") is display:none below 1024px, so each nav has
// a distinct accessible name and only one is in the tree per breakpoint.
function bottomNav(page: import("@playwright/test").Page) {
  return page.getByRole("navigation", { name: "Navegação inferior" });
}

async function loginComo(page: import("@playwright/test").Page, persona: "Professor" | "Coordenação") {
  await page.goto("/login");
  await page.getByRole("button", { name: persona }).click();
  await page.getByLabel("E-mail").fill("teste@radar.escola");
  await page.getByLabel("Senha").fill("senha123");
  await page.getByRole("button", { name: "Entrar" }).click();
}

test.describe("chamada mobile (bottom nav + cards)", () => {
  test.use({ viewport: MOBILE_VIEWPORT });

  test("tela de chamada: título, tiles, busca e status", async ({ page }) => {
    await page.goto("/attendance");

    await expect(page.getByLabel("Selecionar turma")).toBeVisible();
    await expect(page.getByPlaceholder("Buscar aluno por nome ou matrícula...")).toBeVisible();

    const linhas = page.locator('[aria-label^="Status de presença de"]');
    await expect(linhas.first()).toBeVisible();
    const totalInicial = await linhas.count();
    expect(totalInicial).toBeGreaterThan(0);

    const primeiroNome = await linhas
      .first()
      .getAttribute("aria-label")
      .then((label) => label!.replace("Status de presença de ", ""));

    await page.getByPlaceholder("Buscar aluno por nome ou matrícula...").fill(primeiroNome);
    await expect(linhas).toHaveCount(1);
    await expect(page.getByText(primeiroNome)).toBeVisible();

    await page.getByPlaceholder("Buscar aluno por nome ou matrícula...").fill("");
    await expect(linhas).toHaveCount(totalInicial);

    await linhas.first().getByRole("button", { name: "Ausente" }).click();
    await expect(linhas.first().getByRole("button", { name: "Ausente" })).toHaveAttribute("aria-pressed", "true");

    await expect(bottomNav(page)).toBeVisible();
    await expect(bottomNav(page).getByRole("link", { name: "Chamada", exact: true })).toBeVisible();

    await page.screenshot({ path: "e2e/take-attendance/evidencias/chamada-mobile.png", fullPage: true });
  });
});

test.describe("painel mobile", () => {
  test.use({ viewport: MOBILE_VIEWPORT });

  test("painel do professor com bottom nav (4 itens)", async ({ page }) => {
    await page.goto("/");

    await expect(bottomNav(page)).toBeVisible();
    await expect(bottomNav(page).getByRole("link", { name: "Chamada", exact: true })).toBeVisible();
    await expect(bottomNav(page).getByRole("link")).toHaveCount(4);

    await page.screenshot({ path: "e2e/take-attendance/evidencias/painel-professor-mobile.png", fullPage: true });
  });

  test("painel da coordenação com bottom nav (3 itens) e conteúdo não coberto", async ({ page }) => {
    // Persona switcher in the topbar is hidden below 768px (demo affordance);
    // log in as coordenação directly instead of trying to toggle it on mobile.
    await loginComo(page, "Coordenação");
    await expect(page.getByText("Total de alunos")).toBeVisible();

    await expect(bottomNav(page)).toBeVisible();
    await expect(bottomNav(page).getByRole("link", { name: "Relatórios" })).toBeVisible();
    await expect(bottomNav(page).getByRole("link")).toHaveCount(3);

    const kpi = page.getByText("Total de alunos");
    const kpiBox = await kpi.boundingBox();
    const navBox = await bottomNav(page).boundingBox();
    expect(kpiBox).not.toBeNull();
    expect(navBox).not.toBeNull();
    // KPI content must sit above the fixed bottom bar, not underneath it.
    expect(kpiBox!.y + kpiBox!.height).toBeLessThanOrEqual(navBox!.y);

    await page.screenshot({ path: "e2e/take-attendance/evidencias/painel-coordenacao-mobile.png", fullPage: true });
  });
});

test.describe("desktop: sidebar sim, bottom nav não", () => {
  test.use({ viewport: DESKTOP_VIEWPORT });

  test("chamada no desktop", async ({ page }) => {
    await page.goto("/attendance");

    // `display: none` removes BottomNav from the accessibility tree entirely,
    // so on desktop only the Sidebar's landmark should be present.
    await expect(page.getByRole("navigation", { name: "Navegação principal" })).toHaveCount(1);
    await expect(bottomNav(page)).toHaveCount(0);
    await expect(page.getByRole("complementary")).toBeVisible();
    await expect(page.getByRole("complementary").getByRole("link", { name: "Chamada", exact: true })).toBeVisible();

    await page.screenshot({ path: "e2e/take-attendance/evidencias/chamada-desktop.png", fullPage: true });
  });
});
