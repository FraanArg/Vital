"use client";

import { format } from "date-fns";
import LogEntry from "./LogEntry";
import LogList from "./LogList";
import dynamic from "next/dynamic";
import DailySummary from "./DailySummary";
import { Doc } from "../convex/_generated/dataModel";

const WeeklyDigest = dynamic(() => import("./insights/WeeklyDigest"), { ssr: false });

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
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6">
            {/* Left Column: Overview (3 cols) */}
            <div className="lg:col-span-3 space-y-4">
                <DailySummary selectedDate={selectedDate} />
            </div>

            {/* Center Column: Insights + Activity (6 cols) */}
            <div className="lg:col-span-6 space-y-4">
                <WeeklyDigest />
                <div>
                    <h3 className="text-lg font-bold tracking-tight mb-3 px-1">Log Activity</h3>
                    <LogEntry
                        selectedDate={selectedDate}
                        activeTracker={activeTracker}
                        onTrackerChange={onTrackerChange}
                        editingLog={editingLog}
                    />
                </div>
            </div>

            {/* Right Column: History (3 cols) */}
            <div className="lg:col-span-3">
                <div className="flex items-center justify-between mb-3">
                    <h2 className="text-lg font-semibold">History</h2>
                    <span className="text-xs text-muted-foreground">
                        {format(selectedDate, "MMMM d, yyyy")}
                    </span>
                </div>
                <LogList selectedDate={selectedDate} onEdit={onEdit} />
            </div>
        </div>
    );
}

