"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, School, Users, X } from "lucide-react";
import { cn } from "@/shared/lib/utils";

const LINKS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/turmas", label: "Turmas", icon: School },
  { href: "/alunos", label: "Alunos", icon: Users },
];

interface SidebarProps {
  aberta: boolean;
  onFechar: () => void;
}

export function Sidebar({ aberta, onFechar }: SidebarProps) {
  const pathname = usePathname();

  const nav = (
    <nav className="flex flex-col gap-1 p-3">
      {LINKS.map(({ href, label, icon: Icon }) => (
        <Link
          key={href}
          href={href}
          onClick={onFechar}
          className={cn(
            "flex items-center gap-2 rounded px-3 py-2 text-sm font-medium",
            pathname === href ? "bg-brand-500/10 text-brand-500" : "text-gray-600 hover:bg-gray-100",
          )}
        >
          <Icon size={18} />
          {label}
        </Link>
      ))}
    </nav>
  );

  return (
    <>
      <aside className="hidden w-56 shrink-0 border-r border-gray-200 bg-white md:block">{nav}</aside>
      {aberta && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={onFechar} />
          <div className="absolute inset-y-0 left-0 w-64 bg-white shadow-xl">
            <div className="flex h-14 items-center justify-between border-b border-gray-200 px-4">
              <span className="text-lg font-bold text-brand-500">Radar</span>
              <button
                type="button"
                onClick={onFechar}
                aria-label="Fechar menu"
                className="rounded p-2 text-gray-600 hover:bg-gray-100"
              >
                <X size={20} />
              </button>
            </div>
            {nav}
          </div>
        </div>
      )}
    </>
  );
}
