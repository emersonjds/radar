"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import type { Role } from "@/entities/profile/model";
import { useRole } from "./session-store";

/**
 * Route guard for deep links: sends the user home when the current persona
 * isn't allowed here. Returns whether access is permitted so the page can
 * render nothing while the redirect happens.
 */
export function useRequireRole(allowedRoles: Role[]): boolean {
  const role = useRole();
  const router = useRouter();
  const allowed = allowedRoles.includes(role);

  useEffect(() => {
    if (!allowed) router.replace("/");
  }, [allowed, router]);

  return allowed;
}
