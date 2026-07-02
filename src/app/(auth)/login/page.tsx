"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { entrar } from "@/features/auth/api";
import type { Papel } from "@/shared/lib/store/db";

// ponytail: fixed demo roster instead of fetching the store during render —
// keeps this static-export page free of localStorage-during-SSR concerns.
const USUARIOS_SEED: { nome: string; email: string; papel: Papel }[] = [
  { nome: "Ana Admin", email: "admin@radar.escola", papel: "admin" },
  { nome: "Carla Professora", email: "carla@radar.escola", papel: "professor" },
  { nome: "Marcos Professor", email: "marcos@radar.escola", papel: "professor" },
];

const ROTA_POR_PAPEL: Record<Papel, string> = {
  professor: "/professor/turmas",
  admin: "/admin/dashboard",
};

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);

  async function fazerLogin(emailParaEntrar: string) {
    setErro(null);
    setCarregando(true);
    try {
      const perfil = await entrar(emailParaEntrar);
      router.replace(ROTA_POR_PAPEL[perfil.papel]);
    } catch {
      setErro("Nenhum perfil encontrado para este e-mail.");
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-gray-50 px-4 py-10">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-brand-500">Radar</h1>
          <p className="text-sm text-gray-500">presença em foco</p>
        </div>

        <div className="space-y-2">
          {USUARIOS_SEED.map((usuario) => (
            <button
              key={usuario.email}
              type="button"
              disabled={carregando}
              onClick={() => fazerLogin(usuario.email)}
              className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-left text-sm font-medium text-gray-800 shadow-sm hover:border-brand-500 disabled:opacity-50"
            >
              {usuario.nome}
              <span className="ml-2 text-xs font-normal text-gray-500">
                ({usuario.papel === "admin" ? "admin" : "professor"})
              </span>
            </button>
          ))}
        </div>

        <form
          className="space-y-2"
          onSubmit={(event) => {
            event.preventDefault();
            fazerLogin(email);
          }}
        >
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            E-mail
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="seu.email@radar.escola"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
          />
          {erro && <p className="text-sm text-red-600">{erro}</p>}
          <button
            type="submit"
            disabled={carregando}
            className="w-full rounded-lg bg-brand-500 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-500/90 disabled:opacity-50"
          >
            Entrar
          </button>
        </form>
      </div>
    </div>
  );
}
