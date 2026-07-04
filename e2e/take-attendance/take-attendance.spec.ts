import { expect, test, type Page } from "@playwright/test";

const MOBILE_VIEWPORT = { width: 375, height: 812 };
const DESKTOP_VIEWPORT = { width: 1280, height: 800 };

// Mobile-first: nothing may push the page wider than the viewport (wide content
// must scroll inside its own card, not the whole document).
async function semOverflowHorizontal(page: Page) {
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(overflow).toBeLessThanOrEqual(0);
}

async function loginProfessor(page: Page) {
  await page.goto("/login");
  await page.getByLabel("Usuário").fill("ricardo");
  await page.getByLabel("Senha").fill("prof123");
  await page.getByRole("button", { name: "Entrar" }).click();
}

test.describe("chamada mobile (cards)", () => {
  test.use({ viewport: MOBILE_VIEWPORT });

  test("título, busca, tiles e marcação de status", async ({ page }) => {
    await loginProfessor(page);
    await page.goto("/attendance");

    await expect(page.getByLabel("Selecionar turma")).toBeVisible();
    await expect(page.getByPlaceholder("Buscar aluno por nome ou matrícula...")).toBeVisible();

    const linhas = page.locator('[aria-label^="Status de presença de"]');
    await expect(linhas.first()).toBeVisible();
    const totalInicial = await linhas.count();
    expect(totalInicial).toBeGreaterThan(0);

    const primeiroNome = (await linhas.first().getAttribute("aria-label"))!.replace(
      "Status de presença de ",
      "",
    );

    await page.getByPlaceholder("Buscar aluno por nome ou matrícula...").fill(primeiroNome);
    await expect(linhas).toHaveCount(1);

    await page.getByPlaceholder("Buscar aluno por nome ou matrícula...").fill("");
    await expect(linhas).toHaveCount(totalInicial);

    await linhas.first().getByRole("button", { name: "Ausente" }).click();
    await expect(linhas.first().getByRole("button", { name: "Ausente" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );

    await semOverflowHorizontal(page);

    await page.screenshot({ path: "e2e/take-attendance/evidencias/chamada-mobile.png", fullPage: true });
  });

  test("toggle abre o drawer e o backdrop fecha a sidebar", async ({ page }) => {
    await loginProfessor(page);
    await page.goto("/attendance");

    const aside = page.locator("aside");
    await expect.poll(async () => (await aside.boundingBox())?.x).toBeLessThan(0);

    await page.getByRole("button", { name: "Alternar menu" }).click();
    await expect.poll(async () => (await aside.boundingBox())?.x).toBe(0);

    // Drawer aberto cobre o botão (z-50); fecha pelo backdrop, como no template.
    await page.locator("div.fixed.inset-0.z-40").click({ position: { x: 350, y: 400 } });
    await expect.poll(async () => (await aside.boundingBox())?.x).toBeLessThan(0);
  });
});

test.describe("chamada desktop", () => {
  test.use({ viewport: DESKTOP_VIEWPORT });

  test("sidebar com Chamada e tela renderiza", async ({ page }) => {
    await loginProfessor(page);
    await page.goto("/attendance");

    const nav = page.getByRole("navigation", { name: "Navegação principal" });
    await expect(nav.getByRole("link", { name: "Chamada", exact: true })).toBeVisible();
    await expect(page.getByLabel("Selecionar turma")).toBeVisible();

    await page.screenshot({ path: "e2e/take-attendance/evidencias/chamada-desktop.png", fullPage: true });
  });

  test("toggle colapsa a sidebar para os ícones e reexpande", async ({ page }) => {
    await loginProfessor(page);
    await page.goto("/attendance");

    const aside = page.locator("aside");
    await expect.poll(async () => (await aside.boundingBox())?.width).toBe(290);

    await page.getByRole("button", { name: "Alternar menu" }).click();
    await expect.poll(async () => (await aside.boundingBox())?.width).toBe(90);

    await page.screenshot({ path: "e2e/take-attendance/evidencias/sidebar-colapsada.png", fullPage: true });

    await page.getByRole("button", { name: "Alternar menu" }).click();
    await expect.poll(async () => (await aside.boundingBox())?.width).toBe(290);
  });
});
