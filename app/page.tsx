"use client";

import { useState, useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { format, startOfDay, endOfDay } from "date-fns";
import LogEntry from "../components/LogEntry";
import LogList from "../components/LogList";
import dynamic from "next/dynamic";
import DateSelector from "../components/DateSelector";
import SmartSuggestions from "../components/SmartSuggestions";
import Insights from "../components/Insights";


import OfflineIndicator from "../components/OfflineIndicator";
import StreakCounter from "../components/StreakCounter";
import DailyProgress from "../components/DailyProgress";

const StatsOverview = dynamic(() => import("../components/StatsOverview"), {
  loading: () => (
    <div className="grid grid-cols-3 gap-4 mb-8">
      {[1, 2, 3].map((i) => (
        <div key={i} className="p-4 rounded-2xl bg-card border border-border/50 shadow-sm flex flex-col items-center justify-center text-center h-[106px] animate-pulse bg-muted/20" />
      ))}
    </div>
  ),
  ssr: false
});

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

export default function Home() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setTimeout(() => setIsMounted(true), 0);
  }, []);

  if (!isMounted) {
    return null;
  }

  return (
    <div className="flex flex-col h-full bg-background">
      <div className="flex-1 overflow-y-auto pb-24 sm:pb-8">
        <div className="container max-w-md mx-auto p-4 space-y-6">
          <header className="flex items-center justify-between py-2">
            <h1 className="text-2xl font-bold tracking-tight">Vital</h1>
            <div className="flex items-center gap-2">
              <DailyProgress selectedDate={selectedDate} />
              <StreakCounter />
              <OfflineIndicator />
            </div>
          </header>

          <DateSelector selectedDate={selectedDate} onDateChange={setSelectedDate} />
          <SmartSuggestions />
          <Insights />

          <StatsOverview selectedDate={selectedDate} />

          <LogEntry selectedDate={selectedDate} />

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">History</h2>
              <span className="text-xs text-muted-foreground">
                {format(selectedDate, "MMMM d, yyyy")}
              </span>
            </div>
            <LogList selectedDate={selectedDate} />
          </div>
        </div>
      </div>
      <PrefetchDays date={selectedDate} />
    </div>
  );
}
