# Spec — Relatórios como Central de Análise

**Data**: 2026-07-04
**Status**: aprovado (brainstorm)

## Problema

`/reports` hoje é só uma lista de alunos → ficha individual de frequência, e se
sobrepõe ao `/painel` (ambos mostram risco/frequência). Falta uma divisão clara
e falta profundidade acadêmica: não existe nota no modelo, só frequência.

## Objetivo

Tornar Relatórios uma **central de análise** para coordenador e admin: recorte
por turma/período → panorama acadêmico da turma → ficha do aluno enriquecida →
exportar. Introduzir dados acadêmicos (matérias, notas, aptidão) de forma
organizada.

## Divisão de responsabilidades

- **Painel** (`/`): monitoramento ao vivo — KPIs do dia, frequência por turma,
  tendência, alertas de risco, tarefas. **Permanece como está.**
- **Relatórios** (`/reports`): investigação e extração — dono da profundidade
  acadêmica (notas, matérias de destaque, aptidão, ranking) e da exportação.

Sem duplicação: Painel não ganha notas; Relatórios não repete os KPIs ao vivo.

## Domínio novo (fase front-only, dados no seed — sem CRUD)

### `entities/subject`

```
Subject { id: string; name: string; area: Area }
Area = "exatas" | "biologicas" | "linguagens" | "humanas"
areaLabels: { exatas: "Exatas", biologicas: "Biológicas",
              linguagens: "Linguagens", humanas: "Humanas" }
```

8 matérias, 2 por área:

- Exatas: Matemática, Física
- Biológicas: Biologia, Química
- Linguagens: Português, Inglês
- Humanas: História, Geografia

### `entities/grade`

```
Grade { studentId: string; subjectId: string; score: number }  // 0–10, uma casa
```

Representa a **média já agregada por matéria** (não há avaliações individuais
nesta fase). Único por `(studentId, subjectId)`.

### Seed (`shared/lib/storage/seed.ts` + `db.ts`)

- Novas coleções `subjects` e `grades`.
- Cada um dos 18 alunos recebe nota em todas as 8 matérias.
- Geração **determinística** (sem `Math.random`): `score` derivado de
  `(studentIdx, subjectIdx)` de modo que alunos diferentes tenham áreas fortes
  diferentes (uns puxam Exatas, outros Humanas, etc.), com uma casa decimal e
  dentro de [0, 10].

## Analytics (`features/analytics/academic.ts`, puro e testável)

Attendance continua em `model.ts`. Novo arquivo `academic.ts` para não inchar:

- `overallAverage(grades): number` — média geral do aluno (0–10, uma casa).
- `averageBySubject(grades, subjects): { subject, score }[]` — ordenado desc.
- `areaAffinity(grades, subjects): { area, average }[]` — média por área,
  ordenada desc. O primeiro elemento é a **aptidão** do aluno.
- `topSubjects(grades, subjects, n)` / `attentionSubjects(grades, subjects, n)`.
- `classAcademicSummary(studentIds, grades, subjects)` — nota média da turma,
  área forte da turma, matérias de destaque da turma, top/atenção de alunos.

Regras: entradas vazias retornam neutro (0 / arrays vazios), nunca `NaN`.

## Tela `/reports` — Central (`widgets/reports/`)

Evolui o `reports-list` atual. Componentes:

- `ReportsCenter.tsx` — orquestra seletor + panorama + tabela.
- `ClassOverview.tsx` — card de panorama (freq média, nota média, área forte,
  matérias destaque, barra por área).
- `StudentsReportTable.tsx` — tabela de alunos do escopo.

Layout:

```
[Turma: Todas ▾] [Período: Sem.1 ▾]            [Exportar CSV]
┌ PANORAMA ────────────────────────────────────────────┐
│ Freq 82% · Nota 7,4 · Área forte: Exatas             │
│ Matérias destaque: Matemática, Física                │
│ barra por área (Exatas ███ 9,0 · Humanas █ 5,9 …)    │
└──────────────────────────────────────────────────────┘
ALUNO      TURMA     NOTA   FREQ   APTIDÃO   SITUAÇÃO
Marcus     Mat II    7,4    50%    Exatas    Em risco   → ficha
```

- Seletor de **Turma** (`Todas` + cada turma) reduz o escopo da tabela e do
  panorama; `Todas` = visão global.
- Seletor de **Período** (Semestre 1 / 2) — visual nesta fase (dados do seed não
  variam por período); mantido para paridade com a ficha e uso futuro.
- Clicar no aluno → `/reports/[studentId]`.
- **Situação**: "Em risco" quando faltas ≥ 3 (mesmo limite do resto do app).
- **Aptidão** na tabela = rótulo da área forte do aluno.

## Exportar CSV

Botão **Exportar CSV** gera e baixa um CSV real do recorte atual (colunas:
Aluno, Turma, Nota média, Frequência, Faltas, Aptidão, Situação), via Blob +
`URL.createObjectURL` no cliente. Sem backend. O "PDF" da ficha continua no-op
marcado com `ponytail:` (depende de endpoint).

## Ficha do aluno (`widgets/student-detail/StudentDetail.tsx`) — enriquecida

Mantém frequência + calendário e **acrescenta bloco acadêmico**:

- Nota geral do aluno.
- Notas por matéria (barras).
- **Aptidão**: área forte + barras por área.
- Matérias de destaque / de atenção.

Breadcrumb já cobre a trilha (`Início › Relatórios › <aluno>`).

## Testes (SDD)

1. **Unit** (`features/analytics/academic.test.ts`): média geral, média por
   matéria, afinidade de área (aptidão), destaque/atenção, resumo da turma;
   incluir casos vazios (sem `NaN`).
2. **Integração** (`entities/grade/api.test.ts`, `entities/subject/api.test.ts`):
   fetchers contra o storage com `resetDb`; unicidade `(studentId, subjectId)`.
3. **E2E** (`e2e/reports/reports.spec.ts`): `/reports` → escolhe turma →
   panorama aparece → tabela com nota+aptidão → exporta CSV (download) → clica
   aluno → ficha com bloco acadêmico + aptidão. **PNGs de evidência** em
   `e2e/reports/evidencias/`.

## Arquitetura tocada (FSD)

- `entities/subject/` (model, api, queries) — nova
- `entities/grade/` (model, api, queries) — nova
- `features/analytics/academic.ts` — nova (puro)
- `widgets/reports/` (ReportsCenter, ClassOverview, StudentsReportTable) — evolui
  `reports-list`
- `widgets/student-detail/StudentDetail.tsx` — enriquecido
- `shared/lib/storage/` (db collections + seed) — estendido

Regra de import FSD respeitada: `app → widgets → features → entities → shared`.

## Fora de escopo

- Avaliações individuais com peso (`Avaliação`/`Nota` do CLAUDE.md) — entram com
  backend.
- Geração de PDF.
- Variação real de dados por período.
- Edição de notas (CRUD).
