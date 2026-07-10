import type { ComponentProps, ComponentType } from "react";
import Link from "next/link";
import { cn } from "@/shared/lib/utils";

const base =
  "inline-flex size-11 shrink-0 items-center justify-center rounded-full outline-none transition focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-40 sm:size-9";

const tones = {
  neutral: "text-muted-foreground hover:bg-muted hover:text-foreground",
  destructive:
    "text-muted-foreground hover:bg-destructive/10 hover:text-destructive focus-visible:bg-destructive/10 focus-visible:text-destructive",
} as const;

export interface IconButtonProps extends Omit<ComponentProps<"button">, "children"> {
  icon: ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  label: string;
  tone?: keyof typeof tones;
  href?: string;
}

export function IconButton({
  icon: Icon,
  label,
  tone = "neutral",
  href,
  className,
  ...props
}: IconButtonProps) {
  const classes = cn(base, tones[tone], className);
  const glyph = <Icon className="size-[18px]" aria-hidden />;

  if (href) {
    return (
      <Link href={href} aria-label={label} title={label} className={classes}>
        {glyph}
      </Link>
    );
  }

  return (
    <button type="button" aria-label={label} title={label} className={classes} {...props}>
      {glyph}
    </button>
  );
}
