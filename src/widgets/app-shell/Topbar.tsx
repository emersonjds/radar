"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import type { Role } from "@/entities/profile/model";
import { Avatar } from "@/shared/ui/Avatar/Avatar";
import { Icon } from "@/shared/ui/Icon/Icon";
import { IconButton } from "@/shared/ui/IconButton/IconButton";
import { SearchInput } from "@/shared/ui/SearchInput/SearchInput";
import { cx } from "@/shared/ui/cx";
import styles from "./Topbar.module.css";

export interface TopbarProps {
  name: string;
  jobTitle: string;
  role: Role;
  onSwitchRole: (role: Role) => void;
  onToggleMenu: () => void;
}

const PERSONAS: { role: Role; label: string }[] = [
  { role: "teacher", label: "Professor" },
  { role: "admin", label: "Coordenação" },
];

export function Topbar({ name, jobTitle, role, onSwitchRole, onToggleMenu }: TopbarProps) {
  const router = useRouter();
  const [termo, setTermo] = useState("");

  function handleBuscar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const termoLimpo = termo.trim();
    if (termoLimpo) router.push("/students?q=" + encodeURIComponent(termoLimpo));
  }

  return (
    <header className={styles.topbar}>
      <IconButton
        label="Abrir menu"
        className={styles.menuToggle}
        onClick={onToggleMenu}
      >
        <Icon name="menu" size={18} />
      </IconButton>

      <form className={styles.search} onSubmit={handleBuscar} role="search">
        <SearchInput value={termo} onChange={setTermo} placeholder="Buscar aluno..." />
      </form>

      <div className={styles.actions}>
        <div
          className={styles.persona}
          role="group"
          aria-label="Trocar de persona"
        >
          {PERSONAS.map((persona) => (
            <button
              key={persona.role}
              type="button"
              className={cx(
                styles.personaOption,
                role === persona.role && styles.personaActive,
              )}
              aria-pressed={role === persona.role}
              onClick={() => onSwitchRole(persona.role)}
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
          <Avatar name={name} size={40} />
          <div className={styles.userInfo}>
            <span className={styles.userNome}>{name}</span>
            <span className={styles.userCargo}>{jobTitle}</span>
          </div>
        </div>
      </div>
    </header>
  );
}
