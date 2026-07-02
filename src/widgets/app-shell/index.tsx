"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { School } from "lucide-react";
import { sair } from "@/features/auth/api";
import type { Perfil } from "@/shared/lib/store/db";
import { Header } from "./header";
import { Sidebar } from "./sidebar";

interface AppShellProps {
  variant: "professor" | "admin";
  perfil: Perfil;
  children: React.ReactNode;
}

export function AppShell({ variant, perfil, children }: AppShellProps) {
  const router = useRouter();
  const [menuAberto, setMenuAberto] = useState(false);

  function handleSair() {
    sair();
    router.replace("/login");
  }

  if (variant === "admin") {
    return (
      <div className="flex min-h-dvh flex-col">
        <Header nome={perfil.nome} onMenuClick={() => setMenuAberto(true)} onSair={handleSair} />
        <div className="flex flex-1">
          <Sidebar aberta={menuAberto} onFechar={() => setMenuAberto(false)} />
          <main className="min-w-0 flex-1 p-4">{children}</main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-dvh flex-col">
      <Header nome={perfil.nome} onSair={handleSair} />
      <nav className="flex border-b border-gray-200 bg-white px-2 py-1">
        <Link
          href="/professor/turmas"
          className="flex items-center gap-2 rounded px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100"
        >
          <School size={18} />
          Turmas
        </Link>
      </nav>
      <main className="flex-1 p-4">{children}</main>
    </div>
  );
}
