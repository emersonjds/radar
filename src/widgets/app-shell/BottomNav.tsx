"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Role } from "@/entities/profile/model";
import { navForRole } from "@/shared/config/navigation";
import { Icon } from "@/shared/ui/Icon/Icon";
import { cx } from "@/shared/ui/cx";
import styles from "./BottomNav.module.css";

export interface BottomNavProps {
  role: Role;
}

export function BottomNav({ role }: BottomNavProps) {
  const pathname = usePathname();
  const itens = navForRole(role);

  return (
    <nav className={styles.bar} aria-label="Navegação inferior">
      {itens.map((item) => {
        const ativo = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cx(styles.item, ativo && styles.itemAtivo)}
            aria-current={ativo ? "page" : undefined}
          >
            <Icon name={item.icon} size={22} />
            <span className={styles.label}>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
