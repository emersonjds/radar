import type { ComponentProps, ComponentType } from "react";
import Link from "next/link";
import { cn } from "@/shared/lib/utils";

const base =
  "inline-flex size-11 shrink-0 items-center justify-center rounded-full outline-none transition-colors focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-40 sm:size-9";

const tones = {
  neutral: "text-muted-foreground hover:bg-muted hover:text-foreground",
  destructive:
    "text-muted-foreground hover:bg-destructive/10 hover:text-destructive focus-visible:bg-destructive/10 focus-visible:text-destructive",
} as const;

interface IconButtonBase {
  icon: ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  label: string;
  tone?: keyof typeof tones;
}

export type IconButtonProps = IconButtonBase &
  (
    | { href: string; className?: string }
    | ({ href?: undefined } & Omit<ComponentProps<"button">, "children">)
  );

export function IconButton({ icon: Icon, label, tone = "neutral", ...rest }: IconButtonProps) {
  const classes = cn(base, tones[tone], rest.className);
  const glyph = <Icon className="size-[18px]" aria-hidden />;

  if (rest.href !== undefined) {
    return (
      <Link href={rest.href} aria-label={label} title={label} className={classes}>
        {glyph}
      </Link>
    );
  }

  const buttonProps: Omit<ComponentProps<"button">, "children"> = rest;
  return (
    <button type="button" aria-label={label} title={label} {...buttonProps} className={classes}>
      {glyph}
    </button>
  );
}
