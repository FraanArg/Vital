"use client";

import { motion } from "framer-motion";
import { clsx } from "clsx";

interface SegmentedControlProps<T extends string> {
    options: T[];
    value: T;
    onChange: (value: T) => void;
    labels?: Record<T, string>;
    size?: "sm" | "md";
    fullWidth?: boolean;
}

export function SegmentedControl<T extends string>({
    options,
    value,
    onChange,
    labels,
    size = "md",
    fullWidth = false,
}: SegmentedControlProps<T>) {
    const activeIndex = options.indexOf(value);

    const sizeStyles = {
        sm: "h-8 text-xs",
        md: "h-9 text-sm",
    };

    return (
        <div
            className={clsx(
                "relative inline-flex p-0.5 bg-secondary rounded-lg",
                fullWidth && "w-full"
            )}
            role="tablist"
        >
            {/* Animated background indicator */}
            <motion.div
                className="absolute inset-y-0.5 bg-background rounded-md shadow-sm"
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
                const label = labels?.[option] ?? option;

                return (
                    <button
                        key={option}
                        role="tab"
                        aria-selected={isActive}
                        onClick={() => onChange(option)}
                        className={clsx(
                            "relative flex-1 flex items-center justify-center font-medium transition-colors duration-fast z-10",
                            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset rounded-md",
                            sizeStyles[size],
                            isActive
                                ? "text-foreground"
                                : "text-muted-foreground hover:text-foreground/80"
                        )}
                    >
                        {label.charAt(0).toUpperCase() + label.slice(1)}
                    </button>
                );
            })}
        </div>
    );
}
