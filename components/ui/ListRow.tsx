"use client";

import { ReactNode } from "react";
import { ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { clsx } from "clsx";

interface ListRowProps {
    icon?: ReactNode;
    iconColor?: string;
    title: string;
    subtitle?: string;
    value?: ReactNode;
    chevron?: boolean;
    onClick?: () => void;
    destructive?: boolean;
    disabled?: boolean;
    className?: string;
}

/**
 * iOS-style list row for grouped lists/settings
 */
export function ListRow({
    icon,
    iconColor = "text-primary",
    title,
    subtitle,
    value,
    chevron = true,
    onClick,
    destructive = false,
    disabled = false,
    className,
}: ListRowProps) {
    const Component = onClick ? motion.button : "div";

    return (
        <Component
            onClick={onClick}
            disabled={disabled}
            className={clsx(
                "flex items-center gap-3 px-4 py-3 w-full text-left transition-colors duration-fast",
                "border-b border-separator last:border-b-0",
                onClick && !disabled && "hover:bg-secondary/50 active:bg-secondary",
                disabled && "opacity-50 cursor-not-allowed",
                className
            )}
            {...(onClick ? { whileTap: { scale: 0.99 } } : {})}
        >
            {/* Icon */}
            {icon && (
                <div className={clsx(
                    "w-7 h-7 flex items-center justify-center rounded-md",
                    iconColor.includes("bg-") ? iconColor : `bg-${iconColor}/10`
                )}>
                    <span className={clsx(
                        "[&>svg]:w-4 [&>svg]:h-4",
                        destructive ? "text-destructive" : iconColor
                    )}>
                        {icon}
                    </span>
                </div>
            )}

            {/* Title & Subtitle */}
            <div className="flex-1 min-w-0">
                <div className={clsx(
                    "text-sm font-medium truncate",
                    destructive ? "text-destructive" : "text-foreground"
                )}>
                    {title}
                </div>
                {subtitle && (
                    <div className="text-xs text-muted-foreground truncate mt-0.5">
                        {subtitle}
                    </div>
                )}
            </div>

            {/* Value */}
            {value && (
                <div className="text-sm text-muted-foreground shrink-0">
                    {value}
                </div>
            )}

            {/* Chevron */}
            {chevron && onClick && (
                <ChevronRight className="w-4 h-4 text-muted-foreground/50 shrink-0" />
            )}
        </Component>
    );
}

interface ListGroupProps {
    title?: string;
    footer?: string;
    children: ReactNode;
    className?: string;
}

/**
 * iOS-style grouped list container
 */
export function ListGroup({ title, footer, children, className }: ListGroupProps) {
    return (
        <div className={clsx("space-y-1", className)}>
            {title && (
                <div className="px-4 pb-1">
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        {title}
                    </span>
                </div>
            )}
            <div className="bg-card rounded-xl overflow-hidden">
                {children}
            </div>
            {footer && (
                <div className="px-4 pt-1">
                    <span className="text-xs text-muted-foreground">
                        {footer}
                    </span>
                </div>
            )}
        </div>
    );
}
