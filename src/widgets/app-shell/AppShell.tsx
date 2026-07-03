"use client";

import { useState, type ReactNode } from "react";
import { useSession } from "@/features/session/use-session";
import { cx } from "@/shared/ui/cx";
import { BottomNav } from "./BottomNav";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import styles from "./AppShell.module.css";

export interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const { role, profile, switchRole } = useSession();
  const [menuAberto, setMenuAberto] = useState(false);

  const nome = profile?.name ?? "—";
  const cargo = profile?.jobTitle ?? (role === "admin" ? "Coordenação" : "Professor");

  return (
    <div className={styles.shell}>
      <div className={cx(styles.sidebarWrap, menuAberto && styles.sidebarOpen)}>
        <Sidebar role={role} onNavigate={() => setMenuAberto(false)} />
      </div>
      {menuAberto && (
        <button
          type="button"
          aria-label="Fechar menu"
          className={styles.backdrop}
          onClick={() => setMenuAberto(false)}
        />
      )}
      <div className={styles.region}>
        <Topbar
          name={nome}
          jobTitle={cargo}
          role={role}
          onSwitchRole={switchRole}
          onToggleMenu={() => setMenuAberto((aberto) => !aberto)}
        />
        <main className={styles.main}>{children}</main>
      </div>
      <BottomNav role={role} />
    </div>
  );
}
