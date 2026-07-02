import type { ButtonHTMLAttributes } from "react";
import { cx } from "../cx";
import styles from "./IconButton.module.css";

export interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  tone?: "primary" | "secondary" | "tertiary" | "danger" | "ghost";
  size?: "md" | "sm";
}

export function IconButton({
  label,
  tone = "ghost",
  size = "md",
  className,
  children,
  ...rest
}: IconButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      className={cx(styles.button, styles[tone], styles[size], className)}
      {...rest}
    >
      {children}
    </button>
  );
}
