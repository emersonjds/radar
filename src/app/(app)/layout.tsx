import type { ReactNode } from "react";
import { AppShell } from "@/widgets/app-shell/AppShell";

export interface AppLayoutProps {
  children: ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  return <AppShell>{children}</AppShell>;
}
