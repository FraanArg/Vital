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
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:h-[calc(100vh-240px)] lg:min-h-[500px]">
            {/* Left Column: Rings + Weekly Insights (4 cols) */}
            <div className="lg:col-span-4 flex flex-col gap-3">
                <DailySummary selectedDate={selectedDate} compact />
                <div className="hidden lg:block flex-1">
                    <WeeklyDigest />
                </div>
            </div>

            {/* Center Column: Log Activity (4 cols) */}
            <div className="lg:col-span-4 flex flex-col">
                <div className="lg:hidden mb-4">
                    <WeeklyDigest />
                </div>
                <h3 className="text-sm font-semibold tracking-tight mb-3 text-muted-foreground">Log Activity</h3>
                <LogEntry
                    selectedDate={selectedDate}
                    activeTracker={activeTracker}
                    onTrackerChange={onTrackerChange}
                    editingLog={editingLog}
                />
            </div>

            {/* Right Column: History (4 cols) - fills height */}
            <div className="lg:col-span-4 flex flex-col min-h-0">
                <div className="flex items-center justify-between mb-2 shrink-0">
                    <h2 className="text-sm font-semibold text-muted-foreground">History</h2>
                    <span className="text-xs text-muted-foreground">
                        {format(selectedDate, "MMM d, yyyy")}
                    </span>
                </div>
                <div className="flex-1 overflow-y-auto min-h-0 -mr-1 pr-1">
                    <LogList selectedDate={selectedDate} onEdit={onEdit} />
                </div>
            </div>
        </div>
    );
}
