"use client";

import { ReactNode } from "react";
import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";
import clsx from "clsx";

type InsightVariant = "info" | "success" | "warning" | "danger";

interface InsightCardProps {
    icon: ReactNode;
    title: string;
    description?: string;
    value?: ReactNode;
    subValue?: string;
    variant?: InsightVariant;
    progress?: number; // 0-100
    action?: {
        label: string;
        onClick: () => void;
    };
    delay?: number;
    children?: ReactNode;
    className?: string;
}

const variantStyles: Record<InsightVariant, { bg: string; border: string; iconBg: string; progressColor: string }> = {
    info: {
        bg: "bg-card",
        border: "border-border/50",
        iconBg: "bg-primary/10 text-primary",
        progressColor: "bg-primary",
    },
    success: {
        bg: "bg-card",
        border: "border-emerald-500/20",
        iconBg: "bg-emerald-500/10 text-emerald-500",
        progressColor: "bg-emerald-500",
    },
    warning: {
        bg: "bg-card",
        border: "border-amber-500/20",
        iconBg: "bg-amber-500/10 text-amber-500",
        progressColor: "bg-amber-500",
    },
    danger: {
        bg: "bg-card",
        border: "border-red-500/20",
        iconBg: "bg-red-500/10 text-red-500",
        progressColor: "bg-red-500",
    },
};

/**
 * Unified insight card for consistent dashboard widgets
 */
export function InsightCard({
    icon,
    title,
    description,
    value,
    subValue,
    variant = "info",
    progress,
    action,
    delay = 0,
    children,
    className,
}: InsightCardProps) {
    const styles = variantStyles[variant];

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay }}
            className={clsx(
                "rounded-2xl border p-4",
                styles.bg,
                styles.border,
                className
            )}
        >
            <div className="flex items-start gap-3">
                {/* Icon */}
                <div className={clsx("p-2 rounded-xl shrink-0", styles.iconBg)}>
                    {icon}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-sm">{title}</h4>
                    {description && (
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                            {description}
                        </p>
                    )}
                    {children}
                </div>

                {/* Value */}
                {value && (
                    <div className="text-right shrink-0">
                        <div className="text-lg font-bold">{value}</div>
                        {subValue && (
                            <div className="text-[10px] text-muted-foreground">{subValue}</div>
                        )}
                    </div>
                )}
            </div>

            {/* Progress bar */}
            {progress !== undefined && (
                <div className="mt-3 h-1.5 bg-secondary rounded-full overflow-hidden">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
                        transition={{ delay: delay + 0.2, duration: 0.6 }}
                        className={clsx("h-full rounded-full", styles.progressColor)}
                    />
                </div>
            )}

            {/* Action button */}
            {action && (
                <button
                    onClick={action.onClick}
                    className="mt-3 text-xs font-medium text-primary hover:underline focus:outline-none"
                >
                    {action.label} →
                </button>
            )}
        </motion.div>
    );
}
