"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSessao } from "@/features/auth/use-sessao";
import { AppShell } from "@/widgets/app-shell";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { perfil, carregando } = useSessao();
  const router = useRouter();

  useEffect(() => {
    if (carregando) return;
    if (!perfil) {
      router.replace("/login");
      return;
    }
    if (perfil.papel !== "admin") {
      router.replace("/turmas");
    }
  }, [carregando, perfil, router]);

  if (carregando || !perfil || perfil.papel !== "admin") {
    return <div className="flex min-h-dvh items-center justify-center text-sm text-gray-500">Carregando...</div>;
  }

  return <AppShell variant="admin" perfil={perfil}>{children}</AppShell>;
}
