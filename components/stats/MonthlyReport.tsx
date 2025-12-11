"use client";

import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Calendar, Dumbbell, Utensils, Moon, Trophy, Sparkles } from "lucide-react";
import {
    PieChart, Pie, Cell, ResponsiveContainer
} from "recharts";
import { Skeleton } from "../ui/Skeleton";

const COLORS = ["#22c55e", "#3b82f6", "#f59e0b", "#8b5cf6", "#ec4899"];

function MonthlyReportSkeleton() {
    return (
        <div className="bg-card rounded-2xl border border-border/50 p-6">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <Skeleton className="h-6 w-36 mb-2" />
                    <Skeleton className="h-4 w-32" />
                </div>
                <Skeleton className="h-8 w-24 rounded-full" />
            </div>
            <Skeleton className="h-20 rounded-xl mb-6" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {[1, 2, 3, 4].map(i => (
                    <div key={i} className="p-4 rounded-xl bg-muted/50">
                        <Skeleton className="h-4 w-16 mb-2" />
                        <Skeleton className="h-8 w-12 mb-1" />
                        <Skeleton className="h-3 w-20" />
                    </div>
                ))}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Skeleton className="h-40 rounded-xl" />
                <Skeleton className="h-40 rounded-xl" />
            </div>
        </div>
    );
}

export default function MonthlyReport() {
    const summary = useQuery(api.stats.getMonthlySummary);
    const exerciseBreakdown = useQuery(api.stats.getExerciseBreakdown, { days: 30 });
    const achievements = useQuery(api.stats.getAchievements);

    if (!summary) {
        return <MonthlyReportSkeleton />;
    }

    const consistencyPercent = Math.round((summary.daysLogged / summary.daysInMonth) * 100);

    // Prepare exercise type pie data
    const exerciseTypes = exerciseBreakdown?.types || [];
    const pieData = exerciseTypes.slice(0, 5).map((t, i) => ({
        name: t.name,
        value: t.count,
        fill: COLORS[i % COLORS.length],
    }));

    return (
        <div className="bg-card rounded-2xl border border-border/50 p-6 shadow-sm">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-xl font-bold">Monthly Summary</h2>
                    <p className="text-sm text-muted-foreground">
                        {new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                    </p>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-full">
                    <Calendar className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium">
                        {summary.daysLogged}/{summary.daysInMonth} days
                    </span>
                </div>
            </div>

            {/* Consistency Score */}
            <div className="mb-6 p-4 rounded-xl bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                        Logging Consistency
                    </span>
                    <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                        {consistencyPercent}%
                    </span>
                </div>
                <div className="h-3 bg-emerald-500/20 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-500"
                        style={{ width: `${consistencyPercent}%` }}
                    />
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="p-4 rounded-xl bg-green-500/10">
                    <div className="flex items-center gap-2 mb-1">
                        <Dumbbell className="w-4 h-4 text-green-500" />
                        <span className="text-xs text-muted-foreground">Workouts</span>
                    </div>
                    <p className="text-2xl font-bold">{summary.totalWorkouts}</p>
                    <p className="text-xs text-muted-foreground">{summary.totalExerciseMinutes} min</p>
                </div>

                <div className="p-4 rounded-xl bg-orange-500/10">
                    <div className="flex items-center gap-2 mb-1">
                        <Utensils className="w-4 h-4 text-orange-500" />
                        <span className="text-xs text-muted-foreground">Meals</span>
                    </div>
                    <p className="text-2xl font-bold">{summary.totalMeals}</p>
                    <p className="text-xs text-muted-foreground">
                        ~{Math.round(summary.totalMeals / summary.daysLogged || 0)}/day
                    </p>
                </div>

                <div className="p-4 rounded-xl bg-indigo-500/10">
                    <div className="flex items-center gap-2 mb-1">
                        <Moon className="w-4 h-4 text-indigo-500" />
                        <span className="text-xs text-muted-foreground">Avg. Sleep</span>
                    </div>
                    <p className="text-2xl font-bold">{summary.avgSleep}h</p>
                    <p className="text-xs text-muted-foreground">
                        {summary.avgSleep >= 7 ? "✓ Optimal" : "Can improve"}
                    </p>
                </div>

                <div className="p-4 rounded-xl bg-purple-500/10">
                    <div className="flex items-center gap-2 mb-1">
                        <Trophy className="w-4 h-4 text-purple-500" />
                        <span className="text-xs text-muted-foreground">Achievements</span>
                    </div>
                    <p className="text-2xl font-bold">{achievements?.length || 0}</p>
                    <p className="text-xs text-muted-foreground">unlocked</p>
                </div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Exercise Types Pie */}
                {pieData.length > 0 && (
                    <div className="p-4 bg-muted/50 rounded-xl">
                        <h3 className="text-sm font-medium mb-3">Exercise types</h3>
                        <div className="flex items-center">
                            <ResponsiveContainer width="50%" height={120}>
                                <PieChart>
                                    <Pie
                                        data={pieData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={30}
                                        outerRadius={50}
                                        paddingAngle={2}
                                        dataKey="value"
                                    >
                                        {pieData.map((entry, index) => (
                                            <Cell key={index} fill={entry.fill} />
                                        ))}
                                    </Pie>
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="flex-1 space-y-1">
                                {pieData.map((item, i) => (
                                    <div key={i} className="flex items-center gap-2 text-xs">
                                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.fill }} />
                                        <span className="truncate">{item.name}</span>
                                        <span className="text-muted-foreground ml-auto">{item.value}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Intensity distribution */}
                {exerciseBreakdown?.intensities && (
                    <div className="p-4 bg-muted/50 rounded-xl">
                        <h3 className="text-sm font-medium mb-3">Intensity distribution</h3>
                        <div className="space-y-3">
                            {[
                                { key: "low", label: "Low", color: "bg-green-400" },
                                { key: "mid", label: "Medium", color: "bg-yellow-400" },
                                { key: "high", label: "High", color: "bg-red-400" },
                            ].map(({ key, label, color }) => {
                                const value = exerciseBreakdown.intensities[key as keyof typeof exerciseBreakdown.intensities] || 0;
                                const total = Object.values(exerciseBreakdown.intensities).reduce((a, b) => a + b, 0) || 1;
                                const percent = Math.round((value / total) * 100);
                                return (
                                    <div key={key} className="space-y-1">
                                        <div className="flex justify-between text-xs">
                                            <span>{label}</span>
                                            <span className="text-muted-foreground">{value} ({percent}%)</span>
                                        </div>
                                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                                            <div className={`h-full ${color} rounded-full`} style={{ width: `${percent}%` }} />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>

            {/* Highlights */}
            {summary.highlights && summary.highlights.length > 0 && (
                <div className="p-4 bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 rounded-xl">
                    <div className="flex items-center gap-2 mb-2">
                        <Sparkles className="w-4 h-4 text-amber-500" />
                        <h3 className="text-sm font-medium">Monthly highlights</h3>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {summary.highlights.map((h, i) => (
                            <span key={i} className="px-3 py-1 bg-background rounded-full text-sm">
                                {h}
                            </span>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
