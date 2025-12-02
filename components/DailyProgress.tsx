"use client";

import { motion } from "framer-motion";
import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { startOfDay, endOfDay } from "date-fns";

interface DailyProgressProps {
    selectedDate: Date;
}

export default function DailyProgress({ selectedDate }: DailyProgressProps) {
    const start = startOfDay(selectedDate).toISOString();
    const end = endOfDay(selectedDate).toISOString();

    const logs = useQuery(api.logs.getLogs, { from: start, to: end });

    if (!logs) return null;

    // Calculate progress
    const waterGoal = 2.0; // Liters
    const sleepGoal = 7.0; // Hours
    const workoutGoal = 1; // Count
    const moodGoal = 1; // Count (just logging it)
    const foodGoal = 3; // Count (3 meals)

    const waterCurrent = logs.reduce((acc, l) => acc + (l.water || 0), 0);
    const sleepCurrent = logs.reduce((acc, l) => acc + (l.sleep || 0), 0);
    const workoutCurrent = logs.filter(l => l.exercise).length;
    const moodCurrent = logs.filter(l => l.mood).length;
    const foodCurrent = logs.filter(l => l.meal || l.food).length;

    const totalGoals = 5;
    let completedGoals = 0;
    if (waterCurrent >= waterGoal) completedGoals++;
    if (sleepCurrent >= sleepGoal) completedGoals++;
    if (workoutCurrent >= workoutGoal) completedGoals++;
    if (moodCurrent >= moodGoal) completedGoals++;
    if (foodCurrent >= foodGoal) completedGoals++;

    const progress = completedGoals / totalGoals;

    return (
        <div className="relative w-12 h-12 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                {/* Background Circle */}
                <path
                    className="text-secondary"
                    d="M18 2.0845
                        a 15.9155 15.9155 0 0 1 0 31.831
                        a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="4"
                    strokeLinecap="round"
                />
                {/* Progress Circle */}
                <motion.path
                    className="text-primary drop-shadow-sm"
                    d="M18 2.0845
                        a 15.9155 15.9155 0 0 1 0 31.831
                        a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeDasharray={`${progress * 100}, 100`}
                    initial={{ strokeDasharray: "0, 100" }}
                    animate={{ strokeDasharray: `${progress * 100}, 100` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold">
                {Math.round(progress * 100)}%
            </div>
        </div>
    );
}
