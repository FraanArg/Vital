"use client";

import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { motion } from "framer-motion";
import { subDays } from "date-fns";
import { Trophy, Flame, Droplets, Moon, Dumbbell, Target, Zap, Star } from "lucide-react";

interface Badge {
    id: string;
    icon: React.ReactNode;
    label: string;
    color: string;
    earned: boolean;
}

interface AchievementBadgesProps {
    // OPTIMIZED: Accept streak from parent instead of querying
    streakCount?: number;
}

/**
 * Zero app-style horizontal scrolling achievement badges
 * Shows recently earned achievements
 * 
 * OPTIMIZED: Now accepts streakCount as prop from parent's consolidated query
 * Only makes 1 query for log-based achievements (instead of 2)
 */
export function AchievementBadges({ streakCount = 0 }: AchievementBadgesProps) {
    // Get logs for other achievement calculations (still needed for non-streak achievements)
    const logs = useQuery(api.logs.getStats, {
        from: subDays(new Date(), 30).toISOString(),
        to: new Date().toISOString(),
    });

    if (!logs) return null;

    // Calculate achievements based on data
    const totalWater = logs.reduce((sum, l) => sum + (l.water || 0), 0);
    const totalExercise = logs.reduce((sum, l) => sum + (l.exercise?.duration || 0), 0);
    const workoutCount = logs.filter(l => l.exercise).length;
    const perfectDays = countPerfectDays(logs);

    const badges: Badge[] = [
        {
            id: "streak-7",
            icon: <Flame className="w-4 h-4" />,
            label: "7 Day Streak",
            color: "bg-orange-500/10 text-orange-500 border-orange-500/20",
            earned: streakCount >= 7,
        },
        {
            id: "streak-30",
            icon: <Flame className="w-4 h-4" />,
            label: "30 Day Streak",
            color: "bg-red-500/10 text-red-500 border-red-500/20",
            earned: streakCount >= 30,
        },
        {
            id: "hydration-hero",
            icon: <Droplets className="w-4 h-4" />,
            label: "Hydration Hero",
            color: "bg-blue-500/10 text-blue-500 border-blue-500/20",
            earned: totalWater >= 30000, // 30L total
        },
        {
            id: "early-bird",
            icon: <Moon className="w-4 h-4" />,
            label: "Early Bird",
            color: "bg-purple-500/10 text-purple-500 border-purple-500/20",
            earned: logs.some(l => l.sleep_end && parseInt(l.sleep_end.split(':')[0]) < 7),
        },
        {
            id: "workout-warrior",
            icon: <Dumbbell className="w-4 h-4" />,
            label: "Workout Warrior",
            color: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
            earned: workoutCount >= 10,
        },
        {
            id: "perfect-week",
            icon: <Star className="w-4 h-4" />,
            label: "Perfect Week",
            color: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
            earned: perfectDays >= 7,
        },
        {
            id: "marathon",
            icon: <Target className="w-4 h-4" />,
            label: "Marathon",
            color: "bg-pink-500/10 text-pink-500 border-pink-500/20",
            earned: totalExercise >= 1000, // 1000 mins total
        },
        {
            id: "first-log",
            icon: <Zap className="w-4 h-4" />,
            label: "First Steps",
            color: "bg-cyan-500/10 text-cyan-500 border-cyan-500/20",
            earned: logs.length >= 1,
        },
    ];

    const earnedBadges = badges.filter(b => b.earned);

    if (earnedBadges.length === 0) return null;

    return (
        <div className="overflow-x-auto -mx-4 px-4 py-2 scrollbar-hide">
            <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 shrink-0 text-muted-foreground">
                    <Trophy className="w-4 h-4" />
                    <span className="text-xs font-medium">Achievements:</span>
                </div>
                {earnedBadges.map((badge, index) => (
                    <motion.div
                        key={badge.id}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.05 }}
                        className={`
                            shrink-0 inline-flex items-center gap-1.5
                            px-3 py-1.5 rounded-full text-xs font-semibold
                            border ${badge.color}
                        `}
                        title={badge.label}
                    >
                        {badge.icon}
                        <span className="hidden sm:inline">{badge.label}</span>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}

// Helper: Count perfect days (all 4 KPIs logged)
function countPerfectDays(logs: any[]): number {
    const dayMap = new Map<string, { sleep: boolean; water: boolean; exercise: boolean; meal: boolean }>();

    logs.forEach(log => {
        const day = log.date.split('T')[0];
        if (!dayMap.has(day)) {
            dayMap.set(day, { sleep: false, water: false, exercise: false, meal: false });
        }
        const d = dayMap.get(day)!;
        if (log.sleep) d.sleep = true;
        if (log.water) d.water = true;
        if (log.exercise) d.exercise = true;
        if (log.meal) d.meal = true;
    });

    return Array.from(dayMap.values()).filter(d => d.sleep && d.water && d.exercise && d.meal).length;
}
