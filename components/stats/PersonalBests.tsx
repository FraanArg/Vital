"use client";

import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Trophy, Flame, Droplets, Moon, Dumbbell } from "lucide-react";

export default function PersonalBests() {
    const data = useQuery(api.stats.getPersonalBests);

    if (!data) return null;

    const bests = [
        { icon: <Flame className="w-5 h-5 text-orange-500" />, label: "Longest Streak", value: `${data.longestStreak} days` },
        { icon: <Dumbbell className="w-5 h-5 text-blue-500" />, label: "Longest Workout", value: `${data.longestWorkout}m` },
        { icon: <Moon className="w-5 h-5 text-indigo-500" />, label: "Best Sleep", value: `${data.bestSleep}h` },
        { icon: <Droplets className="w-5 h-5 text-cyan-500" />, label: "Most Water", value: `${data.mostWater} glasses` },
        { icon: <Trophy className="w-5 h-5 text-yellow-500" />, label: "Total Workouts", value: data.totalWorkouts },
    ].filter(b => b.value !== "0 days" && b.value !== "0m" && b.value !== "0h" && b.value !== "0 glasses" && b.value !== 0);

    if (bests.length === 0) return null;

    return (
        <div className="bg-card rounded-2xl border border-border/50 p-5">
            <h3 className="font-semibold mb-4">Personal Bests 🏆</h3>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {bests.map((best, i) => (
                    <div key={i} className="text-center p-3 bg-gradient-to-br from-yellow-500/5 to-orange-500/5 border border-yellow-500/20 rounded-xl">
                        <div className="flex justify-center mb-2">{best.icon}</div>
                        <div className="text-xl font-bold">{best.value}</div>
                        <div className="text-xs text-muted-foreground">{best.label}</div>
                    </div>
                ))}
            </div>
        </div>
    );
}
