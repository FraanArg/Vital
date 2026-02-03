"use client";

import { motion, HTMLMotionProps } from "framer-motion";
import { forwardRef, ReactNode } from "react";

type CardVariant = "default" | "interactive" | "glow" | "gradient" | "apple" | "grouped";

interface CardProps extends Omit<HTMLMotionProps<"div">, "children"> {
    children: ReactNode;
    variant?: CardVariant;
    noPadding?: boolean;
}

const variantClasses: Record<CardVariant, string> = {
    default: "bg-card border border-border/30 shadow-sm",
    interactive: "bg-card border border-border/30 shadow-sm card-interactive cursor-pointer",
    glow: "bg-card border border-border/30 glow-border",
    gradient: "bg-card border border-border/30 gradient-border-animated",
    // Apple-style: No visible border, pure elevation
    apple: "bg-card shadow-md border-0",
    // iOS grouped list style
    grouped: "bg-card/80 backdrop-blur-sm border border-border/20 shadow-sm",
};

/**
 * Enhanced Card component with hover effects and variants
 */
const Card = forwardRef<HTMLDivElement, CardProps>(
    ({ children, variant = "default", noPadding = false, className = "", ...props }, ref) => {
        const baseClasses = `rounded-2xl shadow-sm overflow-hidden ${noPadding ? "" : "p-5"
            }`;

        return (
            <motion.div
                ref={ref}
                className={`${baseClasses} ${variantClasses[variant]} ${className}`}
                whileHover={variant === "interactive" ? { y: -2 } : undefined}
                whileTap={variant === "interactive" ? { scale: 0.99 } : undefined}
                {...props}
            >
                {children}
            </motion.div>
        );
    }
);

Card.displayName = "Card";

export default Card;

/**
 * Card header with consistent styling
 */
export function CardHeader({
    icon,
    title,
    badge,
    action,
    className = "",
}: {
    icon?: ReactNode;
    title: string;
    badge?: ReactNode;
    action?: ReactNode;
    className?: string;
}) {
    return (
        <div className={`flex items-center gap-2 mb-4 ${className}`}>
            {icon && <span className="flex-shrink-0">{icon}</span>}
            <h3 className="font-semibold flex-1">{title}</h3>
            {badge && <span>{badge}</span>}
            {action && <span className="ml-auto">{action}</span>}
        </div>
    );
}

/**
 * Stat card with number, label, and optional trend
 */
export function StatCard({
    value,
    label,
    trend,
    trendUp,
    icon,
    color = "text-primary",
    className = "",
}: {
    value: string | number;
    label: string;
    trend?: string;
    trendUp?: boolean;
    icon?: ReactNode;
    color?: string;
    className?: string;
}) {
    return (
        <motion.div
            className={`p-4 rounded-xl bg-secondary/30 border border-border/30 text-center card-interactive ${className}`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
        >
            {icon && <div className={`mb-2 ${color}`}>{icon}</div>}
            <div className={`text-2xl font-bold tabular-nums ${color}`}>{value}</div>
            <div className="text-xs text-muted-foreground">{label}</div>
            {trend && (
                <div className={`text-xs mt-1 ${trendUp ? "text-green-500" : "text-red-500"}`}>
                    {trend}
                </div>
            )}
        </motion.div>
    );
}
