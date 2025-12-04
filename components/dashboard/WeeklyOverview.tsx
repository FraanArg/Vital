"use client";

import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { startOfWeek, endOfWeek, eachDayOfInterval, format, isSameDay } from "date-fns";
import { motion } from "framer-motion";

interface WeeklyOverviewProps {
    selectedDate: Date;
    onDateSelect: (date: Date) => void;
}

export default function WeeklyOverview({ selectedDate, onDateSelect }: WeeklyOverviewProps) {
    const start = startOfWeek(selectedDate, { weekStartsOn: 1 });
    const end = endOfWeek(selectedDate, { weekStartsOn: 1 });

    const logs = useQuery(api.logs.getStats, {
        from: start.toISOString(),
        to: end.toISOString()
    });

    const days = eachDayOfInterval({ start, end });

    // Helper to get completion status for a day
    const getDayStatus = (date: Date) => {
        if (!logs) return { score: 0, color: "bg-secondary" };

        const dayLogs = logs.filter(l => isSameDay(new Date(l.date), date));
        if (dayLogs.length === 0) return { score: 0, color: "bg-secondary" };

        // Simple scoring based on goals met (similar to DailyProgress)
        const waterGoal = 2.0;
        const sleepGoal = 7.0;
        const workoutGoal = 1;

        const water = dayLogs.reduce((acc, l) => acc + (l.water || 0), 0);
        const sleep = dayLogs.reduce((acc, l) => acc + (l.sleep || 0), 0);
        const workout = dayLogs.some(l => l.exercise);

        let goalsMet = 0;
        if (water >= waterGoal) goalsMet++;
        if (sleep >= sleepGoal) goalsMet++;
        if (workout) goalsMet++;

        const score = goalsMet / 3;

        let color = "bg-secondary";
        if (score === 1) color = "bg-green-500";
        else if (score > 0.6) color = "bg-yellow-500";
        else if (score > 0) color = "bg-orange-500";

        return { score, color };
    };

    return (
        <div className="bg-card rounded-3xl p-6 shadow-sm border border-border/50">
            <h3 className="text-lg font-semibold mb-4">Weekly Overview</h3>
            <div className="grid grid-cols-7 gap-2">
                {days.map((day) => {
                    const status = getDayStatus(day);
                    const isSelected = isSameDay(day, selectedDate);
                    const isToday = isSameDay(day, new Date());

                    return (
                        <button
                            key={day.toString()}
                            onClick={() => onDateSelect(day)}
                            className={`flex flex-col items-center gap-2 p-2 rounded-xl transition-all ${isSelected ? "bg-primary/10 ring-2 ring-primary" : "hover:bg-secondary/50"
                                }`}
                        >
                            <span className="text-xs text-muted-foreground font-medium">
                                {format(day, "EEE")}
                            </span>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${isToday ? "bg-primary text-primary-foreground" : "bg-secondary"
                                }`}>
                                {format(day, "d")}
                            </div>
                            <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden">
                                <motion.div
                                    className={`h-full ${status.color}`}
                                    initial={{ width: 0 }}
                                    animate={{ width: `${status.score * 100}%` }}
                                />
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
