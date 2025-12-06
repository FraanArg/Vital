"use client";

import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const LEVEL_COLORS = [
    "bg-secondary",
    "bg-green-200 dark:bg-green-900",
    "bg-green-400 dark:bg-green-700",
    "bg-green-500 dark:bg-green-500",
    "bg-green-600 dark:bg-green-400",
];

export default function ActivityCalendar() {
    const [monthOffset, setMonthOffset] = useState(0);

    const now = new Date();
    const targetMonth = new Date(now.getFullYear(), now.getMonth() + monthOffset, 1);

    const data = useQuery(api.stats.getActivityCalendar, {
        month: targetMonth.getMonth(),
        year: targetMonth.getFullYear()
    });

    if (!data) return null;

    const monthName = targetMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" });

    // Get the day of week the month starts on (0 = Sunday)
    const firstDayOfWeek = new Date(targetMonth.getFullYear(), targetMonth.getMonth(), 1).getDay();

    // Adjust for Monday start
    const startPadding = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;

    return (
        <div className="bg-card rounded-2xl border border-border/50 p-5">
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Activity Calendar</h3>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setMonthOffset(m => m - 1)}
                        className="p-1 hover:bg-secondary rounded-lg transition-colors"
                    >
                        <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span className="text-sm text-muted-foreground min-w-[120px] text-center">{monthName}</span>
                    <button
                        onClick={() => setMonthOffset(m => Math.min(m + 1, 0))}
                        disabled={monthOffset >= 0}
                        className="p-1 hover:bg-secondary rounded-lg transition-colors disabled:opacity-30"
                    >
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Day headers */}
            <div className="grid grid-cols-7 gap-1 mb-2">
                {["M", "T", "W", "T", "F", "S", "S"].map((day, i) => (
                    <div key={i} className="text-center text-xs text-muted-foreground">{day}</div>
                ))}
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-1">
                {/* Empty cells for padding */}
                {Array.from({ length: startPadding }).map((_, i) => (
                    <div key={`empty-${i}`} className="aspect-square" />
                ))}

                {/* Day cells */}
                {data.map((day) => (
                    <div
                        key={day.date}
                        className={`aspect-square rounded-md flex items-center justify-center text-xs ${LEVEL_COLORS[day.level]}`}
                        title={`${day.date}: Level ${day.level}`}
                    >
                        {day.day}
                    </div>
                ))}
            </div>

            {/* Legend */}
            <div className="flex items-center justify-end gap-1 mt-4 text-xs text-muted-foreground">
                <span>Less</span>
                {LEVEL_COLORS.map((color, i) => (
                    <div key={i} className={`w-3 h-3 rounded-sm ${color}`} />
                ))}
                <span>More</span>
            </div>
        </div>
    );
}
