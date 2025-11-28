"use client";

import { ThemeToggle } from "../components/ThemeToggle";
import LogEntry from "../components/LogEntry";
import LogList from "../components/LogList";
import StatsOverview from "../components/StatsOverview";

// Placeholder for DataExport since I don't have the code for it, but it was imported in page.tsx
const DataExport = () => null;

export default function Home() {
  return (
    <div className="min-h-screen p-4 sm:p-8 pb-24 flex flex-col items-center justify-center">
      <div className="w-full max-w-2xl animate-fade-in">
        <header className="mb-12 flex justify-between items-center">
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

        <StatsOverview />
        <LogEntry />

        <div className="space-y-6">
          <h2 className="text-lg font-semibold text-muted uppercase tracking-wider pl-1">Recent Logs</h2>
          <LogList />
        </div>
      </div>
    </div>
  );
}
