"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { Papel } from "@/entities/perfil/model";
import { navParaPapel } from "@/shared/config/navigation";
import { Button } from "@/shared/ui/Button/Button";
import { Icon } from "@/shared/ui/Icon/Icon";
import { cx } from "@/shared/ui/cx";
import styles from "./Sidebar.module.css";

export interface SidebarProps {
  papel: Papel;
  onNavegar?: () => void;
}

export function Sidebar({ papel, onNavegar }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const itens = navParaPapel(papel);

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
              onClick={onNavegar}
            >
              <Icon name={item.icon} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {papel === "professor" && (
        <div className={styles.cta}>
          <Button
            variant="primary"
            fullWidth
            leftIcon={<Icon name="plus" size={16} />}
            onClick={() => {
              router.push("/chamada");
              onNavegar?.();
            }}
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
        <Link href="/login" className={styles.footerItem} onClick={onNavegar}>
          <Icon name="logout" />
          <span>Sair</span>
        </Link>
      </div>
    </aside>
  );
}
