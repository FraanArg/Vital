"use client";

import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { startOfDay, endOfDay } from "date-fns";
import { motion } from "framer-motion";
import { Moon, Droplets, Dumbbell, Utensils, AlertCircle } from "lucide-react";
import { Skeleton } from "./ui/Skeleton";

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

const GOALS = {
    sleep: 8, // hours
    water: 2000, // ml
    exercise: 30, // minutes
    meals: 3, // count
};

/**
 * Today Summary with KPI cards and "what's missing" nudge
 */
export default function TodaySummary({ selectedDate, onQuickAdd }: TodaySummaryProps) {
    const start = startOfDay(selectedDate);
    const end = endOfDay(selectedDate);

    const logs = useQuery(api.logs.getStats, {
        from: start.toISOString(),
        to: end.toISOString()
    });

    if (logs === undefined) {
        return (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[1, 2, 3, 4].map((i) => (
                    <Skeleton key={i} className="h-24 rounded-2xl" />
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
            goal: GOALS.sleep,
            icon: Moon,
            color: "text-indigo-500",
            bgColor: "bg-indigo-500/10",
            trackerId: "sleep",
        },
        {
            id: "water",
            label: "Water",
            value: totals.water,
            unit: "ml",
            goal: GOALS.water,
            icon: Droplets,
            color: "text-blue-500",
            bgColor: "bg-blue-500/10",
            trackerId: "water",
        },
        {
            id: "exercise",
            label: "Exercise",
            value: totals.exercise,
            unit: "min",
            goal: GOALS.exercise,
            icon: Dumbbell,
            color: "text-emerald-500",
            bgColor: "bg-emerald-500/10",
            trackerId: "exercise",
        },
        {
            id: "meals",
            label: "Meals",
            value: totals.meals,
            unit: "",
            goal: GOALS.meals,
            icon: Utensils,
            color: "text-orange-500",
            bgColor: "bg-orange-500/10",
            trackerId: "food",
        },
    ];

    // Find missing items for nudge
    const missing = kpis.filter(k => k.value === 0);

    return (
        <div className="space-y-4">
            {/* KPI Cards Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {kpis.map((kpi, index) => {
                    const Icon = kpi.icon;
                    const progress = Math.min((kpi.value / kpi.goal) * 100, 100);
                    const isComplete = kpi.value >= kpi.goal;

                    return (
                        <motion.button
                            key={kpi.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            onClick={() => onQuickAdd?.(kpi.trackerId)}
                            className="relative bg-card border border-border/50 rounded-2xl p-4 text-left card-interactive focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2"
                        >
                            {/* Progress bar background */}
                            <div className="absolute bottom-0 left-0 right-0 h-1 bg-secondary rounded-b-2xl overflow-hidden">
                                <motion.div
                                    className={`h-full ${isComplete ? "bg-green-500" : kpi.bgColor.replace("/10", "")}`}
                                    initial={{ width: 0 }}
                                    animate={{ width: `${progress}%` }}
                                    transition={{ delay: index * 0.05 + 0.2, duration: 0.5 }}
                                />
                            </div>

                            <div className="flex items-start justify-between mb-2">
                                <div className={`p-2 rounded-lg ${kpi.bgColor}`}>
                                    <Icon className={`w-4 h-4 ${kpi.color}`} />
                                </div>
                                {isComplete && (
                                    <span className="text-[10px] font-medium text-green-500">✓ Done</span>
                                )}
                            </div>

                            <div className="tabular-nums">
                                <span className="text-2xl font-bold">{kpi.value}</span>
                                <span className="text-sm text-muted-foreground ml-0.5">{kpi.unit}</span>
                            </div>
                            <p className="text-xs text-muted-foreground">{kpi.label}</p>
                        </motion.button>
                    );
                })}
            </div>

            {/* What's Missing Nudge */}
            {missing.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-3 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20"
                >
                    <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
                    <p className="text-sm text-amber-700 dark:text-amber-400">
                        <span className="font-medium">Missing today:</span>{" "}
                        {missing.map(m => m.label).join(", ")}
                    </p>
                </motion.div>
            )}
        </div>
    );
}
