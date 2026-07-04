import type { Role } from "@/entities/profile/model";

export type NavIcon = "painel" | "session" | "relatorios" | "user" | "admin";

export interface NavItem {
  href: string;
  label: string;
  icon: NavIcon;
}

/** Professor: chamada e lista de alunos das próprias turmas. */
export const navTeacher: NavItem[] = [
  { href: "/attendance", label: "Chamada", icon: "session" },
  { href: "/students", label: "Alunos", icon: "user" },
];

/** Coordenador: visão administrativa — painel, alunos e relatórios. */
export const navCoordinator: NavItem[] = [
  { href: "/", label: "Painel", icon: "painel" },
  { href: "/students", label: "Alunos", icon: "user" },
  { href: "/reports", label: "Relatórios", icon: "relatorios" },
];

/** Admin: tudo do coordenador + gestão de perfis. */
export const navAdmin: NavItem[] = [
  ...navCoordinator,
  { href: "/users", label: "Perfis", icon: "admin" },
];

export function navForRole(role: Role): NavItem[] {
  if (role === "admin") return navAdmin;
  if (role === "coordinator") return navCoordinator;
  return navTeacher;
}
