"use client";

import { memo } from "react";
import { motion } from "framer-motion";
import { Moon, Droplets, Dumbbell, Utensils, TrendingUp, TrendingDown } from "lucide-react";
import { Skeleton } from "./ui/Skeleton";
import { MiniRing } from "./ui/MiniRing";
import { Sparkline } from "./ui/Sparkline";

interface TodaySummaryProps {
    selectedDate: Date;
    onQuickAdd?: (trackerId: string) => void;
    // OPTIMIZED: Accept pre-calculated data from parent instead of querying
    dashboardData?: {
        goals: { goalWater: number; goalSleep: number; goalExercise: number; goalMeals: number };
        todayTotals: { water: number; sleep: number; exercise: number; meals: number };
        sparklineData: { water: number[]; sleep: number[]; exercise: number[]; meals: number[] };
        comparison: { water: number | null; sleep: number | null; exercise: number | null; meals: number | null };
    } | null;
}

/**
 * Today Summary with Apple Watch-style activity rings
 * 
 * OPTIMIZED: Now accepts pre-calculated data from parent via props
 * instead of making 4 separate Convex queries.
 * 
 * Before: 4 useQuery calls (today, week, lastWeek, goals) = 4 subscriptions
 * After: 0 useQuery calls - uses data from single getDashboardData query
 */
function TodaySummary({ selectedDate, onQuickAdd, dashboardData }: TodaySummaryProps) {
    // Loading state
    if (!dashboardData) {
        return (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => (
                    <Skeleton key={i} className="h-36 rounded-2xl" />
                ))}
            </div>
        );
    }

    const { goals, todayTotals, sparklineData, comparison } = dashboardData;

    const kpis = [
        {
            id: "sleep",
            label: "Sleep",
            value: todayTotals.sleep,
            unit: "h",
            goal: goals.goalSleep,
            icon: Moon,
            ringColor: "#8B5CF6", // violet
            bgGradient: "from-violet-500/20 to-violet-600/5",
            trackerId: "sleep",
            sparkline: sparklineData.sleep,
            comparison: comparison.sleep,
        },
        {
            id: "water",
            label: "Water",
            value: todayTotals.water,
            unit: "ml",
            goal: goals.goalWater,
            icon: Droplets,
            ringColor: "#06B6D4", // cyan
            bgGradient: "from-cyan-500/20 to-cyan-600/5",
            trackerId: "water",
            sparkline: sparklineData.water,
            comparison: comparison.water,
        },
        {
            id: "exercise",
            label: "Exercise",
            value: todayTotals.exercise,
            unit: "min",
            goal: goals.goalExercise,
            icon: Dumbbell,
            ringColor: "#10B981", // emerald
            bgGradient: "from-emerald-500/20 to-emerald-600/5",
            trackerId: "exercise",
            sparkline: sparklineData.exercise,
            comparison: comparison.exercise,
        },
        {
            id: "meals",
            label: "Meals",
            value: todayTotals.meals,
            unit: "",
            goal: goals.goalMeals,
            icon: Utensils,
            ringColor: "#F97316", // orange
            bgGradient: "from-orange-500/20 to-orange-600/5",
            trackerId: "food",
            sparkline: sparklineData.meals,
            comparison: comparison.meals,
        },
    ];

    return (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {kpis.map((kpi, index) => {
                const Icon = kpi.icon;
                const progress = Math.min((kpi.value / kpi.goal) * 100, 100);
                const isComplete = kpi.value >= kpi.goal;
                const hasComparison = kpi.comparison !== null && kpi.comparison !== 0;
                const comparisonUp = hasComparison && kpi.comparison! > 0;

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
                        {/* Sparkline background */}
                        <div className="absolute bottom-2 right-2 opacity-40">
                            <Sparkline
                                data={kpi.sparkline}
                                width={50}
                                height={20}
                                color={kpi.ringColor}
                            />
                        </div>

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

                        {/* Weekly comparison */}
                        {hasComparison && (
                            <div className={`flex items-center gap-1 mt-1 text-[10px] font-medium ${comparisonUp ? "text-emerald-500" : "text-red-400"
                                }`}>
                                {comparisonUp ? (
                                    <TrendingUp className="w-3 h-3" />
                                ) : (
                                    <TrendingDown className="w-3 h-3" />
                                )}
                                <span>{comparisonUp ? "+" : ""}{kpi.comparison}% vs last week</span>
                            </div>
                        )}
                    </motion.button>
                );
            })}
        </div>
    );
}

export default memo(TodaySummary);
