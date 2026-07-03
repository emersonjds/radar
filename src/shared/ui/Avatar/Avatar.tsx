import styles from "./Avatar.module.css";

export interface AvatarProps {
  name: string;
  src?: string;
  size?: number;
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (first + last).toUpperCase();
}

export function Avatar({ name, src, size = 40 }: AvatarProps) {
  return (
    <span
      className={styles.avatar}
      style={{ width: size, height: size, fontSize: size * 0.4 }}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element -- SPA static export, avatar source is arbitrary/remote
        <img src={src} alt={name} className={styles.image} />
      ) : (
        initials(name)
      )}
    </span>
  );
}
