"use client";

import { format, eachDayOfInterval, subDays, isSameDay, parseISO } from "date-fns";
import { Doc } from "../../convex/_generated/dataModel";

interface ConsistencyGridProps {
    logs: Doc<"logs">[];
}

export default function ConsistencyGrid({ logs }: ConsistencyGridProps) {
    // Generate last 90 days
    const today = new Date();
    const days = eachDayOfInterval({
        start: subDays(today, 89), // Approx 3 months
        end: today
    });

    const getIntensity = (date: Date) => {
        const log = logs.find(l => isSameDay(parseISO(l.date), date));
        if (!log) return 0;

        // Simple heuristic for intensity based on number of logged fields
        let score = 0;
        if (log.work) score++;
        if (log.sleep) score++;
        if (log.water) score++;
        if (log.exercise) score++;
        if (log.mood) score++;

        return Math.min(score, 4); // Max intensity 4
    };

    const intensityColors = {
        0: "bg-secondary/30",
        1: "bg-emerald-500/30",
        2: "bg-emerald-500/50",
        3: "bg-emerald-500/70",
        4: "bg-emerald-500"
    };

    return (
        <div className="w-full bg-card rounded-3xl p-6 shadow-sm border border-border/50">
            <h3 className="text-lg font-semibold mb-4">Consistency</h3>

            <div className="flex flex-wrap gap-1.5 justify-center sm:justify-start">
                {days.map((day) => {
                    const intensity = getIntensity(day);
                    return (
                        <div
                            key={day.toISOString()}
                            className={`w-3 h-3 sm:w-4 sm:h-4 rounded-sm sm:rounded-md transition-all hover:scale-125 ${intensityColors[intensity as keyof typeof intensityColors]}`}
                            title={`${format(day, "MMM d")}: ${intensity > 0 ? "Active" : "No activity"}`}
                        />
                    );
                })}
            </div>

            <div className="flex items-center justify-end gap-2 mt-4 text-xs text-muted-foreground">
                <span>Less</span>
                <div className="flex gap-1">
                    <div className="w-3 h-3 rounded-sm bg-secondary/30" />
                    <div className="w-3 h-3 rounded-sm bg-emerald-500/30" />
                    <div className="w-3 h-3 rounded-sm bg-emerald-500/70" />
                    <div className="w-3 h-3 rounded-sm bg-emerald-500" />
                </div>
                <span>More</span>
            </div>
        </div>
    );
}
