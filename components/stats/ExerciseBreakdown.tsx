"use client";

import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Dumbbell, Flame, Timer, Activity } from "lucide-react";

export default function ExerciseBreakdown() {
    const data = useQuery(api.stats.getExerciseBreakdown, { days: 30 });

    if (!data) return null;

    const totalIntensity = data.intensities.low + data.intensities.mid + data.intensities.high;

    return (
        <div className="bg-card rounded-2xl border border-border/50 p-5">
            <h3 className="font-semibold mb-4">Exercise Breakdown</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Workout Types */}
                <div>
                    <h4 className="text-sm text-muted-foreground mb-3">Workout Types</h4>
                    <div className="space-y-2">
                        {data.types.slice(0, 5).map((type) => (
                            <div key={type.name} className="flex items-center gap-2">
                                <div className="flex-1">
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="capitalize">{type.name}</span>
                                        <span className="text-muted-foreground">{type.count}</span>
                                    </div>
                                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-primary rounded-full"
                                            style={{ width: `${(type.count / data.totalWorkouts) * 100}%` }}
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Intensity Distribution */}
                <div>
                    <h4 className="text-sm text-muted-foreground mb-3">Intensity Mix</h4>
                    <div className="space-y-3">
                        <div className="flex items-center gap-3">
                            <span className="text-lg">🟢</span>
                            <span className="text-sm flex-1">Low</span>
                            <span className="font-medium">{Math.round((data.intensities.low / totalIntensity) * 100)}%</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="text-lg">🟡</span>
                            <span className="text-sm flex-1">Medium</span>
                            <span className="font-medium">{Math.round((data.intensities.mid / totalIntensity) * 100)}%</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="text-lg">🔴</span>
                            <span className="text-sm flex-1">High</span>
                            <span className="font-medium">{Math.round((data.intensities.high / totalIntensity) * 100)}%</span>
                        </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-border/50 grid grid-cols-2 gap-3 text-center">
                        <div>
                            <div className="text-2xl font-bold">{data.totalWorkouts}</div>
                            <div className="text-xs text-muted-foreground">Total Workouts</div>
                        </div>
                        <div>
                            <div className="text-2xl font-bold">{data.avgDuration}m</div>
                            <div className="text-xs text-muted-foreground">Avg Duration</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
