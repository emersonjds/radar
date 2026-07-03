import type { Papel } from "@/entities/perfil/model";

export type NavIcon = "painel" | "chamada" | "relatorios" | "user" | "nota";

export interface NavItem {
  href: string;
  label: string;
  icon: NavIcon;
}

/** Professor: enxuto — painel das próprias turmas, chamada e dados dos alunos. */
export const navProfessor: NavItem[] = [
  { href: "/", label: "Painel", icon: "painel" },
  { href: "/chamada", label: "Chamada", icon: "chamada" },
  { href: "/avaliacoes", label: "Avaliações", icon: "nota" },
  { href: "/alunos", label: "Alunos", icon: "user" },
];

/** Coordenação: visão ampla — analytics, todos os alunos e relatórios. */
export const navAdmin: NavItem[] = [
  { href: "/", label: "Painel", icon: "painel" },
  { href: "/alunos", label: "Alunos", icon: "user" },
  { href: "/relatorios", label: "Relatórios", icon: "relatorios" },
];

export function navParaPapel(papel: Papel): NavItem[] {
  return papel === "admin" ? navAdmin : navProfessor;
}
