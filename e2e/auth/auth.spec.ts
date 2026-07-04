import { expect, test, type Page } from "@playwright/test";

const MOBILE_VIEWPORT = { width: 375, height: 812 };

function bottomNav(page: Page) {
  return page.getByRole("navigation", { name: "Navegação inferior" });
}

async function login(page: Page, usuario: string, senha: string) {
  await page.goto("/login");
  await page.getByLabel("Usuário").fill(usuario);
  await page.getByLabel("Senha").fill(senha);
  await page.getByRole("button", { name: "Entrar" }).click();
}

test.use({ viewport: MOBILE_VIEWPORT });

test.describe("login", () => {
  test("usuário ou senha inválidos mostra alerta e não tem seletor de persona", async ({ page }) => {
    await page.goto("/login");

    await expect(page.getByRole("button", { name: "Professor" })).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Coordenação" })).toHaveCount(0);

    await login(page, "ricardo", "senha-errada");

    await expect(
      page.getByRole("alert").filter({ hasText: "Usuário ou senha inválidos." }),
    ).toBeVisible();
    await expect(page).toHaveURL("/login");

    await page.screenshot({ path: "e2e/auth/evidencias/login-invalido.png", fullPage: true });
  });
});

test.describe("visão por papel", () => {
  test("professor vê apenas Chamada e Alunos, home mostra lista de alunos", async ({ page }) => {
    await login(page, "ricardo", "prof123");

    await expect(page.getByText("Meus alunos")).toBeVisible();

    const nav = bottomNav(page);
    await expect(nav.getByRole("link")).toHaveCount(2);
    await expect(nav.getByRole("link", { name: "Chamada", exact: true })).toBeVisible();
    await expect(nav.getByRole("link", { name: "Alunos", exact: true })).toBeVisible();
    await expect(nav.getByRole("link", { name: "Painel" })).toHaveCount(0);
    await expect(nav.getByRole("link", { name: "Relatórios" })).toHaveCount(0);
    await expect(nav.getByRole("link", { name: "Perfis" })).toHaveCount(0);

    await page.screenshot({ path: "e2e/auth/evidencias/professor-home.png", fullPage: true });
  });

  test("admin vê Painel, Alunos, Relatórios e Perfis, e abre /users", async ({ page }) => {
    await login(page, "ana", "admin123");

    const nav = bottomNav(page);
    await expect(nav.getByRole("link")).toHaveCount(4);
    await expect(nav.getByRole("link", { name: "Painel" })).toBeVisible();
    await expect(nav.getByRole("link", { name: "Alunos", exact: true })).toBeVisible();
    await expect(nav.getByRole("link", { name: "Relatórios" })).toBeVisible();
    await expect(nav.getByRole("link", { name: "Perfis" })).toBeVisible();

    await page.screenshot({ path: "e2e/auth/evidencias/admin-home.png", fullPage: true });

    await nav.getByRole("link", { name: "Perfis" }).click();
    await expect(page).toHaveURL("/users");
    await expect(page.getByRole("heading", { name: "Perfis", exact: true })).toBeVisible();

    await page.screenshot({ path: "e2e/auth/evidencias/admin-perfis.png", fullPage: true });
  });

  test("coordenador vê Painel, Alunos, Relatórios sem Perfis, e deep link /users volta pra home", async ({
    page,
  }) => {
    await login(page, "carla", "coord123");

    const nav = bottomNav(page);
    await expect(nav.getByRole("link")).toHaveCount(3);
    await expect(nav.getByRole("link", { name: "Painel" })).toBeVisible();
    await expect(nav.getByRole("link", { name: "Alunos", exact: true })).toBeVisible();
    await expect(nav.getByRole("link", { name: "Relatórios" })).toBeVisible();
    await expect(nav.getByRole("link", { name: "Perfis" })).toHaveCount(0);

    await page.screenshot({ path: "e2e/auth/evidencias/coordenador-home.png", fullPage: true });

    await page.goto("/users");
    await expect(page).toHaveURL("/");
  });
});

test.describe("guard de auth", () => {
  test("sem sessão, /students redireciona pra /login", async ({ page }) => {
    await page.goto("/students");
    await expect(page).toHaveURL("/login");

    await page.screenshot({ path: "e2e/auth/evidencias/guard-sem-sessao.png", fullPage: true });
  });

  test("sem sessão, / redireciona pra /login", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveURL("/login");
  });

  test("professor não acessa /reports (redireciona pra home)", async ({ page }) => {
    await login(page, "ricardo", "prof123");
    await page.goto("/reports");
    await expect(page).toHaveURL("/");
    await expect(page.getByText("Meus alunos")).toBeVisible();
  });

  test("coordenador não acessa /attendance (redireciona pra home)", async ({ page }) => {
    await login(page, "carla", "coord123");
    await page.goto("/attendance");
    await expect(page).toHaveURL("/");
  });
});

test.describe("gestão de perfis (admin)", () => {
  test("admin cria perfil de professor e o novo usuário consegue logar", async ({ page }) => {
    await login(page, "ana", "admin123");
    await page.goto("/users");

    await page.getByLabel("Nome").fill("Perfil de Teste");
    await page.getByLabel("Usuário").fill("teste");
    await page.getByLabel("E-mail").fill("teste@radar.escola");
    await page.getByLabel("Papel").selectOption("teacher");
    await page.getByLabel("Senha").fill("teste123");
    await page.getByRole("button", { name: "Criar perfil" }).click();

    const item = page.getByRole("listitem").filter({ hasText: "Perfil de Teste" });
    await expect(item).toBeVisible();
    await expect(item.getByText("Ativo")).toBeVisible();

    await page.screenshot({ path: "e2e/auth/evidencias/perfil-criado.png", fullPage: true });

    await page.getByRole("button", { name: "Sair" }).click();
    await expect(page).toHaveURL("/login");

    await login(page, "teste", "teste123");
    await expect(page.getByText("Meus alunos")).toBeVisible();
    await expect(bottomNav(page).getByRole("link")).toHaveCount(2);

    await page.screenshot({ path: "e2e/auth/evidencias/perfil-criado-login.png", fullPage: true });
  });

  test("admin desativa um perfil e o badge vira Inativo", async ({ page }) => {
    await login(page, "ana", "admin123");
    await page.goto("/users");

    const item = page.getByRole("listitem").filter({ hasText: "Carla Dias" });
    await expect(item.getByText("Ativo")).toBeVisible();

    await item.getByRole("button", { name: "Desativar" }).click();
    await expect(item.getByText("Inativo")).toBeVisible();

    await page.screenshot({ path: "e2e/auth/evidencias/perfil-desativado.png", fullPage: true });

    await page.getByRole("button", { name: "Sair" }).click();
    await login(page, "carla", "coord123");
    await expect(
      page.getByRole("alert").filter({ hasText: "Usuário ou senha inválidos." }),
    ).toBeVisible();
  });
});
