"use client";

import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Clock, Sunrise, Sun, Sunset } from "lucide-react";

export default function TimePatterns() {
    const data = useQuery(api.stats.getTimePatterns, { days: 30 });

    if (!data) return null;

    const formatHour = (hour: number | null) => {
        if (hour === null) return "-";
        const h = hour % 12 || 12;
        const ampm = hour < 12 ? "AM" : "PM";
        return `${h}${ampm}`;
    };

    const getMealIcon = (type: string) => {
        switch (type) {
            case "breakfast": return <Sunrise className="w-5 h-5 text-orange-400" />;
            case "lunch": return <Sun className="w-5 h-5 text-yellow-500" />;
            case "dinner": return <Sunset className="w-5 h-5 text-indigo-400" />;
            default: return <Clock className="w-5 h-5" />;
        }
    };

    return (
        <div className="bg-card rounded-2xl border border-border/50 p-5">
            <h3 className="font-semibold mb-4">Your Schedule</h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {data.avgExerciseHour !== null && (
                    <div className="text-center p-3 bg-secondary/30 rounded-xl">
                        <div className="text-2xl mb-1">💪</div>
                        <div className="text-lg font-bold">{formatHour(data.avgExerciseHour)}</div>
                        <div className="text-xs text-muted-foreground">Avg Workout</div>
                    </div>
                )}

                {data.avgMealHours.breakfast !== null && (
                    <div className="text-center p-3 bg-secondary/30 rounded-xl">
                        {getMealIcon("breakfast")}
                        <div className="text-lg font-bold mt-1">{formatHour(data.avgMealHours.breakfast)}</div>
                        <div className="text-xs text-muted-foreground">Breakfast</div>
                    </div>
                )}

                {data.avgMealHours.lunch !== null && (
                    <div className="text-center p-3 bg-secondary/30 rounded-xl">
                        {getMealIcon("lunch")}
                        <div className="text-lg font-bold mt-1">{formatHour(data.avgMealHours.lunch)}</div>
                        <div className="text-xs text-muted-foreground">Lunch</div>
                    </div>
                )}

                {data.avgMealHours.dinner !== null && (
                    <div className="text-center p-3 bg-secondary/30 rounded-xl">
                        {getMealIcon("dinner")}
                        <div className="text-lg font-bold mt-1">{formatHour(data.avgMealHours.dinner)}</div>
                        <div className="text-xs text-muted-foreground">Dinner</div>
                    </div>
                )}
            </div>
        </div>
    );
}
