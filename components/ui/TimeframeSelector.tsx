"use client";

import { motion } from "framer-motion";
import { clsx } from "clsx";

type TimeframeOption = "day" | "week" | "month" | "year";

interface TimeframeSelectorProps<T extends string = TimeframeOption> {
    /** Currently selected value */
    value: T;
    /** Available options to select from */
    options: T[];
    /** Callback when value changes */
    onChange: (value: T) => void;
    /** Optional custom labels for options (defaults to capitalized option) */
    labels?: Partial<Record<T, string>>;
    /** Size variant */
    size?: "sm" | "md";
    /** Optional className for additional styling */
    className?: string;
}

/**
 * Unified timeframe selector for date range selection.
 * Used across Stats, Dashboard, and other time-based views.
 * 
 * Built on the same patterns as SegmentedControl but specifically
 * optimized for time ranges with more compact styling.
 */
export function TimeframeSelector<T extends string = TimeframeOption>({
    value,
    options,
    onChange,
    labels,
    size = "md",
    className = "",
}: TimeframeSelectorProps<T>) {
    const activeIndex = options.indexOf(value);

    const sizeStyles = {
        sm: "h-7 text-xs px-2.5",
        md: "h-9 text-sm px-3.5",
    };

    const containerStyles = {
        sm: "p-0.5",
        md: "p-1",
    };

    return (
        <div
            className={clsx(
                "relative inline-flex bg-secondary/80 rounded-xl border border-border/50 shadow-sm",
                containerStyles[size],
                className
            )}
            role="tablist"
            aria-label="Select timeframe"
        >
            {/* Animated background indicator */}
            <motion.div
                className="absolute inset-y-0.5 bg-background rounded-lg shadow-sm"
                initial={false}
                animate={{
                    left: `calc(${(activeIndex / options.length) * 100}% + 2px)`,
                    width: `calc(${100 / options.length}% - 4px)`,
                }}
                transition={{
                    type: "spring",
                    stiffness: 500,
                    damping: 35,
                }}
            />

            {/* Options */}
            {options.map((option) => {
                const isActive = value === option;
                const label = labels?.[option] ?? option.charAt(0).toUpperCase() + option.slice(1);

                return (
                    <button
                        key={option}
                        role="tab"
                        aria-selected={isActive}
                        onClick={() => onChange(option)}
                        className={clsx(
                            "relative flex-1 flex items-center justify-center font-medium transition-colors duration-150 z-10",
                            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset rounded-lg",
                            sizeStyles[size],
                            isActive
                                ? "text-foreground"
                                : "text-muted-foreground hover:text-foreground/80"
                        )}
                    >
                        {label}
                    </button>
                );
            })}
        </div>
    );
}
