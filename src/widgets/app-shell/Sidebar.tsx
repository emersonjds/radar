"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { Role } from "@/entities/profile/model";
import { navForRole } from "@/shared/config/navigation";
import { Button } from "@/shared/ui/Button/Button";
import { Icon } from "@/shared/ui/Icon/Icon";
import { cx } from "@/shared/ui/cx";
import styles from "./Sidebar.module.css";

export interface SidebarProps {
  role: Role;
}

export function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const itens = navForRole(role);

  return (
    <aside className={styles.sidebar}>
      <div className={styles.brand}>
        <span className={styles.brandName}>Radar</span>
        <span className={styles.brandSubtitle}>Presença escolar</span>
      </div>

      <nav className={styles.nav} aria-label="Navegação principal">
        {itens.map((item) => {
          const ativo = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cx(styles.navItem, ativo && styles.navItemActive)}
              aria-current={ativo ? "page" : undefined}
            >
              <Icon name={item.icon} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {role === "teacher" && (
        <div className={styles.cta}>
          <Button
            variant="primary"
            fullWidth
            leftIcon={<Icon name="plus" size={16} />}
            onClick={() => router.push("/attendance")}
          >
            Nova chamada
          </Button>
        </div>
      )}

      <div className={styles.footer}>
        {/* ponytail: sem ação real ainda — volta a ligar quando a feature de auth/config retornar */}
        <button type="button" className={styles.footerItem}>
          <Icon name="settings" />
          <span>Configurações</span>
        </button>
        <Link href="/login" className={styles.footerItem}>
          <Icon name="logout" />
          <span>Sair</span>
        </Link>
      </div>
    </aside>
  );
}
