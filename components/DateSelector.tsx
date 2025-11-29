"use client";

import { useState, useEffect, useRef } from "react";
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
    const [dates, setDates] = useState<Date[]>([]);
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
    useEffect(() => {
        const newDates = [];
        for (let i = -3; i <= 3; i++) {
            newDates.push(addDays(selectedDate, i));
        }
        setDates(newDates);
    }, [selectedDate]);

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
        <div className="w-full mb-6">
            <div className="flex items-center justify-between mb-4 px-1">
                <h2 className="text-xl font-semibold">
                    {isToday(selectedDate) ? "Today" : format(selectedDate, "MMMM d, yyyy")}
                </h2>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => onDateChange(new Date())}
                        className={`text - xs font - medium px - 3 py - 1.5 rounded - full transition - colors ${isToday(selectedDate)
                            ? "bg-primary text-primary-foreground"
                            : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                            } `}
                    >
                        Today
                    </button>
                    <div className="relative">
                        <input
                            type="date"
                            className="absolute inset-0 opacity-0 cursor-pointer"
                            onChange={(e) => {
                                if (e.target.valueAsDate) {
                                    // Fix timezone offset issue with valueAsDate
                                    const date = new Date(e.target.value + 'T00:00:00');
                                    onDateChange(date);
                                }
                            }}
                        />
                        <button className="p-2 rounded-full bg-secondary hover:bg-secondary/80 transition-colors">
                            <CalendarIcon className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>

            <div className="relative group">
                <button
                    onClick={handlePrevDay}
                    className="absolute left-0 top-1/2 -translate-y-1/2 z-10 p-1 rounded-full bg-background/80 backdrop-blur-sm shadow-sm border border-border/50 opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-0"
                >
                    <ChevronLeft className="w-5 h-5" />
                </button>

                <div
                    ref={scrollRef}
                    className="flex justify-between items-center gap-2 overflow-x-auto no-scrollbar py-2 px-1"
                >
                    {dates.map((date) => {
                        const isSelected = isSameDay(date, selectedDate);
                        const isCurrentDay = isToday(date);
                        const hasStreak = streakDates.has(startOfDay(date).toISOString());

                        return (
                            <motion.button
                                key={date.toISOString()}
                                onClick={() => handleDateClick(date)}
                                layout
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className={`flex flex - col items - center justify - center min - w - [3.5rem] h - 16 rounded - 2xl transition - all relative ${isSelected
                                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25 scale-105"
                                    : "bg-card text-card-foreground hover:bg-secondary border border-border/50"
                                    } `}
                            >
                                <span className={`text - xs font - medium ${isSelected ? "text-primary-foreground/80" : "text-muted"} `}>
                                    {format(date, "EEE")}
                                </span>
                                <span className={`text - lg font - bold ${isSelected ? "text-primary-foreground" : ""} `}>
                                    {format(date, "d")}
                                </span>

                                {/* Streak Dot */}
                                {hasStreak && !isSelected && (
                                    <div className="absolute bottom-2 w-1 h-1 rounded-full bg-primary/50" />
                                )}
                                {hasStreak && isSelected && (
                                    <div className="absolute bottom-2 w-1 h-1 rounded-full bg-white/50" />
                                )}

                            </motion.button>
                        );
                    })}
                </div>

                <button
                    onClick={handleNextDay}
                    className="absolute right-0 top-1/2 -translate-y-1/2 z-10 p-1 rounded-full bg-background/80 backdrop-blur-sm shadow-sm border border-border/50 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                    <ChevronRight className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
}
