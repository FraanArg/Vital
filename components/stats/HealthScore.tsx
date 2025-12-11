"use client";

import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Minus, Sparkles, Moon, Dumbbell, Calendar, Utensils } from "lucide-react";
import { useAnimatedCounter } from "../../hooks/useAnimatedCounter";

export default function HealthScore() {
    const data = useQuery(api.stats.getHealthScore);

    // Animate the score
    const animatedScore = useAnimatedCounter(data?.score || 0, {
        duration: 1200,
        delay: 200,
        easing: "easeOut"
    });

    if (!data) return null;

    const { score, breakdown, trend, avgSleep, workoutsThisWeek, daysActive } = data;

    const getScoreColor = (s: number) => {
        if (s >= 80) return "text-green-500";
        if (s >= 60) return "text-yellow-500";
        if (s >= 40) return "text-orange-500";
        return "text-red-500";
    };

    const getScoreLabel = (s: number) => {
        if (s >= 80) return "Excellent";
        if (s >= 60) return "Good";
        if (s >= 40) return "Fair";
        return "Needs Work";
    };

    const breakdownItems = [
        { label: "Sleep", value: breakdown.sleep, max: 25, icon: Moon, color: "text-indigo-500", bg: "bg-indigo-500" },
        { label: "Exercise", value: breakdown.exercise, max: 25, icon: Dumbbell, color: "text-blue-500", bg: "bg-blue-500" },
        { label: "Consistency", value: breakdown.consistency, max: 25, icon: Calendar, color: "text-green-500", bg: "bg-green-500" },
        { label: "Nutrition", value: breakdown.nutrition, max: 25, icon: Utensils, color: "text-orange-500", bg: "bg-orange-500" },
    ];

    return (
        <div className="bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5 border border-primary/20 rounded-2xl p-6 relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl" />

            <div className="relative">
                {/* Header */}
                <div className="flex items-center gap-2 mb-4">
                    <Sparkles className="w-5 h-5 text-primary" />
                    <h3 className="font-semibold">Health Score</h3>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">AI Powered</span>
                </div>

                {/* Main Score */}
                <div className="flex items-center gap-6 mb-6">
                    <div className="relative">
                        <svg className="w-28 h-28 -rotate-90" viewBox="0 0 100 100">
                            <circle
                                cx="50"
                                cy="50"
                                r="42"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="8"
                                className="text-secondary"
                            />
                            <motion.circle
                                cx="50"
                                cy="50"
                                r="42"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="8"
                                strokeLinecap="round"
                                className={getScoreColor(score)}
                                strokeDasharray={`${score * 2.64} 264`}
                                initial={{ strokeDasharray: "0 264" }}
                                animate={{ strokeDasharray: `${score * 2.64} 264` }}
                                transition={{ duration: 1, ease: "easeOut" }}
                            />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className={`text-3xl font-bold tabular-nums ${getScoreColor(score)}`}>
                                {Math.round(animatedScore)}
                            </span>
                            <span className="text-[10px] text-muted-foreground uppercase tracking-wider">/ 100</span>
                        </div>
                    </div>

                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                            <span className={`text-lg font-semibold ${getScoreColor(score)}`}>{getScoreLabel(score)}</span>
                            {trend === "up" && <TrendingUp className="w-4 h-4 text-green-500" />}
                            {trend === "down" && <TrendingDown className="w-4 h-4 text-red-500" />}
                            {trend === "stable" && <Minus className="w-4 h-4 text-muted-foreground" />}
                        </div>
                        <p className="text-xs text-muted-foreground mb-3">
                            Based on your last 7 days of activity
                        </p>
                        <div className="grid grid-cols-3 gap-2 text-center">
                            <div className="bg-card/50 rounded-lg p-2">
                                <div className="text-lg font-bold">{avgSleep}h</div>
                                <div className="text-[10px] text-muted-foreground">Avg Sleep</div>
                            </div>
                            <div className="bg-card/50 rounded-lg p-2">
                                <div className="text-lg font-bold">{workoutsThisWeek}</div>
                                <div className="text-[10px] text-muted-foreground">Workouts</div>
                            </div>
                            <div className="bg-card/50 rounded-lg p-2">
                                <div className="text-lg font-bold">{daysActive}/7</div>
                                <div className="text-[10px] text-muted-foreground">Days Active</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Breakdown */}
                <div className="grid grid-cols-4 gap-3">
                    {breakdownItems.map((item) => {
                        const Icon = item.icon;
                        const percent = (item.value / item.max) * 100;
                        return (
                            <div key={item.label} className="text-center">
                                <div className={`w-8 h-8 mx-auto mb-1 rounded-lg flex items-center justify-center ${item.bg}/10 ${item.color}`}>
                                    <Icon className="w-4 h-4" />
                                </div>
                                <div className="relative h-1.5 bg-secondary rounded-full overflow-hidden mb-1">
                                    <motion.div
                                        className={`absolute inset-y-0 left-0 rounded-full ${item.bg}`}
                                        initial={{ width: 0 }}
                                        animate={{ width: `${percent}%` }}
                                        transition={{ duration: 0.8, delay: 0.2 }}
                                    />
                                </div>
                                <div className="text-[10px] text-muted-foreground">{item.label}</div>
                                <div className="text-xs font-semibold">{item.value}/{item.max}</div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
