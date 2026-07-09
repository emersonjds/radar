import { expect, test } from "@playwright/test";
import { login, sidebar } from "../helpers";

test.describe("academic structure admin", () => {
  test("admin creates a subject", async ({ page }) => {
    await login(page, "Administrador");
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
    await login(page, "Administrador");
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
    await login(page, "Professor");
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
    // loginAsRole devolve o primeiro professor ativo (Ricardo); pra logar como
    // Bruno via cargo, desativa o Ricardo antes (mesma tática do auth.spec.ts).
    await login(page, "Administrador");
    await page.goto("/users");
    const ricardo = page.getByRole("listitem").filter({ hasText: "Ricardo Alves" });
    await ricardo.getByRole("button", { name: "Desativar" }).click();
    await expect(ricardo.getByText("Inativo")).toBeVisible();
    await page.getByRole("button", { name: "Sair" }).click();

    await login(page, "Professor");
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
