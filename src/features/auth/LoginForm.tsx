"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { setSession } from "@/features/session/session-store";
import { roleLabels, type Role } from "@/entities/profile/model";
import Button from "@tailadmin/components/ui/button/Button";
import Label from "@tailadmin/components/form/Label";
import { loginAsRole } from "./authenticate";

const ROLES: Role[] = ["admin", "teacher", "coordinator"];

const selectClasses =
  "h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10";

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
      className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 shadow-theme-sm"
    >
      <div className="mb-8">
        <span className="text-2xl font-bold text-brand-500">Radar</span>
        <p className="mt-1 text-sm text-gray-500">Presença escolar</p>
      </div>

      <div className="mb-5">
        <Label htmlFor="perfil">Entrar como</Label>
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
        <p role="alert" className="mb-5 rounded-lg bg-error-50 px-4 py-3 text-sm text-error-600">
          {erro}
        </p>
      )}

      <Button className="w-full" disabled={entrando}>
        {entrando ? "Entrando…" : "Entrar"}
      </Button>
    </form>
  );
}
