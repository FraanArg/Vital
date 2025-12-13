"use client";

import { forwardRef } from "react";
import { motion } from "framer-motion";
import { clsx } from "clsx";

type IconButtonSize = "sm" | "md" | "lg";
type IconButtonVariant = "default" | "ghost" | "filled";

interface IconButtonProps {
    size?: IconButtonSize;
    variant?: IconButtonVariant;
    label: string; // Required for accessibility
    children: React.ReactNode;
    className?: string;
    disabled?: boolean;
    onClick?: () => void;
    type?: "button" | "submit" | "reset";
}

const sizeStyles: Record<IconButtonSize, string> = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-12 h-12",
};

const variantStyles: Record<IconButtonVariant, string> = {
    default: "text-muted-foreground hover:text-foreground hover:bg-secondary/60",
    ghost: "text-muted-foreground hover:text-foreground",
    filled: "bg-secondary text-foreground hover:bg-secondary/80",
};

const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
    ({ children, size = "md", variant = "default", label, className, disabled, onClick, type = "button" }, ref) => {
        return (
            <motion.button
                ref={ref}
                type={type}
                disabled={disabled}
                onClick={onClick}
                whileTap={{ scale: 0.92 }}
                transition={{ duration: 0.1 }}
                aria-label={label}
                className={clsx(
                    "inline-flex items-center justify-center rounded-full transition-colors duration-fast",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    "disabled:opacity-50 disabled:pointer-events-none",
                    "[&>svg]:w-5 [&>svg]:h-5",
                    sizeStyles[size],
                    variantStyles[variant],
                    className
                )}
            >
                {children}
            </motion.button>
        );
    }
);

IconButton.displayName = "IconButton";

export { IconButton };
export type { IconButtonProps, IconButtonSize, IconButtonVariant };
