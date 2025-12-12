"use client";

import { format } from "date-fns";
import LogEntry from "./LogEntry";
import LogList from "./LogList";
import dynamic from "next/dynamic";
import TodaySummary from "./TodaySummary";
import StreakBadge from "./StreakBadge";
import { Doc } from "../convex/_generated/dataModel";

const WeeklyDigest = dynamic(() => import("./insights/WeeklyDigest"), { ssr: false });
const SmartReminders = dynamic(() => import("./SmartReminders"), { ssr: false });
const SleepDebt = dynamic(() => import("./SleepDebt"), { ssr: false });

interface DailyDashboardProps {
    selectedDate: Date;
    activeTracker: string | null;
    editingLog: Doc<"logs"> | null;
    onTrackerChange: (trackerId: string | null) => void;
    onEdit: (log: Doc<"logs">) => void;
}

export default function DailyDashboard({
    selectedDate,
    activeTracker,
    editingLog,
    onTrackerChange,
    onEdit
}: DailyDashboardProps) {
    return (
        <div className="space-y-6">
            {/* Mobile: Today Summary KPIs at top */}
            <section className="lg:hidden" aria-label="Today's progress">
                <TodaySummary selectedDate={selectedDate} onQuickAdd={onTrackerChange} />
            </section>

            {/* Main Grid: Responsive layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-4 lg:gap-6">

                {/* Left Column: Summary + Insights (Desktop only) */}
                <aside className="hidden lg:flex lg:col-span-3 flex-col gap-4" aria-label="Daily insights">
                    <TodaySummary selectedDate={selectedDate} onQuickAdd={onTrackerChange} />
                    <StreakBadge />
                    <SmartReminders />
                    <SleepDebt />
                    <WeeklyDigest />
                </aside>

                {/* Center Column: Log Activity */}
                <section className="md:col-span-1 lg:col-span-2" aria-label="Log activity">
                    <h3 className="text-xs font-semibold uppercase tracking-wider mb-3 text-muted-foreground">
                        Log Activity
                    </h3>
                    <LogEntry
                        selectedDate={selectedDate}
                        activeTracker={activeTracker}
                        onTrackerChange={onTrackerChange}
                        editingLog={editingLog}
                    />
                    {/* Mobile: Show insights below log entry */}
                    <div className="lg:hidden mt-4 space-y-4">
                        <SmartReminders />
                        <SleepDebt />
                        <WeeklyDigest />
                    </div>
                </section>

                {/* Right Column: History */}
                <section
                    className="md:col-span-1 lg:col-span-7 flex flex-col min-h-0 lg:h-[calc(100vh-280px)] lg:min-h-[400px]"
                    aria-label="Activity history"
                >
                    <div className="flex items-center justify-between mb-3 shrink-0">
                        <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            History
                        </h2>
                        <span className="text-xs text-muted-foreground tabular-nums">
                            {format(selectedDate, "MMM d, yyyy")}
                        </span>
                    </div>
                    <div className="flex-1 overflow-y-auto min-h-0 -mr-1 pr-1">
                        <LogList selectedDate={selectedDate} onEdit={onEdit} />
                    </div>
                </section>
            </div>
        </div>
    );
}
