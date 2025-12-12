"use client";

import { memo } from "react";
import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { subDays, format } from "date-fns";
import { motion } from "framer-motion";
import { Flame, Trophy, Star, Zap } from "lucide-react";

interface StreakData {
    currentStreak: number;
    longestStreak: number;
    todayLogged: boolean;
}

const MILESTONES = [
    { days: 3, icon: Zap, label: "Getting Started", color: "text-yellow-500" },
    { days: 7, icon: Flame, label: "One Week", color: "text-orange-500" },
    { days: 14, icon: Star, label: "Two Weeks", color: "text-blue-500" },
    { days: 30, icon: Trophy, label: "One Month", color: "text-purple-500" },
    { days: 60, icon: Trophy, label: "Two Months", color: "text-pink-500" },
    { days: 100, icon: Trophy, label: "Century", color: "text-emerald-500" },
];

function calculateStreak(logs: { date: string }[] | undefined): StreakData {
    if (!logs || logs.length === 0) {
        return { currentStreak: 0, longestStreak: 0, todayLogged: false };
    }

    // Get unique dates with logs
    const uniqueDates = new Set(
        logs.map(log => format(new Date(log.date), "yyyy-MM-dd"))
    );
    const sortedDates = Array.from(uniqueDates).sort().reverse();

    const today = format(new Date(), "yyyy-MM-dd");
    const yesterday = format(subDays(new Date(), 1), "yyyy-MM-dd");
    const todayLogged = uniqueDates.has(today);

    // Calculate current streak
    let currentStreak = 0;
    let checkDate = todayLogged ? today : yesterday;

    for (let i = 0; i < 365; i++) {
        const dateStr = format(subDays(new Date(checkDate), i), "yyyy-MM-dd");
        if (uniqueDates.has(dateStr)) {
            currentStreak++;
        } else if (i > 0) {
            break;
        }
    }

    // Calculate longest streak (simplified - just use current for now)
    let longestStreak = currentStreak;
    let tempStreak = 0;

    for (let i = 0; i < sortedDates.length; i++) {
        const prevDate = i > 0 ? sortedDates[i - 1] : null;
        const currDate = sortedDates[i];

        if (prevDate) {
            const diff = Math.floor(
                (new Date(prevDate).getTime() - new Date(currDate).getTime()) / (1000 * 60 * 60 * 24)
            );
            if (diff === 1) {
                tempStreak++;
            } else {
                longestStreak = Math.max(longestStreak, tempStreak + 1);
                tempStreak = 0;
            }
        } else {
            tempStreak = 1;
        }
    }
    longestStreak = Math.max(longestStreak, tempStreak);

    return { currentStreak, longestStreak, todayLogged };
}

function StreakBadge() {
    // Fetch last 100 days of logs for streak calculation
    const logs = useQuery(api.logs.getStats, {
        from: subDays(new Date(), 100).toISOString(),
        to: new Date().toISOString(),
    });

    const streak = calculateStreak(logs);
    const nextMilestone = MILESTONES.find(m => m.days > streak.currentStreak);
    const achievedMilestone = [...MILESTONES].reverse().find(m => m.days <= streak.currentStreak);

    if (!logs) {
        return (
            <div className="h-20 bg-card rounded-2xl border border-border/50 animate-pulse" />
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card rounded-2xl border border-border/50 p-4"
        >
            <div className="flex items-center justify-between">
                {/* Current Streak */}
                <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-xl ${streak.currentStreak > 0 ? "bg-orange-500/10" : "bg-muted"}`}>
                        <Flame className={`w-6 h-6 ${streak.currentStreak > 0 ? "text-orange-500" : "text-muted-foreground"}`} />
                    </div>
                    <div>
                        <div className="flex items-baseline gap-1">
                            <span className="text-2xl font-bold tabular-nums">{streak.currentStreak}</span>
                            <span className="text-sm text-muted-foreground">day streak</span>
                        </div>
                        {!streak.todayLogged && streak.currentStreak > 0 && (
                            <p className="text-xs text-amber-500">Log today to keep your streak!</p>
                        )}
                    </div>
                </div>

                {/* Achievement Badge */}
                {achievedMilestone && (
                    <div className="flex items-center gap-2">
                        <achievedMilestone.icon className={`w-5 h-5 ${achievedMilestone.color}`} />
                        <span className="text-xs font-medium text-muted-foreground hidden sm:inline">
                            {achievedMilestone.label}
                        </span>
                    </div>
                )}
            </div>

            {/* Progress to next milestone */}
            {nextMilestone && streak.currentStreak > 0 && (
                <div className="mt-3 pt-3 border-t border-border/50">
                    <div className="flex items-center justify-between text-xs mb-1.5">
                        <span className="text-muted-foreground">Next: {nextMilestone.label}</span>
                        <span className="font-medium tabular-nums">
                            {streak.currentStreak}/{nextMilestone.days} days
                        </span>
                    </div>
                    <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                        <motion.div
                            className="h-full bg-orange-500 rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${(streak.currentStreak / nextMilestone.days) * 100}%` }}
                            transition={{ duration: 0.5 }}
                        />
                    </div>
                </div>
            )}
        </motion.div>
    );
}

export default memo(StreakBadge);
