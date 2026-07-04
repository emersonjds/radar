"use client";

import { useEffect, useSyncExternalStore, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { roleLabels } from "@/entities/profile/model";
import { useSession } from "@/features/session/use-session";
import { BottomNav } from "./BottomNav";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import styles from "./AppShell.module.css";

export interface AppShellProps {
  children: ReactNode;
}

const noopSubscribe = () => () => {};

/** false during SSR/hydration, true once running on the client. */
function useHydrated(): boolean {
  return useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );
}

export function AppShell({ children }: AppShellProps) {
  const router = useRouter();
  const { profile, profileId, loading, logout } = useSession();

  // Only redirect once hydrated — the persisted session reads null on the
  // server pass, so acting earlier would bounce a logged-in user on refresh.
  const hydrated = useHydrated();

  useEffect(() => {
    if (hydrated && profileId === null) router.replace("/login");
  }, [hydrated, profileId, router]);

  if (!hydrated || profileId === null || loading || !profile) return null;

  const cargo = profile.jobTitle ?? roleLabels[profile.role];

  return (
    <div className={styles.shell}>
      <div className={styles.sidebarWrap}>
        <Sidebar role={profile.role} onLogout={logout} />
      </div>
      <div className={styles.region}>
        <Topbar name={profile.name} jobTitle={cargo} onLogout={logout} />
        <main className={styles.main}>{children}</main>
      </div>
      <BottomNav role={profile.role} />
    </div>
  );
}
