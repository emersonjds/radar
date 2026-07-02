import styles from "./Avatar.module.css";

export interface AvatarProps {
  nome: string;
  src?: string;
  size?: number;
}

function iniciais(nome: string): string {
  const partes = nome.trim().split(/\s+/);
  const primeira = partes[0]?.[0] ?? "";
  const ultima = partes.length > 1 ? partes[partes.length - 1][0] : "";
  return (primeira + ultima).toUpperCase();
}

export function Avatar({ nome, src, size = 40 }: AvatarProps) {
  return (
    <span
      className={styles.avatar}
      style={{ width: size, height: size, fontSize: size * 0.4 }}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element -- SPA static export, avatar source is arbitrary/remote
        <img src={src} alt={nome} className={styles.image} />
      ) : (
        iniciais(nome)
      )}
    </span>
  );
}
