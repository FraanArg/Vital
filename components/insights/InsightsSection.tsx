"use client";

import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { TrendingUp, TrendingDown, Minus, ArrowUpRight, ArrowDownRight } from "lucide-react";

interface TrendData {
    metric: string;
    current: number;
    previous: number;
    change: number;
    changePercent: number;
    trend: "up" | "down" | "stable";
}

interface Comparison {
    metric: string;
    thisWeek: string;
    lastWeek: string;
    change: string;
    positive: boolean;
}

interface GoalProgress {
    goal: string;
    current: number;
    target: number;
    percent: number;
    prediction: number;
    onTrack: boolean;
    icon: string;
}

interface Correlation {
    factor1: string;
    factor2: string;
    relationship: string;
    strength: "strong" | "moderate" | "weak";
    icon: string;
}

export default function InsightsSection() {
    const trends = useQuery(api.insights.getWeeklyTrends) as TrendData[] | undefined;
    const comparisons = useQuery(api.insights.getComparisons) as Comparison[] | undefined;
    const goals = useQuery(api.insights.getGoalProgress) as GoalProgress[] | undefined;
    const correlations = useQuery(api.insights.getCorrelations) as Correlation[] | undefined;

    return (
        <div className="space-y-6">
            {/* Trends Grid */}
            {trends && trends.length > 0 && (
                <div>
                    <h3 className="text-lg font-semibold mb-3">Weekly Trends</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {trends.map((trend) => (
                            <div
                                key={trend.metric}
                                className="bg-card p-4 rounded-2xl border border-border/50"
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs text-muted-foreground">{trend.metric}</span>
                                    {trend.trend === "up" ? (
                                        <TrendingUp className="w-4 h-4 text-green-500" />
                                    ) : trend.trend === "down" ? (
                                        <TrendingDown className="w-4 h-4 text-red-500" />
                                    ) : (
                                        <Minus className="w-4 h-4 text-muted-foreground" />
                                    )}
                                </div>
                                <div className="text-2xl font-bold">{trend.current}</div>
                                {trend.change !== 0 && (
                                    <div className={`text-xs flex items-center gap-1 ${trend.trend === "up" ? "text-green-500" : trend.trend === "down" ? "text-red-500" : "text-muted-foreground"}`}>
                                        {trend.change > 0 ? "+" : ""}{trend.change}
                                        {trend.changePercent !== 0 && ` (${trend.changePercent}%)`}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Goal Progress */}
            {goals && goals.length > 0 && (
                <div>
                    <h3 className="text-lg font-semibold mb-3">Goal Progress</h3>
                    <div className="space-y-3">
                        {goals.map((goal) => (
                            <div
                                key={goal.goal}
                                className="bg-card p-4 rounded-2xl border border-border/50"
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <span className="text-xl">{goal.icon}</span>
                                        <span className="font-medium">{goal.goal}</span>
                                    </div>
                                    <span className={`text-xs px-2 py-1 rounded-full ${goal.onTrack ? "bg-green-500/10 text-green-500" : "bg-yellow-500/10 text-yellow-500"}`}>
                                        {goal.onTrack ? "On Track" : "Behind"}
                                    </span>
                                </div>
                                <div className="relative h-2 bg-secondary rounded-full overflow-hidden mb-2">
                                    <div
                                        className={`absolute inset-y-0 left-0 rounded-full ${goal.onTrack ? "bg-green-500" : "bg-yellow-500"}`}
                                        style={{ width: `${goal.percent}%` }}
                                    />
                                </div>
                                <div className="flex justify-between text-xs text-muted-foreground">
                                    <span>{goal.current} / {goal.target}</span>
                                    <span>Predicted: {goal.prediction}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Week Comparison */}
            {comparisons && comparisons.length > 0 && (
                <div>
                    <h3 className="text-lg font-semibold mb-3">Week vs Week</h3>
                    <div className="bg-card rounded-2xl border border-border/50 overflow-hidden">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-border/50">
                                    <th className="text-left p-3 text-muted-foreground font-medium">Metric</th>
                                    <th className="text-center p-3 text-muted-foreground font-medium">This Week</th>
                                    <th className="text-center p-3 text-muted-foreground font-medium">Last Week</th>
                                    <th className="text-right p-3 text-muted-foreground font-medium">Change</th>
                                </tr>
                            </thead>
                            <tbody>
                                {comparisons.map((comp) => (
                                    <tr key={comp.metric} className="border-b border-border/30 last:border-0">
                                        <td className="p-3 font-medium">{comp.metric}</td>
                                        <td className="p-3 text-center">{comp.thisWeek}</td>
                                        <td className="p-3 text-center text-muted-foreground">{comp.lastWeek}</td>
                                        <td className="p-3 text-right">
                                            <span className={`inline-flex items-center gap-1 ${comp.positive ? "text-green-500" : "text-red-500"}`}>
                                                {comp.positive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                                                {comp.change}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Correlations */}
            {correlations && correlations.length > 0 && (
                <div>
                    <h3 className="text-lg font-semibold mb-3">Patterns Discovered</h3>
                    <div className="space-y-2">
                        {correlations.map((corr, i) => (
                            <div
                                key={i}
                                className="bg-gradient-to-r from-purple-500/10 to-purple-500/5 border border-purple-500/20 p-4 rounded-2xl"
                            >
                                <div className="flex items-start gap-3">
                                    <span className="text-2xl">{corr.icon}</span>
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="font-semibold text-sm">{corr.factor1} → {corr.factor2}</span>
                                            <span className={`text-xs px-2 py-0.5 rounded-full ${corr.strength === "strong" ? "bg-green-500/20 text-green-400" : "bg-blue-500/20 text-blue-400"}`}>
                                                {corr.strength}
                                            </span>
                                        </div>
                                        <p className="text-sm text-muted-foreground">{corr.relationship}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
