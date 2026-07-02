import type { ReactNode } from "react";
import { Card } from "../Card/Card";
import { cx } from "../cx";
import styles from "./StatCard.module.css";

export interface StatCardProps {
  label: string;
  value: string;
  delta?: string;
  deltaTone?: "up" | "down" | "neutral" | "alert";
  icon?: ReactNode;
}

export function StatCard({ label, value, delta, deltaTone = "neutral", icon }: StatCardProps) {
  return (
    <Card className={styles.card}>
      <div className={styles.top}>
        {icon && <span className={styles.icon}>{icon}</span>}
        {delta && <span className={cx(styles.delta, styles[deltaTone])}>{delta}</span>}
      </div>
      <span className={styles.value}>{value}</span>
      <span className={styles.label}>{label}</span>
    </Card>
  );
}
