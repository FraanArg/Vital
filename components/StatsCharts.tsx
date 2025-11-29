"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../lib/db";
import {
    LineChart,
    Line,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area,
} from "recharts";
import { format, subDays, startOfDay, isSameDay } from "date-fns";
import { useState } from "react";

export default function StatsCharts() {
    const [activeTab, setActiveTab] = useState<"work" | "sleep" | "water">("work");

    const logs = useLiveQuery(async () => {
        const end = new Date();
        const start = subDays(end, 6); // Last 7 days
        return await db.logs
            .where("date")
            .between(start, end, true, true)
            .toArray();
    }, []);

    if (!logs) return null;

    // Process data for the last 7 days
    const data = [];
    for (let i = 6; i >= 0; i--) {
        const date = subDays(new Date(), i);
        const dayLogs = logs.filter((log) => isSameDay(log.date, date));

        // Sum up values for the day (in case of multiple entries, though usually one per type)
        const work = dayLogs.reduce((acc, log) => acc + (log.work || 0), 0);
        const sleep = dayLogs.reduce((acc, log) => acc + (log.sleep || 0), 0);
        const water = dayLogs.reduce((acc, log) => acc + (log.water || 0), 0);

        data.push({
            name: format(date, "EEE"), // Mon, Tue, etc.
            work,
            sleep,
            water,
        });
    }

    return (
        <div className="w-full bg-card rounded-3xl p-6 shadow-sm border border-border/50 mb-8">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold">Trends</h3>
                <div className="flex bg-secondary rounded-full p-1">
                    {(["work", "sleep", "water"] as const).map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${activeTab === tab
                                    ? "bg-background text-foreground shadow-sm"
                                    : "text-muted hover:text-foreground"
                                }`}
                        >
                            {tab.charAt(0).toUpperCase() + tab.slice(1)}
                        </button>
                    ))}
                </div>
            </div>

            <div className="h-[200px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    {activeTab === "work" ? (
                        <BarChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.5} />
                            <XAxis
                                dataKey="name"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: "var(--muted)", fontSize: 12 }}
                                dy={10}
                            />
                            <Tooltip
                                cursor={{ fill: "var(--secondary)", opacity: 0.5 }}
                                contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "var(--shadow)" }}
                            />
                            <Bar dataKey="work" fill="var(--primary)" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    ) : activeTab === "sleep" ? (
                        <LineChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.5} />
                            <XAxis
                                dataKey="name"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: "var(--muted)", fontSize: 12 }}
                                dy={10}
                            />
                            <Tooltip
                                contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "var(--shadow)" }}
                            />
                            <Line
                                type="monotone"
                                dataKey="sleep"
                                stroke="#8b5cf6"
                                strokeWidth={3}
                                dot={{ fill: "#8b5cf6", strokeWidth: 2 }}
                                activeDot={{ r: 6 }}
                            />
                        </LineChart>
                    ) : (
                        <AreaChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.5} />
                            <XAxis
                                dataKey="name"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: "var(--muted)", fontSize: 12 }}
                                dy={10}
                            />
                            <Tooltip
                                contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "var(--shadow)" }}
                            />
                            <Area
                                type="monotone"
                                dataKey="water"
                                stroke="#3b82f6"
                                fill="#3b82f6"
                                fillOpacity={0.2}
                                strokeWidth={3}
                            />
                        </AreaChart>
                    )}
                </ResponsiveContainer>
            </div>
        </div>
    );
}
