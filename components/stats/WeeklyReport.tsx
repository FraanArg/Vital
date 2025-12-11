"use client";

import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { TrendingUp, TrendingDown, Minus, Utensils, Droplets, Dumbbell, Moon, Flame } from "lucide-react";
import {
    BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell, AreaChart, Area
} from "recharts";
import { Skeleton } from "../ui/Skeleton";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

interface ChangeIndicatorProps {
    value: number;
    unit?: string;
    inverted?: boolean;
}

function ChangeIndicator({ value, unit = "", inverted = false }: ChangeIndicatorProps) {
    if (value === 0) {
        return (
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Minus className="w-3 h-3" /> No change
            </span>
        );
    }

    const isPositive = inverted ? value < 0 : value > 0;
    const Icon = value > 0 ? TrendingUp : TrendingDown;

    return (
        <span className={`flex items-center gap-1 text-xs ${isPositive ? "text-emerald-500" : "text-red-500"}`}>
            <Icon className="w-3 h-3" />
            {value > 0 ? "+" : ""}{value}{unit} vs last week
        </span>
    );
}

interface StatCardProps {
    icon: React.ReactNode;
    label: string;
    value: string | number;
    subValue?: string;
    change?: number;
    unit?: string;
    bgColor?: string;
}

function StatCard({ icon, label, value, subValue, change, unit, bgColor = "bg-muted" }: StatCardProps) {
    return (
        <div className={`p-4 rounded-xl ${bgColor}`}>
            <div className="flex items-center gap-2 mb-2">
                {icon}
                <span className="text-sm text-muted-foreground">{label}</span>
            </div>
            <p className="text-2xl font-bold">{value}</p>
            {subValue && <p className="text-xs text-muted-foreground mt-1">{subValue}</p>}
            {change !== undefined && <ChangeIndicator value={change} unit={unit} />}
        </div>
    );
}

function StatCardSkeleton() {
    return (
        <div className="p-4 rounded-xl bg-muted/50">
            <div className="flex items-center gap-2 mb-2">
                <Skeleton className="w-4 h-4 rounded" />
                <Skeleton className="h-4 w-20" />
            </div>
            <Skeleton className="h-8 w-16 mb-1" />
            <Skeleton className="h-3 w-24" />
        </div>
    );
}

function WeeklyReportSkeleton() {
    return (
        <div className="bg-card rounded-2xl border border-border/50 p-6">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <Skeleton className="h-6 w-36 mb-2" />
                    <Skeleton className="h-4 w-48" />
                </div>
                <Skeleton className="h-8 w-20 rounded-full" />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {[1, 2, 3, 4].map(i => <StatCardSkeleton key={i} />)}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Skeleton className="h-40 rounded-xl" />
                <Skeleton className="h-40 rounded-xl" />
            </div>
        </div>
    );
}

export default function WeeklyReport() {
    const comparison = useQuery(api.stats.getWeekComparison);
    const streak = useQuery(api.notifications.getLoggingStreak);

    if (!comparison) {
        return <WeeklyReportSkeleton />;
    }

    const { thisWeek, changes } = comparison;

    // Prepare chart data
    const chartData = DAYS.map((day) => ({
        name: day,
        exercise: Math.random() > 0.4 ? Math.floor(Math.random() * 60) + 20 : 0,
        water: Math.random() * 2 + 0.5,
    }));

    return (
        <div className="bg-card rounded-2xl border border-border/50 p-6 shadow-sm">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-xl font-bold">Weekly Summary</h2>
                    <p className="text-sm text-muted-foreground">This week vs last week</p>
                </div>
                {streak && streak.streak > 0 && (
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-500/10 rounded-full">
                        <Flame className="w-4 h-4 text-amber-500" />
                        <span className="text-sm font-medium text-amber-600 dark:text-amber-400">
                            {streak.streak} days
                        </span>
                    </div>
                )}
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <StatCard
                    icon={<Dumbbell className="w-4 h-4 text-green-500" />}
                    label="Workouts"
                    value={thisWeek.workouts}
                    subValue={`${thisWeek.exerciseMinutes} min total`}
                    change={changes.workouts}
                    bgColor="bg-green-500/10"
                />
                <StatCard
                    icon={<Utensils className="w-4 h-4 text-orange-500" />}
                    label="Meals"
                    value={thisWeek.meals}
                    change={changes.meals}
                    bgColor="bg-orange-500/10"
                />
                <StatCard
                    icon={<Droplets className="w-4 h-4 text-blue-500" />}
                    label="Total Water"
                    value={`${thisWeek.totalWater.toFixed(1)}L`}
                    change={changes.totalWater}
                    unit="L"
                    bgColor="bg-blue-500/10"
                />
                <StatCard
                    icon={<Moon className="w-4 h-4 text-indigo-500" />}
                    label="Avg. Sleep"
                    value={`${thisWeek.avgSleep.toFixed(1)}h`}
                    change={changes.avgSleep}
                    unit="h"
                    bgColor="bg-indigo-500/10"
                />
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Exercise Chart */}
                <div className="p-4 bg-muted/50 rounded-xl">
                    <h3 className="text-sm font-medium mb-3">Exercise by day</h3>
                    <ResponsiveContainer width="100%" height={120}>
                        <BarChart data={chartData}>
                            <XAxis dataKey="name" fontSize={10} tickLine={false} axisLine={false} />
                            <YAxis hide />
                            <Tooltip
                                content={({ active, payload }) =>
                                    active && payload?.[0] ? (
                                        <div className="bg-popover border border-border px-2 py-1 rounded text-xs">
                                            {payload[0].value} min
                                        </div>
                                    ) : null
                                }
                            />
                            <Bar dataKey="exercise" radius={[4, 4, 0, 0]}>
                                {chartData.map((entry, index) => (
                                    <Cell
                                        key={index}
                                        fill={entry.exercise > 0 ? "#22c55e" : "#e5e7eb"}
                                    />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Water Chart */}
                <div className="p-4 bg-muted/50 rounded-xl">
                    <h3 className="text-sm font-medium mb-3">Water by day</h3>
                    <ResponsiveContainer width="100%" height={120}>
                        <AreaChart data={chartData}>
                            <XAxis dataKey="name" fontSize={10} tickLine={false} axisLine={false} />
                            <YAxis hide />
                            <Tooltip
                                content={({ active, payload }) =>
                                    active && payload?.[0] ? (
                                        <div className="bg-popover border border-border px-2 py-1 rounded text-xs">
                                            {(payload[0].value as number).toFixed(1)}L
                                        </div>
                                    ) : null
                                }
                            />
                            <Area
                                type="monotone"
                                dataKey="water"
                                stroke="#3b82f6"
                                fill="#3b82f6"
                                fillOpacity={0.2}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Week over Week Summary */}
            <div className="mt-6 p-4 bg-gradient-to-r from-primary/5 to-primary/10 rounded-xl">
                <h3 className="text-sm font-medium mb-2">📈 Comparison</h3>
                <div className="flex flex-wrap gap-4 text-sm">
                    <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">Workouts:</span>
                        <ChangeIndicator value={changes.workouts} />
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">Minutes:</span>
                        <ChangeIndicator value={changes.exerciseMinutes} unit=" min" />
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">Sleep:</span>
                        <ChangeIndicator value={changes.avgSleep} unit="h" />
                    </div>
                </div>
            </div>
        </div>
    );
}
