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

test.describe("academic structure admin", () => {
  test("admin creates a subject", async ({ page }) => {
    await login(page, "ana", "admin123");
    await sidebar(page).getByRole("link", { name: "Matérias", exact: true }).click();
    await page.getByRole("button", { name: "Adicionar matéria" }).click();
    await page.getByLabel("Nome").fill("Filosofia");
    await page.getByRole("button", { name: "Salvar" }).click();
    await expect(page.getByText("Filosofia")).toBeVisible();
    await page.screenshot({
      path: "e2e/academic-structure/evidencias/materia-criada.png",
      fullPage: true,
    });
  });

  test("admin creates a turma and assigns a matéria to a teacher", async ({ page }) => {
    await login(page, "ana", "admin123");
    await sidebar(page).getByRole("link", { name: "Turmas", exact: true }).click();

    await page.getByRole("button", { name: "Adicionar turma" }).click();
    await page.getByLabel("Nome").fill("Redação I");
    await page.getByLabel("Série").fill("1ª série");
    await page.getByRole("button", { name: "Salvar" }).click();
    await expect(page.getByText("Redação I")).toBeVisible();

    // Open the turma's matérias panel and add one.
    const card = page.locator("li", { hasText: "Redação I" });
    await card.getByRole("button", { name: "Matérias", exact: true }).click();
    await card.getByRole("button", { name: "Adicionar matéria à turma" }).click();
    await expect(card.getByText("Nenhuma matéria atribuída ainda.")).toHaveCount(0);

    await page.screenshot({
      path: "e2e/academic-structure/evidencias/turma-com-lecionamento.png",
      fullPage: true,
    });
  });
});

test.describe("roll-call scoping", () => {
  test("ricardo sees only his regência turmas in the roll-call select", async ({ page }) => {
    await login(page, "ricardo", "prof123");
    await sidebar(page).getByRole("link", { name: "Chamada", exact: true }).click();

    const select = page.getByLabel("Selecionar turma");
    await expect(select).toBeEnabled();
    const options = await select.locator("option").allTextContents();
    expect(options.join(" ")).toContain("Matemática Avançada II");
    expect(options.join(" ")).toContain("Física I");
    expect(options.join(" ")).not.toContain("Ciências Gerais");

    await page.screenshot({
      path: "e2e/academic-structure/evidencias/chamada-ricardo.png",
      fullPage: true,
    });
  });

  test("bruno sees only Ciências Gerais in the roll-call select", async ({ page }) => {
    await login(page, "bruno", "prof123");
    await sidebar(page).getByRole("link", { name: "Chamada", exact: true }).click();

    const select = page.getByLabel("Selecionar turma");
    await expect(select).toBeEnabled();
    const options = await select.locator("option").allTextContents();
    expect(options.join(" ")).toContain("Ciências Gerais");
    expect(options.join(" ")).not.toContain("Matemática Avançada II");

    await page.screenshot({
      path: "e2e/academic-structure/evidencias/chamada-bruno.png",
      fullPage: true,
    });
  });
});
