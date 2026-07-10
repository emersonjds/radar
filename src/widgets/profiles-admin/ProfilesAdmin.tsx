"use client";

import { useState, type FormEvent } from "react";
import { roleLabels, roleSchema, type Role } from "@/entities/profile/model";
import {
  useCreateProfile,
  useDeleteProfile,
  useProfiles,
  useSetProfileActive,
} from "@/entities/profile/queries";
import { useSession } from "@/features/session/use-session";
import type { PublicProfile } from "@/entities/profile/api";
import { ProfileFormModal } from "./ProfileFormModal";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Label } from "@/shared/ui/label";
import { PencilIcon, TrashBinIcon } from "@tailadmin/icons";

const ROLES = roleSchema.options;
const EMPTY_FORM = { name: "", username: "", role: "teacher" as Role, password: "" };

const control =
  "h-11 w-full rounded-lg border border-input bg-transparent px-4 text-sm text-foreground focus:border-ring focus:outline-hidden focus:ring-3 focus:ring-ring/20";
const acaoBtn =
  "flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40";

function PowerIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="12" y1="3.5" x2="12" y2="12" />
      <path d="M7.5 7a6.5 6.5 0 1 0 9 0" />
    </svg>
  );
}

export function ProfilesAdmin() {
  const { profileId } = useSession();
  const { data: perfis, isLoading } = useProfiles();
  const createProfile = useCreateProfile();
  const setActive = useSetProfileActive();
  const deleteProfile = useDeleteProfile();

  const [form, setForm] = useState(EMPTY_FORM);
  const [erro, setErro] = useState<string | null>(null);
  const [criado, setCriado] = useState<string | null>(null);
  const [editando, setEditando] = useState<PublicProfile | null>(null);

  async function criar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (createProfile.isPending) return;
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
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-2xl font-bold text-foreground">Perfis</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Crie e gerencie os acessos abaixo de você.
        </p>
      </header>

      <section className="rounded-xl border bg-card p-4 shadow-sm md:p-5">
        <h2 className="mb-5 text-lg font-semibold text-foreground">Novo perfil</h2>
        <form onSubmit={criar} className="flex flex-col gap-5">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <Label className="mb-1.5" htmlFor="perfil-nome">
                Nome
              </Label>
              <input
                id="perfil-nome"
                value={form.name}
                onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
                required
                className={control}
              />
            </div>
            <div>
              <Label className="mb-1.5" htmlFor="perfil-usuario">
                Login de usuário
              </Label>
              <input
                id="perfil-usuario"
                autoCapitalize="none"
                value={form.username}
                onChange={(event) => setForm((prev) => ({ ...prev, username: event.target.value }))}
                required
                className={control}
              />
            </div>
            <div>
              <Label className="mb-1.5" htmlFor="perfil-papel">
                Papel
              </Label>
              <select
                id="perfil-papel"
                value={form.role}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, role: event.target.value as Role }))
                }
                className={control}
              >
                {ROLES.map((role) => (
                  <option key={role} value={role}>
                    {roleLabels[role]}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label className="mb-1.5" htmlFor="perfil-senha">
                Senha
              </Label>
              <input
                id="perfil-senha"
                type="password"
                minLength={6}
                autoComplete="new-password"
                value={form.password}
                onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
                required
                className={control}
              />
            </div>
          </div>

          {erro && (
            <p role="alert" className="text-sm text-destructive">
              {erro}
            </p>
          )}
          {criado && (
            <p role="status" className="text-sm text-success-600">
              {criado}
            </p>
          )}

          <div>
            <Button type="submit" size="sm" disabled={createProfile.isPending}>
              {createProfile.isPending ? "Criando…" : "Criar perfil"}
            </Button>
          </div>
        </form>
      </section>

      <section className="rounded-xl border bg-card p-4 shadow-sm md:p-5">
        <h2 className="mb-5 text-lg font-semibold text-foreground">Perfis existentes</h2>
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Carregando…</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {(perfis ?? []).map((perfil) => (
              <li
                key={perfil.id}
                className="flex flex-wrap items-center gap-3 rounded-xl border border-border px-4 py-3"
              >
                <div className="mr-auto min-w-0">
                  <p className="font-medium text-foreground">{perfil.name}</p>
                  <p className="text-sm text-muted-foreground">
                    @{perfil.username} · {roleLabels[perfil.role]}
                  </p>
                </div>
                <Badge variant={perfil.active ? "success" : "secondary"}>
                  {perfil.active ? "Ativo" : "Inativo"}
                </Badge>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    className={acaoBtn}
                    aria-label={`Editar ${perfil.name}`}
                    title="Editar"
                    onClick={() => setEditando(perfil)}
                  >
                    <PencilIcon className="size-[18px]" />
                  </button>
                  <button
                    type="button"
                    className={acaoBtn}
                    aria-label={
                      perfil.active ? `Desativar ${perfil.name}` : `Ativar ${perfil.name}`
                    }
                    title={perfil.active ? "Desativar" : "Ativar"}
                    disabled={perfil.id === profileId || setActive.isPending}
                    onClick={() => setActive.mutate({ id: perfil.id, active: !perfil.active })}
                  >
                    <PowerIcon />
                  </button>
                  <button
                    type="button"
                    className={`${acaoBtn} hover:bg-destructive/10 hover:text-destructive`}
                    aria-label={`Excluir ${perfil.name}`}
                    title="Excluir"
                    disabled={perfil.id === profileId || deleteProfile.isPending}
                    onClick={() => {
                      if (window.confirm(`Excluir o perfil de ${perfil.name}?`)) {
                        deleteProfile.mutate(perfil.id);
                      }
                    }}
                  >
                    <TrashBinIcon />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <ProfileFormModal profile={editando} onClose={() => setEditando(null)} />
    </div>
  );
}
