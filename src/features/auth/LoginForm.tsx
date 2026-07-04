"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { setSession } from "@/features/session/session-store";
import Button from "@/shared/ui/tailadmin/Button";
import Label from "@/shared/ui/tailadmin/Label";
import { authenticate } from "./authenticate";

const inputClasses =
  "h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10";

export function LoginForm() {
  const router = useRouter();
  const [usuario, setUsuario] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [entrando, setEntrando] = useState(false);

  async function entrar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (entrando) return;
    setErro(null);
    setEntrando(true);
    try {
      const profile = await authenticate(usuario, senha);
      if (!profile) {
        setErro("Usuário ou senha inválidos.");
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
        <Label htmlFor="usuario">Usuário</Label>
        <input
          id="usuario"
          type="text"
          autoComplete="username"
          autoCapitalize="none"
          placeholder="seu.usuario"
          value={usuario}
          onChange={(event) => setUsuario(event.target.value)}
          required
          className={inputClasses}
        />
      </div>

      <div className="mb-5">
        <Label htmlFor="senha">Senha</Label>
        <input
          id="senha"
          type="password"
          autoComplete="current-password"
          placeholder="••••••••"
          value={senha}
          onChange={(event) => setSenha(event.target.value)}
          required
          className={inputClasses}
        />
      </div>

      {erro && (
        <p
          role="alert"
          className="mb-5 rounded-lg bg-error-50 px-4 py-3 text-sm text-error-600"
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
