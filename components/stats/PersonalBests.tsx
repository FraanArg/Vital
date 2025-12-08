"use client";

import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { motion } from "framer-motion";
import { Trophy, Flame, Droplets, Moon, Dumbbell } from "lucide-react";

export default function PersonalBests() {
    const data = useQuery(api.stats.getPersonalBests);

    if (!data) return null;

    // Convert water from ml to liters for display
    const waterInLiters = data.mostWater > 0 ? (data.mostWater / 1000).toFixed(1) : "0";

    const bests = [
        { icon: Flame, label: "Longest Streak", value: data.longestStreak, unit: "days", color: "text-orange-500", bg: "from-orange-500/10 to-orange-500/5", border: "border-orange-500/20" },
        { icon: Dumbbell, label: "Longest Workout", value: data.longestWorkout, unit: "min", color: "text-blue-500", bg: "from-blue-500/10 to-blue-500/5", border: "border-blue-500/20" },
        { icon: Moon, label: "Best Sleep", value: data.bestSleep, unit: "hrs", color: "text-indigo-500", bg: "from-indigo-500/10 to-indigo-500/5", border: "border-indigo-500/20" },
        { icon: Droplets, label: "Most Water", value: waterInLiters, unit: "L", color: "text-cyan-500", bg: "from-cyan-500/10 to-cyan-500/5", border: "border-cyan-500/20" },
        { icon: Trophy, label: "Total Workouts", value: data.totalWorkouts, unit: "", color: "text-yellow-500", bg: "from-yellow-500/10 to-yellow-500/5", border: "border-yellow-500/20" },
    ].filter(b => b.value !== 0 && b.value !== "0" && b.value !== "0.0");

    if (bests.length === 0) return null;

    return (
        <div className="bg-card rounded-2xl border border-border/50 p-5">
            <div className="flex items-center gap-2 mb-4">
                <Trophy className="w-5 h-5 text-yellow-500" />
                <h3 className="font-semibold">Personal Bests</h3>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {bests.map((best, i) => {
                    const Icon = best.icon;
                    return (
                        <motion.div
                            key={best.label}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                            className={`text-center p-4 bg-gradient-to-br ${best.bg} border ${best.border} rounded-xl hover:scale-105 transition-transform cursor-default`}
                        >
                            <Icon className={`w-5 h-5 mx-auto mb-2 ${best.color}`} />
                            <div className="text-2xl font-bold">
                                {best.value}
                                <span className="text-sm font-normal text-muted-foreground ml-0.5">{best.unit}</span>
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">{best.label}</div>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
}
