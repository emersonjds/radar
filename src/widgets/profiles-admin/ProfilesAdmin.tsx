"use client";

import { useState, type FormEvent } from "react";
import { roleLabels, roleSchema, type Role } from "@/entities/profile/model";
import { useCreateProfile, useProfiles, useSetProfileActive } from "@/entities/profile/queries";
import { useSession } from "@/features/session/use-session";
import { Badge } from "@/shared/ui/Badge/Badge";
import { Button } from "@/shared/ui/Button/Button";
import { Card } from "@/shared/ui/Card/Card";
import styles from "./ProfilesAdmin.module.css";

const ROLES = roleSchema.options;

const EMPTY_FORM = { name: "", username: "", email: "", role: "teacher" as Role, password: "" };

export function ProfilesAdmin() {
  const { profileId } = useSession();
  const { data: perfis, isLoading } = useProfiles();
  const createProfile = useCreateProfile();
  const setActive = useSetProfileActive();

  const [form, setForm] = useState(EMPTY_FORM);
  const [erro, setErro] = useState<string | null>(null);
  const [criado, setCriado] = useState<string | null>(null);

  async function criar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErro(null);
    setCriado(null);
    try {
      const perfil = await createProfile.mutateAsync(form);
      setCriado(`Perfil de ${perfil.name} criado.`);
      setForm(EMPTY_FORM);
    } catch (motivo) {
      setErro(motivo instanceof Error ? motivo.message : "Não foi possível criar o perfil.");
    }
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.titulo}>Perfis</h1>
        <p className={styles.subtitulo}>Crie e gerencie os acessos abaixo de você.</p>
      </header>

      <Card as="section" className={styles.formCard}>
        <h2 className={styles.secaoTitulo}>Novo perfil</h2>
        <form className={styles.form} onSubmit={criar}>
          <div className={styles.campo}>
            <label htmlFor="perfil-nome">Nome</label>
            <input
              id="perfil-nome"
              value={form.name}
              onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
              required
            />
          </div>
          <div className={styles.campo}>
            <label htmlFor="perfil-usuario">Usuário</label>
            <input
              id="perfil-usuario"
              autoCapitalize="none"
              value={form.username}
              onChange={(event) => setForm((prev) => ({ ...prev, username: event.target.value }))}
              required
            />
          </div>
          <div className={styles.campo}>
            <label htmlFor="perfil-email">E-mail</label>
            <input
              id="perfil-email"
              type="email"
              value={form.email}
              onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
              required
            />
          </div>
          <div className={styles.campo}>
            <label htmlFor="perfil-papel">Papel</label>
            <select
              id="perfil-papel"
              value={form.role}
              onChange={(event) => setForm((prev) => ({ ...prev, role: event.target.value as Role }))}
            >
              {ROLES.map((role) => (
                <option key={role} value={role}>
                  {roleLabels[role]}
                </option>
              ))}
            </select>
          </div>
          <div className={styles.campo}>
            <label htmlFor="perfil-senha">Senha</label>
            <input
              id="perfil-senha"
              type="password"
              minLength={6}
              autoComplete="new-password"
              value={form.password}
              onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
              required
            />
          </div>

          {erro && (
            <p className={styles.erro} role="alert">
              {erro}
            </p>
          )}
          {criado && (
            <p className={styles.ok} role="status">
              {criado}
            </p>
          )}

          <Button type="submit" disabled={createProfile.isPending}>
            {createProfile.isPending ? "Criando…" : "Criar perfil"}
          </Button>
        </form>
      </Card>

      <Card as="section" className={styles.listaCard}>
        <h2 className={styles.secaoTitulo}>Perfis existentes</h2>
        {isLoading ? (
          <p className={styles.vazio}>Carregando…</p>
        ) : (
          <ul className={styles.lista}>
            {(perfis ?? []).map((perfil) => (
              <li key={perfil.id} className={styles.item}>
                <div className={styles.info}>
                  <span className={styles.nome}>{perfil.name}</span>
                  <span className={styles.meta}>
                    @{perfil.username} · {roleLabels[perfil.role]}
                  </span>
                </div>
                <Badge tone={perfil.active ? "success" : "neutral"}>
                  {perfil.active ? "Ativo" : "Inativo"}
                </Badge>
                <Button
                  variant="outlined"
                  size="sm"
                  disabled={perfil.id === profileId || setActive.isPending}
                  onClick={() => setActive.mutate({ id: perfil.id, active: !perfil.active })}
                >
                  {perfil.active ? "Desativar" : "Ativar"}
                </Button>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
