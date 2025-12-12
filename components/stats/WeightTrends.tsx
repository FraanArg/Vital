"use client";

import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { format, parseISO } from "date-fns";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Minus, Scale, Target } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from "recharts";
import { Skeleton } from "../ui/Skeleton";
import Link from "next/link";

interface WeightTrendsProps {
    days?: number;
}

export default function WeightTrends({ days = 90 }: WeightTrendsProps) {
    const measurements = useQuery(api.body.getMeasurements, { days });
    const bodyStats = useQuery(api.body.getBodyStats);

    if (!measurements || !bodyStats) {
        return (
            <div className="bg-card rounded-2xl border border-border/50 p-6">
                <Skeleton className="h-6 w-40 mb-4" />
                <Skeleton className="h-48 rounded-xl" />
            </div>
        );
    }

    // Filter entries with weight
    const weightData = measurements
        .filter(m => m.weight !== undefined && m.weight !== null)
        .map(m => ({
            date: m.date,
            weight: m.weight,
            formattedDate: format(parseISO(m.date), "MMM d"),
        }))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    if (weightData.length === 0) {
        return (
            <div className="bg-card rounded-2xl border border-border/50 p-6">
                <h3 className="text-lg font-semibold mb-4">Weight Trends</h3>
                <div className="text-center py-8 text-muted-foreground">
                    <Scale className="w-12 h-12 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">No weight data yet</p>
                    <Link
                        href="/body"
                        className="inline-block mt-3 px-4 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors"
                    >
                        Track Weight
                    </Link>
                </div>
            </div>
        );
    }

    // Calculate stats
    const latestWeight = weightData[weightData.length - 1]?.weight || 0;
    const firstWeight = weightData[0]?.weight || latestWeight;
    const weightChange = latestWeight - firstWeight;
    const percentChange = firstWeight > 0 ? ((weightChange / firstWeight) * 100) : 0;

    const TrendIcon = weightChange > 0 ? TrendingUp : weightChange < 0 ? TrendingDown : Minus;
    const trendColor = weightChange > 0 ? "text-orange-500" : weightChange < 0 ? "text-green-500" : "text-muted-foreground";

    return (
        <div className="bg-card rounded-2xl border border-border/50 p-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Weight Trends</h3>
                <Link
                    href="/body"
                    className="text-xs text-primary hover:underline"
                >
                    View all →
                </Link>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="p-3 rounded-xl bg-secondary/30 text-center">
                    <p className="text-xs text-muted-foreground">Current</p>
                    <p className="text-xl font-bold tabular-nums">{latestWeight.toFixed(1)}</p>
                    <p className="text-xs text-muted-foreground">kg</p>
                </div>
                <div className="p-3 rounded-xl bg-secondary/30 text-center">
                    <p className="text-xs text-muted-foreground">Change</p>
                    <div className={`flex items-center justify-center gap-1 ${trendColor}`}>
                        <TrendIcon className="w-4 h-4" />
                        <span className="text-xl font-bold tabular-nums">
                            {Math.abs(weightChange).toFixed(1)}
                        </span>
                    </div>
                    <p className="text-xs text-muted-foreground">kg</p>
                </div>
                <div className="p-3 rounded-xl bg-secondary/30 text-center">
                    <p className="text-xs text-muted-foreground">BMI</p>
                    <p className="text-xl font-bold tabular-nums">
                        {bodyStats.bmi?.toFixed(1) || "-"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                        {bodyStats.bmiCategory || "N/A"}
                    </p>
                </div>
            </div>

            {/* Chart */}
            {weightData.length > 1 && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="h-[180px] w-full"
                >
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={weightData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.3} />
                            <XAxis
                                dataKey="formattedDate"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: "var(--muted-foreground)", fontSize: 10 }}
                                interval="preserveStartEnd"
                            />
                            <YAxis
                                domain={['dataMin - 2', 'dataMax + 2']}
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: "var(--muted-foreground)", fontSize: 10 }}
                                width={35}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: "var(--background)",
                                    borderRadius: "12px",
                                    border: "1px solid var(--border)",
                                    padding: "8px 12px",
                                }}
                                formatter={(value: number) => [`${value.toFixed(1)} kg`, "Weight"]}
                            />
                            <Line
                                type="monotone"
                                dataKey="weight"
                                stroke="var(--primary)"
                                strokeWidth={2}
                                dot={{ r: 3, fill: "var(--primary)" }}
                                activeDot={{ r: 5 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </motion.div>
            )}
        </div>
    );
}
