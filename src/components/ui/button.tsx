import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { clsx } from "clsx";

type ButtonVariant = "primary" | "secondary" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: ReactNode;
  className?: string;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: "relative overflow-hidden bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 text-white before:absolute before:inset-0 before:bg-gradient-to-r before:from-pink-500 before:via-purple-500 before:to-cyan-500 before:opacity-0 before:transition-opacity hover:before:opacity-100 [&>span]:relative",
  secondary: "relative overflow-hidden bg-white/10 border border-white/20 text-white hover:bg-white/15 hover:border-white/40 hover:shadow-lg hover:shadow-cyan-500/20",
  ghost: "text-gray-400 hover:text-white hover:bg-white/5",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "px-4 py-2 text-sm",
  md: "px-6 py-3 text-sm",
  lg: "px-8 py-4 text-base",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", children, className, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={clsx(
          "inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-all duration-300",
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        {...props}
      >
        <span>{children}</span>
      </button>
    );
  }
);

Button.displayName = "Button";
