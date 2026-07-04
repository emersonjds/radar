import type { Role } from "@/entities/profile/model";

export type NavIcon = "painel" | "session" | "relatorios" | "user" | "grade";

export interface NavItem {
  href: string;
  label: string;
  icon: NavIcon;
}

/** Professor: enxuto — painel das próprias turmas, chamada e dados dos alunos. */
export const navTeacher: NavItem[] = [
  { href: "/", label: "Painel", icon: "painel" },
  { href: "/attendance", label: "Chamada", icon: "session" },
  { href: "/students", label: "Alunos", icon: "user" },
];

/** Coordenação: visão ampla — analytics, todos os alunos e relatórios. */
export const navAdmin: NavItem[] = [
  { href: "/", label: "Painel", icon: "painel" },
  { href: "/students", label: "Alunos", icon: "user" },
  { href: "/reports", label: "Relatórios", icon: "relatorios" },
];

export function navForRole(role: Role): NavItem[] {
  return role === "admin" ? navAdmin : navTeacher;
}
