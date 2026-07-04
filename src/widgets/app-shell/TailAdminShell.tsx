"use client";

import { useEffect, useSyncExternalStore, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { roleLabels } from "@/entities/profile/model";
import { useSession } from "@/features/session/use-session";
import { useSidebar } from "@tailadmin/context/SidebarContext";
import { AppSidebar } from "./AppSidebar";
import { AppHeader } from "./AppHeader";
import { Backdrop } from "./Backdrop";

export interface TailAdminShellProps {
  children: ReactNode;
}

const noopSubscribe = () => () => {};

/** false during SSR/hydration, true once running on the client. */
function useHydrated(): boolean {
  return useSyncExternalStore(noopSubscribe, () => true, () => false);
}

export function TailAdminShell({ children }: TailAdminShellProps) {
  const router = useRouter();
  const { profile, profileId, loading, logout } = useSession();
  const { isExpanded, isHovered, isMobileOpen } = useSidebar();

  // Only redirect once hydrated — the persisted session reads null on the
  // server pass, so acting earlier would bounce a logged-in user on refresh.
  const hydrated = useHydrated();

  useEffect(() => {
    if (hydrated && profileId === null) router.replace("/login");
  }, [hydrated, profileId, router]);

  if (!hydrated || profileId === null || loading || !profile) return null;

  const jobTitle = profile.jobTitle ?? roleLabels[profile.role];
  const mainMargin = isMobileOpen ? "ml-0" : isExpanded || isHovered ? "lg:ml-[290px]" : "lg:ml-[90px]";

  return (
    <div className="min-h-screen bg-gray-50">
      <AppSidebar role={profile.role} />
      <Backdrop />
      <div className={`flex min-h-screen flex-col transition-all duration-300 ease-in-out ${mainMargin}`}>
        <AppHeader name={profile.name} jobTitle={jobTitle} onLogout={logout} />
        <main className="mx-auto w-full max-w-(--breakpoint-2xl) flex-1 p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
