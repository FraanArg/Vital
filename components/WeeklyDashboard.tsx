"use client";

import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { startOfWeek, endOfWeek, format, eachDayOfInterval, isSameDay } from "date-fns";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from "recharts";
import ActivityRings from "./stats/ActivityRings";

interface WeeklyDashboardProps {
    selectedDate: Date;
}

export default function WeeklyDashboard({ selectedDate }: WeeklyDashboardProps) {
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

    // Average per day (divide by 7 or actual days passed?)
    // Let's do daily average for the rings context
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

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fade-in">
            {/* Left Column: Weekly Stats (4 cols) */}
            <div className="lg:col-span-4 space-y-6">
                <div className="bg-card rounded-[32px] p-6 shadow-sm border border-border/50">
                    <h3 className="text-xl font-black tracking-tight mb-6">Weekly Averages</h3>
                    <ActivityRings averages={averages} />
                </div>
            </div>

            {/* Right Column: Detailed Charts (8 cols) */}
            <div className="lg:col-span-8 space-y-6">
                <div className="bg-card rounded-[32px] p-6 shadow-sm border border-border/50">
                    <h3 className="text-xl font-black tracking-tight mb-6">Activity Trends</h3>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
                                    label={{ value: 'Hours', angle: -90, position: 'insideLeft', style: { fill: 'var(--muted-foreground)', fontSize: 10 } }}
                                />
                                <YAxis
                                    yAxisId="right"
                                    orientation="right"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                                    label={{ value: 'Minutes', angle: 90, position: 'insideRight', style: { fill: 'var(--muted-foreground)', fontSize: 10 } }}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: "var(--background)",
                                        borderRadius: "16px",
                                        border: "1px solid var(--border)"
                                    }}
                                    cursor={{ fill: "var(--secondary)", opacity: 0.3, radius: 8 }}
                                />
                                <Bar yAxisId="left" dataKey="work" name="Work (h)" fill="#22c55e" radius={[4, 4, 4, 4]} barSize={12} />
                                <Bar yAxisId="left" dataKey="sleep" name="Sleep (h)" fill="#3b82f6" radius={[4, 4, 4, 4]} barSize={12} />
                                <Bar yAxisId="right" dataKey="exercise" name="Exercise (m)" fill="#ef4444" radius={[4, 4, 4, 4]} barSize={12} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
}
