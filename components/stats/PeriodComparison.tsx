"use client";

import { useState, useMemo } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { subDays, subWeeks, subMonths, startOfDay, endOfDay, format } from "date-fns";
import { GitCompare, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface PeriodComparisonProps {
    range: "week" | "month" | "year";
}

interface ComparisonData {
    metric: string;
    current: number;
    previous: number;
    change: number;
    changePercent: number;
    unit: string;
}

export default function PeriodComparison({ range }: PeriodComparisonProps) {
    const [showComparison, setShowComparison] = useState(false);

    // Calculate date ranges
    const { currentStart, currentEnd, previousStart, previousEnd } = useMemo(() => {
        const now = new Date();
        let currentStart: Date, previousStart: Date, previousEnd: Date;

        if (range === "week") {
            currentStart = subDays(now, 7);
            previousStart = subDays(now, 14);
            previousEnd = subDays(now, 7);
        } else if (range === "month") {
            currentStart = subMonths(now, 1);
            previousStart = subMonths(now, 2);
            previousEnd = subMonths(now, 1);
        } else {
            currentStart = subMonths(now, 12);
            previousStart = subMonths(now, 24);
            previousEnd = subMonths(now, 12);
        }

        return {
            currentStart: startOfDay(currentStart),
            currentEnd: endOfDay(now),
            previousStart: startOfDay(previousStart),
            previousEnd: endOfDay(previousEnd),
        };
    }, [range]);

    // Fetch both periods
    const currentStats = useQuery(api.logs.getStats, {
        from: currentStart.toISOString(),
        to: currentEnd.toISOString(),
    });

    const previousStats = useQuery(api.logs.getStats, {
        from: previousStart.toISOString(),
        to: previousEnd.toISOString(),
    });

    // Calculate comparison data
    const comparison = useMemo<ComparisonData[]>(() => {
        if (!currentStats || !previousStats) return [];

        const aggregate = (logs: typeof currentStats) => ({
            sleep: logs.reduce((sum, l) => sum + (l.sleep || 0), 0) / Math.max(logs.length, 1),
            exercise: logs.filter(l => l.exercise).length,
            water: logs.reduce((sum, l) => sum + (l.water || 0), 0) / Math.max(logs.length, 1),
            mood: logs.reduce((sum, l) => sum + (l.mood || 0), 0) / Math.max(logs.filter(l => l.mood).length, 1),
        });

        const current = aggregate(currentStats);
        const previous = aggregate(previousStats);

        return [
            {
                metric: "Avg Sleep",
                current: Math.round(current.sleep * 10) / 10,
                previous: Math.round(previous.sleep * 10) / 10,
                change: Math.round((current.sleep - previous.sleep) * 10) / 10,
                changePercent: previous.sleep ? Math.round(((current.sleep - previous.sleep) / previous.sleep) * 100) : 0,
                unit: "h",
            },
            {
                metric: "Workouts",
                current: current.exercise,
                previous: previous.exercise,
                change: current.exercise - previous.exercise,
                changePercent: previous.exercise ? Math.round(((current.exercise - previous.exercise) / previous.exercise) * 100) : 0,
                unit: "",
            },
            {
                metric: "Avg Water",
                current: Math.round(current.water * 10) / 10,
                previous: Math.round(previous.water * 10) / 10,
                change: Math.round((current.water - previous.water) * 10) / 10,
                changePercent: previous.water ? Math.round(((current.water - previous.water) / previous.water) * 100) : 0,
                unit: "L",
            },
            {
                metric: "Avg Mood",
                current: Math.round(current.mood * 10) / 10,
                previous: Math.round(previous.mood * 10) / 10,
                change: Math.round((current.mood - previous.mood) * 10) / 10,
                changePercent: previous.mood ? Math.round(((current.mood - previous.mood) / previous.mood) * 100) : 0,
                unit: "/5",
            },
        ];
    }, [currentStats, previousStats]);

    const periodLabel = range === "week" ? "Last Week" : range === "month" ? "Last Month" : "Last Year";

    return (
        <div className="bg-card rounded-2xl border border-border/50 p-4">
            <button
                onClick={() => setShowComparison(!showComparison)}
                className="w-full flex items-center gap-2"
            >
                <div className="p-1.5 rounded-lg bg-blue-500/10">
                    <GitCompare className="w-4 h-4 text-blue-500" />
                </div>
                <span className="font-semibold text-sm flex-1 text-left">Compare to {periodLabel}</span>
                <motion.span
                    animate={{ rotate: showComparison ? 180 : 0 }}
                    className="text-muted-foreground"
                >
                    ▼
                </motion.span>
            </button>

            <AnimatePresence>
                {showComparison && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="grid grid-cols-2 gap-2 mt-4">
                            {comparison.map((item) => (
                                <div
                                    key={item.metric}
                                    className="bg-muted/30 rounded-lg p-3"
                                >
                                    <div className="text-[10px] text-muted-foreground mb-1">{item.metric}</div>
                                    <div className="flex items-end gap-1.5">
                                        <span className="text-lg font-bold">
                                            {item.current}{item.unit}
                                        </span>
                                        <div className={`flex items-center text-xs ${item.change > 0 ? "text-green-500" :
                                                item.change < 0 ? "text-red-500" : "text-muted-foreground"
                                            }`}>
                                            {item.change > 0 ? <TrendingUp className="w-3 h-3" /> :
                                                item.change < 0 ? <TrendingDown className="w-3 h-3" /> :
                                                    <Minus className="w-3 h-3" />}
                                            <span className="ml-0.5">
                                                {item.change > 0 ? "+" : ""}{item.changePercent}%
                                            </span>
                                        </div>
                                    </div>
                                    <div className="text-[10px] text-muted-foreground">
                                        vs {item.previous}{item.unit}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
