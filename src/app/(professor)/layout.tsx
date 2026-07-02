"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSessao } from "@/features/auth/use-sessao";
import { AppShell } from "@/widgets/app-shell";

interface ProfessorLayoutProps {
  children: React.ReactNode;
}

export default function ProfessorLayout({ children }: ProfessorLayoutProps) {
  const { perfil, carregando } = useSessao();
  const router = useRouter();

  useEffect(() => {
    if (carregando) return;
    if (!perfil) {
      router.replace("/login");
      return;
    }
    if (perfil.papel !== "professor") {
      router.replace("/dashboard");
    }
  }, [carregando, perfil, router]);

  if (carregando || !perfil || perfil.papel !== "professor") {
    return <div className="flex min-h-dvh items-center justify-center text-sm text-gray-500">Carregando...</div>;
  }

  return <AppShell variant="professor" perfil={perfil}>{children}</AppShell>;
}
