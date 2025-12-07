"use client";

import { useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

interface ActivityRingsProps {
    averages: {
        work: number;
        sleep: number;
        exercise: number;
    };
    compact?: boolean;
}

export default function ActivityRings({ averages, compact = false }: ActivityRingsProps) {
    const GOALS = {
        work: 8,
        sleep: 8,
        exercise: 60
    };

    const rings = [
        {
            label: "Move",
            value: averages.exercise,
            goal: GOALS.exercise,
            color: "#ef4444",
            bg: "rgba(239, 68, 68, 0.2)",
            radius: compact ? 75 : 95,
            unit: "m"
        },
        {
            label: "Work",
            value: averages.work,
            goal: GOALS.work,
            color: "#22c55e",
            bg: "rgba(34, 197, 94, 0.2)",
            radius: compact ? 58 : 75,
            unit: "h"
        },
        {
            label: "Sleep",
            value: averages.sleep,
            goal: GOALS.sleep,
            color: "#3b82f6",
            bg: "rgba(59, 130, 246, 0.2)",
            radius: compact ? 41 : 55,
            unit: "h"
        }
    ];

    const averagePercentage = rings.reduce((acc, ring) => {
        const percentage = Math.min(100, (ring.value / ring.goal) * 100);
        return acc + percentage;
    }, 0) / rings.length;

    const [hoveredRing, setHoveredRing] = useState<string | null>(null);
    const activeRing = rings.find(r => r.label === hoveredRing);

    const size = compact ? 160 : 200;

    return (
        <div className={`bg-card rounded-2xl p-4 border border-border/50 shadow-sm ${compact ? '' : 'mb-4'}`}>
            <div className="flex items-center gap-4">
                {/* Rings */}
                <div className="relative shrink-0" style={{ width: size, height: size, minWidth: size, minHeight: size }}>
                    <ResponsiveContainer width="100%" height="100%" minWidth={size} minHeight={size}>
                        <PieChart>
                            {rings.map((ring, index) => (
                                <Pie
                                    key={`bg-ring-${index}`}
                                    data={[{ value: 100, fill: ring.bg }]}
                                    dataKey="value"
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={ring.radius - (compact ? 9 : 12)}
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
                            {rings.map((ring, index) => {
                                const rawPercentage = (ring.value / ring.goal) * 100;
                                const percentage = isNaN(rawPercentage) || !isFinite(rawPercentage) ? 0 : Math.min(100, rawPercentage);
                                const progressData = [
                                    { value: percentage, fill: ring.color },
                                    { value: 100 - percentage, fill: "transparent" }
                                ];
                                return (
                                    <Pie
                                        key={`progress-ring-${index}`}
                                        data={progressData}
                                        dataKey="value"
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={ring.radius - (compact ? 9 : 12)}
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
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        {activeRing ? (
                            <>
                                <span className={`${compact ? 'text-2xl' : 'text-3xl'} font-light`} style={{ color: activeRing.color }}>
                                    {Math.round(activeRing.value * 10) / 10}
                                </span>
                                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                                    {activeRing.unit}
                                </span>
                            </>
                        ) : (
                            <>
                                <span className={`${compact ? 'text-2xl' : 'text-3xl'} font-light`}>
                                    {Math.round(averagePercentage)}%
                                </span>
                                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">AVG</span>
                            </>
                        )}
                    </div>
                </div>

                {/* Inline Stats */}
                <div className="flex-1 flex flex-col gap-2">
                    {rings.map((ring) => (
                        <div
                            key={ring.label}
                            className="flex items-center gap-3 p-2 rounded-xl hover:bg-secondary/50 transition-colors cursor-default"
                            onMouseEnter={() => setHoveredRing(ring.label)}
                            onMouseLeave={() => setHoveredRing(null)}
                        >
                            <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: ring.color }} />
                            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide w-12">{ring.label}</span>
                            <span className="text-lg font-semibold" style={{ color: ring.color }}>
                                {Math.round(ring.value * 10) / 10}
                            </span>
                            <span className="text-xs text-muted-foreground">{ring.unit}</span>
                            <span className="text-[10px] text-muted-foreground/60 ml-auto">/ {ring.goal}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
