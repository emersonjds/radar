"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { setSession } from "@/features/session/session-store";
import { roleLabels } from "@/entities/profile/model";
import { useProfiles } from "@/entities/profile/queries";
import Button from "@tailadmin/components/ui/button/Button";
import Label from "@tailadmin/components/form/Label";
import { authenticate } from "./authenticate";

// ponytail: fase demo — todo perfil semeado compartilha a mesma senha, então a
// tela só escolhe quem entra e preenche a credencial. Volta a ser usuário +
// senha digitados quando o Supabase Auth entrar.
const SENHA_DEMO = "123456";

const fieldClasses =
  "h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10";

export function LoginForm() {
  const router = useRouter();
  const { data: perfis, isLoading } = useProfiles();
  const [escolhido, setEscolhido] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [entrando, setEntrando] = useState(false);

  // Perfis inativos continuam na lista: quem escolher um recebe o mesmo alerta
  // de credencial inválida que o authenticate() já devolve.
  const disponiveis = perfis ?? [];
  const usuario = escolhido ?? disponiveis[0]?.username ?? "";

  async function entrar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (entrando || !usuario) return;
    setErro(null);
    setEntrando(true);
    try {
      const profile = await authenticate(usuario, SENHA_DEMO);
      if (!profile) {
        setErro("Não foi possível entrar com este perfil.");
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
        <Label htmlFor="perfil">Perfil</Label>
        <select
          id="perfil"
          value={usuario}
          onChange={(event) => setEscolhido(event.target.value)}
          disabled={isLoading || disponiveis.length === 0}
          className={fieldClasses}
        >
          {disponiveis.map((perfil) => (
            <option key={perfil.id} value={perfil.username}>
              {perfil.name} — {perfil.jobTitle ?? roleLabels[perfil.role]}
              {perfil.active ? "" : " (inativo)"}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-5">
        <Label htmlFor="senha">Senha</Label>
        <input
          id="senha"
          type="password"
          autoComplete="current-password"
          value={SENHA_DEMO}
          readOnly
          disabled
          className={`${fieldClasses} cursor-not-allowed bg-gray-50 text-gray-400`}
        />
        <p className="mt-1.5 text-xs text-gray-400">
          Ambiente de demonstração: a senha já vem preenchida para o perfil escolhido.
        </p>
      </div>

      {erro && (
        <p
          role="alert"
          className="mb-5 rounded-lg bg-error-50 px-4 py-3 text-sm text-error-600"
        >
          {erro}
        </p>
      )}

      <Button className="w-full" disabled={entrando || !usuario}>
        {entrando ? "Entrando…" : "Entrar"}
      </Button>
    </form>
  );
}
