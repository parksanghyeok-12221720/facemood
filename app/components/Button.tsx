import Link from "next/link";
import { ReactNode } from "react";

type Variant = "primary" | "outline" | "dark";

const base =
  "inline-flex w-full items-center justify-center rounded-full px-8 py-4 text-sm font-semibold tracking-wide transition-opacity active:opacity-80 disabled:cursor-not-allowed disabled:opacity-40";

const variants: Record<Variant, string> = {
  primary: "bg-white text-black",
  outline: "border border-white/30 text-white",
  dark: "border border-white/10 bg-neutral-800 text-gray-200",
};

type CommonProps = {
  children: ReactNode;
  variant?: Variant;
  className?: string;
};

type ButtonAsLink = CommonProps & {
  href: string;
  onClick?: never;
  disabled?: never;
};

type ButtonAsButton = CommonProps & {
  href?: never;
  onClick?: () => void;
  disabled?: boolean;
  type?: "button" | "submit";
};

type ButtonProps = ButtonAsLink | ButtonAsButton;

export default function Button(props: ButtonProps) {
  const { children, variant = "primary", className = "" } = props;
  const classes = `${base} ${variants[variant]} ${className}`;

  if ("href" in props && props.href) {
    return (
      <Link href={props.href} className={classes}>
        {children}
      </Link>
    );
  }

  const { onClick, disabled, type = "button" } = props as ButtonAsButton;

  return (
    <button type={type} onClick={onClick} disabled={disabled} className={classes}>
      {children}
    </button>
  );
}
