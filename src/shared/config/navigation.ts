import type { Papel } from "@/entities/perfil/model";

export type NavIcon = "painel" | "chamada" | "relatorios" | "admin";

export interface NavItem {
  href: string;
  label: string;
  icon: NavIcon;
  /** When set, the item only shows for this role. */
  papel?: Papel;
}

export const navPrincipal: NavItem[] = [
  { href: "/", label: "Painel", icon: "painel" },
  { href: "/chamada", label: "Chamada", icon: "chamada" },
  { href: "/relatorios", label: "Relatórios", icon: "relatorios" },
  { href: "/admin", label: "Administração", icon: "admin", papel: "admin" },
];

export function navParaPapel(papel: Papel): NavItem[] {
  return navPrincipal.filter((item) => !item.papel || item.papel === papel);
}
