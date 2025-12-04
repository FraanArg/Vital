"use client";

import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { startOfWeek, endOfWeek, format, eachDayOfInterval, isSameDay } from "date-fns";
import { BarChart, Bar, XAxis, ResponsiveContainer, Cell } from "recharts";

interface WeeklyOverviewProps {
    selectedDate: Date;
}

export default function WeeklyOverview({ selectedDate }: WeeklyOverviewProps) {
    const start = startOfWeek(selectedDate, { weekStartsOn: 1 }); // Monday start
    const end = endOfWeek(selectedDate, { weekStartsOn: 1 });

    const logs = useQuery(api.logs.getStats, {
        from: start.toISOString(),
        to: end.toISOString(),
    });

    const days = eachDayOfInterval({ start, end });

    // Calculate weekly completion
    const data = days.map(day => {
        const dayLog = logs?.find(l => isSameDay(new Date(l.date), day));

        // Simple score calculation (0-100)
        let score = 0;
        if (dayLog) {
            if (dayLog.exercise) score += 33;
            if ((dayLog.water || 0) >= 2) score += 33;
            if ((dayLog.sleep || 0) >= 7) score += 34;
        }

        return {
            day: format(day, "EEE"),
            score: Math.min(100, score),
            isToday: isSameDay(day, new Date()),
            isSelected: isSameDay(day, selectedDate)
        };
    });

    const averageScore = Math.round(data.reduce((acc, d) => acc + d.score, 0) / 7);

    return (
        <div className="bg-card rounded-[32px] p-6 shadow-sm border border-border/50">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-xl font-black tracking-tight">Weekly Overview</h3>
                    <p className="text-sm text-muted-foreground">
                        {format(start, "MMM d")} - {format(end, "MMM d")}
                    </p>
                </div>
                <div className="flex flex-col items-end">
                    <span className="text-3xl font-thin">{averageScore}%</span>
                    <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Avg Score</span>
                </div>
            </div>

            <div className="h-[180px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                        <XAxis
                            dataKey="day"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                            dy={10}
                        />
                        <Bar dataKey="score" radius={[6, 6, 6, 6]} barSize={32}>
                            {data.map((entry, index) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={entry.isToday ? "var(--primary)" : "var(--secondary)"}
                                    className="transition-all duration-300 hover:opacity-80"
                                />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
