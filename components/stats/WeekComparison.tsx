"use client";

import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { motion } from "framer-motion";
import { ArrowUpRight, ArrowDownRight, Minus, TrendingUp } from "lucide-react";

export default function WeekComparison() {
    const data = useQuery(api.stats.getWeekComparison);

    if (!data) return null;

    const metrics = [
        { label: "Workouts", thisWeek: data.thisWeek.workouts, change: data.changes.workouts, unit: "", icon: "💪" },
        { label: "Exercise", thisWeek: data.thisWeek.exerciseMinutes, change: data.changes.exerciseMinutes, unit: "m", icon: "⏱️" },
        { label: "Avg Sleep", thisWeek: Math.round(data.thisWeek.avgSleep * 10) / 10, change: data.changes.avgSleep, unit: "h", icon: "😴" },
        { label: "Water", thisWeek: data.thisWeek.totalWater, change: data.changes.totalWater, unit: "", icon: "💧" },
        { label: "Meals", thisWeek: data.thisWeek.meals, change: data.changes.meals, unit: "", icon: "🍽️" },
    ];

    return (
        <div className="bg-card rounded-2xl border border-border/50 p-5">
            <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-5 h-5 text-green-500" />
                <h3 className="font-semibold">This Week vs Last Week</h3>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {metrics.map((metric, i) => {
                    const isPositive = metric.change > 0;
                    const isNeutral = metric.change === 0;
                    return (
                        <motion.div
                            key={metric.label}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                            className="text-center p-3 bg-gradient-to-br from-secondary/50 to-secondary/30 border border-border/30 rounded-xl hover:scale-105 transition-transform"
                        >
                            <div className="text-lg mb-1">{metric.icon}</div>
                            <div className="text-xs text-muted-foreground mb-1">{metric.label}</div>
                            <div className="text-xl font-bold">{metric.thisWeek}{metric.unit}</div>
                            <div className={`text-xs flex items-center justify-center gap-0.5 mt-1 ${isPositive ? "text-green-500" : isNeutral ? "text-muted-foreground" : "text-red-500"
                                }`}>
                                {isPositive ? (
                                    <ArrowUpRight className="w-3 h-3" />
                                ) : isNeutral ? (
                                    <Minus className="w-3 h-3" />
                                ) : (
                                    <ArrowDownRight className="w-3 h-3" />
                                )}
                                {isPositive ? "+" : ""}{metric.change}{metric.unit}
                            </div>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
}
