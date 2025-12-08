"use client";

import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { motion } from "framer-motion";
import { Calendar, Dumbbell, Utensils, Moon, Sparkles, Timer, CheckCircle } from "lucide-react";

export default function MonthlySummary() {
    const data = useQuery(api.stats.getMonthlySummary);

    if (!data) return null;

    const monthName = new Date().toLocaleDateString("en-US", { month: "long" });

    const stats = [
        { icon: Dumbbell, label: "Workouts", value: data.totalWorkouts, color: "text-blue-500" },
        { icon: Timer, label: "Exercise Time", value: `${Math.round(data.totalExerciseMinutes / 60)}h`, color: "text-green-500" },
        { icon: Moon, label: "Avg Sleep", value: `${data.avgSleep}h`, color: "text-indigo-500" },
        { icon: Utensils, label: "Meals Logged", value: data.totalMeals, color: "text-orange-500" },
        { icon: CheckCircle, label: "Days Active", value: `${data.daysLogged}/${data.daysInMonth}`, color: "text-primary" },
    ];

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/20 rounded-2xl p-5"
        >
            <div className="flex items-center gap-2 mb-4">
                <Calendar className="w-5 h-5 text-primary" />
                <h3 className="font-semibold">{monthName} Summary</h3>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-4">
                {stats.map((stat, i) => {
                    const Icon = stat.icon;
                    return (
                        <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: i * 0.05 }}
                            className="text-center p-3 bg-card/50 rounded-xl hover:bg-card transition-colors"
                        >
                            <Icon className={`w-5 h-5 mx-auto mb-2 ${stat.color}`} />
                            <div className="text-2xl font-bold">{stat.value}</div>
                            <div className="text-xs text-muted-foreground">{stat.label}</div>
                        </motion.div>
                    );
                })}
            </div>

            {data.highlights.length > 0 && (
                <div className="flex flex-wrap gap-2">
                    {data.highlights.map((highlight, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 + i * 0.05 }}
                            className="flex items-center gap-1 text-sm bg-primary/10 text-primary px-3 py-1.5 rounded-full"
                        >
                            <Sparkles className="w-3 h-3" />
                            {highlight}
                        </motion.div>
                    ))}
                </div>
            )}
        </motion.div>
    );
}
