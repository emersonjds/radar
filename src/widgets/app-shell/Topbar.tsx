"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Avatar } from "@/shared/ui/Avatar/Avatar";
import { Icon } from "@/shared/ui/Icon/Icon";
import { IconButton } from "@/shared/ui/IconButton/IconButton";
import { SearchInput } from "@/shared/ui/SearchInput/SearchInput";
import styles from "./Topbar.module.css";

export interface TopbarProps {
  name: string;
  jobTitle: string;
  onLogout: () => void;
}

export function Topbar({ name, jobTitle, onLogout }: TopbarProps) {
  const router = useRouter();
  const [termo, setTermo] = useState("");

  function handleBuscar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const termoLimpo = termo.trim();
    if (termoLimpo) router.push("/students?q=" + encodeURIComponent(termoLimpo));
  }

  return (
    <header className={styles.topbar}>
      <form className={styles.search} onSubmit={handleBuscar} role="search">
        <SearchInput value={termo} onChange={setTermo} placeholder="Buscar aluno..." />
      </form>

      <div className={styles.actions}>
        <IconButton label="Notificações">
          <Icon name="bell" size={18} />
        </IconButton>
        <div className={styles.user}>
          <Avatar name={name} size={40} />
          <div className={styles.userInfo}>
            <span className={styles.userNome}>{name}</span>
            <span className={styles.userCargo}>{jobTitle}</span>
          </div>
        </div>
        <IconButton label="Sair" onClick={onLogout}>
          <Icon name="logout" size={18} />
        </IconButton>
      </div>
    </header>
  );
}
