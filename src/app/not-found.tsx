import Link from "next/link";
import styles from "./not-found.module.css";

export default function NotFound() {
  return (
    <main className={styles.wrap}>
      <p className={styles.code}>404</p>
      <h1 className={styles.title}>Página não encontrada</h1>
      <p className={styles.text}>
        O endereço que você tentou abrir não existe ou foi movido.
      </p>
      <Link href="/" className={styles.link}>
        Voltar ao painel
      </Link>
    </main>
  );
}
