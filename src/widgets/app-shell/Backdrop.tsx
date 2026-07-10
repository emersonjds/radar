"use client";

import { useSidebar } from "@tailadmin/context/SidebarContext";

export function Backdrop() {
  const { isMobileOpen, toggleMobileSidebar } = useSidebar();

  if (!isMobileOpen) return null;

  return (
    <div className="fixed inset-0 z-40 bg-foreground/50 lg:hidden" onClick={toggleMobileSidebar} />
  );
}
