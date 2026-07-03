"use client";

import type { Papel } from "@/entities/perfil/model";
import { Avatar } from "@/shared/ui/Avatar/Avatar";
import { Icon } from "@/shared/ui/Icon/Icon";
import { IconButton } from "@/shared/ui/IconButton/IconButton";
import { SearchInput } from "@/shared/ui/SearchInput/SearchInput";
import { cx } from "@/shared/ui/cx";
import styles from "./Topbar.module.css";

export interface TopbarProps {
  nome: string;
  cargo: string;
  papel: Papel;
  onTrocarPapel: (papel: Papel) => void;
  onToggleMenu: () => void;
}

const PERSONAS: { papel: Papel; label: string }[] = [
  { papel: "professor", label: "Professor" },
  { papel: "admin", label: "Coordenação" },
];

export function Topbar({ nome, cargo, papel, onTrocarPapel, onToggleMenu }: TopbarProps) {
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
        <div
          className={styles.persona}
          role="group"
          aria-label="Trocar de persona"
        >
          {PERSONAS.map((persona) => (
            <button
              key={persona.papel}
              type="button"
              className={cx(
                styles.personaOption,
                papel === persona.papel && styles.personaActive,
              )}
              aria-pressed={papel === persona.papel}
              onClick={() => onTrocarPapel(persona.papel)}
            >
              {persona.label}
            </button>
          ))}
        </div>

        <IconButton label="Notificações">
          <Icon name="bell" size={18} />
        </IconButton>
        <IconButton label="Ajuda" className={styles.help}>
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
