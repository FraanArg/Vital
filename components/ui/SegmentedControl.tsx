"use client";

import { motion } from "framer-motion";

interface SegmentedControlProps<T extends string> {
    options: T[];
    value: T;
    onChange: (value: T) => void;
    labels?: Record<T, string>;
}

export function SegmentedControl<T extends string>({
    options,
    value,
    onChange,
    labels,
}: SegmentedControlProps<T>) {
    return (
        <div className="flex bg-secondary/50 p-1 rounded-xl relative">
            {options.map((option) => {
                const isSelected = value === option;
                return (
                    <button
                        key={option}
                        onClick={() => onChange(option)}
                        className={`relative z-10 px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${isSelected ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                            }`}
                    >
                        {isSelected && (
                            <motion.div
                                layoutId="segmented-control-indicator"
                                className="absolute inset-0 bg-primary shadow-sm rounded-lg -z-10"
                                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            />
                        )}
                        <span className="relative z-10">
                            {labels ? labels[option] : option.charAt(0).toUpperCase() + option.slice(1)}
                        </span>
                    </button>
                );
            })}
        </div>
    );
}
