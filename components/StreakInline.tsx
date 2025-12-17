"use client";

import { motion } from "framer-motion";
import { Flame } from "lucide-react";

interface StreakInlineProps {
    className?: string;
    // OPTIMIZED: Accept streak count directly instead of querying
    streakCount?: number;
}

/**
 * Inline streak badge for header (Duolingo style)
 * Shows fire emoji + streak count
 * 
 * OPTIMIZED: Now accepts streakCount as prop instead of using useStreak hook
 * This eliminates a redundant query since parent already has the data.
 */
export function StreakInline({ className, streakCount }: StreakInlineProps) {
    if (!streakCount || streakCount === 0) return null;

    return (
        <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 ${className}`}
        >
            <Flame className="w-4 h-4 text-orange-500" />
            <span className="text-sm font-bold text-orange-500 tabular-nums">{streakCount}</span>
        </motion.div>
    );
}
