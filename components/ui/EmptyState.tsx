"use client";

import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

interface EmptyStateProps {
    icon: LucideIcon;
    title: string;
    description: string;
    action?: {
        label: string;
        onClick: () => void;
    };
    className?: string;
}

/**
 * Reusable empty state component with icon, message, and optional CTA
 */
export function EmptyState({
    icon: Icon,
    title,
    description,
    action,
    className = "",
}: EmptyStateProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex flex-col items-center justify-center py-12 text-center ${className}`}
        >
            <div className="p-4 bg-secondary/50 rounded-2xl mb-4">
                <Icon className="w-10 h-10 text-muted-foreground/50" />
            </div>
            <h3 className="text-lg font-semibold mb-1">{title}</h3>
            <p className="text-sm text-muted-foreground max-w-[280px] mb-4">
                {description}
            </p>
            {action && (
                <button
                    onClick={action.onClick}
                    className="px-4 py-2 rounded-xl bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 transition-colors focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2"
                >
                    {action.label}
                </button>
            )}
        </motion.div>
    );
}

/**
 * Error state with retry button
 */
interface ErrorStateProps {
    message?: string;
    onRetry: () => void;
}

export function ErrorState({ message = "Something went wrong", onRetry }: ErrorStateProps) {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-8 text-center"
        >
            <div className="p-3 bg-red-500/10 rounded-xl mb-3">
                <svg
                    className="w-8 h-8 text-red-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                </svg>
            </div>
            <p className="text-sm text-muted-foreground mb-3">{message}</p>
            <button
                onClick={onRetry}
                className="px-4 py-2 rounded-xl bg-secondary hover:bg-secondary/80 font-medium text-sm transition-colors"
            >
                Try Again
            </button>
        </motion.div>
    );
}
