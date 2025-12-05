"use client";

import { useState, useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { startOfDay, endOfDay } from "date-fns";
import DailyDashboard from "../components/DailyDashboard";
import WeeklyDashboard from "../components/WeeklyDashboard";
import { SegmentedControl } from "../components/ui/SegmentedControl";
import DailyProgress from "../components/DailyProgress";
import StreakCounter from "../components/StreakCounter";
import OfflineIndicator from "../components/OfflineIndicator";
import DateSelector from "../components/DateSelector";
import LiveActivity from "../components/LiveActivity";
import { TRACKERS } from "../lib/tracker-registry";
import { Doc } from "../convex/_generated/dataModel";

// Prefetch adjacent days
function PrefetchDays({ date }: { date: Date }) {
  const prev = new Date(date);
  prev.setDate(prev.getDate() - 1);
  const next = new Date(date);
  next.setDate(next.getDate() + 1);

  // We just call the hooks to prime the cache
  useQuery(api.logs.getLogs, { from: startOfDay(prev).toISOString(), to: endOfDay(prev).toISOString() });
  useQuery(api.logs.getLogs, { from: startOfDay(next).toISOString(), to: endOfDay(next).toISOString() });

  return null;
}



// ...

export default function Home() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isMounted, setIsMounted] = useState(false);
  const [activeTracker, setActiveTracker] = useState<string | null>(null);
  const [editingLog, setEditingLog] = useState<Doc<"logs"> | null>(null);
  const [viewMode, setViewMode] = useState<"daily" | "weekly">("daily");

  useEffect(() => {
    setTimeout(() => setIsMounted(true), 0);
  }, []);

  const handleEdit = (log: Doc<"logs">) => {
    const tracker = TRACKERS.find(t => t.matcher(log));
    if (tracker) {
      setEditingLog(log);
      setActiveTracker(tracker.id);
    }
  };

  const handleTrackerChange = (trackerId: string | null) => {
    setActiveTracker(trackerId);
    if (!trackerId) {
      setEditingLog(null);
    }
  };

  if (!isMounted) {
    return null;
  }

  return (
    <div className="flex flex-col h-full bg-background">
      <div className="flex-1 overflow-y-auto pb-24 sm:pb-8">
        <div className="w-full max-w-[1600px] mx-auto p-4 lg:p-8 space-y-6">
          <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 py-2 pt-safe">
            <div>
              <h1 className="text-2xl md:text-4xl font-black tracking-tighter">
                Good {new Date().getHours() < 12 ? "Morning" : new Date().getHours() < 18 ? "Afternoon" : "Evening"}, Friend
              </h1>
              <p className="text-muted-foreground text-sm">Ready to seize the day?</p>
            </div>
            <div className="flex items-center gap-4">
              <SegmentedControl
                options={["daily", "weekly"]}
                value={viewMode}
                onChange={setViewMode}
                labels={{ daily: "Daily", weekly: "Weekly" }}
              />
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.location.reload()}
                  className="p-2 rounded-full hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
                  aria-label="Refresh"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" /><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" /><path d="M16 21h5v-5" /></svg>
                </button>
                <DailyProgress selectedDate={selectedDate} />
                <StreakCounter />
                <OfflineIndicator />
              </div>
            </div>
          </header>

          <DateSelector selectedDate={selectedDate} onDateChange={setSelectedDate} />

          <LiveActivity />

          {viewMode === "daily" ? (
            <DailyDashboard
              selectedDate={selectedDate}
              activeTracker={activeTracker}
              editingLog={editingLog}
              onTrackerChange={handleTrackerChange}
              onEdit={handleEdit}
            />
          ) : (
            <WeeklyDashboard selectedDate={selectedDate} />
          )}
        </div>
      </div>
      <PrefetchDays date={selectedDate} />
    </div>
  );
}
