import { expect, test, type Page } from "@playwright/test";

async function login(page: Page, user: string) {
  await page.goto("/login");
  await page.getByLabel("Perfil").selectOption(user);
  await page.getByRole("button", { name: "Entrar" }).click();
}

function sidebar(page: Page) {
  return page.getByRole("navigation", { name: "Navegação principal" });
}

test.describe("academic structure admin", () => {
  test("admin creates a subject", async ({ page }) => {
    await login(page, "ana");
    await sidebar(page).getByRole("link", { name: "Matérias", exact: true }).click();
    await page.getByRole("button", { name: "Adicionar matéria" }).click();
    await page.getByLabel("Nome").fill("Filosofia");
    await page.getByRole("button", { name: "Salvar" }).click();
    await expect(page.getByText("Filosofia")).toBeVisible();
    await page.screenshot({ path: "e2e/academic-structure/evidencias/materia-criada.png", fullPage: true });
  });

  test("admin creates a turma and assigns a matéria to a teacher", async ({ page }) => {
    await login(page, "ana");
    await sidebar(page).getByRole("link", { name: "Aulas", exact: true }).click();

    await page.getByRole("button", { name: "Adicionar aula" }).click();
    await page.getByLabel("Nome").fill("Redação I");
    await page.getByRole("button", { name: "Salvar" }).click();
    await expect(page.getByText("Redação I")).toBeVisible();

    // Open the turma's matérias panel and add one.
    const card = page.locator("li", { hasText: "Redação I" });
    await card.getByRole("button", { name: "Ver detalhes", exact: true }).click();
    await card.getByRole("button", { name: "Adicionar matéria à aula" }).click();
    await expect(card.getByText("Nenhuma matéria atribuída ainda.")).toHaveCount(0);

    await page.screenshot({ path: "e2e/academic-structure/evidencias/turma-com-lecionamento.png", fullPage: true });
  });
});

test.describe("roll-call scoping", () => {
  test("ricardo sees only his regência turmas in the roll-call select", async ({ page }) => {
    await login(page, "ricardo");
    await sidebar(page).getByRole("link", { name: "Chamada", exact: true }).click();

    const select = page.getByLabel("Selecionar aula");
    await expect(select).toBeEnabled();
    const options = await select.locator("option").allTextContents();
    expect(options.join(" ")).toContain("Reforço de Matemática — Segunda");
    expect(options.join(" ")).toContain("Reforço de Física — Terça");
    expect(options.join(" ")).not.toContain("Reforço de Ciências — Quarta");

    await page.screenshot({ path: "e2e/academic-structure/evidencias/chamada-ricardo.png", fullPage: true });
  });

  test("bruno sees only Ciências Gerais in the roll-call select", async ({ page }) => {
    await login(page, "bruno");
    await sidebar(page).getByRole("link", { name: "Chamada", exact: true }).click();

    const select = page.getByLabel("Selecionar aula");
    await expect(select).toBeEnabled();
    const options = await select.locator("option").allTextContents();
    expect(options.join(" ")).toContain("Reforço de Ciências — Quarta");
    expect(options.join(" ")).not.toContain("Reforço de Matemática — Segunda");

    await page.screenshot({ path: "e2e/academic-structure/evidencias/chamada-bruno.png", fullPage: true });
  });
});
