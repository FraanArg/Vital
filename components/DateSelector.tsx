"use client";

import { useRef } from "react";
import { format, addDays, subDays, isSameDay, startOfDay } from "date-fns";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";
import { motion } from "framer-motion";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../lib/db";

interface DateSelectorProps {
    selectedDate: Date;
    onDateChange: (date: Date) => void;
}

export default function DateSelector({ selectedDate, onDateChange }: DateSelectorProps) {
    const scrollRef = useRef<HTMLDivElement>(null);

    // Query logs to find days with any activity (streaks)
    const streakLogs = useLiveQuery(async () => {
        const end = addDays(selectedDate, 4);
        const start = subDays(selectedDate, 4);
        return await db.logs
            .where('date')
            .between(start, end, true, true)
            .toArray();
    }, [selectedDate]);

    // Create a set of date strings for easy lookup
    const streakDates = new Set(
        streakLogs?.map(log => startOfDay(log.date).toISOString())
    );

    // Generate a sliding window of dates centered around the selected date
    const dates = [];
    for (let i = -3; i <= 3; i++) {
        dates.push(addDays(selectedDate, i));
    }

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

    return (
        <div className="w-full mb-8">
            <div className="flex items-center justify-between mb-6 px-2">
                <h2 className="text-2xl font-bold tracking-tight">
                    {isToday(selectedDate) ? "Today" : format(selectedDate, "MMMM d")}
                    <span className="text-muted-foreground font-normal ml-2 text-lg">
                        {format(selectedDate, "yyyy")}
                    </span>
                </h2>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => onDateChange(new Date())}
                        className={`text-sm font-medium px-4 py-2 rounded-full transition-all ${isToday(selectedDate)
                            ? "bg-primary text-primary-foreground shadow-md"
                            : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                            }`}
                    >
                        Today
                    </button>
                    <div className="relative">
                        <input
                            type="date"
                            className="absolute inset-0 opacity-0 cursor-pointer"
                            onChange={(e) => {
                                if (e.target.valueAsDate) {
                                    const date = new Date(e.target.value + 'T00:00:00');
                                    onDateChange(date);
                                }
                            }}
                        />
                        <button className="p-2 rounded-full bg-secondary hover:bg-secondary/80 transition-colors">
                            <CalendarIcon className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>

            <div className="relative group">
                <button
                    onClick={handlePrevDay}
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
                        const hasStreak = streakDates.has(startOfDay(date).toISOString());

                        return (
                            <motion.button
                                key={date.toISOString()}
                                onClick={() => handleDateClick(date)}
                                layout
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className={`flex flex-col items-center justify-center min-w-[4rem] h-20 rounded-2xl transition-all relative border ${isSelected
                                    ? "bg-primary text-primary-foreground border-primary shadow-md"
                                    : "bg-card text-card-foreground hover:bg-secondary border-border/50"
                                    }`}
                            >
                                <span className={`text-xs font-medium mb-1 ${isSelected ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
                                    {format(date, "EEE")}
                                </span>
                                <span className={`text-xl font-bold ${isSelected ? "text-primary-foreground" : ""}`}>
                                    {format(date, "d")}
                                </span>

                                {/* Streak Dot */}
                                {hasStreak && (
                                    <div className={`absolute bottom-2 w-1.5 h-1.5 rounded-full ${isSelected ? "bg-white" : "bg-primary"}`} />
                                )}
                            </motion.button>
                        );
                    })}
                </div>

                <button
                    onClick={handleNextDay}
                    className="absolute -right-2 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-background/80 backdrop-blur-sm shadow-sm border border-border/50 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-secondary"
                >
                    <ChevronRight className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
}
