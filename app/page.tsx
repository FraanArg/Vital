"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useQuery } from "convex/react";
import { useUser } from "@clerk/nextjs";
import { api } from "../convex/_generated/api";
import { isSameDay } from "date-fns";
import DailyDashboard from "../components/DailyDashboard";
import WeeklyDashboard from "../components/WeeklyDashboard";
import { SegmentedControl } from "../components/ui/SegmentedControl";
import DailyProgress from "../components/DailyProgress";
import NotificationCenter from "../components/NotificationCenter";
import OfflineIndicator from "../components/OfflineIndicator";
import DateSelector from "../components/DateSelector";
import UndoToast from "../components/UndoToast";
import PullToRefresh from "../components/PullToRefresh";
import QuickAddFAB from "../components/QuickAddFAB";
import Onboarding, { useOnboarding } from "../components/Onboarding";
import { CelebrationOverlay } from "../components/ui/CelebrationOverlay";
import { TRACKERS } from "../lib/tracker-registry";
import { Doc } from "../convex/_generated/dataModel";
import { Plus, RefreshCw } from "lucide-react";
import { Button } from "../components/ui/Button";
import { IconButton } from "../components/ui/IconButton";
import { StreakInline } from "../components/StreakInline";

// Get time-based greeting
function getGreeting(hour: number): string {
  if (hour < 5) return "Good Night";
  if (hour < 12) return "Good Morning";
  if (hour < 18) return "Good Afternoon";
  return "Good Evening";
}

// Motivational messages that rotate
const MOTIVATIONAL_MESSAGES = [
  "Ready to seize the day?",
  "Let's make today count!",
  "One step at a time!",
  "You're doing great!",
  "Keep up the momentum!",
  "Small wins add up!",
];

export default function Home() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isMounted, setIsMounted] = useState(false);
  const [activeTracker, setActiveTracker] = useState<string | null>(null);
  const [editingLog, setEditingLog] = useState<Doc<"logs"> | null>(null);
  const [viewMode, setViewMode] = useState<"daily" | "weekly">("daily");
  const [showCelebration, setShowCelebration] = useState(false);
  const [lastCelebrationDate, setLastCelebrationDate] = useState<string | null>(null);
  const { showOnboarding, completeOnboarding } = useOnboarding();
  const { user } = useUser();

  // OPTIMIZED: Use consolidated dashboard query instead of separate queries
  const dashboardData = useQuery(api.dashboard.getDashboardData, {
    date: selectedDate.toISOString(),
  });

  // Calculate if all goals are complete using dashboard data
  const allGoalsComplete = useMemo(() => {
    if (!dashboardData) return false;
    const { goals, todayTotals } = dashboardData;
    return (
      todayTotals.sleep >= goals.goalSleep &&
      todayTotals.water >= goals.goalWater &&
      todayTotals.exercise >= goals.goalExercise &&
      todayTotals.meals >= goals.goalMeals
    );
  }, [dashboardData]);

  // Trigger celebration when all goals complete (only once per day)
  useEffect(() => {
    const today = new Date().toDateString();
    if (allGoalsComplete && lastCelebrationDate !== today && isSameDay(selectedDate, new Date())) {
      setShowCelebration(true);
      setLastCelebrationDate(today);
    }
  }, [allGoalsComplete, lastCelebrationDate, selectedDate]);

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

  const handleRefresh = useCallback(async () => {
    window.location.reload();
  }, []);

  // Get user's first name from Clerk or fallback to "Friend"
  const userName = useMemo(() => {
    if (user?.firstName) {
      return user.firstName;
    }
    return "Friend";
  }, [user]);

  // Rotate motivational message
  const motivationalMessage = MOTIVATIONAL_MESSAGES[Math.floor(Date.now() / 60000) % MOTIVATIONAL_MESSAGES.length];

  if (!isMounted) {
    return null;
  }

  const currentHour = new Date().getHours();

  return (
    <div className="flex flex-col h-full bg-background">
      <PullToRefresh
        onRefresh={handleRefresh}
        className="flex-1 overflow-y-auto pb-24 md:pb-8"
      >
        <div className="container-mobile page-padding space-y-4 sm:space-y-6">
          <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 pt-safe">
            <div className="flex items-center gap-3">
              <div>
                <div className="flex items-center gap-2 sm:gap-3">
                  <h1 className="text-page-title">
                    {getGreeting(currentHour)}, {userName}
                  </h1>
                  <StreakInline streakCount={dashboardData?.streak?.current} />
                </div>
                <p className="text-muted-foreground text-sm">
                  {allGoalsComplete ? "🎉 All goals complete! Amazing!" : motivationalMessage}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <SegmentedControl
                options={["daily", "weekly"]}
                value={viewMode}
                onChange={setViewMode}
                labels={{ daily: "Daily", weekly: "Weekly" }}
              />
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => setActiveTracker("work")}
                  leftIcon={<Plus className="w-4 h-4" />}
                  size="sm"
                  className="hidden md:flex"
                >
                  Log Activity
                </Button>
                <IconButton
                  onClick={() => window.location.reload()}
                  label="Refresh"
                  variant="ghost"
                  size="sm"
                >
                  <RefreshCw className="w-4 h-4" />
                </IconButton>
                <DailyProgress
                  selectedDate={selectedDate}
                  dashboardData={dashboardData}
                />
                <NotificationCenter />
                <OfflineIndicator />
              </div>
            </div>
          </header>

          <DateSelector selectedDate={selectedDate} onDateChange={setSelectedDate} />

          {viewMode === "daily" ? (
            <DailyDashboard
              selectedDate={selectedDate}
              activeTracker={activeTracker}
              editingLog={editingLog}
              onTrackerChange={handleTrackerChange}
              onEdit={handleEdit}
              dashboardData={dashboardData}
            />
          ) : (
            <WeeklyDashboard selectedDate={selectedDate} onTrackerSelect={handleTrackerChange} />
          )}
        </div>
      </PullToRefresh>

      {/* REMOVED PrefetchDays - causes extra queries */}
      <QuickAddFAB selectedDate={selectedDate} onTrackerSelect={handleTrackerChange} />
      <UndoToast />
      {showOnboarding && <Onboarding onComplete={completeOnboarding} />}

      {/* Celebration overlay for all goals complete */}
      <CelebrationOverlay
        trigger={showCelebration}
        onComplete={() => setShowCelebration(false)}
      />
    </div>
  );
}
