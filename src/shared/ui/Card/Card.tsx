import type { ElementType, ReactNode } from "react";
import { cx } from "../cx";
import styles from "./Card.module.css";

export interface CardProps {
  children: ReactNode;
  className?: string;
  as?: ElementType;
}

export function Card({ children, className, as: Component = "div" }: CardProps) {
  return <Component className={cx(styles.card, className)}>{children}</Component>;
}
