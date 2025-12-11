"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { ChevronLeft, ChevronRight, Utensils, Droplets, Dumbbell, Moon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { Skeleton } from "./ui/Skeleton";

const LEVEL_COLORS = [
    "bg-muted",
    "bg-emerald-200 dark:bg-emerald-900/50",
    "bg-emerald-400 dark:bg-emerald-700",
    "bg-emerald-500 dark:bg-emerald-500",
    "bg-emerald-600 dark:bg-emerald-400",
];

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

interface DayData {
    date: string;
    day: number;
    completeness: number;
    level: number;
    hasData: boolean;
    meals: number;
    water: number;
    sleep: number | null;
    exercise: boolean;
    exerciseType: string | null;
    mood: number | null;
}

// Skeleton loader for the calendar
function CalendarSkeleton() {
    return (
        <div className="bg-card rounded-2xl border border-border/50 p-5 shadow-sm animate-pulse">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <Skeleton className="h-7 w-40" />
                <div className="flex items-center gap-1">
                    <Skeleton className="w-9 h-9 rounded-xl" />
                    <Skeleton className="w-16 h-9 rounded-xl" />
                    <Skeleton className="w-9 h-9 rounded-xl" />
                </div>
            </div>

            {/* Weekday headers */}
            <div className="grid grid-cols-7 gap-1 mb-2">
                {WEEKDAYS.map((_, i) => (
                    <Skeleton key={i} className="h-6 w-full rounded" />
                ))}
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-1.5">
                {Array.from({ length: 35 }).map((_, i) => (
                    <Skeleton key={i} className="aspect-square rounded-xl" />
                ))}
            </div>

            {/* Legend */}
            <div className="flex items-center justify-between mt-6 pt-4 border-t border-border/50">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-48" />
            </div>
        </div>
    );
}

export default function CalendarView() {
    const router = useRouter();
    const [monthOffset, setMonthOffset] = useState(0);
    const [selectedDay, setSelectedDay] = useState<DayData | null>(null);

    const now = new Date();
    const targetMonth = new Date(now.getFullYear(), now.getMonth() + monthOffset, 1);

    const data = useQuery(api.stats.getMonthCompleteness, {
        month: targetMonth.getMonth(),
        year: targetMonth.getFullYear()
    });

    const monthName = targetMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" });

    // Get the day of week the month starts on (0 = Sunday)
    const firstDayOfWeek = new Date(targetMonth.getFullYear(), targetMonth.getMonth(), 1).getDay();
    // Adjust for Monday start
    const startPadding = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;

    // Check if a day is today
    const isToday = (dateStr: string) => {
        const today = new Date();
        return dateStr === today.toISOString().split('T')[0];
    };

    // Check if a day is in the future
    const isFuture = (dateStr: string) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return new Date(dateStr) > today;
    };

    const handleDayClick = (day: DayData) => {
        if (isFuture(day.date)) return;

        if (selectedDay?.date === day.date) {
            // Navigate to that day
            router.push(`/?date=${day.date}`);
        } else {
            setSelectedDay(day);
        }
    };

    // Show skeleton while loading
    if (!data) {
        return <CalendarSkeleton />;
    }

    return (
        <div className="bg-card rounded-2xl border border-border/50 p-5 shadow-sm">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold capitalize">{monthName}</h2>
                <div className="flex items-center gap-1">
                    <button
                        onClick={() => { setMonthOffset(m => m - 1); setSelectedDay(null); }}
                        className="p-2 hover:bg-secondary rounded-xl transition-colors"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                        onClick={() => { setMonthOffset(0); setSelectedDay(null); }}
                        className="px-3 py-1.5 text-sm font-medium hover:bg-secondary rounded-xl transition-colors"
                    >
                        Today
                    </button>
                    <button
                        onClick={() => { setMonthOffset(m => Math.min(m + 1, 0)); setSelectedDay(null); }}
                        disabled={monthOffset >= 0}
                        className="p-2 hover:bg-secondary rounded-xl transition-colors disabled:opacity-30"
                    >
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Weekday headers */}
            <div className="grid grid-cols-7 gap-1 mb-2">
                {WEEKDAYS.map((day, i) => (
                    <div key={i} className="text-center text-xs font-medium text-muted-foreground py-2">
                        {day}
                    </div>
                ))}
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-1.5">
                {/* Empty cells for padding */}
                {Array.from({ length: startPadding }).map((_, i) => (
                    <div key={`empty-${i}`} className="aspect-square" />
                ))}

                {/* Day cells */}
                {data.map((day) => {
                    const isSelected = selectedDay?.date === day.date;
                    const dayIsToday = isToday(day.date);
                    const dayIsFuture = isFuture(day.date);

                    return (
                        <motion.button
                            key={day.date}
                            onClick={() => handleDayClick(day)}
                            disabled={dayIsFuture}
                            whileHover={!dayIsFuture ? { scale: 1.1 } : undefined}
                            whileTap={!dayIsFuture ? { scale: 0.95 } : undefined}
                            className={`
                                aspect-square rounded-xl flex flex-col items-center justify-center relative
                                transition-all duration-200
                                ${LEVEL_COLORS[day.level]}
                                ${dayIsToday ? "ring-2 ring-primary ring-offset-2 ring-offset-background" : ""}
                                ${isSelected ? "ring-2 ring-foreground/50" : ""}
                                ${dayIsFuture ? "opacity-30 cursor-not-allowed" : "cursor-pointer hover:shadow-md"}
                            `}
                        >
                            <span className={`text-sm font-medium ${day.level >= 3 ? "text-white" : ""}`}>
                                {day.day}
                            </span>
                            {day.hasData && (
                                <div className="flex gap-0.5 mt-0.5">
                                    {day.meals > 0 && <div className="w-1 h-1 rounded-full bg-orange-500" />}
                                    {day.water > 0 && <div className="w-1 h-1 rounded-full bg-blue-500" />}
                                    {day.exercise && <div className="w-1 h-1 rounded-full bg-green-600" />}
                                </div>
                            )}
                        </motion.button>
                    );
                })}
            </div>

            {/* Legend */}
            <div className="flex items-center justify-between mt-6 pt-4 border-t border-border/50">
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <span>Less</span>
                    {LEVEL_COLORS.map((color, i) => (
                        <div key={i} className={`w-4 h-4 rounded ${color}`} />
                    ))}
                    <span>More</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full bg-orange-500" />
                        <span>Meals</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full bg-blue-500" />
                        <span>Water</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full bg-green-600" />
                        <span>Exercise</span>
                    </div>
                </div>
            </div>

            {/* Selected Day Detail */}
            <AnimatePresence>
                {selectedDay && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="mt-4 p-4 rounded-xl bg-muted/50 border border-border/50">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="font-semibold">
                                    {new Date(selectedDay.date).toLocaleDateString("en-US", {
                                        weekday: "long",
                                        day: "numeric",
                                        month: "long"
                                    })}
                                </h3>
                                <div className="flex items-center gap-2">
                                    <span className={`text-sm font-bold px-2 py-0.5 rounded ${selectedDay.completeness >= 80 ? "bg-emerald-500/20 text-emerald-600" :
                                        selectedDay.completeness >= 50 ? "bg-yellow-500/20 text-yellow-600" :
                                            "bg-muted text-muted-foreground"
                                        }`}>
                                        {selectedDay.completeness}%
                                    </span>
                                </div>
                            </div>

                            {selectedDay.hasData ? (
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                    <div className="flex items-center gap-2 p-2 rounded-lg bg-background">
                                        <Utensils className="w-4 h-4 text-orange-500" />
                                        <span className="text-sm">{selectedDay.meals} meals</span>
                                    </div>
                                    <div className="flex items-center gap-2 p-2 rounded-lg bg-background">
                                        <Droplets className="w-4 h-4 text-blue-500" />
                                        <span className="text-sm">{selectedDay.water.toFixed(1)}L water</span>
                                    </div>
                                    <div className="flex items-center gap-2 p-2 rounded-lg bg-background">
                                        <Moon className="w-4 h-4 text-indigo-500" />
                                        <span className="text-sm">
                                            {selectedDay.sleep ? `${selectedDay.sleep}h sleep` : "Not logged"}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 p-2 rounded-lg bg-background">
                                        <Dumbbell className="w-4 h-4 text-green-500" />
                                        <span className="text-sm">
                                            {selectedDay.exercise ? (selectedDay.exerciseType || "Exercise") : "No exercise"}
                                        </span>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-sm text-muted-foreground text-center py-4">
                                    No logs for this day
                                </p>
                            )}

                            <button
                                onClick={() => router.push(`/?date=${selectedDay.date}`)}
                                className="w-full mt-3 p-2 text-sm font-medium text-primary hover:bg-primary/10 rounded-lg transition-colors"
                            >
                                View this day →
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
