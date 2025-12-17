"use client";

import { useState } from "react";
import { format } from "date-fns";
import LogEntry from "./LogEntry";
import LogList from "./LogList";
import dynamic from "next/dynamic";
import TodaySummary from "./TodaySummary";
import StreakBadge from "./StreakBadge";
import { TipOfTheDay } from "./TipOfTheDay";
import { QuickAddRow } from "./QuickAddRow";
import { AchievementBadges } from "./AchievementBadges";
import { Doc } from "../convex/_generated/dataModel";
import { motion, AnimatePresence } from "framer-motion";

const WeeklyDigest = dynamic(() => import("./insights/WeeklyDigest"), { ssr: false });
const SmartReminders = dynamic(() => import("./SmartReminders"), { ssr: false });
const SleepDebt = dynamic(() => import("./SleepDebt"), { ssr: false });

// Dashboard data type (from consolidated query)
interface DashboardData {
    goals: { goalWater: number; goalSleep: number; goalExercise: number; goalMeals: number };
    todayTotals: { water: number; sleep: number; exercise: number; meals: number };
    sparklineData: { water: number[]; sleep: number[]; exercise: number[]; meals: number[] };
    comparison: { water: number | null; sleep: number | null; exercise: number | null; meals: number | null };
    streak: { current: number; todayLogged: boolean };
    todayLogIds: string[];
}

interface DailyDashboardProps {
    selectedDate: Date;
    activeTracker: string | null;
    editingLog: Doc<"logs"> | null;
    onTrackerChange: (trackerId: string | null) => void;
    onEdit: (log: Doc<"logs">) => void;
    // OPTIMIZED: Accept pre-fetched dashboard data
    dashboardData?: DashboardData | null;
}

/**
 * Section header component for consistent styling
 */
function SectionHeader({ title, subtitle }: { title: string; subtitle?: string }) {
    return (
        <div className="mb-4">
            <h2 className="text-lg font-bold tracking-tight">{title}</h2>
            {subtitle && (
                <p className="text-sm text-muted-foreground mt-0.5">{subtitle}</p>
            )}
        </div>
    );
}

export default function DailyDashboard({
    selectedDate,
    activeTracker,
    editingLog,
    onTrackerChange,
    onEdit,
    dashboardData
}: DailyDashboardProps) {
    // Check if tip was dismissed today
    const today = new Date().toDateString();
    const [showTip, setShowTip] = useState(() => {
        if (typeof window === 'undefined') return true;
        return localStorage.getItem('tipDismissedDate') !== today;
    });

    const handleDismissTip = () => {
        setShowTip(false);
        localStorage.setItem('tipDismissedDate', today);
    };

    return (
        <div className="space-y-6">
            {/* Tip of the Day - Nike Training Club style */}
            <AnimatePresence>
                {showTip && (
                    <TipOfTheDay onDismiss={handleDismissTip} />
                )}
            </AnimatePresence>

            {/* Quick Add Row - Apple Fitness+ style (uses dashboardData for goal checking) */}
            <QuickAddRow
                selectedDate={selectedDate}
                onTrackerOpen={onTrackerChange}
                dashboardData={dashboardData}
            />

            {/* Achievement Badges - Zero app style (uses dashboardData for streak) */}
            <AchievementBadges streakCount={dashboardData?.streak?.current} />

            {/* Summary Stats - Full Width (uses dashboardData directly) */}
            <section aria-label="Today's progress">
                <TodaySummary
                    selectedDate={selectedDate}
                    onQuickAdd={onTrackerChange}
                    dashboardData={dashboardData ?? undefined}
                />
            </section>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">

                {/* Left Column: Log Activity + Insights */}
                <section className="lg:col-span-4 space-y-6" aria-label="Log activity">
                    <div>
                        <SectionHeader title="Log Activity" />
                        <LogEntry
                            selectedDate={selectedDate}
                            activeTracker={activeTracker}
                            onTrackerChange={onTrackerChange}
                            editingLog={editingLog}
                        />
                    </div>

                    {/* Insights Section */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="space-y-3"
                    >
                        <StreakBadge streakCount={dashboardData?.streak?.current} />
                        <SmartReminders selectedDate={selectedDate} />
                        <SleepDebt />
                        <WeeklyDigest />
                    </motion.div>
                </section>

                {/* Right Column: History */}
                <section
                    className="lg:col-span-8 flex flex-col min-h-0 lg:min-h-[500px]"
                    aria-label="Activity history"
                >
                    <SectionHeader
                        title="History"
                        subtitle={format(selectedDate, "EEEE, MMMM d, yyyy")}
                    />
                    <div className="flex-1 overflow-y-auto min-h-0 -mr-1 pr-1">
                        <LogList selectedDate={selectedDate} onEdit={onEdit} />
                    </div>
                </section>
            </div>
        </div>
    );
}
