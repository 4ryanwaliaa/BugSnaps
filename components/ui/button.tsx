import Link from "next/link";
import { cn } from "@/lib/utils";
import type { ComponentPropsWithoutRef, ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost";
type Size = "sm" | "md" | "lg";

const base = "site-button";

const variants: Record<Variant, string> = {
  primary: "site-button-primary",
  secondary: "site-button-secondary",
  ghost: "site-button-ghost",
};

const sizes: Record<Size, string> = {
  sm: "min-h-11 px-4 text-sm",
  md: "min-h-12 px-6 text-sm",
  lg: "min-h-14 px-7 text-[15px]",
};

interface ButtonBaseProps {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: ReactNode;
}

type ButtonProps = ButtonBaseProps &
  (
    | ({ href: string } & Omit<ComponentPropsWithoutRef<typeof Link>, "href" | "className">)
    | ({ href?: undefined } & Omit<ComponentPropsWithoutRef<"button">, "className">)
  );

export function Button({ variant = "primary", size = "md", className, children, ...props }: ButtonProps) {
  const classes = cn(base, variants[variant], sizes[size], className);

  if (props.href !== undefined) {
    return (
      <Link className={classes} {...props}>
        {children}
      </Link>
    );
  }

  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
}
