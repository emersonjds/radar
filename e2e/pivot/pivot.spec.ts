import { test, expect } from "@playwright/test";
import { login, sidebar } from "../helpers";

test.describe("ong reforço pivot: ficha cadastral e matrícula N:N", () => {
  test("admin cria ficha do aluno, matricula em aula, e professor vê na chamada", async ({
    page,
  }) => {
    // 1. Admin faz login
    await login(page, "Administrador");

    // 2. Navega para a tela de alunos
    await sidebar(page).getByRole("link", { name: "Alunos", exact: true }).click();
    await expect(page.getByRole("heading", { name: "Alunos" })).toBeVisible({ timeout: 10000 });

    // 3. Cria um novo aluno com ficha completa
    await page.getByRole("button", { name: "Adicionar aluno" }).click();
    await page.locator("#aluno-nome").fill("João Pedro Silva");
    await page.locator("#aluno-nascimento").fill("2010-03-15");
    await page.locator("#aluno-responsavel").fill("Maria Silva");
    await page.locator("#aluno-telefone").fill("(11) 98765-4321");
    await page.getByRole("button", { name: "Salvar" }).click();

    // Aguarda e verifica se o aluno foi criado
    await expect(page.getByText("João Pedro Silva")).toBeVisible({ timeout: 5000 });
    await expect(page.getByRole("dialog")).toHaveCount(0);
    await page.screenshot({ path: "e2e/pivot/evidencias/aluno-criado.png", fullPage: true });

    // 4. Navega para aulas e matricula o aluno
    await sidebar(page).getByRole("link", { name: "Aulas", exact: true }).click();
    await expect(page.getByRole("heading", { name: "Aulas" })).toBeVisible();

    // Encontra a card da aula "Reforço de Matemática — Segunda" e clica em "Ver detalhes"
    const aulaCard = page.locator("li", { hasText: "Reforço de Matemática — Segunda" });
    await aulaCard.getByRole("button", { name: "Ver detalhes" }).click();

    // Verifica se o painel de alunos matriculados apareceu
    await expect(aulaCard.getByText("Alunos matriculados")).toBeVisible();

    // Matricula João Pedro
    await aulaCard.getByLabel("Adicionar aluno").selectOption({ label: "João Pedro Silva" });
    await aulaCard.getByRole("button", { name: "Matricular" }).click();

    // Aguarda e verifica se João Pedro aparece na lista de matriculados
    await expect(aulaCard.getByText("João Pedro Silva")).toBeVisible({ timeout: 5000 });
    await page.screenshot({ path: "e2e/pivot/evidencias/aluno-matriculado.png", fullPage: true });

    // Faz logout
    await page.getByRole("button", { name: "Sair" }).click();

    // 5. Professor Ricardo faz login e vê João Pedro na lista da chamada
    await login(page, "Professor");
    await sidebar(page).getByRole("link", { name: "Chamada", exact: true }).click();

    // Seleciona a aula "Reforço de Matemática — Segunda"
    await page
      .getByLabel("Selecionar aula")
      .selectOption({ label: "Reforço de Matemática — Segunda" });

    // Verifica que João Pedro aparece na lista de alunos
    await expect(page.getByText("João Pedro Silva")).toBeVisible({ timeout: 5000 });
    await page.screenshot({ path: "e2e/pivot/evidencias/aluno-na-chamada.png", fullPage: true });
  });
});
