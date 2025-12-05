"use client";

import { useRef } from "react";
import { format, addDays, subDays, isSameDay, startOfDay, endOfDay } from "date-fns";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";
import { motion } from "framer-motion";
import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";

interface DateSelectorProps {
    selectedDate: Date;
    onDateChange: (date: Date) => void;
}

export default function DateSelector({ selectedDate, onDateChange }: DateSelectorProps) {
    const scrollRef = useRef<HTMLDivElement>(null);

    // Generate a sliding window of dates centered around the selected date
    const dates = [];
    for (let i = -3; i <= 3; i++) {
        dates.push(addDays(selectedDate, i));
    }

    // Fetch stats for the visible range
    const start = startOfDay(dates[0]).toISOString();
    const end = endOfDay(dates[dates.length - 1]).toISOString();

    const logs = useQuery(api.logs.getStats, { from: start, to: end });

    // Helper to get completion status for a day
    const getDayStatus = (date: Date) => {
        if (!logs) return { score: 0, color: "bg-secondary" };

        const dayLogs = logs.filter(l => isSameDay(new Date(l.date), date));
        if (dayLogs.length === 0) return { score: 0, color: "bg-secondary" };

        // Simple scoring based on goals met
        const waterGoal = 2.0;
        const sleepGoal = 7.0;
        const workoutGoal = 1;

        const water = dayLogs.reduce((acc, l) => acc + (l.water || 0), 0);
        const sleep = dayLogs.reduce((acc, l) => acc + (l.sleep || 0), 0);
        const workout = dayLogs.some(l => l.exercise);

        let goalsMet = 0;
        if (water >= waterGoal) goalsMet++;
        if (sleep >= sleepGoal) goalsMet++;
        if (workout) goalsMet++;

        const score = goalsMet / 3;

        let color = "bg-secondary";
        if (score === 1) color = "bg-green-500";
        else if (score > 0.6) color = "bg-yellow-500";
        else if (score > 0) color = "bg-orange-500";

        return { score, color };
    };

    const handlePrevDay = () => {
        onDateChange(subDays(selectedDate, 1));
    };

    const handleNextDay = () => {
        onDateChange(addDays(selectedDate, 1));
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

        if (isLeftSwipe) {
            handleNextDay();
        } else if (isRightSwipe) {
            handlePrevDay();
        }
    };

    return (
        <div
            className="w-full mb-8 touch-pan-y"
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
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
                    onClick={handlePrevDay}
                    aria-label="Previous day"
                    className="absolute -left-2 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-background/80 backdrop-blur-sm shadow-sm border border-border/50 opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-0 hover:bg-secondary"
                >
                    <ChevronLeft className="w-5 h-5" />
                </button>

                <div
                    ref={scrollRef}
                    className="flex justify-between items-center gap-3 overflow-x-auto no-scrollbar py-2 px-1"
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
                                className={`flex flex-col justify-center px-4 min-w-[100px] flex-1 w-full h-24 rounded-[32px] transition-all relative border ${isSelected
                                    ? "bg-primary text-primary-foreground border-primary shadow-md"
                                    : "bg-card text-card-foreground hover:bg-secondary border-border/50"
                                    }`}
                            >
                                <div className="w-full flex items-center justify-between mb-1">
                                    <span className={`text-xs font-black uppercase tracking-widest ${isSelected ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
                                        {format(date, "EEE")}
                                    </span>
                                    <span className={`text-2xl md:text-4xl font-thin ${isSelected ? "text-primary-foreground" : ""}`}>
                                        {format(date, "d")}
                                    </span>
                                </div>

                                {/* Progress Bar */}
                                <div className="w-full h-1.5 bg-black/10 dark:bg-white/10 rounded-full overflow-hidden mt-2">
                                    <motion.div
                                        className={`h-full ${status.score > 0 ? status.color : 'bg-transparent'}`}
                                        initial={{ width: 0 }}
                                        animate={{ width: `${status.score * 100}%` }}
                                    />
                                </div>
                            </motion.button>
                        );
                    })}
                </div>

                <button
                    onClick={handleNextDay}
                    aria-label="Next day"
                    className="absolute -right-2 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-background/80 backdrop-blur-sm shadow-sm border border-border/50 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-secondary"
                >
                    <ChevronRight className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
}
