"use client";

import { useRequireRole } from "@/features/session/use-require-role";
import { ProfilesAdmin } from "@/widgets/profiles-admin/ProfilesAdmin";

export default function UsersPage() {
  const permitido = useRequireRole(["admin"]);
  if (!permitido) return null;
  return <ProfilesAdmin />;
}
