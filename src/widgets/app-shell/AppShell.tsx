"use client";

import { useState, type ReactNode } from "react";
import type { Papel } from "@/entities/perfil/model";
import { cx } from "@/shared/ui/cx";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import styles from "./AppShell.module.css";

export interface AppShellProps {
  children: ReactNode;
  nome?: string;
  cargo?: string;
  papel?: Papel;
}

export function AppShell({
  children,
  nome = "Ricardo Alves",
  cargo = "Professor Titular",
  papel = "professor",
}: AppShellProps) {
  const [menuAberto, setMenuAberto] = useState(false);

  return (
    <div className={styles.shell}>
      <div className={cx(styles.sidebarWrap, menuAberto && styles.sidebarOpen)}>
        <Sidebar papel={papel} />
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
        <Topbar nome={nome} cargo={cargo} onToggleMenu={() => setMenuAberto((aberto) => !aberto)} />
        <main className={styles.main}>{children}</main>
      </div>
    </div>
  );
}
