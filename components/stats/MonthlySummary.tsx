"use client";

import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Calendar, Dumbbell, Utensils, Moon, Sparkles } from "lucide-react";

export default function MonthlySummary() {
    const data = useQuery(api.stats.getMonthlySummary);

    if (!data) return null;

    const monthName = new Date().toLocaleDateString("en-US", { month: "long" });

    return (
        <div className="bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4">
                <Calendar className="w-5 h-5 text-primary" />
                <h3 className="font-semibold">{monthName} Summary</h3>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-4">
                <div className="text-center">
                    <Dumbbell className="w-5 h-5 mx-auto mb-1 text-blue-500" />
                    <div className="text-2xl font-bold">{data.totalWorkouts}</div>
                    <div className="text-xs text-muted-foreground">Workouts</div>
                </div>
                <div className="text-center">
                    <div className="text-2xl font-bold">{Math.round(data.totalExerciseMinutes / 60)}h</div>
                    <div className="text-xs text-muted-foreground">Exercise Time</div>
                </div>
                <div className="text-center">
                    <Moon className="w-5 h-5 mx-auto mb-1 text-indigo-500" />
                    <div className="text-2xl font-bold">{data.avgSleep}h</div>
                    <div className="text-xs text-muted-foreground">Avg Sleep</div>
                </div>
                <div className="text-center">
                    <Utensils className="w-5 h-5 mx-auto mb-1 text-orange-500" />
                    <div className="text-2xl font-bold">{data.totalMeals}</div>
                    <div className="text-xs text-muted-foreground">Meals Logged</div>
                </div>
                <div className="text-center">
                    <div className="text-2xl font-bold">{data.daysLogged}/{data.daysInMonth}</div>
                    <div className="text-xs text-muted-foreground">Days Active</div>
                </div>
            </div>

            {data.highlights.length > 0 && (
                <div className="flex flex-wrap gap-2">
                    {data.highlights.map((highlight, i) => (
                        <div key={i} className="flex items-center gap-1 text-sm bg-primary/10 text-primary px-3 py-1 rounded-full">
                            <Sparkles className="w-3 h-3" />
                            {highlight}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
