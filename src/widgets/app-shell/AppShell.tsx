"use client";

import { useState, type ReactNode } from "react";
import { useSessao } from "@/features/sessao/use-sessao";
import { cx } from "@/shared/ui/cx";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import styles from "./AppShell.module.css";

export interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const { papel, perfil, trocarPapel } = useSessao();
  const [menuAberto, setMenuAberto] = useState(false);

  const nome = perfil?.nome ?? "—";
  const cargo = perfil?.cargo ?? (papel === "admin" ? "Coordenação" : "Professor");

  return (
    <div className={styles.shell}>
      <div className={cx(styles.sidebarWrap, menuAberto && styles.sidebarOpen)}>
        <Sidebar papel={papel} onNavegar={() => setMenuAberto(false)} />
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
          nome={nome}
          cargo={cargo}
          papel={papel}
          onTrocarPapel={trocarPapel}
          onToggleMenu={() => setMenuAberto((aberto) => !aberto)}
        />
        <main className={styles.main}>{children}</main>
      </div>
    </div>
  );
}
