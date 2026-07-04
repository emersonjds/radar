import type { ReactNode } from "react";
import { TailAdminShell } from "@/widgets/app-shell/TailAdminShell";

export interface AppLayoutProps {
  children: ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  return <TailAdminShell>{children}</TailAdminShell>;
}
