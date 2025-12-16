"use client";

import { memo } from "react";
import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { startOfDay, endOfDay } from "date-fns";
import { motion } from "framer-motion";
import { Moon, Droplets, Dumbbell, Utensils } from "lucide-react";
import { Skeleton } from "./ui/Skeleton";
import { MiniRing } from "./ui/MiniRing";

interface TodaySummaryProps {
    selectedDate: Date;
    onQuickAdd?: (trackerId: string) => void;
}

interface KPIData {
    sleep: number;
    water: number;
    exercise: number;
    meals: number;
}

/**
 * Today Summary with Apple Watch-style activity rings
 */
function TodaySummary({ selectedDate, onQuickAdd }: TodaySummaryProps) {
    const start = startOfDay(selectedDate);
    const end = endOfDay(selectedDate);

    const logs = useQuery(api.logs.getStats, {
        from: start.toISOString(),
        to: end.toISOString()
    });

    const goals = useQuery(api.userProfile.getGoals);

    if (logs === undefined || goals === undefined) {
        return (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => (
                    <Skeleton key={i} className="h-32 rounded-2xl" />
                ))}
            </div>
        );
    }

    // Calculate totals
    const totals: KPIData = logs.reduce((acc, log) => ({
        sleep: acc.sleep + (log.sleep || 0),
        water: acc.water + (log.water || 0),
        exercise: acc.exercise + (log.exercise?.duration || 0),
        meals: acc.meals + (log.meal ? 1 : 0),
    }), { sleep: 0, water: 0, exercise: 0, meals: 0 });

    const kpis = [
        {
            id: "sleep",
            label: "Sleep",
            value: totals.sleep,
            unit: "h",
            goal: goals.goalSleep,
            icon: Moon,
            ringColor: "#8B5CF6", // violet
            bgGradient: "from-violet-500/20 to-violet-600/5",
            trackerId: "sleep",
        },
        {
            id: "water",
            label: "Water",
            value: totals.water,
            unit: "ml",
            goal: goals.goalWater,
            icon: Droplets,
            ringColor: "#06B6D4", // cyan
            bgGradient: "from-cyan-500/20 to-cyan-600/5",
            trackerId: "water",
        },
        {
            id: "exercise",
            label: "Exercise",
            value: totals.exercise,
            unit: "min",
            goal: goals.goalExercise,
            icon: Dumbbell,
            ringColor: "#10B981", // emerald
            bgGradient: "from-emerald-500/20 to-emerald-600/5",
            trackerId: "exercise",
        },
        {
            id: "meals",
            label: "Meals",
            value: totals.meals,
            unit: "",
            goal: goals.goalMeals,
            icon: Utensils,
            ringColor: "#F97316", // orange
            bgGradient: "from-orange-500/20 to-orange-600/5",
            trackerId: "food",
        },
    ];

    return (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {kpis.map((kpi, index) => {
                const Icon = kpi.icon;
                const progress = Math.min((kpi.value / kpi.goal) * 100, 100);
                const isComplete = kpi.value >= kpi.goal;

                return (
                    <motion.button
                        key={kpi.id}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.08, type: "spring", stiffness: 300 }}
                        onClick={() => onQuickAdd?.(kpi.trackerId)}
                        className={`
                            relative overflow-hidden bg-gradient-to-br ${kpi.bgGradient}
                            bg-card border border-border/30 rounded-2xl p-4
                            text-left transition-all duration-200
                            hover:shadow-lg hover:scale-[1.02] hover:border-border/50
                            active:scale-[0.98]
                            focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2
                        `}
                    >
                        {/* Ring with Icon inside */}
                        <div className="flex items-center justify-between mb-3">
                            <div className="relative">
                                <MiniRing
                                    progress={progress}
                                    size={52}
                                    strokeWidth={5}
                                    color={kpi.ringColor}
                                    showCheck={isComplete}
                                    delay={index * 0.1}
                                />
                                {/* Icon centered in ring */}
                                {!isComplete && (
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <Icon
                                            className="w-5 h-5"
                                            style={{ color: kpi.ringColor }}
                                        />
                                    </div>
                                )}
                            </div>
                            <span
                                className="text-xs font-medium px-2 py-0.5 rounded-full"
                                style={{
                                    backgroundColor: `${kpi.ringColor}15`,
                                    color: kpi.ringColor
                                }}
                            >
                                {kpi.label}
                            </span>
                        </div>

                        {/* Value with inline goal */}
                        <div className="flex items-baseline gap-0.5 flex-wrap">
                            <motion.span
                                className="text-3xl font-bold tabular-nums"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: index * 0.1 + 0.2 }}
                            >
                                {kpi.value}
                            </motion.span>
                            <span className="text-sm text-muted-foreground font-medium">
                                {kpi.unit}
                            </span>
                            <span className="text-sm text-muted-foreground/50 font-medium">
                                / {kpi.goal}{kpi.unit}
                            </span>
                        </div>
                    </motion.button>
                );
            })}
        </div>
    );
}

export default memo(TodaySummary);
