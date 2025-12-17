"use client";

import { memo } from "react";
import { motion } from "framer-motion";
import { Flame, Trophy, Star, Zap } from "lucide-react";

interface StreakBadgeProps {
    // OPTIMIZED: Accept streak from parent instead of querying
    streakCount?: number;
}

const MILESTONES = [
    { days: 3, icon: Zap, label: "Getting Started", color: "text-yellow-500" },
    { days: 7, icon: Flame, label: "One Week", color: "text-orange-500" },
    { days: 14, icon: Star, label: "Two Weeks", color: "text-blue-500" },
    { days: 30, icon: Trophy, label: "One Month", color: "text-purple-500" },
    { days: 60, icon: Trophy, label: "Two Months", color: "text-pink-500" },
    { days: 100, icon: Trophy, label: "Century", color: "text-emerald-500" },
];

/**
 * Streak Badge with milestone display
 * 
 * OPTIMIZED: Now accepts streakCount as prop instead of making its own query
 * This eliminates a redundant logs.getStats query.
 */
function StreakBadge({ streakCount = 0 }: StreakBadgeProps) {
    if (streakCount === 0) {
        return null;
    }

    const currentMilestone = MILESTONES.filter(m => streakCount >= m.days).pop() || MILESTONES[0];
    const nextMilestone = MILESTONES.find(m => streakCount < m.days) || MILESTONES[MILESTONES.length - 1];
    const MilestoneIcon = currentMilestone?.icon || Flame;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative overflow-hidden bg-gradient-to-br from-orange-500/10 to-red-500/5 rounded-2xl border border-orange-500/20 p-4"
        >
            <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
                        <Flame className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h3 className="font-bold text-lg tabular-nums">{streakCount} Day Streak!</h3>
                        <p className="text-sm text-muted-foreground">
                            Keep it up! You're doing great.
                        </p>
                    </div>
                </div>
                {currentMilestone && (
                    <div className={`flex items-center gap-1.5 ${currentMilestone.color}`}>
                        <MilestoneIcon className="w-5 h-5" />
                        <span className="text-xs font-semibold">{currentMilestone.label}</span>
                    </div>
                )}
            </div>

            {/* Progress to next milestone */}
            {nextMilestone && streakCount < nextMilestone.days && (
                <div className="mt-4">
                    <div className="flex justify-between text-xs text-muted-foreground mb-1">
                        <span>{nextMilestone.days - streakCount} days to {nextMilestone.label}</span>
                        <span>{streakCount} / {nextMilestone.days}</span>
                    </div>
                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                        <motion.div
                            className="h-full bg-gradient-to-r from-orange-500 to-red-500 rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${(streakCount / nextMilestone.days) * 100}%` }}
                            transition={{ duration: 1, ease: "easeOut" }}
                        />
                    </div>
                </div>
            )}
        </motion.div>
    );
}

export default memo(StreakBadge);
