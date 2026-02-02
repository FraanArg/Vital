"use client";

import { motion } from "framer-motion";
import { LucideIcon, Inbox, Search, Calendar, Utensils, Dumbbell, BarChart3, FileText, Heart } from "lucide-react";
import { Button } from "./Button";
import clsx from "clsx";

// Preset illustrations for common empty states
type EmptyPreset = "noData" | "noResults" | "noLogs" | "noFoods" | "noExercises" | "noStats" | "noHistory" | "noGoals";

const presetConfig: Record<EmptyPreset, { icon: LucideIcon; title: string; description: string; gradient: string }> = {
    noData: {
        icon: Inbox,
        title: "No data yet",
        description: "Start logging to see your progress here",
        gradient: "from-blue-500/10 to-purple-500/10",
    },
    noResults: {
        icon: Search,
        title: "No results found",
        description: "Try adjusting your search or filters",
        gradient: "from-gray-500/10 to-gray-400/10",
    },
    noLogs: {
        icon: Calendar,
        title: "No logs for this day",
        description: "Tap the + button to add your first entry",
        gradient: "from-green-500/10 to-emerald-500/10",
    },
    noFoods: {
        icon: Utensils,
        title: "No foods saved",
        description: "Add your favorite foods for quick logging",
        gradient: "from-orange-500/10 to-amber-500/10",
    },
    noExercises: {
        icon: Dumbbell,
        title: "No exercises yet",
        description: "Create your workout routine to get started",
        gradient: "from-red-500/10 to-rose-500/10",
    },
    noStats: {
        icon: BarChart3,
        title: "Not enough data",
        description: "Keep logging for at least a week to see trends",
        gradient: "from-violet-500/10 to-purple-500/10",
    },
    noHistory: {
        icon: FileText,
        title: "No history",
        description: "Your past entries will appear here",
        gradient: "from-cyan-500/10 to-teal-500/10",
    },
    noGoals: {
        icon: Heart,
        title: "No goals set",
        description: "Set daily goals to track your progress",
        gradient: "from-pink-500/10 to-rose-500/10",
    },
};

interface EmptyStateProps {
    /** Use a preset or provide custom icon */
    preset?: EmptyPreset;
    icon?: LucideIcon;
    title?: string;
    description?: string;
    action?: {
        label: string;
        onClick: () => void;
    };
    className?: string;
    /** Show compact version */
    compact?: boolean;
}

/**
 * Beautiful empty state component with gradient backgrounds and illustrations
 */
export function EmptyState({
    preset,
    icon: CustomIcon,
    title: customTitle,
    description: customDescription,
    action,
    className = "",
    compact = false,
}: EmptyStateProps) {
    const config = preset ? presetConfig[preset] : null;
    const Icon = CustomIcon || config?.icon || Inbox;
    const title = customTitle || config?.title || "No data";
    const description = customDescription || config?.description || "Nothing to show here";
    const gradient = config?.gradient || "from-gray-500/10 to-gray-400/10";

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={clsx(
                "flex flex-col items-center justify-center text-center",
                compact ? "py-6" : "py-12",
                className
            )}
        >
            {/* Gradient Background Circle */}
            <div className={clsx(
                "relative mb-4",
                compact ? "p-3" : "p-5"
            )}>
                <div className={clsx(
                    "absolute inset-0 rounded-full bg-gradient-to-br blur-xl opacity-60",
                    gradient
                )} />
                <div className={clsx(
                    "relative p-4 bg-gradient-to-br rounded-2xl",
                    gradient
                )}>
                    <Icon className={clsx(
                        "text-muted-foreground/70",
                        compact ? "w-8 h-8" : "w-12 h-12"
                    )} />
                </div>
            </div>

            <h3 className={clsx(
                "font-semibold mb-1",
                compact ? "text-base" : "text-lg"
            )}>
                {title}
            </h3>
            <p className={clsx(
                "text-muted-foreground max-w-[280px]",
                compact ? "text-xs mb-3" : "text-sm mb-4"
            )}>
                {description}
            </p>

            {action && (
                <Button onClick={action.onClick} size={compact ? "sm" : "md"}>
                    {action.label}
                </Button>
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
            <div className="relative mb-4">
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-red-500/20 to-orange-500/20 blur-xl" />
                <div className="relative p-4 bg-gradient-to-br from-red-500/10 to-orange-500/10 rounded-2xl">
                    <svg
                        className="w-10 h-10 text-red-500"
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
            </div>
            <p className="text-sm text-muted-foreground mb-3">{message}</p>
            <Button onClick={onRetry} variant="secondary" size="sm">
                Try Again
            </Button>
        </motion.div>
    );
}

