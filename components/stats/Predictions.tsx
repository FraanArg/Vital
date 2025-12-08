"use client";

import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { motion } from "framer-motion";
import { Target, TrendingUp, Clock, Dumbbell, Moon } from "lucide-react";

export default function Predictions() {
    const data = useQuery(api.stats.getPredictions);

    if (!data) return null;

    return (
        <div className="bg-card rounded-2xl border border-border/50 p-5">
            <div className="flex items-center gap-2 mb-4">
                <div className="p-2 rounded-xl bg-purple-500/10">
                    <Target className="w-5 h-5 text-purple-500" />
                </div>
                <div>
                    <h3 className="font-semibold">Predictions</h3>
                    <p className="text-xs text-muted-foreground">{data.daysRemaining} days left in the month</p>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                {/* Workout Prediction */}
                <div className={`p-4 rounded-xl border ${data.workouts.onTrack ? "bg-green-500/5 border-green-500/20" : "bg-yellow-500/5 border-yellow-500/20"}`}>
                    <div className="flex items-center gap-2 mb-2">
                        <Dumbbell className="w-4 h-4 text-muted-foreground" />
                        <span className="text-xs font-medium">Monthly Workouts</span>
                    </div>
                    <div className="flex items-end gap-2 mb-2">
                        <span className="text-3xl font-bold">{data.workouts.current}</span>
                        <span className="text-muted-foreground text-sm pb-1">/ {data.workouts.target}</span>
                    </div>
                    <div className="relative h-2 bg-secondary rounded-full overflow-hidden mb-2">
                        <motion.div
                            className={`absolute inset-y-0 left-0 rounded-full ${data.workouts.onTrack ? "bg-green-500" : "bg-yellow-500"}`}
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min(100, (data.workouts.current / data.workouts.target) * 100)}%` }}
                            transition={{ duration: 0.8 }}
                        />
                    </div>
                    <div className="flex items-center gap-1 text-xs">
                        <TrendingUp className="w-3 h-3" />
                        <span className={data.workouts.onTrack ? "text-green-500" : "text-yellow-500"}>
                            Predicted: {data.workouts.predicted} workouts
                        </span>
                    </div>
                </div>

                {/* Sleep Average */}
                <div className={`p-4 rounded-xl border ${data.sleep.onTrack ? "bg-green-500/5 border-green-500/20" : "bg-yellow-500/5 border-yellow-500/20"}`}>
                    <div className="flex items-center gap-2 mb-2">
                        <Moon className="w-4 h-4 text-muted-foreground" />
                        <span className="text-xs font-medium">Sleep Average</span>
                    </div>
                    <div className="flex items-end gap-2 mb-2">
                        <span className="text-3xl font-bold">{data.sleep.current}h</span>
                        <span className="text-muted-foreground text-sm pb-1">/ {data.sleep.target}h</span>
                    </div>
                    <div className="relative h-2 bg-secondary rounded-full overflow-hidden mb-2">
                        <motion.div
                            className={`absolute inset-y-0 left-0 rounded-full ${data.sleep.onTrack ? "bg-green-500" : "bg-yellow-500"}`}
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min(100, (data.sleep.current / data.sleep.target) * 100)}%` }}
                            transition={{ duration: 0.8 }}
                        />
                    </div>
                    <div className="flex items-center gap-1 text-xs">
                        <Clock className="w-3 h-3" />
                        <span className={data.sleep.onTrack ? "text-green-500" : "text-yellow-500"}>
                            {data.sleep.onTrack ? "On track for goal" : "Below target"}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
