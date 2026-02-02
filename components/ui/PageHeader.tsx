"use client";

import { ReactNode } from "react";
import { motion } from "framer-motion";

interface PageHeaderProps {
    /** Page title - displayed prominently */
    title: string;
    /** Optional subtitle - smaller text below title */
    subtitle?: string;
    /** Optional action buttons/elements on the right */
    actions?: ReactNode;
    /** Optional className for additional styling */
    className?: string;
}

/**
 * Standardized page header component for consistent page layouts.
 * Provides a unified structure for all page headers across the app.
 */
export function PageHeader({ title, subtitle, actions, className = "" }: PageHeaderProps) {
    return (
        <motion.header
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 ${className}`}
        >
            <div className="space-y-1">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                    {title}
                </h1>
                {subtitle && (
                    <p className="text-sm text-muted-foreground">
                        {subtitle}
                    </p>
                )}
            </div>
            {actions && (
                <div className="flex items-center gap-3 flex-shrink-0">
                    {actions}
                </div>
            )}
        </motion.header>
    );
}
