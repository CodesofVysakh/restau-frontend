import { clsx } from "clsx";
import { ButtonHTMLAttributes, ReactNode } from "react";
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "primary" | "secondary" | "ghost" | "danger";
    size?: "sm" | "md" | "lg";
    isLoading?: boolean;
    children: ReactNode;
}
const V = {
    primary: "bg-[#C8410A] text-white hover:bg-[#A33508]",
    secondary:
        "bg-white text-[#C8410A] border border-[#C8410A] hover:bg-orange-50",
    ghost: "bg-transparent text-[#6B5E57] hover:bg-stone-100",
    danger: "bg-red-600 text-white hover:bg-red-700",
};
const S = {
    sm: "px-3 py-1.5 text-sm rounded-md",
    md: "px-5 py-2.5 text-sm rounded-lg",
    lg: "px-6 py-3 text-base rounded-lg",
};
export function Button({
    variant = "primary",
    size = "md",
    isLoading,
    children,
    className,
    disabled,
    ...props
}: ButtonProps) {
    return (
        <button
            {...props}
            disabled={disabled || isLoading}
            className={clsx(
                "inline-flex items-center justify-center gap-2 font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]",
                V[variant],
                S[size],
                className,
            )}
        >
            {isLoading && (
                <svg
                    className="animate-spin h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                >
                    <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                    />
                    <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v8H4z"
                    />
                </svg>
            )}
            {children}
        </button>
    );
}
