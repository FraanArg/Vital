"use client";

import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { ArrowUpRight, ArrowDownRight, Minus } from "lucide-react";

export default function WeekComparison() {
    const data = useQuery(api.stats.getWeekComparison);

    if (!data) return null;

    const metrics = [
        { label: "Workouts", thisWeek: data.thisWeek.workouts, change: data.changes.workouts, unit: "" },
        { label: "Exercise", thisWeek: data.thisWeek.exerciseMinutes, change: data.changes.exerciseMinutes, unit: "m" },
        { label: "Avg Sleep", thisWeek: Math.round(data.thisWeek.avgSleep * 10) / 10, change: data.changes.avgSleep, unit: "h" },
        { label: "Water", thisWeek: data.thisWeek.totalWater, change: data.changes.totalWater, unit: "" },
        { label: "Meals", thisWeek: data.thisWeek.meals, change: data.changes.meals, unit: "" },
    ];

    return (
        <div className="bg-card rounded-2xl border border-border/50 p-5">
            <h3 className="font-semibold mb-4">This Week vs Last Week</h3>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {metrics.map((metric) => (
                    <div key={metric.label} className="text-center p-3 bg-secondary/30 rounded-xl">
                        <div className="text-xs text-muted-foreground mb-1">{metric.label}</div>
                        <div className="text-2xl font-bold">{metric.thisWeek}{metric.unit}</div>
                        <div className={`text-sm flex items-center justify-center gap-1 mt-1 ${metric.change > 0 ? "text-green-500" : metric.change < 0 ? "text-red-500" : "text-muted-foreground"
                            }`}>
                            {metric.change > 0 ? (
                                <ArrowUpRight className="w-4 h-4" />
                            ) : metric.change < 0 ? (
                                <ArrowDownRight className="w-4 h-4" />
                            ) : (
                                <Minus className="w-4 h-4" />
                            )}
                            {metric.change > 0 ? "+" : ""}{metric.change}{metric.unit}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
