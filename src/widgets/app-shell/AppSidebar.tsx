"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSidebar } from "@tailadmin/context/SidebarContext";
import { navForRole, type NavIcon } from "@/shared/config/navigation";
import type { Role } from "@/entities/profile/model";
import {
  GridIcon,
  CalenderIcon,
  GroupIcon,
  PieChartIcon,
  UserCircleIcon,
} from "@tailadmin/icons";

const navIcons: Record<NavIcon, ReactNode> = {
  painel: <GridIcon />,
  session: <CalenderIcon />,
  user: <GroupIcon />,
  relatorios: <PieChartIcon />,
  admin: <UserCircleIcon />,
};

export interface AppSidebarProps {
  role: Role;
}

export function AppSidebar({ role }: AppSidebarProps) {
  const pathname = usePathname();
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();

  const items = navForRole(role);
  const showText = isExpanded || isHovered || isMobileOpen;

  return (
    <aside
      className={`fixed top-0 left-0 z-50 flex h-screen flex-col border-r border-gray-200 bg-white px-5 transition-all duration-300 ease-in-out ${
        showText ? "w-[290px]" : "w-[90px]"
      } ${isMobileOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={`flex flex-col py-8 ${showText ? "items-start" : "items-center"}`}>
        <span className="text-2xl font-bold text-brand-500">
          {showText ? "Radar" : "R"}
        </span>
        {showText && (
          <span className="text-xs font-medium text-gray-500">Gestão Estudantil</span>
        )}
      </div>

      <nav aria-label="Navegação principal" className="flex flex-col gap-1">
        {items.map((item) => {
          const active =
            item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`menu-item group ${
                active ? "menu-item-active" : "menu-item-inactive"
              } ${showText ? "" : "justify-center"}`}
            >
              <span
                className={active ? "menu-item-icon-active" : "menu-item-icon-inactive"}
              >
                {navIcons[item.icon]}
              </span>
              <span className={showText ? "" : "sr-only"}>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
