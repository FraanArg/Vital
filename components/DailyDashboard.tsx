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
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6 lg:h-[calc(100vh-280px)] lg:min-h-[400px]">
            {/* Left Column: Overview (3 cols) */}
            <div className="lg:col-span-3 flex flex-col">
                <DailySummary selectedDate={selectedDate} />
            </div>

            {/* Center Column: Insights + Activity (6 cols) */}
            <div className="lg:col-span-6 flex flex-col gap-4">
                <WeeklyDigest />
                <div>
                    <h3 className="text-sm font-semibold tracking-tight mb-2 px-1 text-muted-foreground">Log Activity</h3>
                    <LogEntry
                        selectedDate={selectedDate}
                        activeTracker={activeTracker}
                        onTrackerChange={onTrackerChange}
                        editingLog={editingLog}
                    />
                </div>
            </div>

            {/* Right Column: History (3 cols) - scrollable */}
            <div className="lg:col-span-3 flex flex-col min-h-0">
                <div className="flex items-center justify-between mb-3 shrink-0">
                    <h2 className="text-lg font-semibold">History</h2>
                    <span className="text-xs text-muted-foreground">
                        {format(selectedDate, "MMMM d, yyyy")}
                    </span>
                </div>
                <div className="flex-1 overflow-y-auto min-h-0 -mr-2 pr-2">
                    <LogList selectedDate={selectedDate} onEdit={onEdit} />
                </div>
            </div>
        </div>
    );
}
