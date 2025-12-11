"use client";

import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { motion } from "framer-motion";
import { Dumbbell, Timer, Activity, Plus } from "lucide-react";
import { Skeleton } from "../ui/Skeleton";
import Link from "next/link";

interface ExerciseBreakdownProps {
    days?: number;
}

export default function ExerciseBreakdown({ days = 30 }: ExerciseBreakdownProps) {
    const data = useQuery(api.stats.getExerciseBreakdown, { days });

    // Loading state
    if (data === undefined) {
        return (
            <div className="bg-card rounded-2xl border border-border/50 p-5">
                <div className="flex items-center gap-2 mb-4">
                    <Skeleton className="w-5 h-5 rounded" />
                    <Skeleton className="h-5 w-36" />
                </div>
                <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-3">
                        {[1, 2, 3].map(i => <Skeleton key={i} className="h-10 rounded" />)}
                    </div>
                    <div className="space-y-3">
                        {[1, 2, 3].map(i => <Skeleton key={i} className="h-10 rounded" />)}
                    </div>
                </div>
            </div>
        );
    }

    // Empty state - no workouts
    if (!data || data.totalWorkouts === 0) {
        return (
            <div className="bg-card rounded-2xl border border-border/50 p-5">
                <div className="flex items-center gap-2 mb-4">
                    <Dumbbell className="w-5 h-5 text-blue-500" />
                    <h3 className="font-semibold">Exercise Breakdown</h3>
                </div>
                <div className="text-center py-8">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-blue-500/10 flex items-center justify-center">
                        <Dumbbell className="w-8 h-8 text-blue-500/50" />
                    </div>
                    <p className="text-muted-foreground mb-2">No workouts logged yet</p>
                    <p className="text-sm text-muted-foreground/70 mb-4">
                        Start tracking to see your exercise breakdown
                    </p>
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                    >
                        <Plus className="w-4 h-4" />
                        Log your first workout
                    </Link>
                </div>
            </div>
        );
    }

    const totalIntensity = data.intensities.low + data.intensities.mid + data.intensities.high;

    const intensityData = [
        { label: "Low", count: data.intensities.low, color: "bg-green-500", emoji: "🟢" },
        { label: "Medium", count: data.intensities.mid, color: "bg-yellow-500", emoji: "🟡" },
        { label: "High", count: data.intensities.high, color: "bg-red-500", emoji: "🔴" },
    ];

    return (
        <div className="bg-card rounded-2xl border border-border/50 p-5">
            <div className="flex items-center gap-2 mb-4">
                <Dumbbell className="w-5 h-5 text-blue-500" />
                <h3 className="font-semibold">Exercise Breakdown</h3>
                <span className="text-xs text-muted-foreground ml-auto">{data.totalWorkouts} workouts</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Workout Types */}
                <div>
                    <h4 className="text-sm text-muted-foreground mb-3 flex items-center gap-2">
                        <Activity className="w-4 h-4" /> Workout Types
                    </h4>
                    <div className="space-y-3">
                        {data.types.slice(0, 5).map((type, i) => (
                            <motion.div
                                key={type.name}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.05 }}
                            >
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="capitalize font-medium">{type.name}</span>
                                    <span className="text-muted-foreground">{type.count}</span>
                                </div>
                                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                                    <motion.div
                                        className="h-full bg-gradient-to-r from-blue-500 to-primary rounded-full"
                                        initial={{ width: 0 }}
                                        animate={{ width: `${(type.count / data.totalWorkouts) * 100}%` }}
                                        transition={{ duration: 0.6, delay: i * 0.05 }}
                                    />
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Intensity Distribution */}
                <div>
                    <h4 className="text-sm text-muted-foreground mb-3 flex items-center gap-2">
                        <Timer className="w-4 h-4" /> Intensity Mix
                    </h4>
                    <div className="space-y-3">
                        {intensityData.map((intensity, i) => (
                            <motion.div
                                key={intensity.label}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.05 }}
                                className="flex items-center gap-3"
                            >
                                <span className="text-lg w-6">{intensity.emoji}</span>
                                <span className="text-sm flex-1">{intensity.label}</span>
                                <div className="w-20 h-2 bg-secondary rounded-full overflow-hidden">
                                    <motion.div
                                        className={`h-full ${intensity.color} rounded-full`}
                                        initial={{ width: 0 }}
                                        animate={{ width: `${totalIntensity > 0 ? (intensity.count / totalIntensity) * 100 : 0}%` }}
                                        transition={{ duration: 0.6, delay: i * 0.05 }}
                                    />
                                </div>
                                <span className="font-medium text-sm w-10 text-right">
                                    {totalIntensity > 0 ? Math.round((intensity.count / totalIntensity) * 100) : 0}%
                                </span>
                            </motion.div>
                        ))}
                    </div>

                    <div className="mt-4 pt-4 border-t border-border/50 grid grid-cols-2 gap-3 text-center">
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="p-3 bg-gradient-to-br from-blue-500/10 to-blue-500/5 border border-blue-500/20 rounded-xl"
                        >
                            <div className="text-2xl font-bold">{data.totalWorkouts}</div>
                            <div className="text-xs text-muted-foreground">Total</div>
                        </motion.div>
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.05 }}
                            className="p-3 bg-gradient-to-br from-green-500/10 to-green-500/5 border border-green-500/20 rounded-xl"
                        >
                            <div className="text-2xl font-bold">{data.avgDuration}m</div>
                            <div className="text-xs text-muted-foreground">Avg Duration</div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    );
}
