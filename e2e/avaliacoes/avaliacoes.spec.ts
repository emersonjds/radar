import { expect, test } from "@playwright/test";

test.describe("avaliacoes", () => {
  test("professor lança notas, prefill ao reabrir e coordenação vê no relatório", async ({
    page,
  }) => {
    await page.goto("/avaliacoes");

    await expect(page.getByText("Prova 1")).toBeVisible();

    await page.getByRole("button", { name: "Nova avaliação" }).click();
    await page.getByLabel("Nome").fill("Prova Final");
    await page.getByLabel("Peso").selectOption("2");
    await page.getByRole("button", { name: "Criar" }).click();

    const notaPrimeiroAluno = page.getByLabel(/^Nota de /).first();
    await expect(page.getByRole("button", { name: "Prova Final" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    await notaPrimeiroAluno.fill("8.5");
    await page.getByRole("button", { name: "Salvar notas" }).click();

    await expect(page.getByText("Notas salvas")).toBeVisible();
    await page.screenshot({ path: "e2e/avaliacoes/evidencias/notas-salvas.png", fullPage: true });

    await page.reload();
    await page.getByRole("button", { name: "Prova Final" }).click();
    await expect(page.getByLabel(/^Nota de /).first()).toHaveValue("8.5");
    await page.screenshot({ path: "e2e/avaliacoes/evidencias/notas-prefill.png", fullPage: true });

    await page.getByRole("group", { name: "Trocar de persona" }).getByRole("button", { name: "Coordenação" }).click();
    await expect(page.getByText("Total de alunos")).toBeVisible();

    await page.goto("/alunos");
    await page.getByRole("link", { name: "Ver relatório" }).first().click();

    await expect(page.getByText("Desempenho por atividade")).toBeVisible();
    await expect(page.getByText("Prova Final")).toBeVisible();
    await expect(page.getByText("Média")).toBeVisible();
    await page.screenshot({
      path: "e2e/avaliacoes/evidencias/relatorio-com-notas.png",
      fullPage: true,
    });
  });

  test("guarda coordenação não acessa avaliações", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("group", { name: "Trocar de persona" }).getByRole("button", { name: "Coordenação" }).click();
    await expect(page.getByText("Total de alunos")).toBeVisible();

    await page.goto("/avaliacoes");

    await expect(page).toHaveURL("/");
    await expect(page.getByText("Total de alunos")).toBeVisible();
  });
});
