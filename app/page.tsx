"use client";

import { useState } from "react";
import { ThemeToggle } from "../components/ThemeToggle";
import LogEntry from "../components/LogEntry";
import LogList from "../components/LogList";
import StatsOverview from "../components/StatsOverview";
import DateSelector from "../components/DateSelector";
import StatsCharts from "../components/StatsCharts";
import DataExport from "../components/DataExport";
import SmartSuggestions from "../components/SmartSuggestions";
import OfflineIndicator from "../components/OfflineIndicator";

export default function Home() {
  const [selectedDate, setSelectedDate] = useState(new Date());

  return (
    <div className="min-h-screen p-4 sm:p-8 pb-24 flex flex-col items-center justify-center">
      <div className="w-full max-w-2xl animate-fade-in">
        <header className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-br from-foreground to-muted bg-clip-text text-transparent">
              Personal Tracker
            </h1>
            <p className="text-muted text-base mt-2 font-medium">Your private, local-first journal.</p>
          </div>
          <div className="flex items-center gap-3">
            <DataExport />
            <ThemeToggle />
          </div>
        </header>

        <SmartSuggestions />
        <DateSelector selectedDate={selectedDate} onDateChange={setSelectedDate} />

        <StatsOverview />
        <StatsCharts />
        <LogEntry selectedDate={selectedDate} />

        <div className="space-y-6">
          <h2 className="text-lg font-semibold text-muted uppercase tracking-wider pl-1">
            Logs for {selectedDate.toLocaleDateString()}
          </h2>
          <LogList selectedDate={selectedDate} />
        </div>
      </div>
      <OfflineIndicator />
    </div>
  );
}
