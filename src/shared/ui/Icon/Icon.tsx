import type { ReactNode } from "react";

export type IconName =
  | "painel"
  | "session"
  | "relatorios"
  | "admin"
  | "bell"
  | "search"
  | "help"
  | "plus"
  | "settings"
  | "logout"
  | "user"
  | "chevron-left"
  | "chevron-right"
  | "alert"
  | "download"
  | "check"
  | "check-circle"
  | "x-circle"
  | "clock"
  | "calendar"
  | "menu"
  | "grade";

export interface IconProps {
  name: IconName;
  size?: number;
}

/** One shared 1.5px-stroke visual language for every icon in the app. */
const paths: Record<IconName, ReactNode> = {
  painel: (
    <>
      <rect x="3" y="3" width="8" height="8" rx="2" />
      <rect x="13" y="3" width="8" height="8" rx="2" />
      <rect x="3" y="13" width="8" height="8" rx="2" />
      <rect x="13" y="13" width="8" height="8" rx="2" />
    </>
  ),
  session: (
    <>
      <rect x="5" y="4" width="14" height="17" rx="2" />
      <path d="M9 2.5h6a1 1 0 0 1 1 1V5H8V3.5a1 1 0 0 1 1-1Z" />
      <path d="m8.5 13 2.2 2.2 4.3-4.4" />
    </>
  ),
  grade: (
    <>
      <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8l-5-5Z" />
      <path d="M14 3v5h5" />
      <path d="M8.5 13.5h7" />
      <path d="M8.5 17h4.5" />
    </>
  ),
  relatorios: (
    <>
      <line x1="6" y1="20" x2="6" y2="13" />
      <line x1="12" y1="20" x2="12" y2="7" />
      <line x1="18" y1="20" x2="18" y2="10" />
    </>
  ),
  admin: <path d="M12 3 19 6v5c0 5-3.3 7.8-7 9-3.7-1.2-7-4-7-9V6l7-3Z" />,
  bell: (
    <>
      <path d="M6 9a6 6 0 0 1 12 0v4.5L19.5 17h-15L6 13.5V9Z" />
      <path d="M10 19.5a2 2 0 0 0 4 0" />
    </>
  ),
  search: (
    <>
      <circle cx="10.5" cy="10.5" r="6.5" />
      <line x1="15.3" y1="15.3" x2="20" y2="20" />
    </>
  ),
  help: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M9.3 9.3a2.7 2.7 0 1 1 3.9 2.4c-.8.4-1.4 1-1.4 1.9v.4" />
      <line x1="12" y1="17" x2="12" y2="17.1" />
    </>
  ),
  plus: (
    <>
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </>
  ),
  settings: (
    <>
      <circle cx="12" cy="12" r="3.2" />
      <line x1="12" y1="2.5" x2="12" y2="5.2" />
      <line x1="12" y1="18.8" x2="12" y2="21.5" />
      <line x1="2.5" y1="12" x2="5.2" y2="12" />
      <line x1="18.8" y1="12" x2="21.5" y2="12" />
      <line x1="5.1" y1="5.1" x2="7" y2="7" />
      <line x1="17" y1="17" x2="18.9" y2="18.9" />
      <line x1="18.9" y1="5.1" x2="17" y2="7" />
      <line x1="7" y1="17" x2="5.1" y2="18.9" />
    </>
  ),
  logout: (
    <>
      <path d="M9 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h3" />
      <line x1="21" y1="12" x2="10" y2="12" />
      <path d="m17 8 4 4-4 4" />
    </>
  ),
  user: (
    <>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-4 3.6-6 8-6s8 2 8 6" />
    </>
  ),
  "chevron-left": <path d="m15 6-6 6 6 6" />,
  "chevron-right": <path d="m9 6 6 6-6 6" />,
  alert: (
    <>
      <path d="M12 3.5 21 19.5H3L12 3.5Z" />
      <line x1="12" y1="10" x2="12" y2="14" />
      <line x1="12" y1="17" x2="12" y2="17.1" />
    </>
  ),
  download: (
    <>
      <path d="M12 4v10" />
      <path d="m8 10 4 4 4-4" />
      <line x1="5" y1="19" x2="19" y2="19" />
    </>
  ),
  check: <path d="m5 12 5 5L19 7" />,
  "check-circle": (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="m8.5 12 2.5 2.5 4.5-5" />
    </>
  ),
  "x-circle": (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="m9 9 6 6" />
      <path d="m15 9-6 6" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7.5V12l3 2" />
    </>
  ),
  calendar: (
    <>
      <rect x="4" y="5" width="16" height="16" rx="2" />
      <line x1="4" y1="9.5" x2="20" y2="9.5" />
      <line x1="8.5" y1="3" x2="8.5" y2="6.5" />
      <line x1="15.5" y1="3" x2="15.5" y2="6.5" />
    </>
  ),
  menu: (
    <>
      <line x1="4" y1="6.5" x2="20" y2="6.5" />
      <line x1="4" y1="12" x2="20" y2="12" />
      <line x1="4" y1="17.5" x2="20" y2="17.5" />
    </>
  ),
};

export function Icon({ name, size = 20 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {paths[name]}
    </svg>
  );
}
