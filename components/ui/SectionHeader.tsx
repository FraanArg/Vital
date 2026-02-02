"use client";

import { ReactNode } from "react";

interface SectionHeaderProps {
    /** Section title */
    title: string;
    /** Optional subtitle or description */
    subtitle?: string;
    /** Optional action element (button, link, etc.) */
    action?: ReactNode;
    /** Optional icon to display before the title */
    icon?: ReactNode;
    /** Optional className for additional styling */
    className?: string;
}

/**
 * Standardized section header component for consistent section layouts.
 * Used within pages to separate content areas.
 */
export function SectionHeader({
    title,
    subtitle,
    action,
    icon,
    className = ""
}: SectionHeaderProps) {
    return (
        <div className={`flex items-center justify-between mb-4 ${className}`}>
            <div className="flex items-center gap-2">
                {icon && (
                    <span className="flex-shrink-0 text-muted-foreground">
                        {icon}
                    </span>
                )}
                <div>
                    <h2 className="text-lg font-semibold tracking-tight">
                        {title}
                    </h2>
                    {subtitle && (
                        <p className="text-sm text-muted-foreground mt-0.5">
                            {subtitle}
                        </p>
                    )}
                </div>
            </div>
            {action && (
                <div className="flex-shrink-0">
                    {action}
                </div>
            )}
        </div>
    );
}
