import { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary";

const VARIANTS: Record<Variant, string> = {
  primary:
    "bg-gradient-to-br from-violet to-violet-light text-white shadow-[0_6px_20px_rgba(124,92,255,0.4)]",
  secondary: "bg-white/5 border border-white/10 text-white",
};

export function Button({
  variant = "primary",
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return (
    <button
      className={`rounded-2xl px-6 py-3 font-semibold transition active:scale-95 ${VARIANTS[variant]} ${className}`}
      {...props}
    />
  );
}
