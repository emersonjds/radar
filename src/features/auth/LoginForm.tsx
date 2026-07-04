"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { setSession } from "@/features/session/session-store";
import { Button } from "@/shared/ui/Button/Button";
import { authenticate } from "./authenticate";
import styles from "./LoginForm.module.css";

export function LoginForm() {
  const router = useRouter();
  const [usuario, setUsuario] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [entrando, setEntrando] = useState(false);

  async function entrar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (entrando) return;
    setErro(null);
    setEntrando(true);
    try {
      const profile = await authenticate(usuario, senha);
      if (!profile) {
        setErro("Usuário ou senha inválidos.");
        return;
      }
      setSession(profile.id);
      router.push("/");
    } finally {
      setEntrando(false);
    }
  }

  return (
    <form className={styles.card} onSubmit={entrar}>
      <div className={styles.brand}>
        <span className={styles.mark}>Radar</span>
        <span className={styles.sub}>Presença escolar</span>
      </div>

      <div className={styles.field}>
        <label htmlFor="usuario">Usuário</label>
        <input
          id="usuario"
          type="text"
          autoComplete="username"
          autoCapitalize="none"
          placeholder="seu.usuario"
          value={usuario}
          onChange={(event) => setUsuario(event.target.value)}
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

      {erro && (
        <p className={styles.erro} role="alert">
          {erro}
        </p>
      )}

      <Button type="submit" fullWidth disabled={entrando}>
        {entrando ? "Entrando…" : "Entrar"}
      </Button>
    </form>
  );
}
