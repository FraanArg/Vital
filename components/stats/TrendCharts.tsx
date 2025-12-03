"use client";

import { useState } from "react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    LineChart,
    Line,
    AreaChart,
    Area
} from "recharts";
import { format, parseISO } from "date-fns";

interface ChartData {
    date: string;
    work: number;
    sleep: number;
    exerciseDuration: number;
    water: number;
    mood: number;
}

interface TrendChartsProps {
    data: ChartData[];
    range: "week" | "month" | "year";
}

interface TooltipProps {
    active?: boolean;
    payload?: Array<{ value: number }>;
    label?: string;
    config: {
        color: string;
        unit: string;
    };
}

const CustomTooltip = ({ active, payload, label, config }: TooltipProps) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-background/80 backdrop-blur-md border border-border/50 p-3 rounded-xl shadow-lg">
                <p className="text-sm font-medium mb-1">{label ? format(parseISO(label), "EEE, MMM d") : ""}</p>
                <p className="text-lg font-bold" style={{ color: config.color }}>
                    {payload[0].value}
                    <span className="text-xs text-muted-foreground ml-1">{config.unit}</span>
                </p>
            </div>
        );
    }
    return null;
};

export default function TrendCharts({ data, range }: TrendChartsProps) {
    const [activeTab, setActiveTab] = useState<"work" | "sleep" | "exercise" | "water" | "mood">("work");

    const config = {
        work: { color: "#22c55e", label: "Work", unit: "h", type: "bar" },
        sleep: { color: "#8b5cf6", label: "Sleep", unit: "h", type: "line" },
        exercise: { color: "#ef4444", label: "Exercise", unit: "min", type: "bar" },
        water: { color: "#3b82f6", label: "Water", unit: "L", type: "area" },
        mood: { color: "#f59e0b", label: "Mood", unit: "/10", type: "line" }
    };

    const currentConfig = config[activeTab];

    return (
        <div className="w-full bg-card rounded-3xl p-6 shadow-sm border border-border/50 mb-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                <h3 className="text-lg font-semibold">Trends</h3>
                <div className="flex flex-wrap gap-1 bg-secondary/30 p-1 rounded-xl">
                    {(Object.keys(config) as Array<keyof typeof config>).map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${activeTab === tab
                                ? "bg-background text-foreground shadow-sm"
                                : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                                }`}
                        >
                            {config[tab].label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    {currentConfig.type === "bar" ? (
                        <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.3} />
                            <XAxis
                                dataKey="date"
                                tickFormatter={(str) => format(parseISO(str), range === "week" ? "EEE" : "d")}
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                                dy={10}
                                minTickGap={30}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                            />
                            <Tooltip content={<CustomTooltip config={currentConfig} />} cursor={{ fill: "var(--secondary)", opacity: 0.3, radius: 8 }} />
                            <Bar
                                dataKey={activeTab === "exercise" ? "exerciseDuration" : activeTab}
                                fill={currentConfig.color}
                                radius={[6, 6, 6, 6]}
                                barSize={range === "week" ? 40 : undefined}
                            />
                        </BarChart>
                    ) : currentConfig.type === "line" ? (
                        <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.3} />
                            <XAxis
                                dataKey="date"
                                tickFormatter={(str) => format(parseISO(str), range === "week" ? "EEE" : "d")}
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                                dy={10}
                                minTickGap={30}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                                domain={activeTab === "mood" ? [0, 10] : ['auto', 'auto']}
                            />
                            <Tooltip content={<CustomTooltip config={currentConfig} />} />
                            <Line
                                type="monotone"
                                dataKey={activeTab}
                                stroke={currentConfig.color}
                                strokeWidth={3}
                                dot={range === "week" ? { fill: currentConfig.color, strokeWidth: 2, r: 4 } : false}
                                activeDot={{ r: 6, strokeWidth: 0 }}
                            />
                        </LineChart>
                    ) : (
                        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorWater" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={currentConfig.color} stopOpacity={0.3} />
                                    <stop offset="95%" stopColor={currentConfig.color} stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.3} />
                            <XAxis
                                dataKey="date"
                                tickFormatter={(str) => format(parseISO(str), range === "week" ? "EEE" : "d")}
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                                dy={10}
                                minTickGap={30}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                            />
                            <Tooltip content={<CustomTooltip config={currentConfig} />} />
                            <Area
                                type="monotone"
                                dataKey={activeTab}
                                stroke={currentConfig.color}
                                fillOpacity={1}
                                fill="url(#colorWater)"
                                strokeWidth={3}
                            />
                        </AreaChart>
                    )}
                </ResponsiveContainer>
            </div>
        </div>
    );
}
