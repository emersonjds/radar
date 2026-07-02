# CLAUDE.md — Radar

Regras de ouro para todo desenvolvimento assistido por IA neste projeto. Leia e siga integralmente antes de qualquer tarefa.

---

## 1. Identidade do Produto

- **Nome**: Radar
- **Domínio**: presença escolar. Professores marcam a chamada da turma (mobile, em sala); admins acompanham frequência e absenteísmo em dashboards (mobile + desktop).
- **Stack**: Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4, pnpm. Supabase (Postgres + RLS + RPCs) via `@supabase/ssr`. recharts, TanStack Query/Table, zustand, zod, react-hook-form.
- **Tipo**: SPA com static export (`output: "export"`) — sem servidor próprio; dados direto do Supabase (MSW só nos testes).
- **Idioma da UI**: português brasileiro em 100% dos textos visíveis.

## 2. Identidade Visual

- `brand-500` = `#2563eb` (azul — sinal de "radar" — cor principal)
- `accent` = `#f59e0b` (âmbar — alertas, destaque de "aluno em risco")
- Light mode como padrão (único modo do v1)
- Clima: escolar, profissional, direto ao ponto — o professor usa entre uma aula e outra

## 3. Regras de Git — OBRIGATÓRIO

- **Micro-commits atômicos** — uma mudança lógica por commit
- Mensagens em **inglês**, imperativo curto: `add X`, `fix Y`, `translate Z`
- **Proibido mencionar** Claude, Anthropic, IA, agent ou qualquer ferramenta de IA em mensagens de commit, PRs ou comentários
- **Proibido** rodapé `Co-Authored-By: Claude` ou similar
- **O push final é sempre do desenvolvedor humano** — nunca `git push` sem confirmação explícita
- Hooks: `git config --local core.hooksPath .githooks` (uma vez por clone)
- Versionados: `.claude/agents/`, `.claude/skills/`, `.claude/settings.json`, `.mcp.json`. Nunca commitar `.claude/settings.local.json`, `.serena/`, sessões/credenciais de IA

## 4. Qualidade de Código

> **Estas regras são OBRIGATÓRIAS para qualquer pessoa ou agent que escreva código neste projeto** — valem sempre, em toda tarefa e em todo subagent acionado.

- **Comentários: só o extremamente necessário.** Comente apenas o "porquê" não-óbvio de uma **regra** (de negócio, segurança, fuso, armadilha). Proibido comentário que narra/reescreve o que o código já diz. Na dúvida entre comentar e não comentar um trecho óbvio, **não comente**.
- **Legível em ≤10s por qualquer nível** (jr, pleno, sênior). Se exige mais que isso para entender, simplifique — nomes claros, funções pequenas de propósito único, sem esperteza desnecessária.
- **Melhores padrões E simples.** O melhor padrão aqui é o mais simples que resolve bem; padrão sofisticado que dificulta a leitura é o padrão errado. Sem abstração prematura, sem código morto.
- **Performance e escalabilidade sempre no radar.** Evite trabalho desnecessário (re-render, recomputação, query/loop redundante); escolha estruturas/algoritmos que aguentam crescer. Mas sem micro-otimização que prejudique a clareza — meça antes de complicar.
- Prefira editar arquivos existentes a criar novos.
- TypeScript: tipos explícitos em interfaces públicas; **sem `any`** (use `unknown` + narrowing); props sempre com interface nomeada.
- Nomes semânticos — proibido identificadores de uma letra.
- Tailwind: mobile-first (`sm:`/`md:`/`lg:`), usar tokens do design system (`brand-*`, `gray-*`, `accent`).

## 5. Arquitetura — Feature-Sliced Design

```
src/
├── app/          ← Next.js App Router. Rotas e layouts. Sem regra de negócio.
├── widgets/      ← UI composta (header, sidebar, painéis de gráfico).
├── features/     ← Casos de uso (fazer-chamada, ver-dashboard, gerir-turmas, gerir-alunos, auth).
├── entities/     ← Modelos de domínio (perfil, turma, aluno, chamada, presenca).
└── shared/       ← Infra reutilizável (ui, lib/supabase, hooks, providers).
```

**Regra de import**: só importar de **layers abaixo** (`app → widgets → features → entities → shared`). Nunca o contrário, nunca lateral entre slices da mesma layer.

## 6. Dados / API

> **Estado atual (experimento front-only):** os dados vivem em **localStorage** (`src/shared/lib/store/`, chave `radar.db.v1`), com seed de demonstração. Os fetchers de `entities/*/api.ts` são assíncronos e têm assinatura estável, então o Supabase abaixo entra depois como adapter sem mexer nas features. Analytics é calculado em JS sobre o store (temporário). O client Supabase (`src/shared/lib/supabase/`) já existe como encaixe do backend futuro.

- Backend-alvo é **Supabase** (Postgres + RLS + RPCs). O app é SPA static export e fala **direto** com o Supabase via `@supabase/ssr` (`getSupabaseBrowserClient`, `src/shared/lib/supabase/`). **Não há MSW** em produção — todos os dados (turmas, alunos, chamadas, presenças) vêm do banco real; MSW só mocka nos testes.
- Usa a **publishable key** (pública por design; a proteção é a RLS no Postgres). A `service_role` NUNCA vai para o frontend.
- Config em `.env.local`: `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`. Schema/migrations em `supabase/migrations/` (aplicar com `supabase db push`).
- **Analytics é responsabilidade do servidor**: frequência por aluno/turma, tendência de absenteísmo e alunos em risco vêm de views/RPCs do Postgres — nunca recalculadas no cliente.

## 7. Segurança

- Nunca commitar secrets/tokens/chaves de API
- RLS é a proteção real: professor só lê/escreve as próprias turmas (`professor_id = auth.uid()`); admin lê e gere tudo
- Coluna `papel` em `perfis` nunca gravável por `authenticated` (evita autopromoção a admin)
- Dados de aluno são PII (frequentemente menor de idade) — nunca logar nome/matrícula completos, mascarar em telemetria
- Validar status de presença e unicidade de chamada no servidor (constraints), nunca confiar só no cliente

## 8. Review (antes de concluir)

- [ ] `pnpm type-check` sem erros
- [ ] Textos da UI em PT-BR
- [ ] Responsivo (375px, 768px, 1280px) — mobile-first para o professor, desktop+mobile para o admin
- [ ] Sem `console.log` / código de debug
- [ ] Imports não usados removidos

### Testes obrigatórios por implementação (SDD)

Toda feature/implementação que passa pelo fluxo SDD **deve** ter as três camadas — e o E2E vale mais que os mocks (já pega bug de regra de servidor que os unit não pegam):

1. **Unitário** — lógica pura (libs, derivações, regras).
2. **Integração com MSW** — fetchers/queries contra o Supabase mockado (`src/test/msw/`).
3. **E2E de tela (Playwright)** — fluxo real no browser, **com prints de evidência em PNG**. As evidências ficam em `e2e/<feature>/evidencias/*.png` (gere rodando o spec; não invente prints).

## 9. Agentes disponíveis

Especialistas de domínio: `arq` (arquitetura FSD + Supabase), `back` (schema/RLS/RPCs de presença e analytics), `front` (frontend, performance e segurança client-side), `pixel` (UX/UI: chamada mobile do professor, dashboard responsivo do admin), `redteam` (segurança ofensiva e threat modeling da RLS).
Execução e qualidade: `bug` (QA/quality gate de código), `qa` (E2E em tela com Playwright), `scribe` (i18n PT-BR, docs).

Regra: **um agent por função, sem duplicação**.

## 10. Domínio: Radar

- **Perfil**: usuário do sistema, com papel `professor` ou `admin`.
- **Turma**: grupo de alunos com um professor responsável (nome, série, turno).
- **Aluno**: estudante vinculado a uma turma (nome, matrícula, ativo/inativo).
- **Chamada**: registro de uma aula realizada — única por `(turma, data)`.
- **Presença**: status de um aluno numa chamada — `presente`, `ausente`, `atrasado` ou `justificado`; única por `(chamada, aluno)`.
- **Frequência**: percentual de presença de um aluno ou de uma turma, agregado no servidor.
- **Absenteísmo**: tendência/série temporal de faltas ao longo do tempo.
- **Aluno em risco**: aluno com faltas acima de um limite (indicador de risco de evasão).
