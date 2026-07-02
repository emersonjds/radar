"use client";

import { Avatar } from "@/shared/ui/Avatar/Avatar";
import { Icon } from "@/shared/ui/Icon/Icon";
import { IconButton } from "@/shared/ui/IconButton/IconButton";
import { SearchInput } from "@/shared/ui/SearchInput/SearchInput";
import styles from "./Topbar.module.css";

export interface TopbarProps {
  nome: string;
  cargo: string;
  onToggleMenu: () => void;
}

export function Topbar({ nome, cargo, onToggleMenu }: TopbarProps) {
  return (
    <header className={styles.topbar}>
      <IconButton
        label="Abrir menu"
        className={styles.menuToggle}
        onClick={onToggleMenu}
      >
        <Icon name="menu" size={18} />
      </IconButton>

      <div className={styles.search}>
        <SearchInput placeholder="Buscar aluno..." />
      </div>

      <div className={styles.actions}>
        <IconButton label="Notificações">
          <Icon name="bell" size={18} />
        </IconButton>
        <IconButton label="Ajuda">
          <Icon name="help" size={18} />
        </IconButton>
        <div className={styles.user}>
          <Avatar nome={nome} size={40} />
          <div className={styles.userInfo}>
            <span className={styles.userNome}>{nome}</span>
            <span className={styles.userCargo}>{cargo}</span>
          </div>
        </div>
      </div>
    </header>
  );
}
