"use client";

import { motion } from "framer-motion";

interface DailyProgressProps {
    selectedDate: Date;
    // OPTIMIZED: Accept pre-fetched dashboard data instead of querying
    dashboardData?: {
        goals: { goalWater: number; goalSleep: number; goalExercise: number; goalMeals: number };
        todayTotals: { water: number; sleep: number; exercise: number; meals: number };
    } | null;
}

/**
 * Daily progress ring showing % of goals completed
 * 
 * OPTIMIZED: Now accepts dashboardData as prop instead of making its own query
 * This eliminates a redundant logs.getLogs query.
 */
export default function DailyProgress({ selectedDate, dashboardData }: DailyProgressProps) {
    if (!dashboardData) return null;

    const { goals, todayTotals } = dashboardData;

    // Calculate progress using actual goals
    const totalGoals = 4;
    let completedGoals = 0;
    if (todayTotals.water >= goals.goalWater) completedGoals++;
    if (todayTotals.sleep >= goals.goalSleep) completedGoals++;
    if (todayTotals.exercise >= goals.goalExercise) completedGoals++;
    if (todayTotals.meals >= goals.goalMeals) completedGoals++;

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
