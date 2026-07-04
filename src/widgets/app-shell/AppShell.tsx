"use client";

import { type ReactNode } from "react";
import { useSession } from "@/features/session/use-session";
import { BottomNav } from "./BottomNav";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import styles from "./AppShell.module.css";

export interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const { role, profile, switchRole } = useSession();

  const nome = profile?.name ?? "—";
  const cargo = profile?.jobTitle ?? (role === "admin" ? "Coordenação" : "Professor");

  return (
    <div className={styles.shell}>
      <div className={styles.sidebarWrap}>
        <Sidebar role={role} />
      </div>
      <div className={styles.region}>
        <Topbar name={nome} jobTitle={cargo} role={role} onSwitchRole={switchRole} />
        <main className={styles.main}>{children}</main>
      </div>
      <BottomNav role={role} />
    </div>
  );
}
