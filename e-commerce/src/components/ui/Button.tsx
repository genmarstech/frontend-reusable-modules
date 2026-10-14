import { type ButtonHTMLAttributes, forwardRef } from "react";
import clsx from "clsx";
import { Loader2 } from "lucide-react";

type Variant = "primary" | "secondary" | "ghost" | "danger" | "mpesa";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
}

const VARIANT_CLASSES: Record<Variant, string> = {
  primary: "bg-inverse text-inverse-text hover:opacity-85 disabled:opacity-40",
  secondary: "bg-bg-raised text-text border border-border hover:bg-bg-sunken",
  ghost: "text-text hover:bg-bg-sunken",
  danger: "bg-danger text-white hover:bg-danger/85 disabled:bg-danger/40",
  // The one payment method this store takes — its own brand colour, not
  // the generic primary/inverse button, so "pay now" always reads as
  // distinctly the M-Pesa action.
  mpesa: "bg-mpesa text-white hover:bg-mpesa/85 disabled:bg-mpesa/40",
};

const SIZE_CLASSES: Record<Size, string> = {
  sm: "h-8 px-3 text-sm gap-1.5",
  md: "h-10 px-4 text-sm gap-2",
  lg: "h-12 px-6 text-base gap-2",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "primary", size = "md", loading, disabled, className, children, ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={clsx(
        "inline-flex items-center justify-center rounded-full font-medium transition-colors cursor-pointer disabled:cursor-not-allowed",
        VARIANT_CLASSES[variant],
        SIZE_CLASSES[size],
        className,
      )}
      {...props}
    >
      {loading && <Loader2 className="size-4 animate-spin" />}
      {children}
    </button>
  );
});
