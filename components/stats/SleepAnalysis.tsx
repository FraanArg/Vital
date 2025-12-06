"use client";

import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Moon, Clock, TrendingUp, TrendingDown } from "lucide-react";

export default function SleepAnalysis() {
    const data = useQuery(api.stats.getSleepAnalysis, { days: 30 });

    if (!data) return null;

    return (
        <div className="bg-card rounded-2xl border border-border/50 p-5">
            <h3 className="font-semibold mb-4">Sleep Analysis</h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-secondary/30 rounded-xl">
                    <Moon className="w-5 h-5 mx-auto mb-2 text-indigo-400" />
                    <div className="text-2xl font-bold">{data.avgDuration}h</div>
                    <div className="text-xs text-muted-foreground">Avg Duration</div>
                </div>

                <div className="text-center p-3 bg-secondary/30 rounded-xl">
                    <div className="text-2xl font-bold mb-2">{data.consistency}%</div>
                    <div className="text-xs text-muted-foreground">Consistency</div>
                    <div className={`text-xs mt-1 ${data.consistency >= 70 ? "text-green-500" : "text-yellow-500"}`}>
                        {data.consistency >= 70 ? "Good" : "Fair"}
                    </div>
                </div>

                <div className="text-center p-3 bg-secondary/30 rounded-xl">
                    <TrendingUp className="w-5 h-5 mx-auto mb-2 text-green-500" />
                    <div className="text-2xl font-bold">{data.bestSleep}h</div>
                    <div className="text-xs text-muted-foreground">Best Night</div>
                </div>

                {data.avgBedtime && (
                    <div className="text-center p-3 bg-secondary/30 rounded-xl">
                        <Clock className="w-5 h-5 mx-auto mb-2 text-blue-400" />
                        <div className="text-2xl font-bold">{data.avgBedtime}</div>
                        <div className="text-xs text-muted-foreground">Avg Bedtime</div>
                    </div>
                )}
            </div>
        </div>
    );
}
