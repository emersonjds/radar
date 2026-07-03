"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import type { Role } from "@/entities/profile/model";
import { setRole } from "@/features/session/session-store";
import { Button } from "@/shared/ui/Button/Button";
import { cx } from "@/shared/ui/cx";
import styles from "./LoginForm.module.css";

const PERSONAS: { role: Role; label: string; hint: string }[] = [
  { role: "teacher", label: "Professor", hint: "Chamada e turmas" },
  { role: "admin", label: "Coordenação", hint: "Visão da escola" },
];

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [papel, setPapelEscolhido] = useState<Role>("teacher");

  // ponytail: no real auth yet — the chosen persona sets the session and opens
  // the app. Swap for Supabase auth (role from the JWT) when it lands.
  function entrar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setRole(papel);
    router.push("/");
  }

  return (
    <form className={styles.card} onSubmit={entrar}>
      <div className={styles.brand}>
        <span className={styles.mark}>Radar</span>
        <span className={styles.sub}>Presença escolar</span>
      </div>

      <fieldset className={styles.personas}>
        <legend className={styles.legend}>Entrar como</legend>
        {PERSONAS.map((persona) => (
          <button
            key={persona.role}
            type="button"
            className={cx(
              styles.persona,
              papel === persona.role && styles.personaActive,
            )}
            aria-pressed={papel === persona.role}
            onClick={() => setPapelEscolhido(persona.role)}
          >
            <span className={styles.personaLabel}>{persona.label}</span>
            <span className={styles.personaHint}>{persona.hint}</span>
          </button>
        ))}
      </fieldset>

      <div className={styles.field}>
        <label htmlFor="email">E-mail</label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          placeholder="voce@radar.escola"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />
      </div>

      <div className={styles.field}>
        <label htmlFor="senha">Senha</label>
        <input
          id="senha"
          type="password"
          autoComplete="current-password"
          placeholder="••••••••"
          value={senha}
          onChange={(event) => setSenha(event.target.value)}
          required
        />
      </div>

      <Button type="submit" fullWidth>
        Entrar
      </Button>

      <a className={styles.link} href="#">
        Esqueci minha senha
      </a>
    </form>
  );
}
