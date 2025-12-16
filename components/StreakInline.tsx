"use client";

import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { subDays, isSameDay, startOfDay } from "date-fns";
import { motion } from "framer-motion";
import { Flame } from "lucide-react";

interface StreakInlineProps {
    className?: string;
}

/**
 * Inline streak badge for header (Duolingo style)
 * Shows fire emoji + streak count
 */
export function StreakInline({ className }: StreakInlineProps) {
    const logs = useQuery(api.logs.getStats, {
        from: subDays(new Date(), 100).toISOString(),
        to: new Date().toISOString(),
    });

    if (!logs) return null;

    // Calculate current streak
    let streak = 0;
    let checkDate = startOfDay(new Date());

    // Check if logged today
    const todayLogs = logs.filter(log => isSameDay(new Date(log.date), checkDate));
    if (todayLogs.length === 0) {
        // Check yesterday
        checkDate = subDays(checkDate, 1);
    }

    // Count consecutive days
    while (true) {
        const dayLogs = logs.filter(log => isSameDay(new Date(log.date), checkDate));
        if (dayLogs.length === 0) break;
        streak++;
        checkDate = subDays(checkDate, 1);
    }

    if (streak === 0) return null;

    return (
        <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 ${className}`}
        >
            <Flame className="w-4 h-4 text-orange-500" />
            <span className="text-sm font-bold text-orange-500 tabular-nums">{streak}</span>
        </motion.div>
    );
}
