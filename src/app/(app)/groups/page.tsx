"use client";

import { useRequireRole } from "@/features/session/use-require-role";
import { GroupsAdmin } from "@/widgets/groups-admin/GroupsAdmin";

export default function GroupsPage() {
  const permitido = useRequireRole(["admin"]);
  if (!permitido) return null;
  return <GroupsAdmin />;
}
