"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import type { Papel } from "@/entities/perfil/model";
import { usePapel } from "./session-store";

/**
 * Route guard for deep links: sends the user home when the current persona
 * isn't allowed here. Returns whether access is permitted so the page can
 * render nothing while the redirect happens.
 */
export function useExigirPapel(permitidos: Papel[]): boolean {
  const papel = usePapel();
  const router = useRouter();
  const permitido = permitidos.includes(papel);

  useEffect(() => {
    if (!permitido) router.replace("/");
  }, [permitido, router]);

  return permitido;
}
