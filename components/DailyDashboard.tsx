"use client";

import { format } from "date-fns";
import LogEntry from "./LogEntry";
import LogList from "./LogList";
import dynamic from "next/dynamic";
import SmartSuggestions from "./SmartSuggestions";
import DailySummary from "./DailySummary";
import WeeklyOverview from "./WeeklyOverview";
import { Doc } from "../convex/_generated/dataModel";

const Insights = dynamic(() => import("./Insights"), { ssr: false });

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
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Column: Overview (3 cols) */}
            <div className="lg:col-span-3 space-y-6">
                <DailySummary selectedDate={selectedDate} />
                <WeeklyOverview selectedDate={selectedDate} />
                <Insights />
            </div>

            {/* Center Column: Action (6 cols) */}
            <div className="lg:col-span-6 space-y-6">
                <h3 className="text-xl font-black tracking-tight mb-4 px-2">Log Activity</h3>
                <LogEntry
                    selectedDate={selectedDate}
                    activeTracker={activeTracker}
                    onTrackerChange={onTrackerChange}
                    editingLog={editingLog}
                />
                <SmartSuggestions />
            </div>

            {/* Right Column: History (3 cols) */}
            <div className="lg:col-span-3 space-y-6">
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold">History</h2>
                        <span className="text-xs text-muted-foreground">
                            {format(selectedDate, "MMMM d, yyyy")}
                        </span>
                    </div>
                    <LogList selectedDate={selectedDate} onEdit={onEdit} />
                </div>
            </div>
        </div>
    );
}
