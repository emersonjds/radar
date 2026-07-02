"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Button } from "@/shared/ui/Button/Button";
import styles from "./LoginForm.module.css";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");

  // ponytail: no real auth yet — entering just opens the app. Swap for the
  // session feature when Supabase auth lands.
  function entrar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    router.push("/");
  }

  return (
    <form className={styles.card} onSubmit={entrar}>
      <div className={styles.brand}>
        <span className={styles.mark}>Radar</span>
        <span className={styles.sub}>Presença escolar</span>
      </div>

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
