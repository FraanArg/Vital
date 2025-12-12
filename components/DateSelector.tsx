"use client";

import { useRef, useState, useMemo, memo } from "react";
import { format, addDays, addWeeks, subWeeks, isSameDay, startOfDay, endOfDay, startOfWeek } from "date-fns";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";

interface DateSelectorProps {
    selectedDate: Date;
    onDateChange: (date: Date) => void;
}

function DateSelector({ selectedDate, onDateChange }: DateSelectorProps) {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [slideDirection, setSlideDirection] = useState<"left" | "right" | null>(null);

    // Generate the current week (Monday to Sunday) based on selected date
    const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 }); // Monday
    const dates = [];
    for (let i = 0; i < 7; i++) {
        dates.push(addDays(weekStart, i));
    }

    // Fetch stats for the visible range
    const start = startOfDay(dates[0]).toISOString();
    const end = endOfDay(dates[dates.length - 1]).toISOString();

    const logs = useQuery(api.logs.getStats, { from: start, to: end });

    // Helper to get completion status for a day
    const getDayStatus = (date: Date) => {
        if (!logs) return { score: 0, color: "bg-secondary", activities: [], isComplete: false };

        const dayLogs = logs.filter(l => isSameDay(new Date(l.date), date));
        if (dayLogs.length === 0) return { score: 0, color: "bg-secondary", activities: [], isComplete: false };

        // Simple scoring based on goals met
        const waterGoal = 2.0;
        const sleepGoal = 7.0;

        const water = dayLogs.reduce((acc, l) => acc + (l.water || 0), 0);
        const sleep = dayLogs.reduce((acc, l) => acc + (l.sleep || 0), 0);
        const workout = dayLogs.some(l => l.exercise);
        const food = dayLogs.some(l => l.meal || l.food);

        let goalsMet = 0;
        if (water >= waterGoal) goalsMet++;
        if (sleep >= sleepGoal) goalsMet++;
        if (workout) goalsMet++;

        const score = goalsMet / 3;

        let color = "bg-secondary";
        if (score === 1) color = "bg-green-500";
        else if (score > 0.6) color = "bg-yellow-500";
        else if (score > 0) color = "bg-orange-500";

        // Track which activities were logged
        const activities: string[] = [];
        if (sleep > 0) activities.push("sleep");
        if (food) activities.push("food");
        if (workout) activities.push("exercise");
        if (water > 0) activities.push("water");

        return { score, color, activities, isComplete: score === 1 };
    };

    const handlePrevWeek = () => {
        setSlideDirection("right");
        onDateChange(subWeeks(selectedDate, 1));
        setTimeout(() => setSlideDirection(null), 300);
    };

    const handleNextWeek = () => {
        setSlideDirection("left");
        onDateChange(addWeeks(selectedDate, 1));
        setTimeout(() => setSlideDirection(null), 300);
    };

    const handleDateClick = (date: Date) => {
        onDateChange(date);
    };

    const isToday = (date: Date) => isSameDay(date, new Date());

    // Swipe Logic
    const touchStart = useRef<number | null>(null);
    const touchEnd = useRef<number | null>(null);

    const minSwipeDistance = 50;

    const onTouchStart = (e: React.TouchEvent) => {
        touchEnd.current = null;
        touchStart.current = e.targetTouches[0].clientX;
    };

    const onTouchMove = (e: React.TouchEvent) => {
        touchEnd.current = e.targetTouches[0].clientX;
    };

    const onTouchEnd = () => {
        if (!touchStart.current || !touchEnd.current) return;
        const distance = touchStart.current - touchEnd.current;
        const isLeftSwipe = distance > minSwipeDistance;
        const isRightSwipe = distance < -minSwipeDistance;

        // Navigate by week on swipe
        if (isLeftSwipe) {
            onDateChange(addWeeks(selectedDate, 1)); // Swipe left = next week
        } else if (isRightSwipe) {
            onDateChange(subWeeks(selectedDate, 1)); // Swipe right = previous week
        }
    };

    // Desktop wheel/trackpad horizontal scroll
    const wheelTimeout = useRef<NodeJS.Timeout | null>(null);
    const accumulatedDelta = useRef(0);

    const onWheel = (e: React.WheelEvent) => {
        // Handle horizontal scroll (deltaX) - prevent Safari back/forward
        if (Math.abs(e.deltaX) > Math.abs(e.deltaY) && Math.abs(e.deltaX) > 10) {
            e.preventDefault();
            e.stopPropagation();

            accumulatedDelta.current += e.deltaX;

            // Debounce to avoid multiple triggers
            if (wheelTimeout.current) {
                clearTimeout(wheelTimeout.current);
            }

            wheelTimeout.current = setTimeout(() => {
                if (accumulatedDelta.current > 50) {
                    handleNextWeek(); // Scroll right = next week
                } else if (accumulatedDelta.current < -50) {
                    handlePrevWeek(); // Scroll left = previous week
                }
                accumulatedDelta.current = 0;
            }, 100);
        }
    };

    return (
        <div
            className="w-full mb-8 touch-pan-y"
            style={{ overscrollBehaviorX: "contain" }}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
            onWheel={onWheel}
        >
            <div className="flex items-center justify-between mb-6 px-2">
                <h2 className="text-2xl md:text-4xl font-black tracking-tight">
                    {isToday(selectedDate) ? "Today" : format(selectedDate, "EEEE d")}
                    <span className="text-muted-foreground font-light ml-2 text-2xl">
                        {format(selectedDate, "MMMM yyyy")}
                    </span>
                </h2>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => onDateChange(new Date())}
                        aria-label="Go to today"
                        className={`text-sm font-bold px-4 py-2 rounded-full transition-all ${isToday(selectedDate)
                            ? "bg-primary text-primary-foreground shadow-md"
                            : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                            }`}
                    >
                        Today
                    </button>
                    <div className="relative">
                        <input
                            type="date"
                            aria-label="Select date"
                            className="absolute inset-0 opacity-0 cursor-pointer"
                            onChange={(e) => {
                                if (e.target.valueAsDate) {
                                    const date = new Date(e.target.value + 'T00:00:00');
                                    onDateChange(date);
                                }
                            }}
                        />
                        <button className="p-2 rounded-full bg-secondary hover:bg-secondary/80 transition-colors" aria-label="Open calendar">
                            <CalendarIcon className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>

            <div className="relative group">
                <button
                    onClick={handlePrevWeek}
                    aria-label="Previous week"
                    className="absolute -left-2 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-background/80 backdrop-blur-sm shadow-sm border border-border/50 opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-0 hover:bg-secondary"
                >
                    <ChevronLeft className="w-5 h-5" />
                </button>

                <AnimatePresence mode="wait" initial={false}>
                    <motion.div
                        key={weekStart.toISOString()}
                        ref={scrollRef}
                        initial={{ x: slideDirection === "left" ? 100 : slideDirection === "right" ? -100 : 0, opacity: 0.5 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: slideDirection === "left" ? -100 : 100, opacity: 0.5 }}
                        transition={{ duration: 0.25, ease: "easeOut" }}
                        className="flex gap-3 py-2 px-1"
                    >
                        {dates.map((date) => {
                            const isSelected = isSameDay(date, selectedDate);
                            const status = getDayStatus(date);

                            return (
                                <motion.button
                                    key={date.toISOString()}
                                    onClick={() => handleDateClick(date)}
                                    aria-label={`Select ${format(date, "MMMM do, yyyy")}`}
                                    aria-current={isSelected ? "date" : undefined}
                                    layout
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className={`flex flex-col justify-center px-4 min-w-[100px] flex-1 h-24 rounded-[32px] transition-all relative border ${isSelected
                                        ? "bg-primary text-primary-foreground border-primary shadow-md"
                                        : "bg-card text-card-foreground hover:bg-secondary border-border/50"
                                        }`}
                                >
                                    <div className="w-full flex items-center justify-between mb-1">
                                        <span className={`text-xs font-black uppercase tracking-widest ${isSelected ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
                                            {format(date, "EEE")}
                                        </span>
                                        <div className="flex items-center gap-1">
                                            {/* Streak fire for complete days */}
                                            {status.isComplete && (
                                                <span className="text-sm">🔥</span>
                                            )}
                                            <span className={`text-2xl md:text-4xl font-thin ${isSelected ? "text-primary-foreground" : ""}`}>
                                                {format(date, "d")}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Activity Dots */}
                                    <div className="flex items-center gap-1 mb-1">
                                        {status.activities.includes("sleep") && (
                                            <div className="w-1.5 h-1.5 rounded-full bg-purple-500" title="Sleep" />
                                        )}
                                        {status.activities.includes("food") && (
                                            <div className="w-1.5 h-1.5 rounded-full bg-orange-500" title="Food" />
                                        )}
                                        {status.activities.includes("exercise") && (
                                            <div className="w-1.5 h-1.5 rounded-full bg-red-500" title="Exercise" />
                                        )}
                                        {status.activities.includes("water") && (
                                            <div className="w-1.5 h-1.5 rounded-full bg-blue-500" title="Water" />
                                        )}
                                    </div>

                                    {/* Progress Bar */}
                                    <div className="w-full h-1.5 bg-black/10 dark:bg-white/10 rounded-full overflow-hidden">
                                        <motion.div
                                            className={`h-full ${status.score > 0 ? status.color : 'bg-transparent'}`}
                                            initial={{ width: 0 }}
                                            animate={{ width: `${status.score * 100}%` }}
                                        />
                                    </div>
                                </motion.button>
                            );
                        })}
                    </motion.div>
                </AnimatePresence>

                <button
                    onClick={handleNextWeek}
                    aria-label="Next week"
                    className="absolute -right-2 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-background/80 backdrop-blur-sm shadow-sm border border-border/50 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-secondary"
                >
                    <ChevronRight className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
}

export default memo(DateSelector);
