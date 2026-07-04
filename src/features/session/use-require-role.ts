"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import type { Role } from "@/entities/profile/model";
import { useSession } from "./use-session";

/**
 * Route guard for deep links: sends a logged-out user to /login and a
 * logged-in user whose role isn't allowed here back home. Returns whether
 * access is permitted so the page can render nothing while redirecting.
 *
 * This is navigation UX, NOT a security boundary — the session lives in
 * localStorage and is trivially editable. Real authorization comes from
 * Supabase RLS (role not writable by `authenticated`) once the backend lands.
 */
export function useRequireRole(allowedRoles: Role[]): boolean {
  const { role, loading } = useSession();
  const router = useRouter();
  const allowed = role !== null && allowedRoles.includes(role);

  useEffect(() => {
    if (loading) return;
    if (role === null) router.replace("/login");
    else if (!allowed) router.replace("/");
  }, [loading, role, allowed, router]);

  return allowed;
}
