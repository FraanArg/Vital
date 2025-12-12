"use client";

import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { subDays, format, startOfDay, eachDayOfInterval } from "date-fns";
import { motion } from "framer-motion";
import { Smile, Frown, Meh, Sun, CloudRain } from "lucide-react";
import { Skeleton } from "../ui/Skeleton";

const MOOD_COLORS = [
    { value: 1, label: "Awful", color: "#ef4444", icon: Frown, bgColor: "bg-red-500/10" },
    { value: 2, label: "Bad", color: "#f97316", icon: Frown, bgColor: "bg-orange-500/10" },
    { value: 3, label: "Okay", color: "#eab308", icon: Meh, bgColor: "bg-yellow-500/10" },
    { value: 4, label: "Good", color: "#22c55e", icon: Smile, bgColor: "bg-green-500/10" },
    { value: 5, label: "Great", color: "#10b981", icon: Sun, bgColor: "bg-emerald-500/10" },
];

interface MoodVisualizationProps {
    days?: number;
}

export default function MoodVisualization({ days = 30 }: MoodVisualizationProps) {
    const start = subDays(new Date(), days);
    const end = new Date();

    const logs = useQuery(api.logs.getStats, {
        from: start.toISOString(),
        to: end.toISOString(),
    });

    if (!logs) {
        return (
            <div className="bg-card rounded-2xl border border-border/50 p-6">
                <Skeleton className="h-6 w-40 mb-4" />
                <Skeleton className="h-32 rounded-xl" />
            </div>
        );
    }

    // Group mood by date
    const moodByDate = new Map<string, number>();
    logs.forEach(log => {
        if (log.mood) {
            const dateKey = format(new Date(log.date), "yyyy-MM-dd");
            const existing = moodByDate.get(dateKey);
            if (!existing || log.mood !== existing) {
                // Take the latest mood for the day
                moodByDate.set(dateKey, log.mood);
            }
        }
    });

    // Create calendar data
    const allDays = eachDayOfInterval({ start, end });
    const calendarData = allDays.map(day => {
        const dateKey = format(day, "yyyy-MM-dd");
        const mood = moodByDate.get(dateKey);
        return {
            date: day,
            dateKey,
            mood,
            moodConfig: mood ? MOOD_COLORS.find(m => m.value === mood) : null,
        };
    });

    // Calculate averages
    const moodsArray = Array.from(moodByDate.values());
    const avgMood = moodsArray.length > 0
        ? moodsArray.reduce((a, b) => a + b, 0) / moodsArray.length
        : 0;

    // Distribution
    const distribution = MOOD_COLORS.map(m => ({
        ...m,
        count: moodsArray.filter(mood => mood === m.value).length,
        percentage: moodsArray.length > 0
            ? (moodsArray.filter(mood => mood === m.value).length / moodsArray.length) * 100
            : 0,
    }));

    const avgMoodConfig = MOOD_COLORS.find(m => m.value === Math.round(avgMood)) || MOOD_COLORS[2];

    return (
        <div className="bg-card rounded-2xl border border-border/50 p-6">
            <h3 className="text-lg font-semibold mb-4">Mood Patterns</h3>

            {moodsArray.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                    <Meh className="w-12 h-12 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">No mood data yet</p>
                    <p className="text-xs mt-1">Log your mood to see patterns</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {/* Average Mood */}
                    <div className="flex items-center gap-4 p-4 rounded-xl bg-secondary/30">
                        <div className={`p-3 rounded-xl ${avgMoodConfig.bgColor}`}>
                            <avgMoodConfig.icon className="w-8 h-8" style={{ color: avgMoodConfig.color }} />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Average Mood</p>
                            <p className="text-xl font-bold">{avgMoodConfig.label}</p>
                            <p className="text-xs text-muted-foreground">
                                Based on {moodsArray.length} entries
                            </p>
                        </div>
                    </div>

                    {/* Distribution */}
                    <div>
                        <p className="text-sm font-medium mb-3">Distribution</p>
                        <div className="flex gap-1 h-8">
                            {distribution.map((m, i) => (
                                <motion.div
                                    key={m.value}
                                    initial={{ scaleY: 0 }}
                                    animate={{ scaleY: 1 }}
                                    transition={{ delay: i * 0.1 }}
                                    className="flex-1 rounded origin-bottom"
                                    style={{
                                        backgroundColor: m.color,
                                        opacity: m.count > 0 ? 0.8 : 0.15,
                                    }}
                                    title={`${m.label}: ${m.count} days (${m.percentage.toFixed(0)}%)`}
                                />
                            ))}
                        </div>
                        <div className="flex justify-between mt-1 text-xs text-muted-foreground">
                            <span>😢</span>
                            <span>😊</span>
                        </div>
                    </div>

                    {/* Mood Calendar (last 2 weeks) */}
                    <div>
                        <p className="text-sm font-medium mb-3">Last 14 Days</p>
                        <div className="grid grid-cols-7 gap-1">
                            {calendarData.slice(-14).map((day, i) => (
                                <motion.div
                                    key={day.dateKey}
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ delay: i * 0.02 }}
                                    className="aspect-square rounded-lg flex items-center justify-center text-xs font-medium"
                                    style={{
                                        backgroundColor: day.moodConfig?.color || "var(--secondary)",
                                        opacity: day.mood ? 0.8 : 0.3,
                                    }}
                                    title={`${format(day.date, "MMM d")}: ${day.moodConfig?.label || "No data"}`}
                                >
                                    {format(day.date, "d")}
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
