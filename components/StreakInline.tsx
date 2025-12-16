"use client";

import { motion } from "framer-motion";
import { Flame } from "lucide-react";
import { useStreak } from "../hooks/useStreak";

interface StreakInlineProps {
    className?: string;
}

/**
 * Inline streak badge for header (Duolingo style)
 * Shows fire emoji + streak count
 */
export function StreakInline({ className }: StreakInlineProps) {
    const { currentStreak, isLoading } = useStreak();

    if (isLoading || currentStreak === 0) return null;

    return (
        <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 ${className}`}
        >
            <Flame className="w-4 h-4 text-orange-500" />
            <span className="text-sm font-bold text-orange-500 tabular-nums">{currentStreak}</span>
        </motion.div>
    );
}
