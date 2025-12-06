"use client";

import { useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
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
            radius: 95,
            unit: "m"
        },
        {
            label: "Work",
            value: averages.work, // hours
            goal: GOALS.work,
            color: "#22c55e", // Green
            bg: "rgba(34, 197, 94, 0.2)",
            radius: 75,
            unit: "h"
        },
        {
            label: "Sleep",
            value: averages.sleep, // hours
            goal: GOALS.sleep,
            color: "#3b82f6", // Blue
            bg: "rgba(59, 130, 246, 0.2)",
            radius: 55,
            unit: "h"
        }
    ];

    const averagePercentage = rings.reduce((acc, ring) => {
        const percentage = Math.min(100, (ring.value / ring.goal) * 100);
        return acc + percentage;
    }, 0) / rings.length;

    const [hoveredRing, setHoveredRing] = useState<string | null>(null);

    const activeRing = rings.find(r => r.label === hoveredRing);

    return (
        <div className="flex flex-col gap-6 mb-8">
            {/* Rings Visualization */}
            <div className="bg-card rounded-[32px] p-6 border border-border/50 shadow-sm flex items-center justify-center min-h-[250px]">
                <div className="relative w-[200px] h-[200px]" style={{ minWidth: 200, minHeight: 200 }}>
                    <ResponsiveContainer width="100%" height="100%" minWidth={200} minHeight={200}>
                        <PieChart>
                            {/* Background rings */}
                            {rings.map((ring, index) => (
                                <Pie
                                    key={`bg-ring-${index}`}
                                    data={[{ value: 100, fill: ring.bg }]}
                                    dataKey="value"
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={ring.radius - 12}
                                    outerRadius={ring.radius}
                                    startAngle={90}
                                    endAngle={-270}
                                    stroke="none"
                                    isAnimationActive={false}
                                    onMouseEnter={() => setHoveredRing(ring.label)}
                                    onMouseLeave={() => setHoveredRing(null)}
                                    style={{ opacity: hoveredRing && hoveredRing !== ring.label ? 0.3 : 1, transition: 'opacity 0.3s' }}
                                />
                            ))}
                            {/* Progress rings */}
                            {rings.map((ring, index) => {
                                const rawPercentage = (ring.value / ring.goal) * 100;
                                const percentage = isNaN(rawPercentage) || !isFinite(rawPercentage) ? 0 : Math.min(100, rawPercentage);
                                const progressData = [
                                    { value: percentage, fill: ring.color },
                                    { value: 100 - percentage, fill: "transparent" } // Transparent remainder
                                ];
                                return (
                                    <Pie
                                        key={`progress-ring-${index}`}
                                        data={progressData}
                                        dataKey="value"
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={ring.radius - 12}
                                        outerRadius={ring.radius}
                                        startAngle={90}
                                        endAngle={-270}
                                        cornerRadius={10}
                                        stroke="none"
                                        onMouseEnter={() => setHoveredRing(ring.label)}
                                        onMouseLeave={() => setHoveredRing(null)}
                                        style={{ opacity: hoveredRing && hoveredRing !== ring.label ? 0.3 : 1, transition: 'opacity 0.3s', cursor: 'pointer' }}
                                    >
                                        {progressData.map((entry, idx) => (
                                            <Cell key={`cell-${idx}`} fill={entry.fill} />
                                        ))}
                                    </Pie>
                                );
                            })}
                        </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none transition-all duration-300">
                        {activeRing ? (
                            <>
                                <span className="text-4xl font-thin text-foreground" style={{ color: activeRing.color }}>
                                    {Math.round(activeRing.value * 10) / 10}
                                </span>
                                <span className="text-xs font-black uppercase tracking-widest text-muted-foreground mt-1">
                                    {activeRing.unit}
                                </span>
                                <span className="text-[10px] font-medium text-muted-foreground mt-1 opacity-70">
                                    {activeRing.label}
                                </span>
                            </>
                        ) : (
                            <>
                                <span className="text-4xl font-thin text-foreground">
                                    {Math.round(averagePercentage)}%
                                </span>
                                <span className="text-xs font-black uppercase tracking-widest text-muted-foreground mt-1">AVG</span>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Legend / Details */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full">
                {rings.map((ring) => (
                    <motion.div
                        key={ring.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-card rounded-[32px] p-3 border border-border/50 shadow-sm flex flex-col items-center justify-center text-center gap-1"
                    >
                        <div className="flex items-center gap-2 mb-1">
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: ring.color }} />
                            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{ring.label}</span>
                        </div>
                        <div className="flex items-baseline gap-1">
                            <span className="text-3xl font-thin text-foreground">
                                {Math.round(ring.value * 10) / 10}
                            </span>
                            <span className="text-xs text-muted-foreground font-medium">{ring.unit}</span>
                        </div>
                        <span className="text-[10px] text-muted-foreground">
                            Goal: {ring.goal}
                        </span>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
