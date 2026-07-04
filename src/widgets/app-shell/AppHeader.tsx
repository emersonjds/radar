"use client";

import { useSidebar } from "@tailadmin/context/SidebarContext";
import AvatarText from "@tailadmin/components/ui/avatar/AvatarText";

export interface AppHeaderProps {
  name: string;
  jobTitle: string;
  onLogout: () => void;
}

export function AppHeader({ name, jobTitle, onLogout }: AppHeaderProps) {
  const { toggleSidebar, toggleMobileSidebar } = useSidebar();

  // lg breakpoint (1024px) controls which sidebar the toggle drives: the
  // collapsible desktop rail vs. the mobile slide-in drawer. Firing both at
  // once leaves isMobileOpen set on desktop, which pins the rail open.
  const handleToggle = () => {
    if (window.innerWidth >= 1024) {
      toggleSidebar();
    } else {
      toggleMobileSidebar();
    }
  };

  return (
    <header className="sticky top-0 z-30 flex w-full border-b border-gray-200 bg-white">
      <div className="flex w-full items-center justify-between gap-2 px-4 py-3 lg:px-6">
        <button
          aria-label="Alternar menu"
          onClick={handleToggle}
          className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
            <line x1="4" y1="7" x2="20" y2="7" />
            <line x1="4" y1="12" x2="20" y2="12" />
            <line x1="4" y1="17" x2="20" y2="17" />
          </svg>
        </button>

        <div className="ml-auto flex items-center gap-3">
          <div className="hidden text-right sm:block">
            <p className="text-sm font-medium text-gray-800">{name}</p>
            <p className="text-xs text-gray-500">{jobTitle}</p>
          </div>
          <AvatarText name={name} />
          <button
            onClick={onLogout}
            className="rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Sair
          </button>
        </div>
      </div>
    </header>
  );
}
