"use client";

import { LogOut, Menu } from "lucide-react";

interface HeaderProps {
  nome: string;
  onMenuClick?: () => void;
  onSair: () => void;
}

export function Header({ nome, onMenuClick, onSair }: HeaderProps) {
  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-gray-200 bg-white px-4">
      <div className="flex items-center gap-2">
        {onMenuClick && (
          <button
            type="button"
            onClick={onMenuClick}
            aria-label="Abrir menu"
            className="-ml-2 rounded p-2 text-gray-600 hover:bg-gray-100 md:hidden"
          >
            <Menu size={20} />
          </button>
        )}
        <span className="text-lg font-bold text-brand-500">Radar</span>
      </div>
      <div className="flex items-center gap-3">
        <span className="hidden text-sm text-gray-600 sm:inline">{nome}</span>
        <button
          type="button"
          onClick={onSair}
          className="flex items-center gap-1 rounded p-2 text-sm font-medium text-gray-600 hover:bg-gray-100"
        >
          <LogOut size={16} />
          Sair
        </button>
      </div>
    </header>
  );
}
