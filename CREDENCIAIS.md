# Credenciais de Acesso - Radar (Demo)

A tela de login lista os perfis num select e já preenche a senha (`123456` para todos, campo desabilitado) — basta escolher o perfil e entrar.

## 👨‍💼 Administração

**Ana Vance**
- **Usuário**: `ana`
- **Senha**: `123456`
- **Perfil**: Administrador
- **Acesso**: Todas as funcionalidades

---

## 👨‍🏫 Professores

### Ricardo Alves (Professor Titular)
- **Usuário**: `ricardo`
- **Senha**: `123456`
- **Perfil**: Professor
- **Aulas**:
  - Reforço de Matemática — Segunda (tarde)
  - Reforço de Física — Terça (tarde)
- **Acesso**: Chamada das suas aulas, lançamento de notas

### Bruno Farias (Professor)
- **Usuário**: `bruno`
- **Senha**: `123456`
- **Perfil**: Professor
- **Aulas**:
  - Reforço de Ciências — Quarta (tarde)
- **Acesso**: Chamada da sua aula, lançamento de notas

---

## 📋 Coordenação

**Carla Dias**
- **Usuário**: `carla`
- **Senha**: `123456`
- **Perfil**: Coordenador Pedagógico
- **Acesso**: Visualização de relatórios e acompanhamento

---

## 🎯 Como Testar

### Testar como Administração:

1. **Login**: escolha `Ana Vance — Administração` no select
2. **Dashboard**: Veja KPIs, gráficos de frequência, alunos em risco
3. **Alunos**:
   - Liste todos os alunos (18 cadastrados)
   - Crie um novo aluno com ficha completa (nome, data nascimento, responsável, telefone)
   - Busque por nome
   - Veja alunos em risco
4. **Aulas**:
   - Liste as 3 aulas cadastradas
   - Crie uma nova aula
   - Expanda uma aula e veja os alunos matriculados
   - Matricule/desmatrícule alunos
   - Gerencie matérias de cada aula
5. **Relatórios**:
   - Veja o panorama geral
   - Filtre por aula específica
   - Clique em um aluno para ver ficha detalhada
   - Exporte para CSV

### Testar como Professor:

1. **Login**: escolha `Ricardo Alves` ou `Bruno Farias` no select
2. **Chamada**:
   - Selecione uma aula
   - Marque presença/falta/atraso/justificado
   - Salve a chamada
3. **Notas**:
   - Selecione uma aula
   - Lance notas de avaliações
   - Veja médias calculadas automaticamente

---

## 🗂️ Dados de Demo

- **18 alunos** cadastrados (6 por aula)
- **3 aulas** ativas no contra-turno (tarde)
- **8 matérias** configuradas (Matemática, Física, Biologia, Química, Português, Inglês, História, Geografia)
- **Histórico de chamadas** dos últimos 15 dias
- **Alunos em risco** identificados (Marcus, Sasha, Julian)

---

## 🔒 Segurança

Estas são credenciais de **demonstração**. Em produção com Supabase:
- Autenticação via Supabase Auth
- RLS (Row Level Security) no Postgres
- Senhas nunca expostas no frontend
- Tokens JWT para sessão
