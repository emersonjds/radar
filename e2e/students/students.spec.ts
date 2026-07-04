import { expect, test } from "@playwright/test";

test.use({ viewport: { width: 1280, height: 800 } });

async function loginAdmin(page: import("@playwright/test").Page) {
  await page.goto("/login");
  await page.getByLabel("Usuário").fill("ana");
  await page.getByLabel("Senha").fill("admin123");
  await page.getByRole("button", { name: "Entrar" }).click();
}

test("admin adiciona, edita e exclui um aluno", async ({ page }) => {
  page.on("dialog", (dialog) => dialog.accept());
  await loginAdmin(page);
  await page.goto("/students");

  // Adicionar
  await page.getByRole("button", { name: "Adicionar aluno" }).click();
  await expect(page.getByRole("heading", { name: "Adicionar aluno" })).toBeVisible();
  await page.locator("#aluno-nome").fill("Aluno Teste E2E");
  await page.getByRole("button", { name: "Salvar" }).click();
  await expect(page.getByText("Aluno Teste E2E")).toBeVisible();
  await page.screenshot({ path: "e2e/students/evidencias/aluno-criado.png", fullPage: true });

  // Editar
  const linha = page.getByRole("row").filter({ hasText: "Aluno Teste E2E" });
  await linha.getByRole("button", { name: "Editar" }).click();
  await expect(page.getByRole("heading", { name: "Editar aluno" })).toBeVisible();
  await page.locator("#aluno-nome").fill("Aluno Editado E2E");
  await page.getByRole("button", { name: "Salvar" }).click();
  await expect(page.getByText("Aluno Editado E2E")).toBeVisible();

  // Excluir
  const linhaEditada = page.getByRole("row").filter({ hasText: "Aluno Editado E2E" });
  await linhaEditada.getByRole("button", { name: "Excluir" }).click();
  await expect(page.getByText("Aluno Editado E2E")).toHaveCount(0);
  await page.screenshot({ path: "e2e/students/evidencias/aluno-excluido.png", fullPage: true });
});
