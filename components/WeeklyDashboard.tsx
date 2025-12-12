"use client";

import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { startOfWeek, endOfWeek, format, eachDayOfInterval, isSameDay } from "date-fns";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from "recharts";
import ActivityRings from "./stats/ActivityRings";
import TodaySummary from "./TodaySummary";
import { Skeleton } from "./ui/Skeleton";

interface WeeklyDashboardProps {
    selectedDate: Date;
    onTrackerSelect?: (trackerId: string) => void;
}

export default function WeeklyDashboard({ selectedDate, onTrackerSelect }: WeeklyDashboardProps) {
    const start = startOfWeek(selectedDate, { weekStartsOn: 1 });
    const end = endOfWeek(selectedDate, { weekStartsOn: 1 });

    const logs = useQuery(api.logs.getStats, {
        from: start.toISOString(),
        to: end.toISOString(),
    });

    // Calculate weekly totals for rings
    const totals = logs?.reduce((acc, log) => ({
        work: acc.work + (log.work || 0),
        sleep: acc.sleep + (log.sleep || 0),
        exercise: acc.exercise + (log.exercise?.duration || 0),
    }), { work: 0, sleep: 0, exercise: 0 }) || { work: 0, sleep: 0, exercise: 0 };

    // Average per day
    const averages = {
        work: totals.work / 7,
        sleep: totals.sleep / 7,
        exercise: totals.exercise / 7
    };

    const days = eachDayOfInterval({ start, end });
    const chartData = days.map(day => {
        const dayLogs = logs?.filter(l => isSameDay(new Date(l.date), day)) || [];

        const dayTotals = dayLogs.reduce((acc, log) => ({
            work: acc.work + (log.work || 0),
            sleep: acc.sleep + (log.sleep || 0),
            exercise: acc.exercise + (log.exercise?.duration || 0),
            water: acc.water + (log.water || 0),
        }), { work: 0, sleep: 0, exercise: 0, water: 0 });

        return {
            day: format(day, "EEE"),
            work: dayTotals.work,
            sleep: dayTotals.sleep,
            exercise: dayTotals.exercise,
            water: dayTotals.water,
        };
    });

    if (!logs) {
        return (
            <div className="space-y-6">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[1, 2, 3, 4].map((i) => (
                        <Skeleton key={i} className="h-24 rounded-2xl" />
                    ))}
                </div>
                <Skeleton className="h-[300px] rounded-2xl" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Today's Progress - Quick Access */}
            <section aria-label="Today's progress">
                <h3 className="text-xs font-semibold uppercase tracking-wider mb-3 text-muted-foreground">
                    Today
                </h3>
                <TodaySummary selectedDate={new Date()} onQuickAdd={onTrackerSelect} />
            </section>

            {/* Weekly Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left Column: Weekly Averages */}
                <div className="lg:col-span-4">
                    <div className="bg-card rounded-2xl p-6 shadow-sm border border-border/50">
                        <h3 className="text-lg font-semibold mb-4">Weekly Averages</h3>
                        <ActivityRings averages={averages} />
                    </div>
                </div>

                {/* Right Column: Activity Trends Chart */}
                <div className="lg:col-span-8">
                    <div className="bg-card rounded-2xl p-6 shadow-sm border border-border/50">
                        <h3 className="text-lg font-semibold mb-4">Activity Trends</h3>
                        <div className="h-[280px] w-full" aria-label="Weekly activity chart">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                    data={chartData}
                                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                                    role="img"
                                    aria-label="Bar chart showing weekly work, sleep, and exercise trends"
                                >
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.3} />
                                    <XAxis
                                        dataKey="day"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                                        dy={10}
                                    />
                                    <YAxis
                                        yAxisId="left"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                                        width={35}
                                    />
                                    <YAxis
                                        yAxisId="right"
                                        orientation="right"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                                        width={35}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: "var(--background)",
                                            borderRadius: "12px",
                                            border: "1px solid var(--border)",
                                            padding: "8px 12px",
                                        }}
                                        cursor={{ fill: "var(--secondary)", opacity: 0.3, radius: 8 }}
                                    />
                                    <Bar yAxisId="left" dataKey="work" name="Work (h)" fill="#22c55e" radius={[4, 4, 4, 4]} barSize={14} />
                                    <Bar yAxisId="left" dataKey="sleep" name="Sleep (h)" fill="#6366f1" radius={[4, 4, 4, 4]} barSize={14} />
                                    <Bar yAxisId="right" dataKey="exercise" name="Exercise (m)" fill="#f97316" radius={[4, 4, 4, 4]} barSize={14} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                        {/* Chart Legend */}
                        <div className="flex items-center justify-center gap-6 mt-4 text-xs">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded bg-green-500" />
                                <span className="text-muted-foreground">Work</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded bg-indigo-500" />
                                <span className="text-muted-foreground">Sleep</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded bg-orange-500" />
                                <span className="text-muted-foreground">Exercise</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
