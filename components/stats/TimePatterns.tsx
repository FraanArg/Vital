"use client";

import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { motion } from "framer-motion";
import { Clock, Sunrise, Sun, Sunset, Dumbbell } from "lucide-react";

export default function TimePatterns() {
    const data = useQuery(api.stats.getTimePatterns, { days: 30 });

    if (!data) return null;

    const formatHour = (hour: number | null) => {
        if (hour === null) return "-";
        const h = hour % 12 || 12;
        const ampm = hour < 12 ? "AM" : "PM";
        return `${h}${ampm}`;
    };

    const patterns = [
        ...(data.avgExerciseHour !== null ? [{
            icon: Dumbbell, label: "Workout", value: formatHour(data.avgExerciseHour),
            color: "text-red-500", bg: "from-red-500/10 to-red-500/5", border: "border-red-500/20"
        }] : []),
        ...(data.avgMealHours.breakfast !== null ? [{
            icon: Sunrise, label: "Breakfast", value: formatHour(data.avgMealHours.breakfast),
            color: "text-orange-500", bg: "from-orange-500/10 to-orange-500/5", border: "border-orange-500/20"
        }] : []),
        ...(data.avgMealHours.lunch !== null ? [{
            icon: Sun, label: "Lunch", value: formatHour(data.avgMealHours.lunch),
            color: "text-yellow-500", bg: "from-yellow-500/10 to-yellow-500/5", border: "border-yellow-500/20"
        }] : []),
        ...(data.avgMealHours.dinner !== null ? [{
            icon: Sunset, label: "Dinner", value: formatHour(data.avgMealHours.dinner),
            color: "text-indigo-500", bg: "from-indigo-500/10 to-indigo-500/5", border: "border-indigo-500/20"
        }] : []),
    ];

    if (patterns.length === 0) return null;

    return (
        <div className="bg-card rounded-2xl border border-border/50 p-5">
            <div className="flex items-center gap-2 mb-4">
                <Clock className="w-5 h-5 text-primary" />
                <h3 className="font-semibold">Your Schedule</h3>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {patterns.map((pattern, i) => {
                    const Icon = pattern.icon;
                    return (
                        <motion.div
                            key={pattern.label}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                            className={`text-center p-4 bg-gradient-to-br ${pattern.bg} border ${pattern.border} rounded-xl hover:scale-105 transition-transform`}
                        >
                            <Icon className={`w-5 h-5 mx-auto mb-2 ${pattern.color}`} />
                            <div className="text-xl font-bold">{pattern.value}</div>
                            <div className="text-xs text-muted-foreground">{pattern.label}</div>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
}
