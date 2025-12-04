"use client";

import { PieChart, Pie, Cell } from "recharts";
import { motion } from "framer-motion";

interface ActivityRingsProps {
    averages: {
        work: number;
        sleep: number;
        exercise: number;
    };
}

export default function ActivityRings({ averages }: ActivityRingsProps) {
    // Goals (hardcoded for now, could be dynamic later)
    const GOALS = {
        work: 8,
        sleep: 8,
        exercise: 60 // minutes
    };

    const rings = [
        {
            label: "Move",
            value: averages.exercise, // minutes
            goal: GOALS.exercise,
            color: "#ef4444", // Red
            bg: "rgba(239, 68, 68, 0.2)",
            radius: 80
        },
        {
            label: "Work",
            value: averages.work, // hours
            goal: GOALS.work,
            color: "#22c55e", // Green
            bg: "rgba(34, 197, 94, 0.2)",
            radius: 60
        },
        {
            label: "Sleep",
            value: averages.sleep, // hours
            goal: GOALS.sleep,
            color: "#3b82f6", // Blue
            bg: "rgba(59, 130, 246, 0.2)",
            radius: 40
        }
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Rings Visualization */}
            <div className="bg-card rounded-3xl p-6 border border-border/50 shadow-sm flex items-center justify-center min-h-[250px]">
                <div className="relative w-[200px] h-[200px]">
                    <PieChart width={200} height={200}>
                        {rings.map((ring) => {
                            const rawPercentage = (ring.value / ring.goal) * 100;
                            const percentage = isNaN(rawPercentage) || !isFinite(rawPercentage) ? 0 : Math.min(100, rawPercentage);
                            const data = [
                                { value: percentage, fill: ring.color },
                                { value: 100 - percentage, fill: "transparent" } // Transparent remainder
                            ];
                            // Background ring
                            const bgData = [{ value: 100, fill: ring.bg }];

                            return (
                                <g key={ring.label}>
                                    <Pie
                                        data={bgData}
                                        dataKey="value"
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={ring.radius - 8}
                                        outerRadius={ring.radius}
                                        startAngle={90}
                                        endAngle={-270}
                                        stroke="none"
                                        isAnimationActive={false}
                                    />
                                    <Pie
                                        data={data}
                                        dataKey="value"
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={ring.radius - 8}
                                        outerRadius={ring.radius}
                                        startAngle={90}
                                        endAngle={90 - (360 * percentage) / 100}
                                        cornerRadius={10}
                                        stroke="none"
                                    >
                                        {data.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.fill} />
                                        ))}
                                    </Pie>
                                </g>
                            );
                        })}
                    </PieChart>

                    {/* Center Text */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <span className="text-xs font-medium text-muted-foreground uppercase tracking-widest">Avg</span>
                    </div>
                </div>
            </div>

            {/* Legend / Details */}
            <div className="grid grid-rows-3 gap-4">
                {rings.map((ring) => (
                    <motion.div
                        key={ring.label}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-card rounded-2xl p-4 border border-border/50 shadow-sm flex items-center justify-between"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: ring.color }} />
                            <div>
                                <div className="font-semibold">{ring.label}</div>
                                <div className="text-xs text-muted-foreground">Goal: {ring.goal}{ring.label === "Move" ? "m" : "h"}</div>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-xl font-bold" style={{ color: ring.color }}>
                                {Math.round(ring.value * 10) / 10}<span className="text-sm font-medium text-muted-foreground ml-1">{ring.label === "Move" ? "min" : "h"}</span>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
