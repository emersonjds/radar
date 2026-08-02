"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { setSession } from "@/features/session/session-store";
import { roleLabels, type Role } from "@/entities/profile/model";
import { Button } from "@/shared/ui/button";
import { Label } from "@/shared/ui/label";
import { loginAsRole } from "./authenticate";

const ROLES: Role[] = ["admin", "teacher", "coordinator"];

const selectClasses =
  "h-11 w-full rounded-lg border border-input bg-transparent px-4 text-sm text-foreground shadow-xs focus:border-ring focus:outline-hidden focus:ring-3 focus:ring-ring/20";

export function LoginForm() {
  const router = useRouter();
  const [role, setRole] = useState<Role>("admin");
  const [erro, setErro] = useState<string | null>(null);
  const [entrando, setEntrando] = useState(false);

  async function entrar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (entrando) return;
    setErro(null);
    setEntrando(true);
    try {
      const profile = await loginAsRole(role);
      if (!profile) {
        setErro("Nenhum perfil ativo para esse cargo.");
        return;
      }
      setSession(profile.id);
      router.push("/");
    } finally {
      setEntrando(false);
    }
  }

  return (
    <form
      onSubmit={entrar}
      className="w-full max-w-md rounded-xl border border-border bg-card p-8 shadow-sm"
    >
      <div className="mb-8">
        <span className="text-2xl font-bold text-primary">Radar</span>
        <p className="mt-1 text-sm text-muted-foreground">Presença escolar</p>
      </div>

      <div className="mb-5">
        <Label className="mb-1.5" htmlFor="perfil">
          Entrar como
        </Label>
        <select
          id="perfil"
          value={role}
          onChange={(event) => setRole(event.target.value as Role)}
          className={selectClasses}
        >
          {ROLES.map((value) => (
            <option key={value} value={value}>
              {roleLabels[value]}
            </option>
          ))}
        </select>
      </div>

      {erro && (
        <p
          role="alert"
          className="mb-5 rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive"
        >
          {erro}
        </p>
      )}

      <Button className="w-full" disabled={entrando}>
        {entrando ? "Entrando…" : "Entrar"}
      </Button>
    </form>
  );
}
