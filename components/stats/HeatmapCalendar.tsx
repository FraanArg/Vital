"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { format, eachDayOfInterval, startOfMonth, endOfMonth, subMonths, getDay, isSameDay } from "date-fns";

interface HeatmapData {
    date: string; // ISO date string
    value: number; // 0-1 normalized value
    label?: string; // tooltip text
}

interface HeatmapCalendarProps {
    data: HeatmapData[];
    title: string;
    colorScale?: string[]; // gradient from low to high
    months?: number; // how many months to show
    emptyColor?: string;
    className?: string;
}

const DEFAULT_COLORS = [
    "bg-secondary", // 0
    "bg-green-200 dark:bg-green-900",
    "bg-green-300 dark:bg-green-700",
    "bg-green-400 dark:bg-green-600",
    "bg-green-500 dark:bg-green-500",
];

const WORKOUT_COLORS = [
    "bg-secondary",
    "bg-blue-200 dark:bg-blue-900",
    "bg-blue-300 dark:bg-blue-700",
    "bg-blue-400 dark:bg-blue-600",
    "bg-blue-500 dark:bg-blue-500",
];

const SLEEP_COLORS = [
    "bg-secondary",
    "bg-indigo-200 dark:bg-indigo-900",
    "bg-indigo-300 dark:bg-indigo-700",
    "bg-indigo-400 dark:bg-indigo-600",
    "bg-indigo-500 dark:bg-indigo-500",
];

/**
 * GitHub-style contribution heatmap calendar
 */
export default function HeatmapCalendar({
    data,
    title,
    colorScale = DEFAULT_COLORS,
    months = 3,
    emptyColor = "bg-secondary/50",
    className = "",
}: HeatmapCalendarProps) {
    const weeks = useMemo(() => {
        const endDate = new Date();
        const startDate = startOfMonth(subMonths(endDate, months - 1));

        const allDays = eachDayOfInterval({ start: startDate, end: endDate });

        // Create a map for quick lookup
        const dataMap = new Map(data.map(d => [d.date.split("T")[0], d]));

        // Organize into weeks (starting Sunday)
        const weeksArray: (HeatmapData | null)[][] = [];
        let currentWeek: (HeatmapData | null)[] = [];

        // Add empty days at start to align with day of week
        const firstDayOfWeek = getDay(allDays[0]);
        for (let i = 0; i < firstDayOfWeek; i++) {
            currentWeek.push(null);
        }

        for (const day of allDays) {
            const dateStr = format(day, "yyyy-MM-dd");
            const dayData = dataMap.get(dateStr);

            currentWeek.push(dayData || { date: dateStr, value: 0 });

            if (currentWeek.length === 7) {
                weeksArray.push(currentWeek);
                currentWeek = [];
            }
        }

        // Add remaining days
        if (currentWeek.length > 0) {
            while (currentWeek.length < 7) {
                currentWeek.push(null);
            }
            weeksArray.push(currentWeek);
        }

        return weeksArray;
    }, [data, months]);

    const getColorClass = (value: number) => {
        if (value === 0) return colorScale[0];
        const index = Math.min(
            Math.ceil(value * (colorScale.length - 1)),
            colorScale.length - 1
        );
        return colorScale[index];
    };

    return (
        <div className={`${className}`}>
            <h4 className="text-sm font-medium text-muted-foreground mb-3">{title}</h4>

            <div className="flex gap-0.5">
                {/* Day labels */}
                <div className="flex flex-col gap-0.5 mr-1 text-[9px] text-muted-foreground">
                    <span className="h-3"></span>
                    <span className="h-3 flex items-center">M</span>
                    <span className="h-3"></span>
                    <span className="h-3 flex items-center">W</span>
                    <span className="h-3"></span>
                    <span className="h-3 flex items-center">F</span>
                    <span className="h-3"></span>
                </div>

                {/* Weeks */}
                <div className="flex gap-0.5 overflow-x-auto">
                    {weeks.map((week, weekIndex) => (
                        <div key={weekIndex} className="flex flex-col gap-0.5">
                            {week.map((day, dayIndex) => (
                                <motion.div
                                    key={dayIndex}
                                    initial={{ opacity: 0, scale: 0 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: weekIndex * 0.02 + dayIndex * 0.01 }}
                                    className={`w-3 h-3 rounded-sm ${day === null
                                            ? "invisible"
                                            : getColorClass(day.value)
                                        }`}
                                    title={day ? `${format(new Date(day.date), "MMM d")}: ${day.label || (day.value > 0 ? "Active" : "No data")}` : ""}
                                />
                            ))}
                        </div>
                    ))}
                </div>
            </div>

            {/* Legend */}
            <div className="flex items-center justify-end gap-1 mt-2 text-[10px] text-muted-foreground">
                <span>Less</span>
                {colorScale.map((color, i) => (
                    <div key={i} className={`w-3 h-3 rounded-sm ${color}`} />
                ))}
                <span>More</span>
            </div>
        </div>
    );
}

// Preset for workout intensity
export function WorkoutHeatmap({ data, className }: { data: HeatmapData[]; className?: string }) {
    return (
        <HeatmapCalendar
            data={data}
            title="Workout Intensity"
            colorScale={WORKOUT_COLORS}
            className={className}
        />
    );
}

// Preset for sleep quality
export function SleepHeatmap({ data, className }: { data: HeatmapData[]; className?: string }) {
    return (
        <HeatmapCalendar
            data={data}
            title="Sleep Quality"
            colorScale={SLEEP_COLORS}
            className={className}
        />
    );
}
